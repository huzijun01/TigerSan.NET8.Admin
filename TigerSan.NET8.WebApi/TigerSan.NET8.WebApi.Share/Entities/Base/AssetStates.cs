namespace TigerSan.NET8.WebApi.Share.Entities
{
    /// <summary>资产状态</summary>
    public enum AssetStates
    {
        /// <summary>无记录</summary>
        NoRecord = 0,
        /// <summary>入库</summary>
        Inbound = 1,
        /// <summary>在库</summary>
        InStore = 2,
        /// <summary>滞留</summary>
        Stolid = 3,
        /// <summary>出库</summary>
        Outbound = 4,
        /// <summary>在途</summary>
        InTransit = 5,
        /// <summary>超时</summary>
        Timeout = 6,
    }

    /// <summary>异常类型</summary>
    public enum ErrorTypes
    {
        /// <summary>无信号</summary>
        NoSignal = 0,
        /// <summary>故障</summary>
        Breakdown = 1,
        /// <summary>丢失</summary>
        Lose = 2,
    }
}
