using System;
using System.ComponentModel;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    public static class ObjectHelper
    {
        #region 获取字段
        /// <summary>获取字段</summary>
        public static object? GetField<T>(T obj, string propName) where T : class
        {
            var fieldInfo = obj.GetType().GetField(propName);
            if (fieldInfo == null)
            {
                LogHelper.Instance.IsNull(nameof(fieldInfo));
                return null;
            }

            return fieldInfo.GetValue(obj);
        }
        #endregion

        #region 修改字段
        /// <summary>修改字段</summary>
        public static bool SetField<T>(T obj, string propName, object? value) where T : class
        {
            var fieldInfo = obj.GetType().GetField(propName);
            if (fieldInfo == null)
            {
                LogHelper.Instance.IsNull(nameof(fieldInfo));
                return false;
            }

            fieldInfo.SetValue(obj, value);

            return true;
        }
        #endregion

        #region 获取属性
        /// <summary>获取属性</summary>
        public static object? GetProperty<T>(T obj, string propName) where T : class
        {
            var propInfo = obj.GetType().GetProperty(propName);
            if (propInfo == null)
            {
                LogHelper.Instance.IsNull(nameof(propInfo));
                return null;
            }

            return propInfo.GetValue(obj);
        }
        #endregion

        #region 修改属性
        /// <summary>修改属性</summary>
        public static bool SetProperty<T>(T obj, string propName, object? value) where T : class
        {
            var propInfo = obj.GetType().GetProperty(propName);
            if (propInfo == null)
            {
                LogHelper.Instance.IsNull(nameof(propInfo));
                return false;
            }

            propInfo.SetValue(obj, value);

            return true;
        }
        #endregion

        #region 转换类型
        /// <summary>转换类型</summary>
        public static bool TryParse(Type type, string? input, out object result)
        {
            result = new object();
            try
            {
                if (input == null) return false;

                Type underlyingType = Nullable.GetUnderlyingType(type) ?? type;

                if (underlyingType.IsEnum)
                {
                    return TryParseEnum(underlyingType, input, out result);
                }

                var converter = TypeDescriptor.GetConverter(underlyingType);
                if (converter == null || !converter.IsValid(input)) return false;

                var convertedValue = converter.ConvertFromString(input);
                if (convertedValue == null) return false;

                result = convertedValue;
                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region 转换“枚举”
        /// <summary>转换“枚举”</summary>
        private static bool TryParseEnum(Type enumType, string input, out object result)
        {
            result = new object();
            try
            {
                if (char.IsDigit(input[0]) || input.StartsWith("-") && char.IsDigit(input[1]))
                {
                    if (Enum.IsDefined(enumType, Convert.ToInt32(input)))
                    {
                        result = Enum.ToObject(enumType, Convert.ToInt32(input));
                        return true;
                    }
                }
                else
                {
                    var enumValue = Enum.Parse(enumType, input, ignoreCase: true);
                    result = enumValue;
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
        #endregion
    }
}
