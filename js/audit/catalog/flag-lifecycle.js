function validateFlagLifecycle(W_, services) {
  const actualCreators = new Map(),
    actualClearers = new Map(),
    actualConsumers = new Map();
  for (const event of services.EV) {
    const seen = new Map();
    const inspect = node => {
      if (!node || typeof node !== "object") return;
      if (Array.isArray(node)) {
        for (const part of node) inspect(part);
        return;
      }
      for (const [flag, value] of Object.entries({...node.fl,...(["primary","case:commit","case:commit-grant","case:commit-loan"].includes(node.educationAction)?{sch:1}:{})})) {
        if (!seen.has(flag)) seen.set(flag, new Set());
        seen.get(flag).add(value);
      }
      for (const outcome of node.o || []) inspect(outcome?.[2]);
    };
    inspect(event.fx);
    for (const choice of event.c || []) for (const outcome of choice.o || []) inspect(outcome?.[2]);
    for (const [flag, values] of seen) {
      if (values.has(1)) {
        if (!actualCreators.has(flag)) actualCreators.set(flag, []);
        actualCreators.get(flag).push(event.id);
      }
      if (values.has(0)) {
        if (!actualClearers.has(flag)) actualClearers.set(flag, []);
        actualClearers.get(flag).push(event.id);
      }
    }
    for (const flag of services.eventFlagRefs(event)) {
      if (!actualConsumers.has(flag)) actualConsumers.set(flag, []);
      actualConsumers.get(flag).push(event.id + " の条件");
    }
  }
  Object.entries(services.FLAG_REGISTRY).forEach(([flag, meta]) => {
    if (
      !meta.label ||
      !meta.description ||
      !meta.type ||
      !meta.valueDomain ||
      !meta.lifecycle ||
      !meta.source ||
      !meta.engine ||
      !meta.producers?.length ||
      !meta.consumers?.length ||
      !Array.isArray(meta.clearers) ||
      !Array.isArray(meta.engineClearers)
    )
      W_.push(`${flag}: フラグ台帳の型・寿命・出典・生成元・解除元・参照先が不足`);
    (meta.tags || []).forEach(tag => {
      if (!services.BT.has(tag)) W_.push(`${flag}: 未登録の状況タグ別名「${tag}」`);
    });
    const producers = actualCreators.get(flag) || [],
      clearers = actualClearers.get(flag) || [];
    if (!producers.length) W_.push(`${flag}: イベント生成元がない（未使用フラグの可能性）`);
    if (meta.producers?.join("|") !== producers.join("|"))
      W_.push(`${flag}: フラグ生成元の台帳がイベント定義と一致しない`);
    if (!Array.isArray(meta.clearers) || meta.clearers.join("|") !== clearers.join("|"))
      W_.push(`${flag}: フラグ解除元の台帳がイベント定義と一致しない`);
    const consumers = [meta.engine, ...(actualConsumers.get(flag) || [])];
    if (meta.consumers?.join("|") !== consumers.join("|"))
      W_.push(`${flag}: フラグ参照先の台帳がイベント定義と一致しない`);
  });
  services.ENGINE_CLEARED_FLAGS.forEach(flag => {
    if (!services.FLAG_REGISTRY[flag]?.engineClearers?.length)
      W_.push(`${flag}: エンジンによる解除条件の記録がない`);
  });
}
