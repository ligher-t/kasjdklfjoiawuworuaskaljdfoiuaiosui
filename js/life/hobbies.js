const HOBBY_MODE_SCALE = { full: 1, reduced: 0.35, shared: 0, paused: 0 };
const HOBBY_META = {
  hobby_music: { title: "音楽", skill: "演奏", delta: 0.9 },
  hobby_craft: { title: "手仕事", skill: "手仕事", delta: 1 },
  hobby_garden: { title: "植物", skill: "栽培", delta: 0.9 },
  hobby_sport: { title: "運動・武術", skill: "身体技法", delta: 0.8 },
  hobby_collect: { title: "収集", skill: "調査と整理", delta: 0.7 },
  hobby_story: { title: "物語・唄・信仰", skill: "語りと伝承", delta: 0.8 }
};
const hobbyAnnualExpense = (s, costPm = s.res.pm * (s.priceIndex || 1), override = null) =>
  ["hobby_music", "hobby_craft", "hobby_garden", "hobby_sport", "hobby_collect", "hobby_story"].reduce(
    (sum, key) => {
      const mode = override?.key === key ? override.mode : s.hobbyModes?.[key];
      return sum + (s.fl?.[key] ? P("economy.hobbyAnnualCost") * (HOBBY_MODE_SCALE[mode] ?? 1) * costPm : 0);
    },
    0
  );
const hobbyCostForKey = (s, key, mode = s.hobbyModes?.[key] || "full") =>
  s.fl?.[key] && HOBBY_META[key]
    ? P("economy.hobbyAnnualCost") * (HOBBY_MODE_SCALE[mode] ?? 1) * s.res.pm * (s.priceIndex || 1)
    : 0;
