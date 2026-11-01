// flags-and-world: original rule order and preparation timing are preserved.
function appendFlagsAndWorldTags(s, services, T) {
  Object.keys(s.fl || {}).forEach(k => {
    if (s.fl[k]) {
      T.add(k);
      (services.catalog.FLAG_REGISTRY[k]?.tags || []).forEach(tag => {
        if (tag !== "亡命" || (s.exileFrom && s.res.n !== s.exileFrom)) T.add(tag);
      });
    }
  });
  Object.keys(services.world.events).forEach(k => {
    if (services.world.events[k]) T.add("事件:" + k);
  });
}
