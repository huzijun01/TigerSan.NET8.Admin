using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;
using TigerSan.CsvLog;
using TigerSan.WebApi.Base;

namespace TigerSan.NET8.EFCore.Base
{
    #region 方法获取器
    public static class MethodPicker
    {
        /// <summary>获取方法</summary>
        public static MethodInfo GetMethod<T>(Expression<Action<T>> expression)
            => ((MethodCallExpression)expression.Body).Method;

        /// <summary>转为小写</summary>
        public static readonly MethodInfo ToLower = GetMethod<string>(s => s.ToLower());

        /// <summary>抛出异常</summary>
        public static Expression GetThrow(string msg)
            => Expression.Throw(Expression.Constant(new InvalidOperationException(msg)));
    }
    #endregion

    public static class IQueryableExtendion
    {
        #region 【Contains】
        private static readonly Lazy<MethodInfo?> StringContainsMethod
            = new Lazy<MethodInfo?>(() => typeof(string).GetMethod("Contains", BindingFlags.Public | BindingFlags.Instance, null, new[] { typeof(string) }, null), true);
        #endregion 【Contains】

        #region 【Where】
        private static readonly Lazy<MethodInfo?> _cachedWhereMethod = new Lazy<MethodInfo?>(GetWhereMethod, true);

        #region 获取“Where”方法
        private static MethodInfo? GetWhereMethod()
        {
            var queryableType = typeof(Queryable);
            var methods = queryableType.GetMethods(BindingFlags.Public | BindingFlags.Static)
                .Where(m => m.Name == nameof(Queryable.Where) &&
                            m.GetParameters().Length == 2);

            return methods.FirstOrDefault(m =>
                m.GetParameters()[1].ParameterType.IsGenericType &&
                m.GetParameters()[1].ParameterType.GetGenericTypeDefinition() == typeof(Expression<>));
        }
        #endregion

        #region 调用“Where”方法
        public static IQueryable? Where(this IQueryable source, LambdaExpression predicate)
        {
            var method = _cachedWhereMethod.Value;
            if (method == null)
            {
                LogHelper.Instance.IsNull(nameof(method));
                return null;
            }

            try
            {
                var genericMethod = method.MakeGenericMethod(source.ElementType);
                return (IQueryable?)genericMethod.Invoke(null, new object[] { source, predicate });
            }
            catch (TargetInvocationException tie)
            {
                LogHelper.Instance.Error($"The execution of the Where method failed:{Environment.NewLine}{tie.GetMessage()}");
                return null;
            }
            catch (ArgumentException ae)
            {
                LogHelper.Instance.Error($"Type parameter mismatch:{Environment.NewLine}{ae.GetMessage()}");
                return null;
            }
        }
        #endregion
        #endregion 【Where】

        #region 【OrderBy】
        /// <summary>排序</summary>
        public static MethodInfo? OrderBy(bool ascending = true)
        {
            var methodName = ascending ? nameof(Queryable.OrderBy) : nameof(Queryable.OrderByDescending);

            return typeof(Queryable)
                .GetMethods()
                .FirstOrDefault(m => m.Name == methodName && m.GetParameters().Length == 2);
        }
        #endregion 【OrderBy】

        #region 【Others】
        #region 获取“OR”表达式
        /// <summary>获取“OR”表达式</summary>
        private static Expression GetOrExpression(
            ParameterExpression parameter,
            Expression property,
            Type propertyType,
            List<object> values)
        {
            Func<object, Expression> selector = obj =>
            {
                if (propertyType == typeof(string))
                {
                    if (string.IsNullOrEmpty(obj.ToString()))
                        return Expression.Constant(false);

                    return Expression.Equal(
                        Expression.Call(property, MethodPicker.ToLower),
                        Expression.Constant(obj.ToString()?.ToLower(), typeof(string))
                    );
                }
                else
                {
                    var res = ObjectHelper.TryParse(propertyType, obj.ToString(), out var convertedValue);
                    if (res == false)
                        return MethodPicker.GetThrow($"TryParse error!({propertyType.Name})");

                    return Expression.Equal(property, Expression.Constant(convertedValue, propertyType));
                }
            };

            return values.Select(selector).Aggregate(Expression.OrElse);
        }
        #endregion

