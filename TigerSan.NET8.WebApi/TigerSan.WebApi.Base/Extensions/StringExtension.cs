using System;
using System.Text;

namespace TigerSan.WebApi.Base
{
    public static class StringExtension
    {
        public static string ToSnakeCase(this string input)
        {
            if (string.IsNullOrEmpty(input)) return input;

            var sb = new StringBuilder();
            for (int i = 0; i < input.Length; i++)
            {
                if (i > 0 && char.IsUpper(input[i]) && input[i - 1] != '_')
                    sb.Append('_');
                sb.Append(char.ToLower(input[i]));
            }
            return sb.ToString();
        }

        public static string[] ToLines(this string input, StringSplitOptions options = StringSplitOptions.RemoveEmptyEntries)
        {
            return input.Split(new[] { "\r\n", "\r", "\n" }, options);
        }
    }
}
