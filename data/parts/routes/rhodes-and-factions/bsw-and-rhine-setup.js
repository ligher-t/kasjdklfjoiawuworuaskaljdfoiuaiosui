// routes/rhodes-and-factions/bsw-and-rhine-setup: setup for Blacksteel Worldwide (BSW) and Rhine Lab routes.
window.TERRA_DATA_BUILD.fragment(
  "routes/rhodes-and-factions",
  "routes/rhodes-and-factions/bsw-and-rhine-setup"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  $terraData.SETTING_SOURCES.SRC_BSW_PMC = {
    title: "ブラックスチール・ワールドワイド (BSW) 企業資料",
    kind: "公式設定・人物記録・公式漫画黒鋼",
    note: "クルビアPMC、国際警護、要人警備、最新式銃火器と防護装備、ロドスとの業務提携"
  };

  $terraData.SETTING_SOURCES.SRC_RHINE_LAB = {
    title: "ライン生命 (Rhine Lab) 組織資料",
    kind: "公式設定・公式漫画ライン生命・孤星",
    note: "トリマウンツ最先端科学連合体、10の専門科、源石工学と研究倫理、ロドスへの亡命"
  };

  $define(
    "BSW_JOBS",
    {
      junior: 35,
      regular: 36,
      specialist: 37
    },
    false
  );

  $define(
    "RHINE_JOBS",
    {
      intern: 38,
      researcher: 39,
      chief: 40
    },
    false
  );

  // Append BSW and Rhine Lab jobs to J
  // Ensuring J index 35, 36, 37 for BSW and 38, 39, 40 for Rhine Lab
  for (const job of [
    { n: "BSW契約警備員・見習い", pay: 2400000, ex: 1.10 },
    { n: "BSW正規戦術オペレーター", pay: 4200000, ex: 1.25 },
    { n: "BSW特務スペシャリスト", pay: 6800000, ex: 1.40 },
    { n: "ライン生命研究実習生", pay: 2200000, ex: 1.05 },
    { n: "ライン生命専任研究員", pay: 4800000, ex: 1.15 },
    { n: "ライン生命主任研究員", pay: 8500000, ex: 1.30 }
  ]) {
    $terraData.J.push(job);
  }

  $define(
    "bswStaff",
    (jobKey, roleTitle, skillDelta = 3) => ({
      job: $terraData.BSW_JOBS[jobKey],
      lifeAffiliation: {
        id: "bsw-contract",
        title: "ブラックスチール・ワールドワイド",
        kind: "employer",
        action: "join",
        role: roleTitle,
        note: "クルビア本社での選考を経て警備契約を締結"
      },
      lifeGoal: {
        id: "bsw-work",
        title: "民間軍事会社BSWでプロとしての契約を果たす",
        priority: "生業",
        action: "start",
        preserveAchievement: true
      },
      lifeSkill: {
        id: "bsw-tactics",
        title: "戦術機動・防護火器運用",
        delta: skillDelta,
        context: "BSW戦術教練と装備点検"
      },
      groupStanding: {
        id: "bsw-colleagues",
        title: "BSWの同僚・小隊員",
        delta: 1,
        reason: "配属先で日々の警備任務を開始した"
      },
      p: 1,
      h: 1
    }),
    false,
    true
  );

  $define(
    "rhineStaff",
    (jobKey, roleTitle, skillDelta = 3) => ({
      job: $terraData.RHINE_JOBS[jobKey],
      lifeAffiliation: {
        id: "rhine-lab",
        title: "ライン生命医科学研究所",
        kind: "employer",
        action: "join",
        role: roleTitle,
        note: "トリマウンツ研究所での採用審査を通過"
      },
      lifeGoal: {
        id: "rhine-research",
        title: "ライン生命で最先端科学の真理を開拓する",
        priority: "生業",
        action: "start",
        preserveAchievement: true
      },
      lifeSkill: {
        id: "rhine-academic",
        title: "先端科学理論・実験計測技術",
        delta: skillDelta,
        context: "研究室でのデータ整理と実験業務"
      },
      groupStanding: {
        id: "rhine-colleagues",
        title: "ライン生命の研究仲間",
        delta: 1,
        reason: "研究室で業務を開始した"
      },
      p: 1,
      k: 2
    }),
    false,
    true
  );
});