        #region 获取“Contains”表达式
        /// <summary>获取“Contains”表达式</summary>
        private static Expression GetContainsExpression(
            ParameterExpression parameter,
            Expression property,
            Type propertyType,
            List<object> values)
        {
            if (propertyType == typeof(string))
            {
                // 字符串类型：全部转小写
                var convertedValues = values.Select(v => v.ToString()?.ToLower()).ToArray();

                // 构建：values.Contains(x.Prop.ToLower())
                var valuesConstant = Expression.Constant(convertedValues, typeof(string[]));
                var toLowerCall = Expression.Call(property, MethodPicker.ToLower);

                var containsMethod = typeof(Enumerable)
                    .GetMethods()
                    .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
                    .MakeGenericMethod(typeof(string));

                return Expression.Call(containsMethod, valuesConstant, toLowerCall);
            }
            else
            {
                // 创建强类型数组：
                var convertedValues = Array.CreateInstance(propertyType, values.Count);

                for (int i = 0; i < values.Count; i++)
                {
                    var res = ObjectHelper.TryParse(propertyType, values[i].ToString(), out var converted);
                    if (res == false)
                        return MethodPicker.GetThrow($"TryParse error!({propertyType.Name})");
                    convertedValues.SetValue(converted, i);
                }

                // 构建：values.Contains(x.Prop)
                var valuesConstant = Expression.Constant(convertedValues, propertyType.MakeArrayType());

                var containsMethod = typeof(Enumerable)
                    .GetMethods()
                    .First(m => m.Name == "Contains" && m.GetParameters().Length == 2)
                    .MakeGenericMethod(propertyType);

                return Expression.Call(containsMethod, valuesConstant, property);
            }
        }
        #endregion
        #endregion 【Others】

        #region 不选择
        /// <summary>不选择</summary>
        public static IQueryable<TEntity> False<TEntity>(this IQueryable<TEntity> queryable)
        {
            return queryable.Where(x => false);
        }

        /// <summary>不选择</summary>
        public static IQueryable False(this IQueryable queryable)
        {
            var parameter = Expression.Parameter(queryable.ElementType, "p");
            var falseConstant = Expression.Constant(false, typeof(bool));
            var lambda = Expression.Lambda(falseConstant, parameter);
            return queryable.Where(lambda)!;
        }
        #endregion

        #region 获取“单页数据”
        /// <summary>获取“单页数据”</summary>
        public static IQueryable<TEntity> GetPage<TEntity>(this IQueryable<TEntity> queryable, int? pageSize, int? pageNumber) where TEntity : IdEntityBase
        {
            if (pageSize == null || pageNumber == null) return queryable;
            return queryable
                    .Skip((pageNumber.Value - 1) * pageSize.Value)
                    .Take(pageSize.Value);
        }
        #endregion

