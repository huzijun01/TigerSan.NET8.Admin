using System;
using System.Buffers.Binary;
using System.Security.Cryptography;

public static class Uuid7Generator
{
    private static readonly RandomNumberGenerator _rng = RandomNumberGenerator.Create();
    private static ulong _sequence = 0;
    private static long _lastTimestamp = 0;

    #region 生成GUID
    public static Guid GenerateGuid()
    {
        // 获取毫秒级时间戳
        long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // 处理时钟回拨和同一毫秒内多次请求
        if (timestamp <= _lastTimestamp)
        {
            _sequence++;
            timestamp = _lastTimestamp;
        }
        else
        {
            _sequence = 0;
            _lastTimestamp = timestamp;
        }

        Span<byte> buffer = stackalloc byte[16];

        // 写入48位时间戳
        BinaryPrimitives.WriteInt64BigEndian(buffer, timestamp);
        buffer = buffer.Slice(2); // 去除高16位

        // 写入7位序列号 + 4位版本号(0111) + 1位保留位
        ulong sequencePart = (_sequence & 0x7F) << 5 | 0x70;
        BinaryPrimitives.WriteUInt16BigEndian(buffer, (ushort)sequencePart);
        buffer = buffer.Slice(2);

        // 生成剩余62位随机数
        _rng.GetBytes(buffer);

        // 设置变体标识为RFC 4122规范(10xx)
        buffer[0] = (byte)(buffer[0] & 0x3F | 0x80);

        return new Guid(buffer);
    }
    #endregion

    #region 生成GUID（long）
    public static long GenerateLong()
    {
        // 获取毫秒级时间戳（48位存储）
        long timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

        // 处理时钟回拨和并发请求
        if (timestamp <= _lastTimestamp)
        {
            _sequence++;
            // 防止序列号溢出（32位足够应对高并发）
            _sequence &= 0xFFFFFFFF;
        }
        else
        {
            _sequence = 0;
            _lastTimestamp = timestamp;
        }

        // 分配64位存储空间
        Span<byte> buffer = stackalloc byte[8];

        // 组合48位时间戳 + 7位序列号 + 版本位
        ulong combined = ((ulong)timestamp << 16) | (ulong)(_sequence & 0x7F) << 8 | 0x70;
        BinaryPrimitives.WriteUInt64BigEndian(buffer, combined);

        // 生成剩余15位随机数（保证唯一性）
        _rng.GetBytes(buffer.Slice(7, 1)); // 只需要1字节随机数

        // 返回64位long值
        return BinaryPrimitives.ReadInt64BigEndian(buffer);
    }
    #endregion
}