using System;
using System.Linq;
using System.Collections.Generic;
using TigerSan.CsvLog;

namespace TigerSan.WebApi.Base
{
    #region 二维点
    /// <summary>二维点</summary>
    public class Point2
    {
        public double X { get; set; }
        public double Y { get; set; }

        public Point2() { }
        public Point2(Point2 p) { X = p.X; Y = p.Y; }
        public Point2(double x, double y) { X = x; Y = y; }
    }
    #endregion

    #region “二维点”拓展方法
    /// <summary>“二维点”拓展方法</summary>
    public static class Point2Extension
    {
        /// <summary>加</summary>
        public static Point2 Add(this Point2 p1, Point2 p2)
        {
            p1.X += p2.X;
            p1.Y += p2.Y;
            return p1;
        }

        /// <summary>减</summary>
        public static Point2 Sub(this Point2 p1, Point2 p2)
        {
            p1.X -= p2.X;
            p1.Y -= p2.Y;
            return p1;
        }

        /// <summary>欧氏距离</summary>
        public static double Distance(this Point2 p1, Point2 p2)
        {
            double dx = p1.X - p2.X;
            double dy = p1.Y - p2.Y;
            return Math.Sqrt(dx * dx + dy * dy);
        }

        /// <summary>Haversine距离（考虑地球曲率，返回米）</summary>
        public static double Haversine(this Point2 p1, Point2 p2)
        {
            const double R = 6371000; // 地球半径（米）
            double lat1 = p1.Y * Math.PI / 180;
            double lon1 = p1.X * Math.PI / 180;
            double lat2 = p2.Y * Math.PI / 180;
            double lon2 = p2.X * Math.PI / 180;

            double dLat = lat2 - lat1;
            double dLon = lon2 - lon1;

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1) * Math.Cos(lat2) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }
    }
    #endregion

    public static class MathHelper
    {
        #region 获取“二维点”集合
        /// <summary>获取“二维点”集合</summary>
        public static List<Point2>? GetPoint2s(string? strPath)
        {
            if (strPath == null) return null;
            var points = new List<Point2>();

            var strPoints = strPath.Split(';');
            foreach (var strPoint in strPoints)
            {
                var values = strPoint.Split(',');
                if (values.Length != 2)
                {
                    LogHelper.Instance.Warning($"The length of the {nameof(values)} is not equal to 2!");
                    return null;
                }

                if (double.TryParse(values[0], out var x)
                    && double.TryParse(values[1], out var y))
                {
                    points.Add(new Point2(x, y));
                }
                else
                {
                    LogHelper.Instance.Warning("Cannot parse the string to a number!");
                    return null;
                }
            }

            return points;
        }
        #endregion

        #region 获取“路径”字符串
        /// <summary>获取“路径”字符串</summary>
        public static string? GetPathString(List<Point2> points)
        {
            var strPoints = points.Select(i => $"{i.X},{i.Y}").ToList();
            return string.Join(';', strPoints);
        }
        #endregion

        #region 是否“在围栏内”
        /// <summary>是否“在围栏内”</summary>
        public static bool IsInFence(Point2 point, List<Point2> fence)
        {
            // 边界检查：围栏至少需要3个点才能构成多边形
            if (fence == null || fence.Count < 3)
                return false;

            int intersectCount = 0;
            int n = fence.Count;

            for (int i = 0; i < n; i++)
            {
                Point2 p1 = fence[i];
                Point2 p2 = fence[(i + 1) % n]; // 下一个点，循环闭合

                // 检查点是否正好在边上（包含端点）
                if (IsPointOnLineSegment(point, p1, p2))
                    return true;

                // 判断射线是否与边相交（仅考虑从左到右的向上或向下穿越）
                if (((p1.Y > point.Y) != (p2.Y > point.Y)) &&
                    (point.X < (p2.X - p1.X) * (point.Y - p1.Y) / (p2.Y - p1.Y) + p1.X))
                {
                    intersectCount++;
                }
            }

            // 奇数个交点表示点在多边形内
            return intersectCount % 2 == 1;
        }

        private static bool IsPointOnLineSegment(Point2 p, Point2 a, Point2 b)
        {
            // 检查点p是否在线段ab上（含端点）
            // 首先检查p是否在直线ab上（叉积为0）
            double crossProduct = (p.Y - a.Y) * (b.X - a.X) - (p.X - a.X) * (b.Y - a.Y);
            if (Math.Abs(crossProduct) > 1e-9)
                return false;

            // 然后检查p是否在a和b的矩形范围内
            if (p.X < Math.Min(a.X, b.X) - 1e-9 || p.X > Math.Max(a.X, b.X) + 1e-9)
                return false;
            if (p.Y < Math.Min(a.Y, b.Y) - 1e-9 || p.Y > Math.Max(a.Y, b.Y) + 1e-9)
                return false;

            return true;
        }
        #endregion
    }
}
