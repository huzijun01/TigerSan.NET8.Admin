using System;
using Microsoft.Extensions.Caching.Memory;

namespace TigerSan.WebApi.Base
{
    public static class MemoryCacheHelper
    {
        /// <summary>缓存实例</summary>
        public static readonly MemoryCache _cache = new(new MemoryCacheOptions());

        /// <summary>绝对时间过期</summary>
        public static void SetAbsolute(string key, object value, DateTimeOffset absoluteExpiration)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpiration = absoluteExpiration
            };
            _cache.Set(key, value, options);
        }

        /// <summary>相对时间过期</summary>
        public static void SetRelative(string key, object value, TimeSpan absoluteExpirationRelativeToNow)
        {
            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = absoluteExpirationRelativeToNow
            };
            _cache.Set(key, value, options);
        }

        /// <summary>永不过期</summary>
        public static void SetNoExpiration(string key, object value)
        {
            _cache.Set(key, value);
        }

        /// <summary>滑动过期</summary>
        public static void SetSliding(string key, object value, TimeSpan slidingExpiration)
        {
            var options = new MemoryCacheEntryOptions
            {
                SlidingExpiration = slidingExpiration
            };
            _cache.Set(key, value, options);
        }

        /// <summary>获取</summary>
        public static T? Get<T>(string key)
        {
            if (_cache.TryGetValue(key, out var obj) && obj is T value)
            {
                return value;
            }
            return default;
        }

        /// <summary>是否存在</summary>
        public static bool Exists(string key)
        {
            return _cache.TryGetValue(key, out _);
        }

        /// <summary>移除</summary>
        public static void Remove(string key)
        {
            _cache.Remove(key);
        }
    }
}