        #region 获取“排序数据”
        /// <summary>获取“排序数据”</summary>
        public static ApiResult<IQueryable<TEntity>> Sort<TEntity>(
            this IQueryable<TEntity> queryable,
            string? propName = null,
            bool? ascending = null) where TEntity : IdEntityBase
        {
            if (string.IsNullOrEmpty(propName)) return ApiResults<IQueryable<TEntity>>.Success(null, queryable);

            try
            {
                // 获取实体类型元数据
                var entityType = typeof(TEntity);

                // 获取“属性信息”:
                var propertyInfo = entityType.GetProperty(propName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (propertyInfo == null)
                {
                    var error = $"Property '{propName}' not found on type '{entityType.Name}'";
                    LogHelper.Instance.Error(error);
                    return ApiResults<IQueryable<TEntity>>.Error(error);
                }

                // 创建“x”表达式:
                var parameter = Expression.Parameter(entityType, "x");
                // 创建“x.prop”表达式:
                var property = Expression.Property(parameter, propertyInfo);
                var propertyType = propertyInfo.PropertyType;

                // 创建“=”表达式:
                var propertyAccess = Expression.Property(parameter, propName);
                var keySelector = Expression.Lambda(propertyAccess, parameter);

                // 动态调用OrderBy方法
                var orderByMethod = OrderBy(ascending ?? true);
                if (orderByMethod == null)
                {
                    LogHelper.Instance.IsNull(nameof(orderByMethod));
                    return ApiResults<IQueryable<TEntity>>.Error($"The {nameof(orderByMethod)} is null!");
                }

                var sortedQuery = orderByMethod.MakeGenericMethod(entityType, propertyType).Invoke(null, new object[] { queryable, keySelector });

                if (sortedQuery == null)
                {
                    LogHelper.Instance.IsNull(nameof(sortedQuery));
                    return ApiResults<IQueryable<TEntity>>.Error($"The {nameof(sortedQuery)} is null!");
                }

                return ApiResults<IQueryable<TEntity>>.Success(null, (IQueryable<TEntity>)sortedQuery);
            }
            catch (Exception e)
            {
                return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }
        }
        #endregion

        #region 获取“过滤器数据”
        public static ApiResult<IQueryable> GetFilter(Type entityType, IQueryable queryable, PropFilter filter)
        {
            try
            {
                #region x.Prop
                // 属性名为空校验
                if (string.IsNullOrEmpty(filter.PropName))
                    return ApiResults<IQueryable>.Error(LogHelper.Instance.IsNullOrEmpty(nameof(filter.PropName)));

                // 获取属性信息
                var propertyInfo = entityType.GetProperty(filter.PropName, BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase);
                if (propertyInfo == null)
                    return ApiResults<IQueryable>.Error(LogHelper.Instance.Error($"Property '{filter.PropName}' not found on type '{entityType.Name}'"));

                // 创建参数表达式 x
                var parameter = Expression.Parameter(entityType, "x");
                // 创建属性访问表达式 x.Prop
                var property = Expression.Property(parameter, propertyInfo);
                var propertyType = propertyInfo.PropertyType;
                #endregion

                #region 是否“为null”
                if (filter.IsNull != null)
                {
                    Expression nullBody;
                    if (filter.IsNull == true)
                    {
                        // 构建 x.Prop == null 表达式
                        nullBody = Expression.Equal(property, Expression.Constant(null, property.Type));
                    }
                    else
                    {
                        // 构建 x.Prop != null 表达式
                        nullBody = Expression.NotEqual(property, Expression.Constant(null, property.Type));
                    }

                    // 生成Lambda表达式
                    var nullLambda = Expression.Lambda(nullBody, parameter);
                    // 动态调用Where方法
                    var nullFilteredQueryable = queryable.Where(nullLambda);
                    if (nullFilteredQueryable == null)
                        return ApiResults<IQueryable>.Error(LogHelper.Instance.IsNull(nameof(nullFilteredQueryable)));

                    return ApiResults<IQueryable>.Success(null, nullFilteredQueryable);
                }
                #endregion

                #region 是否“为null或空”
                if (filter.IsNullOrEmpty != null)
                {
                    // 非字符串类型直接返回全量数据，避免类型转换异常
                    if (propertyType != typeof(string))
                        return ApiResults<IQueryable>.Success(null, queryable);

                    // 构建 x.Prop == null || x.Prop == "" 表达式
                    Expression emptyBody;
                    var nullCheck = Expression.Equal(property, Expression.Constant(null, typeof(string)));
                    var emptyCheck = Expression.Equal(property, Expression.Constant(string.Empty, typeof(string)));

                    if (filter.IsNullOrEmpty == true)
                    {
                        // 筛选空字符串或null
                        emptyBody = Expression.OrElse(nullCheck, emptyCheck);
                    }
                    else
                    {
                        // 筛选非空字符串且不为null
                        emptyBody = Expression.AndAlso(
                            Expression.NotEqual(property, Expression.Constant(null, typeof(string))),
                            Expression.NotEqual(property, Expression.Constant(string.Empty, typeof(string)))
                        );
                    }

                    var emptyLambda = Expression.Lambda(emptyBody, parameter);
                    var emptyFiltered = queryable.Where(emptyLambda);
                    if (emptyFiltered == null)
                        return ApiResults<IQueryable>.Error(LogHelper.Instance.IsNull(nameof(emptyFiltered)));

                    return ApiResults<IQueryable>.Success(null, emptyFiltered);
                }
                #endregion

                #region 获取“值”集合
                // 添加单值:
                if (filter.Value != null)
                {
                    if (filter.Values == null)
                    {
                        filter.Values = new List<object>();
                    }
                    filter.Values.Add(filter.Value);
                }

                // 验证过滤器参数的有效性:
                if (filter.Values == null)
                    return ApiResults<IQueryable>.Success(null, queryable);

                // 属性名为空:
                if (string.IsNullOrEmpty(filter.PropName))
                    return ApiResults<IQueryable>.Error(LogHelper.Instance.IsNullOrEmpty(nameof(filter.PropName)));

                // 值去重:
                var values = filter.Values.Distinct().ToList();
                if (propertyType == typeof(string))
                {
                    values = values.Where(v => v != null && !string.IsNullOrEmpty(v.ToString())).ToList();
                }

                // 不选择:
                if (values.Count < 1)
                    return ApiResults<IQueryable>.Success(null, queryable.False());
                #endregion

                #region Where
                Expression body;

                // 5. 构建表达式主体
                bool isStringFuzzy = propertyType == typeof(string) && filter.IsFuzzy == true;

                if (isStringFuzzy)
                {
                    // 获取 string.Contains 方法
                    var containsMethod = StringContainsMethod.Value;
                    if (containsMethod == null)
                    {
                        return ApiResults<IQueryable>.Error(LogHelper.Instance.Error("String.Contains method not found."));
                    }

                    Expression? combinedExpression = null;

                    foreach (var val in values)
                    {
                        if (val == null) continue;

                        var strVal = val.ToString();
                        if (string.IsNullOrEmpty(strVal)) continue;

                        // 构造常量表达式
                        var constant = Expression.Constant(strVal, typeof(string));

                        // 构造 x.Prop.Contains(strVal)
                        var containsCall = Expression.Call(property, containsMethod, constant);

                        if (combinedExpression == null)
                        {
                            combinedExpression = containsCall;
                        }
                        else
                        {
                            // 组合: prev OR current
                            combinedExpression = Expression.OrElse(combinedExpression, containsCall);
                        }
                    }

                    // 如果所有值都无效，返回 false
                    body = combinedExpression ?? Expression.Constant(false, typeof(bool));
                }
                else
                {
                    if (values.Count > 10) // 超过10个值，使用 Contains（避免栈溢出）
                    {
                        body = GetContainsExpression(parameter, property, propertyType, values);
                    }
                    else // 值少的时候用原来的 OR（性能更好）
                    {
                        body = GetOrExpression(parameter, property, propertyType, values);
                    }
                }

                // 创建“Lambda”表达式:
                var lambda = Expression.Lambda(body, parameter);

                // 动态调用“Where”方法:
                var newQueryable = queryable.Where(lambda);
                if (newQueryable == null)
                    return ApiResults<IQueryable>.Error(LogHelper.Instance.IsNull(nameof(newQueryable)));

                queryable = newQueryable;
                #endregion
            }
            catch (Exception e)
            {
                return ApiResults<IQueryable>.Error(LogHelper.Instance.Error(e.GetMessage()));
            }

            return ApiResults<IQueryable>.Success(null, queryable);
        }
        #endregion

        #region 获取“单过滤器数据”
        /// <summary>获取“单过滤器数据”</summary>
        public static ApiResult<IQueryable<TEntity>> GetOnlyFilter<TEntity>(this IQueryable<TEntity> queryable, PropFilter? filters) where TEntity : IdEntityBase
        {
            if (filters == null) return ApiResults<IQueryable<TEntity>>.Success(null, queryable);
            var res = GetFilter(typeof(TEntity), queryable, filters);
            if (res.Data == null)
            {
                LogHelper.Instance.Error(res.Message);
                return ApiResults<IQueryable<TEntity>>.Error(res.Message);
            }

            return ApiResults<IQueryable<TEntity>>.Success(null, (IQueryable<TEntity>)res.Data);
        }
        #endregion

        #region 获取“多过滤器数据”
        /// <summary>获取“多过滤器数据”</summary>
        public static ApiResult<IQueryable<TEntity>> GetFilters<TEntity>(this IQueryable<TEntity> queryable, List<PropFilter> filters) where TEntity : IdEntityBase
        {
            foreach (var filter in filters)
            {
                var res = GetFilter(typeof(TEntity), queryable, filter);
                if (res.Data == null)
                    return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.Error(res.Message));

                queryable = (IQueryable<TEntity>)res.Data;
            }

            return ApiResults<IQueryable<TEntity>>.Success(null, queryable);
        }
        #endregion

