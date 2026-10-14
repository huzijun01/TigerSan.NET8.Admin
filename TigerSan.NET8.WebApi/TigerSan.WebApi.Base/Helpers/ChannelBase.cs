using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Threading.Channels;
using System.Collections.Generic;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    public class ChannelBase<TData>
    {
        #region 消费者状态
        /// <summary>消费者状态</summary>
        private enum ProcessingState
        {
            /// <summary>未启动</summary>
            NotStarted,
            /// <summary>启动中</summary>
            Starting,
            /// <summary>运行中</summary>
            Running,
            /// <summary>已停止</summary>
            Stopped
        }
        #endregion

        #region 【Fields】
        #region [private]
        /// <summary>默认管道容量</summary>
        private const int DefaultCapacity = 50_000;
        /// <summary>管道容量</summary>
        private readonly int _capacity;
        /// <summary>当前生命周期的管道</summary>
        private Channel<TData> _channel;
        /// <summary>状态锁</summary>
        private readonly object _stateLock = new();
        /// <summary>消费者启动任务（仅表示启动过程完成）</summary>
        private Task? _startTask;
        /// <summary>所有消费者的完成任务</summary>
        private Task _consumersCompletion = Task.CompletedTask;
        /// <summary>消费者状态</summary>
        private ProcessingState _processingState = ProcessingState.NotStarted;
        /// <summary>生产是否已结束</summary>
        private bool _writerCompleted;
        #endregion [private]

        #region [引用]
        /// <summary>消费者是否正在运行且允许生产</summary>
        public bool IsProcessing
        {
            get
            {
                lock (_stateLock)
                {
                    return _processingState == ProcessingState.Running && !_writerCompleted;
                }
            }
        }

        /// <summary>所有消费者结束的任务</summary>
        public Task ConsumersCompletion
        {
            get
            {
                lock (_stateLock)
                {
                    return _consumersCompletion;
                }
            }
        }
        #endregion [引用]

        /// <summary>批量处理数量</summary>
        public int _batchSize = 1;
        /// <summary>消费者数量</summary>
        public int _consumerCount = 5;
        /// <summary>同步批量处理委托</summary>
        public Action<List<TData>>? _process;
        /// <summary>异步批量处理委托</summary>
        public Func<List<TData>, Task>? _processAsync;
        #endregion 【Fields】

        #region 【Ctor】
        public ChannelBase(int capacity = DefaultCapacity)
        {
            if (capacity <= 0)
            {
                capacity = DefaultCapacity;
                LogHelper.Instance.Warning("Invalid channel capacity. Using the default capacity.");
            }

            _capacity = capacity;
            _channel = CreateChannel(_capacity);
        }
        #endregion 【Ctor】

        #region 【Functions】
        #region [Private]
        /// <summary>创建一个新的管道实例</summary>
        private static Channel<TData> CreateChannel(int capacity)
        {
            return Channel.CreateBounded<TData>(new BoundedChannelOptions(capacity)
            {
                SingleReader = false,
                SingleWriter = false,
                FullMode = BoundedChannelFullMode.Wait,
                AllowSynchronousContinuations = false
            });
        }

        #region 等待所有消费者进入启动流程
        /// <summary>等待所有消费者进入启动流程</summary>
        private async Task WaitForConsumersStartedAsync(
            Channel<TData> channel,
            TaskCompletionSource<bool>[] startSignals,
            Task allConsumersTask)
        {
            await Task.WhenAll(startSignals.Select(signal => signal.Task)).ConfigureAwait(false);

            lock (_stateLock)
            {
                // 旧生命周期的启动任务不能修改新生命周期的状态。
                if (ReferenceEquals(_channel, channel)
                    && _processingState == ProcessingState.Starting
                    && !allConsumersTask.IsCompleted)
                {
                    _processingState = ProcessingState.Running;
                }
            }
        }
        #endregion

        #region 等待全部消费者结束，并完成管道生命周期清理
        /// <summary>等待全部消费者结束，并完成管道生命周期清理</summary>
        private async Task ObserveConsumersStoppedAsync(Channel<TData> channel, Task allConsumersTask)
        {
            try
            {
                await allConsumersTask.ConfigureAwait(false);
            }
            catch (Exception e)
            {
                LogHelper.Instance.Warning($"One or more channel consumers failed: {e.GetMessage()}");
            }
            finally
            {
                int discardedCount = 0;

                lock (_stateLock)
                {
                    // 清理与本轮消费者绑定的管道，不能误操作之后创建的新管道。
                    channel.Writer.TryComplete();

                    // 若消费者因取消而提前退出，清理未处理的剩余数据。
                    while (channel.Reader.TryRead(out _))
                    {
                        discardedCount++;
                    }

                    if (ReferenceEquals(_channel, channel))
                    {
                        _writerCompleted = true;
                        _processingState = ProcessingState.Stopped;

                        // 允许下一次 StartProcessingAsync 创建新的生命周期。
                        _startTask = null;
                    }
                }

                if (discardedCount > 0)
                {
                    LogHelper.Instance.Warning($"Discarded {discardedCount} queued item(s) because all consumers have stopped.");
                }

                LogHelper.Instance.Warning("All channel consumers have stopped.");
            }
        }
        #endregion

        #region 消费者循环
        /// <summary>消费者循环</summary>
        private async Task ConsumerLoopAsync(
            Channel<TData> channel,
            int batchSize,
            Action<List<TData>>? process,
            Func<List<TData>, Task>? processAsync,
            CancellationToken ct,
            TaskCompletionSource<bool> started)
        {
            try
            {
                var buffer = new List<TData>(batchSize);

                // 缓冲区初始化完成后通知启动方法。
                started.TrySetResult(true);

                while (await channel.Reader
                    .WaitToReadAsync(ct)
                    .ConfigureAwait(false))
                {
                    // 尽可能批量读取，减少处理委托的调用次数。
                    while (buffer.Count < batchSize
                        && channel.Reader.TryRead(out var item))
                    {
                        buffer.Add(item);
                    }

                    if (buffer.Count == 0)
                    {
                        continue;
                    }

                    // 每批使用独立列表，避免回调保存列表后，
                    // 又被消费者 Clear() 清空或覆盖。
                    var batch = buffer;
                    buffer = new List<TData>(batchSize);

                    await ProcessBatchInternalAsync(
                        batch,
                        process,
                        processAsync).ConfigureAwait(false);
                }
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                // Expected cancellation.
            }
            catch (Exception e)
            {
                LogHelper.Instance.Warning($"Channel consumer failed: {e.GetMessage()}");
            }
            finally
            {
                // 即使初始化失败，也不能让启动任务无限等待。
                started.TrySetResult(true);
            }
        }
        #endregion

        #region 执行批量处理
        /// <summary>执行批量处理</summary>
        private async Task ProcessBatchInternalAsync(
            List<TData> batch,
            Action<List<TData>>? process,
            Func<List<TData>, Task>? processAsync)
        {
            List<TData>? asyncBatch = process != null && processAsync != null
                ? new List<TData>(batch)
                : batch;

            if (process != null)
            {
                try
                {
                    process.Invoke(batch);
                }
                catch (Exception e)
                {
                    LogHelper.Instance.Warning($"Synchronous batch processing failed: {e.GetMessage()}");
                }
            }

            if (processAsync != null && asyncBatch != null)
            {
                try
                {
                    await processAsync.Invoke(asyncBatch).ConfigureAwait(false);
                }
                catch (Exception e)
                {
                    LogHelper.Instance.Warning($"Asynchronous batch processing failed: {e.GetMessage()}");
                }
            }
        }
        #endregion
        #endregion [Private]

        #region 启动多个消费者
        /// <summary>启动多个消费者</summary>
        public Task StartProcessingAsync(CancellationToken ct = default)
        {
            lock (_stateLock)
            {
                // 正在启动或运行时保持幂等，不重复创建消费者。
                if (_processingState == ProcessingState.Starting
                    || _processingState == ProcessingState.Running)
                {
                    if (_startTask != null)
                    {
                        return _startTask;
                    }

                    LogHelper.Instance.Warning("Cannot start consumers because the current lifecycle is still active.");
                    return Task.CompletedTask;
                }

                // 启动时一次性读取配置，避免运行过程中配置变化。
                int batchSize = _batchSize;
                int consumerCount = _consumerCount;

                if (consumerCount <= 0)
                {
                    LogHelper.Instance.Warning("Cannot start consumers because the consumer count must be greater than zero.");
                    return Task.CompletedTask;
                }

                if (batchSize <= 0)
                {
                    LogHelper.Instance.Warning("Cannot start consumers because the batch size must be greater than zero.");
                    return Task.CompletedTask;
                }

                // 快照委托，保证运行期间处理逻辑不随属性变化。
                Action<List<TData>>? process = _process;
                Func<List<TData>, Task>? processAsync = _processAsync;

                if (process == null && processAsync == null)
                {
                    LogHelper.Instance.Warning("Cannot start consumers because no batch processor is configured.");
                    return Task.CompletedTask;
                }

                // 已停止或生产端已关闭时，为新一轮处理创建全新的管道。
                // Channel<T> 完成后不可重新打开，不能复用旧实例。
                if (_processingState == ProcessingState.Stopped || _writerCompleted)
                {
                    _channel = CreateChannel(_capacity);
                    _writerCompleted = false;
                    _processingState = ProcessingState.NotStarted;
                    _startTask = null;
                }

                Channel<TData> channel = _channel;
                _processingState = ProcessingState.Starting;

                var startSignals = new TaskCompletionSource<bool>[consumerCount];
                var consumerTasks = new Task[consumerCount];

                for (int i = 0; i < consumerCount; i++)
                {
                    var started = new TaskCompletionSource<bool>(TaskCreationOptions.RunContinuationsAsynchronously);
                    startSignals[i] = started;

                    // 不向 Task.Run 传递取消令牌：消费者必须有机会发出启动信号。
                    consumerTasks[i] = Task.Run(() => ConsumerLoopAsync(
                        channel,
                        batchSize,
                        process,
                        processAsync,
                        ct,
                        started));
                }

                Task allConsumersTask = Task.WhenAll(consumerTasks);

                // 必须保存启动任务，否则重复调用会创建多组消费者。
                Task startTask = WaitForConsumersStartedAsync(channel, startSignals, allConsumersTask);
                _startTask = startTask;

                // 后台观察消费者退出，并在完成清理后允许重启。
                _consumersCompletion = ObserveConsumersStoppedAsync(channel, allConsumersTask);

                // 只等待启动信号，不等待实际消费完成。
                return startTask;
            }
        }
        #endregion

        #region 标记生产结束
        /// <summary>
        /// 标记生产结束（已写入的数据仍会由消费者继续处理）
        /// </summary>
        public void Complete()
        {
            bool alreadyCompleted;
            bool completed = false;

            lock (_stateLock)
            {
                alreadyCompleted = _writerCompleted;

                if (!alreadyCompleted)
                {
                    _writerCompleted = true;
                    completed = _channel.Writer.TryComplete();

                    // 尚未启动消费者时，直接结束当前生命周期；后续启动会创建新管道。
                    if (_processingState == ProcessingState.NotStarted)
                    {
                        _processingState = ProcessingState.Stopped;
                    }
                }
            }

            if (alreadyCompleted)
            {
                LogHelper.Instance.Warning("The channel has already been completed.");
            }
            else if (!completed)
            {
                LogHelper.Instance.Warning("Failed to complete the channel writer.");
            }
        }
        #endregion

        #region 发布数据
        /// <summary>发布数据</summary>
        /// <returns>是否成功发布</returns>
        public async ValueTask<bool> PublishAsync(TData data, CancellationToken ct = default)
        {
            Channel<TData> channel;
            bool canPublish;

            lock (_stateLock)
            {
                // 捕获当前生命周期的管道，避免 await 期间重启后写入新管道。
                channel = _channel;
                canPublish = _processingState == ProcessingState.Running && !_writerCompleted;
            }

            if (!canPublish)
            {
                LogHelper.Instance.Warning("Cannot publish data because consumers are not running or the channel is closed.");
                return false;
            }

            try
            {
                await channel.Writer.WriteAsync(data, ct).ConfigureAwait(false);
                return true;
            }
            catch (OperationCanceledException) when (ct.IsCancellationRequested)
            {
                LogHelper.Instance.Warning("Publishing was canceled.");
                return false;
            }
            catch (ChannelClosedException)
            {
                LogHelper.Instance.Warning("Cannot publish data because the channel is closed.");
                return false;
            }
            catch (Exception e)
            {
                LogHelper.Instance.Warning($"Failed to publish data: {e.GetMessage()}");
                return false;
            }
        }
        #endregion
        #endregion 【Functions】
    }
}
