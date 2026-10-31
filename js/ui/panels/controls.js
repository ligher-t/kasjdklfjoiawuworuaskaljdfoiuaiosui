function renderControlsPanel(s, services) {
  const c = s.cn || { g: 0, b: 0, n: 0 };
  services.$("cnt").textContent = `順調な出来事 ${c.g}件 / 困難な出来事 ${c.b}件 / 日常の出来事 ${c.n}件`;
  [...services.$("fc").children].forEach((x, i) => {
    x.classList.toggle("on", s.f == i);
    if (!x.dataset.normalTitle) x.dataset.normalTitle = x.title;
    const blocked = services.restricted(s) && ![0, 1, 4].includes(i);
    x.disabled = s.age < services.P("life.policyStartAge") || s.dead || blocked;
    x.title = blocked
      ? "収容・隔離中はこの方針を選べない"
      : services.restricted(s) && i === 1
        ? "自習で知識を増やす。通学と学歴の進行は中断する"
        : services.restricted(s) && i === 4
          ? "休める時間に体を休める"
          : x.dataset.normalTitle;
  });
  if (typeof syncLifePolicyLabel === "function") syncLifePolicyLabel();
}