        #region 获取“父表过滤器数据”
        /// <summary>获取“父表过滤器数据”</summary>
        public async static Task<ApiResult<IQueryable<TEntity>>> GetParentFilter<TEntity, TDbContext>(
            this IQueryable<TEntity> queryable,
            string? parentIdPropName,
            TDbContext db,
            DbSetConfig? config,
            ParentFilter parentFilter)
            where TEntity : IdEntityBase
            where TDbContext : DbContextBase<TDbContext>
        {
            if (config == null)
                return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.IsNull(nameof(config)));

            if (string.IsNullOrEmpty(parentIdPropName))
                return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.IsNullOrEmpty(nameof(parentIdPropName)));

            var resGetParentIds = await GetParentIds(
                db,
                config,
                parentFilter);
            var parentIds = resGetParentIds.Data;
            if (parentIds == null && resGetParentIds.IsSuccess) // 无需筛选
                return ApiResults<IQueryable<TEntity>>.Success(null, queryable);
            else if (parentIds == null)
                return ApiResults<IQueryable<TEntity>>.Error(resGetParentIds.Message);

            var res = queryable.GetOnlyFilter(new PropFilter()
            {
                PropName = parentIdPropName,
                Values = parentIds.Cast<object>().ToList()
            });

            if (res.Data == null)
                return ApiResults<IQueryable<TEntity>>.Error(LogHelper.Instance.Error(res.Message));

