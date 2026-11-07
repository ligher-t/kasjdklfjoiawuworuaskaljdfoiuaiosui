// routes/regional-careers/setup: catalog, helpers, and sources for regional careers across all 19 regions.
window.TERRA_DATA_BUILD.fragment(
  "routes/regional-careers",
  "routes/regional-careers/setup"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";

  // Register setting sources for regional careers
  $terraData.SETTING_SOURCES.SRC_REGIONAL_CAREERS = {
    title: "テラ19地域 特色職種・キャリア体系資料",
    kind: "公式世界観・国家組織記録・地域生活誌",
    note: "全19地域の国家機関、軍隊、教会、マフィア、企業、伝統職種における選考・キャリア・過酷な現実"
  };

  $terraData.SETTING_SOURCES.SRC_HIGASHI_CAREERS = {
    title: "極東 南北朝・武家・電脳防諜資料",
    kind: "INVESTIGATED TERRA・公式人物記録・露華村記録",
    note: "北朝（鎖川）と南朝（御机）、侍・忍者、1088年鎖川サイバー攻撃とサイバーニンジャ、神職、東方重工"
  };

  $terraData.SETTING_SOURCES.SRC_VICTORIA_MILITARY = {
    title: "ヴィクトリア軍事・議会構造資料",
    kind: "メインテーマ10-14章・回想秘録・貴族院記録",
    note: "正規軍平民歩兵の過酷さ、王立前衛学校エリート将校、議会書記官、鉄道工廠重工業技師"
  };

  // Define regional job indices
  $define(
    "REG_JOBS",
    {
      // 東方 (41 - 50)
      yan_court: 41,
      yan_suis: 42,
      yan_tianshi: 43,
      lmd_guard: 44,
      lmd_black: 45,
      hig_samurai: 46,
      hig_ninja: 47,
      hig_cyber: 48,
      hig_shinto: 49,
      hig_touhou: 50,

      // 北西大国 (51 - 61)
      urs_officer: 51,
      urs_guard: 52,
      urs_academy: 53,
      vic_infantry: 54,
      vic_royal: 55,
      vic_scribe: 56,
      vic_works: 57,
      lei_golden: 58,
      lei_court: 59,
      lat_executor: 60,
      lat_landen: 61,

      // 企業・商業・自治 (62 - 67)
      col_pioneer: 62,
      kaz_comp_knight: 63,
      kaz_armorless: 64,
      sir_soldier: 65,
      sir_police: 66,
      sie_obs: 67,

      // 辺境・自然・海洋・特異 (68 - 82)
      sar_guard: 68,
      sar_warrior: 69,
      sam_priest: 70,
      sam_warrior: 71,
      kje_karlan: 72,
      kje_monk: 73,
      kazdel_mil: 74,
      kazdel_bone: 75,
      ibe_inq: 76,
      ibe_tuner: 77,
      bol_soldier: 78,
      bol_dossoles: 79,
      rim_eng: 80,
      min_champ: 81,
      min_orator: 82
    },
    false
  );

  // Append regional career jobs to J ensuring exact index alignment
  const regionalJobsList = [
    // 41 - 50: 東方
    { n: "炎国朝廷文官（科挙登用）", pay: 4500000, ex: 1.05 },
    { n: "炎国司歳台・大理寺監察官", pay: 4800000, ex: 1.25, war: 1.3 },
    { n: "炎国天師府・国家天師", pay: 3800000, ex: 1.15 },
    { n: "龍門近衛局（L.G.D.）警官", pay: 2800000, ex: 1.20, war: 1.2 },
    { n: "龍門黒市ブローカー", pay: 2200000, ex: 1.10 },
    { n: "極東武家・侍", pay: 3200000, ex: 1.20, war: 1.4 },
    { n: "極東・忍者（隠密）", pay: 2600000, ex: 1.30, war: 1.5 },
    { n: "極東・サイバーニンジャ", pay: 6000000, ex: 1.35 },
    { n: "極東・神職（神官・僧侶）", pay: 1400000, ex: 1.00 },
    { n: "東方重工・兵器技師", pay: 3600000, ex: 1.25 },

    // 51 - 61: 北西大国
    { n: "ウルサス帝国軍・近衛将校", pay: 4200000, ex: 1.30, war: 1.8 },
    { n: "ウルサス国境警備兵・炭鉱監視", pay: 1200000, ex: 1.40, war: 1.5 },
    { n: "ウルサス帝国科学院技師", pay: 3500000, ex: 1.15 },
    { n: "ヴィクトリア正規軍・歩兵", pay: 1600000, ex: 1.35, war: 1.6 },
    { n: "王立前衛学校卒エリート将校", pay: 5200000, ex: 1.30, war: 1.5 },
    { n: "ヴィクトリア帝国議会書記官", pay: 3800000, ex: 1.05 },
    { n: "ヴィクトリア重工業・鉄道工廠技師", pay: 3200000, ex: 1.20 },
    { n: "リターニア金律法衛", pay: 5000000, ex: 1.30, war: 1.4 },
    { n: "選帝侯領・宮廷音楽家", pay: 2800000, ex: 1.05 },
    { n: "ラテラーノ公証人役場執行人", pay: 4600000, ex: 1.25, war: 1.3 },
    { n: "ランデン修道院・修道銃士", pay: 2400000, ex: 1.10, war: 1.2 },

    // 62 - 67: 企業・商業・自治
    { n: "フロンティア開拓パイオニア", pay: 1800000, ex: 1.30 },
    { n: "商業連合会公認・企業騎士", pay: 4500000, ex: 1.35, war: 1.3 },
    { n: "カジミエーシュ無冑盟暗殺員", pay: 3000000, ex: 1.45, war: 1.6 },
    { n: "シラクーザ・ファミリー構成員", pay: 2800000, ex: 1.35, war: 1.5 },
    { n: "ウォルシーニ裁判所警察官", pay: 2600000, ex: 1.15, war: 1.2 },
    { n: "シエスタ火山観測所研究員", pay: 3000000, ex: 1.10 },

    // 68 - 82: 辺境・自然・海洋・特異
    { n: "パーディシャー宮廷親衛隊", pay: 3200000, ex: 1.30, war: 1.5 },
    { n: "アカフラ部族大勇士", pay: 1000000, ex: 1.20, war: 1.3 },
    { n: "サーミ雪祀（自然呪術者）", pay: 800000, ex: 1.15 },
    { n: "氷原境界哨戒戦士", pay: 1500000, ex: 1.50, war: 1.8 },
    { n: "カランド貿易・武装社員", pay: 3000000, ex: 1.20, war: 1.3 },
    { n: "曼珠院・聖山護衛僧", pay: 1200000, ex: 1.10 },
    { n: "軍事委員会・サルカズ正規兵", pay: 2500000, ex: 1.40, war: 2.0 },
    { n: "カズデル伝統骨鍛冶", pay: 2200000, ex: 1.25 },
    { n: "イベリア裁判所・見習い審問官", pay: 3600000, ex: 1.30, war: 1.4 },
    { n: "イベリア沿岸灯台調律師", pay: 2800000, ex: 1.20 },
    { n: "ボリバル正規・真正連合軍兵士", pay: 1100000, ex: 1.45, war: 1.8 },
    { n: "ドッソレス特区市警", pay: 3000000, ex: 1.15, war: 1.2 },
    { n: "レム・ビリトン採掘重機主任技師", pay: 3400000, ex: 1.30 },
    { n: "アテヌス英雄神殿競技勇士", pay: 2600000, ex: 1.25, war: 1.3 },
    { n: "ミノス市民集会・法廷弁論官", pay: 3000000, ex: 1.05 }
  ];

  for (const job of regionalJobsList) {
    $terraData.J.push(job);
  }

  // Recruitment outcomes establish the canonical employer for each regional job.
  // Duty scenes must follow an active posting, not a stale occupation identifier.
  const regionalCareerEmployers = new Map();
  $define(
    "regionalCareerOnDuty",
    (s, jobKey) => {
      const employer = regionalCareerEmployers.get(jobKey);
      return !!employer &&
        s.job === $terraData.REG_JOBS[jobKey] &&
        $rules.affiliations.canWork(s, employer);
    },
    false,
    true
  );

  // Helper function to build a regional career entry effect
  $define(
    "regionalCareerStaff",
    (jobKey, affiliationId, affiliationTitle, roleTitle, goalId, goalTitle, skillId, skillTitle, opts = {}) => {
      const assigned = regionalCareerEmployers.get(jobKey);
      if (assigned && assigned !== affiliationId)
        throw new Error("Conflicting regional career employer for " + jobKey);
      regionalCareerEmployers.set(jobKey, affiliationId);
      const effect = {
        job: $terraData.REG_JOBS[jobKey],
        lifeAffiliation: {
          id: affiliationId,
          title: affiliationTitle,
          kind: "employer",
          action: "join",
          role: roleTitle,
          note: opts.note || `${affiliationTitle}での選考を経て正式に配属`
        },
        lifeGoal: {
          id: goalId,
          title: goalTitle,
          priority: "生業",
          action: "start",
          preserveAchievement: true
        },
        p: opts.p || 0,
        k: opts.k || 0,
        h: opts.h || 0
      };
      if (skillId && skillTitle) {
        effect.lifeSkill = {
          id: skillId,
          title: skillTitle,
          delta: opts.skillDelta || 3,
          context: opts.skillContext || "配属初期の専門研修と実務訓練"
        };
      }
      if (opts.standingId && opts.standingTitle) {
        effect.groupStanding = {
          id: opts.standingId,
          title: opts.standingTitle,
          delta: opts.standingDelta || 1,
          reason: opts.standingReason || "配属先で日々の業務を開始した"
        };
      }
      if (opts.cashDelta) effect.cash = opts.cashDelta;
      if (opts.debtDelta) effect.debt = opts.debtDelta;
      if (opts.fl) effect.fl = { ...(opts.fl) };
      return effect;
    },
    false,
    true
  );
});
