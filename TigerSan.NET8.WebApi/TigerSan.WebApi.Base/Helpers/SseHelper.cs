using System;
using System.IO;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http.Headers;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    #region 拓展方法
    public static class TaskExtensions
    {
        #region 超时等待
        /// <summary>超时等待</summary>
        public static async Task WaitAsync(this Task task, TimeSpan timeout, CancellationToken cancellationToken = default)
        {
            // 如果任务已经完成，直接返回，避免不必要的开销
            if (task.IsCompleted)
            {
                await task.ConfigureAwait(false);
                return;
            }

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            cts.CancelAfter(timeout);

            try
            {
                // 这里不需要 Task.WhenAny，直接将 token 传给支持取消的操作是最理想的。
                // 但 Task 本身不支持传入 Token 等待。
                // 因此我们仍需使用 WhenAny 来竞争，但这次我们用 cts.Token 控制 Delay

                // 注意：Task.Delay 在 .NET Standard 2.1 中是高效的
                var delayTask = Task.Delay(timeout, cts.Token);

                var completedTask = await Task.WhenAny(task, delayTask).ConfigureAwait(false);

                if (completedTask != task)
                {
                    // 如果是 delayTask 先完成，说明超时了
                    // 检查是因为超时还是因为外部 token 取消
                    if (cts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
                    {
                        throw new TimeoutException($"The operation has timed out after {timeout}.");
                    }

                    // 如果是外部 token 取消，ThrowIfCancellationRequested 会抛出 OperationCanceledException
                    cancellationToken.ThrowIfCancellationRequested();
                }

                // 确保传播 task 的异常（如果 task 失败）
                await task.ConfigureAwait(false);
            }
            finally
            {
                // 确保取消定时器，释放资源
                cts.Cancel();
            }
        }
        #endregion
    }

    public static class StreamReaderExtensions
    {
        #region 创建一个 StreamReader
        /// <summary>创建一个 StreamReader</summary>
        public static StreamReader CreateReader(this Stream stream, bool leaveOpen = false)
        {
            if (stream == null) throw new ArgumentNullException(nameof(stream));

            return new StreamReader(
                stream: stream,
                encoding: null,
                detectEncodingFromByteOrderMarks: true,
                bufferSize: -1,
                leaveOpen: leaveOpen
            );
        }
        #endregion
    }
    #endregion

    public class SseHelper : IDisposable
    {
        #region 【Fields】
        private readonly HttpClient _httpClient;
        private readonly ConnectInfo _connectInfo;

        // 加 volatile 保证多线程下的字段读取可见性，避免读到寄存器缓存的旧值(null)
        private volatile Stream? _responseStream;
        private volatile Task? _listenTask;
        private volatile CancellationTokenSource? _cts;

        // 状态锁：保护 _cts / _listenTask / _responseStream 的读写一致性
        private readonly object _stateLock = new object();

        // 标记是否已释放，防止 Dispose 后重复操作
        private volatile bool _disposed;
        /// <summary>监听任务退出的超时时间</summary>
        public int _listenTaskStopAwaitSeconds = 3;
        #endregion 【Fields】

        #region 【Ctor】
        public SseHelper(ConnectInfo connectInfo)
        {
            _connectInfo = connectInfo;
            _httpClient = new HttpClient();
            InitHttpClient(_httpClient);
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region 销毁
        /// <summary>销毁</summary>
        public void Dispose()
        {
            if (_disposed) return;
            _disposed = true;

            // 同步等待 Stop 完成，确保资源完全释放后再 Dispose HttpClient
            // 用 .ConfigureAwait(false).GetAwaiter().GetResult() 避免死锁
            StopAsync().ConfigureAwait(false).GetAwaiter().GetResult();
            _httpClient?.Dispose();
        }
        #endregion

        #region 初始化"HTTP客户端"
        /// <summary>初始化"HTTP客户端"</summary>
        private void InitHttpClient(HttpClient httpClient)
        {
            // 设置超时，避免无限等待:
            httpClient.Timeout = TimeSpan.FromSeconds(30);
            // SSE需要的请求头:
            httpClient.DefaultRequestHeaders.Add("Connection", "keep-alive");
            httpClient.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/event-stream"));
            // 设置Basic Auth认证头:
            httpClient.DefaultRequestHeaders.Add("Authorization", _connectInfo.Authorization);
        }
        #endregion

        #region 开始监听（多线程异步版本）
        /// <summary>开始监听（异步，后台线程执行不阻塞调用方）</summary>
        public async Task StartAsync(Func<string, Task> onDataReceived)
        {
            if (_disposed) throw new ObjectDisposedException(nameof(SseHelper));

            // 先 await Stop 确保上一次监听完全停止，避免状态混乱
            await StopAsync().ConfigureAwait(false);

            Console.WriteLine("Connected to SSE stream. Listening for events...");

            // 在锁内创建 CTS 并赋值给字段，保证原子性
            CancellationTokenSource localCts;
            lock (_stateLock)
            {
                localCts = new CancellationTokenSource();
                _cts = localCts;
            }
            var cancellationToken = localCts.Token;

            // 将监听循环放入Task.Run，使用后台线程池线程执行
            _listenTask = Task.Run(async () =>
            {
                while (!cancellationToken.IsCancellationRequested)
                {
                    try
                    {
                        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(60));
                        // 链接全局取消令牌与局部超时令牌
                        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, cts.Token);

                        using var response = await _httpClient.GetAsync(
                            _connectInfo.SseUrl,
                            HttpCompletionOption.ResponseHeadersRead,
                            linkedCts.Token
                        ).ConfigureAwait(false);
                        response.EnsureSuccessStatusCode();

                        // 验证Content-Type
                        if (response.Content.Headers.ContentType?.MediaType != "text/event-stream")
                        {
                            throw new Exception("Invalid content type. Expected 'text/event-stream'");
                        }

                        // 用局部变量接收流，再在锁内赋值给字段，避免读取时读到中间态
                        var responseStream = await response.Content.ReadAsStreamAsync().ConfigureAwait(false);
                        lock (_stateLock)
                        {
                            _responseStream = responseStream;
                        }

                        using var reader = new StreamReader(responseStream, true);

                        string? line;
                        while ((line = await reader.ReadLineAsync().ConfigureAwait(false)) != null)
                        {
                            if (cancellationToken.IsCancellationRequested) break;

                            // 跳过注释行
                            if (string.IsNullOrEmpty(line) || line.StartsWith(":"))
                                continue;

                            // 解析事件字段
                            if (line.StartsWith("data:"))
                            {
                                var data = line.Substring(5).Trim();
                                await onDataReceived(data).ConfigureAwait(false);
                            }
                            // 处理其他事件类型
                            else if (line.StartsWith("event:"))
                            {
                                var eventName = line.Substring(6).Trim();
                            }
                            else if (line.StartsWith("retry:"))
                            {
                                if (int.TryParse(line.Substring(6).Trim(), out var retryMs))
                                {
                                    // 更新重连间隔
                                }
                            }
                            // 处理ID字段
                            else if (line.StartsWith("id:"))
                            {
                                var id = line.Substring(3).Trim();
                            }
                        }

                        // 正常连接断开处理
                        if (!cancellationToken.IsCancellationRequested)
                        {
                            LogHelper.Instance.Warning("Connection closed by server.");
                        }
                    }
                    catch (TaskCanceledException) when (cancellationToken.IsCancellationRequested)
                    {
                        break; // 主动关闭连接时退出
                    }
                    catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                    {
                        break; // 主动取消导致的流操作取消也直接退出
                    }
                    catch (IOException) when (cancellationToken.IsCancellationRequested)
                    {
                        break; // 主动关闭流导致的IO异常直接退出
                    }
                    catch (ObjectDisposedException) when (cancellationToken.IsCancellationRequested)
                    {
                        break; // 主动释放流导致的对象释放异常直接退出
                    }
                    catch (Exception ex)
                    {
                        try
                        {
                            LogHelper.Instance.Error($"Connection error: {ex.GetMessage()}");
                        }
                        catch (Exception ex1)
                        {
                            Console.Error.WriteLine(ex1.Message);
                        }
                    }
                    finally
                    {
                        // 锁内取出流再释放，保证线程安全
                        Stream? streamToDispose;
                        lock (_stateLock)
                        {
                            streamToDispose = _responseStream;
                            _responseStream = null;
                        }
                        try { streamToDispose?.Dispose(); } catch { /* 忽略 */ }
                    }

                    // 仅在需要重试且服务运行时等待
                    if (!cancellationToken.IsCancellationRequested)
                    {
                        Console.WriteLine($"Reconnecting in {_connectInfo.RetryIntervalMs / 1000}s...");
                        await Task.Delay(_connectInfo.RetryIntervalMs, cancellationToken).ConfigureAwait(false);
                        Console.WriteLine($"Try to reconnect...");
                    }
                }

                LogHelper.Instance.Log("SSE listener stopped!");
            }, cancellationToken);
        }
        #endregion

        #region 停止
        /// <summary>停止</summary>
        public async Task StopAsync()
        {
            // ★ 核心修复：在锁内一次性把所有字段快照到局部变量，
            //   后续操作全部基于局部变量，彻底避免 await 期间字段被其他线程改 null
            CancellationTokenSource? ctsToDispose;
            Stream? streamToClose;
            Task? taskToAwait;

            lock (_stateLock)
            {
                ctsToDispose = _cts;
                streamToClose = _responseStream;
                taskToAwait = _listenTask;

                // 立即把字段置空，让后续并发调用 Stop 直接返回 null，
                // 保证 CTS 只被 Dispose 一次
                _cts = null;
                _responseStream = null;
                _listenTask = null;
            }

            if (ctsToDispose == null) return;

            // 1. 先发出取消信号
            ctsToDispose.Cancel();
            _httpClient.CancelPendingRequests();

            // 2. 主动关闭响应流，打断阻塞的 ReadLineAsync，让监听线程快速退出
            try
            {
                streamToClose?.Close();
                streamToClose?.Dispose();
            }
            catch { /* 忽略关闭流时的异常 */ }

            // 3. 异步等待监听任务退出，最多等3秒避免永久阻塞
            if (taskToAwait != null)
            {
                try
                {
                    await taskToAwait.WaitAsync(TimeSpan.FromSeconds(_listenTaskStopAwaitSeconds)).ConfigureAwait(false);
                }
                catch (OperationCanceledException)
                {
                    LogHelper.Instance.Warning("Wait listen task timeout, force stop.");
                }
                catch (Exception)
                {
                    /* 忽略任务退出时的其他异常 */
                }
            }

            // 4. 清理资源 —— 用的是局部变量 ctsToDispose，绝不会空引用
            ctsToDispose.Dispose();
            LogHelper.Instance.Log("Listener stopped successfully!");
        }
        #endregion

        #region 是否"正在监听"
        /// <summary>是否"正在监听"</summary>
        public bool IsListening()
        {
            // 锁内读取，保证原子性，避免读取到中间状态
            lock (_stateLock)
            {
                return _cts != null
                    && !_cts.Token.IsCancellationRequested
                    && _listenTask is { IsCompleted: false };
            }
        }
        #endregion
        #endregion 【Functions】
    }
}