            queryable = res.Data;

            return ApiResults<IQueryable<TEntity>>.Success(null, queryable);
        }
        #endregion

        #region 获取“父表ID”集合
        public static async Task<ApiResult<List<long>>> GetParentIds<TDbContext>(
            TDbContext db,
            DbSetConfig config,
            ParentFilter parentFilter)
            where TDbContext : DbContextBase<TDbContext>
        {
            if (parentFilter.Id != null || parentFilter.Ids != null) // 无需向上筛选
            {
                var ids = new List<long>();
                if (parentFilter.Id != null) ids.Add(parentFilter.Id.Value);
                if (parentFilter.Ids != null) ids.AddRange(parentFilter.Ids);
                return ApiResults<List<long>>.Success(null, ids);
            }
            else if (parentFilter.Parent == null || config.Parent == null) // 已到顶级
                return ApiResults<List<long>>.Success(null, null);

            // 继续向上获取父表ID集合:
            var resGetParentIds = await GetParentIds(
                db,
                config.Parent,
                parentFilter.Parent);
            var grandIds = resGetParentIds.Data;
            if (grandIds == null)
                return resGetParentIds;

            if (grandIds.Count < 1) return ApiResults<List<long>>.Success(null, new List<long>());

            // 获取父表ID集合:
            var queryableParent = db.GetDbSet(config.DbSetName) as IQueryable<IdEntityBase>;
            if (queryableParent == null)
                return ApiResults<List<long>>.Error(LogHelper.Instance.IsNull(nameof(queryableParent)));

            if (string.IsNullOrEmpty(config.ParentIdPropName))
                return ApiResults<List<long>>.Error(LogHelper.Instance.IsNullOrEmpty(nameof(config.ParentIdPropName)));

            var resGetFilter = GetFilter(config.EntityType, queryableParent, new PropFilter()
            {
                PropName = config.ParentIdPropName,
                Values = grandIds.Cast<object>().ToList()
            });
            queryableParent = resGetFilter.Data as IQueryable<IdEntityBase>;
            if (queryableParent == null)
                return ApiResults<List<long>>.Error(resGetFilter.Message);

            return ApiResults<List<long>>.Success(null, await queryableParent.Select(i => i.Id).ToListAsync());
        }
        #endregion
    }
}
