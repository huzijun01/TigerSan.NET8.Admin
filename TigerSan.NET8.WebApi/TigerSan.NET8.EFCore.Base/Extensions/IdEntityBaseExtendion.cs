namespace TigerSan.NET8.EFCore.Base
{
    public static class IdEntityBaseExtendion
    {
        public static void UpdateId<TEntity>(this List<TEntity> entities, Action<TEntity>? init = null) where TEntity : IdEntityBase
        {
            foreach (var entity in entities)
            {
                entity.UpdateId();
                init?.Invoke(entity);
            }
        }
    }
}
