// Annual death-risk candidates; called from the event dispatcher.
function D(s) {
  const a = s.age,
    ea = a / Math.max(0.3, s.r?.lm || 1),
    r = s.res,
    t = s.t,
    j = J[s.job] || {},
    isLandship = isRhodesLandshipResident(s),
    po = s.w.i < P("condition.povertyWealthIndex"),
    hp = (100 - s.h) / 100,
    o = [],
    m = mortalityState(s);
  const deathCauseModifier = cause => {
    const category = cause === "天災による死亡" ? "天災" :
      cause.startsWith("事故死") ? "事故死" :
      cause.startsWith("病死") || cause.includes("病死") ? "病死" :
      cause.startsWith("殉職") ? "戦死・戦争被害" :
      cause.startsWith("他殺") || cause.includes("私刑") || cause.includes("暗殺") ? "他殺" :
      ["戦闘職務中の死亡", "戦争に伴う民間人死亡", "都市モジュール衝突・砲撃被災", "闘技場での致命傷（競技・地下闘技）"].includes(cause) ? "戦死・戦争被害" :
      ["刑の執行", "粛清による死亡", "迫害死（ゼルグラード燃料化虐殺）", "国家機密漏洩・密告者処刑"].includes(cause) ? "処刑・粛清" : null;
    return r.dm?.[cause] ?? (category ? r.dm?.[category] : undefined) ?? 1;
  };
  const A = (p, c, l, episode = null) => {
    if (Number.isFinite(p) && p > 0) o.push({ p: Math.min(0.95, p * deathCauseModifier(c)), c, l,
      ...(episode?.id ? { episodeId: episode.id } : {}) });
  };
  const active = kind => m.episodes.find(x => x.status === "active" && x.kind === kind),
    severe = kind => {
      const ep = active(kind);
      return ep?.severity >= 3 ? ep : null;
    };
  const protectedCare = ep =>
    ep?.careUntilYear != null && ep.careUntilYear >= s.year ? P("mortality.episodeCareReduction") : 1;
  const baseIll =
    P("life.generalMortalityBase") +
    hp * hp * P("life.generalMortalityHealthScale") * (1 + ea / P("death.generalMortalityAgeScale"));
  A(
    a < 5 ? P("death.infantBase") * (po ? P("death.povertyMortalityScale") : 1) * (0.5 + hp) : 0,
    "病死（小児期の急性疾患）",
    ["小児期の急な病気が重くなり、亡くなった。", "体調が急変し、回復できないまま亡くなった。"]
  );
  const illnessTypes = [
    [
      "respiratory",
      "病死（呼吸器の病）",
      ["息苦しさを伴う病状が悪化し、命を落とした。", "呼吸器の病状が長引き、体力が戻らないまま亡くなった。"]
    ],
    [
      "circulatory",
      "病死（循環器の病）",
      ["心臓や循環器に関わる病状が悪化し、亡くなった。", "循環器の不調が重なり、亡くなった。"]
    ],
    [
      "vascular",
      "病死（脳血管の病）",
      ["手足の動きに影響していた病状が重くなり、亡くなった。", "血管に関わる病状が悪化し、亡くなった。"]
    ],
    [
      "occupational",
      "病死（職業に関わる慢性疾患）",
      ["仕事の間に続いていた身体の不調が悪化し、亡くなった。", "長く続いた不調が重くなり、回復できなかった。"]
    ],
    [
      "nutrition",
      "衰弱による死亡",
      [
        "十分な食事と休養が得られない状態が続き、亡くなった。",
        "療養と生活の支えが足りず、衰弱が進んで亡くなった。"
      ]
    ],
    [
      "injury",
      "負傷の合併症による死亡",
      ["以前の負傷から体調が回復せず、合併症により亡くなった。", "負傷の後の経過が悪化し、亡くなった。"]
    ]
  ];
  for (const [kind, category, texts] of illnessTypes) {
    const ep = severe(kind);
    if (!ep) continue;
    const rate =
      kind === "nutrition"
        ? P("mortality.precarityBase") * ep.severity
        : baseIll * (ep.severity === 4 ? 2.1 : 1.2);
    const palliative = isLandship && ep.severity >= 3 && s.h < 25;
    A(rate * protectedCare(ep) * (s.h < 25 ? 1.5 : 1),
      palliative ? "病死（ロドス医療部での看取り）" : category,
      palliative ? ["記録されていた重い病状が悪化し、ロドスの医務室で療養を続けたが、回復できずに亡くなった。"] : texts, ep);
  }
  const op = severe("oripathy");
  if (op && s.inf) {
    const scale = Math.max(0, s.ob - P("death.oripathyStart")) / P("death.oripathyScale");
    A(
      scale *
        P("death.oripathyBase") *
        (s.ac ? P("death.oripathyAcuteScale") : 1) *
        (1 + a / P("death.oripathyAgeScale")) *
        protectedCare(op) *
        (s.fl.tx ? P("mortality.episodeCareReduction") : 1),
      isLandship ? "病死（ロドス医療部での看取り）" : "病死（鉱石病）",
      isLandship ? ["鉱石病に伴う重い病状が悪化し、ロドスの医務室で療養を続けたが、回復できずに亡くなった。"] : [
        "鉱石病の合併症が悪化し、亡くなった。",
        "鉱石病に伴う身体機能の低下が進み、亡くなった。",
        "症状が重くなり、亡くなった。"
      ], op
    );
  }
  // The old illness state is still honored when the new episode has not yet been staged.
  if (!illnessTypes.some(([kind]) => severe(kind)) && s.h <= 18 && (s.illness?.stage || 0) >= 3)
    A(baseIll * (s.illness?.treated ? 0.4 : 1), "病死（病状の悪化）", [
      "長く続いた病状が重くなり、回復できずに亡くなった。",
      "全身の状態が悪化し、回復できずに亡くなった。"
    ]);
  A(
    a > 18 ? P("mortality.suddenAcuteBase") * (1 + Math.max(0, ea - 30) / 28) * (1 + hp * 0.6) : 0,
    "急病（前兆の乏しい急変）",
    ["突然体調が急変し、亡くなった。", "それまでの生活の中で予期できなかった急病により、亡くなった。"]
  );
  A(
    ea > P("life.oldAgeMortalityStart")
      ? (ea - P("life.oldAgeMortalityStart")) * P("life.oldAgeMortalitySlope") * (s.h < 40 ? 1.4 : 1)
      : 0,
    "老衰",
    ["年齢とともに少しずつ体力が落ち、長い人生を終えた。", "長い時間を生き、徐々に衰弱して亡くなった。"]
  );
  const work = (j.ex || 1) > 1 || s.fl.workplace_hazard || s.f === 8,
    travel = s.job === 16 || (!!s.moves?.at(-1) && s.year - s.moves.at(-1).year <= 1);
  const safety = m.exposureProtectionUntilYear >= s.year ? 0.42 : 1;
  const accident =
    (P("life.accidentMortalityBase") +
      (ea > P("death.accidentOlderAgeLimit") ? P("death.accidentOlderAgeBase") : 0)) *
    (t.acc || 1) *
    (0.75 + (s.local?.hazard || 0) * 0.5);
  const isDustZone = !isLandship && (s.local?.kind === "工業・採掘地域" || s.fl.workplace_hazard || s.f === 8) && (work || s.job === 2);
  A(isDustZone ? accident * 0.45 * (j.ex || 1) * safety : 0, "事故死（源石粉塵吸入・爆発）", [
    "採掘・精錬区画での高濃度源石粉塵の爆発に巻き込まれ、命を落とした。",
    "換気停止による高濃度源石粉塵の急速吸入により、急性塞栓を起こして亡くなった。"
  ]);
  A(work ? accident * (j.ex || 1) * safety * (s.f === 8 ? 1.25 : 1) * (isDustZone ? 0.6 : 1) : 0, "事故死（作業現場）", [
    "作業現場の事故に巻き込まれ、亡くなった。",
    "復旧作業中の事故で致命的な傷を負い、亡くなった。",
    "作業中の機材の事故により、亡くなった。"
  ]);
  A(travel ? accident * 0.65 : accident * 0.12, "事故死（移動中）", [
    "移動中に事故に遭い、亡くなった。",
    "輸送車両を利用しているときに事故に巻き込まれ、亡くなった。"
  ]);
  A(accident * 0.13, "事故死（火災・建物）", [
    "建物の火災で避難が間に合わず、亡くなった。",
    "居住区の事故に巻き込まれ、亡くなった。"
  ]);
  A(accident * (work ? 0.14 : 0.38), "事故死（不慮の転倒・負傷）", [
    "不慮の転倒で重傷を負い、亡くなった。",
    "思いがけない事故による負傷が命に関わり、亡くなった。"
  ]);
  const displaced = !isLandship && !!(s.fl.disaster_displaced || s.displacement?.status === "shelter" || s.displacement?.status === "displaced");
  const disaster = isLandship ? 0 :
    P("life.disasterMortalityBase") *
    (s.home === "固定集落" ? P("death.disasterFixedSettlementScale") : 1) *
    (0.65 + (s.local?.hazard || 0) * 0.6);
  A(
    disaster * (displaced ? 1.4 : 1),
    "天災による死亡",
    displaced
      ? ["避難中に天災の被害を受け、亡くなった。", "仮住まいで新たな災害に遭い、亡くなった。"]
      : s.home === "移動都市"
        ? ["移動都市の一部が天災の被害を受け、亡くなった。", "天災により居住区が損壊し、亡くなった。"]
        : ["居住地を襲った天災に巻き込まれ、亡くなった。", "天災による建物の損壊で命を落とした。"]
  );
  const warPressureVal = worldPressure(s, "war");
  const war =
    r.war *
    (r.n === "極東" && s.year < P("world.farEastWarReliefUntil") ? P("world.farEastWarReliefScale") : 1) *
    (j.war || 1) *
    warPressureVal;
  const activeWarDuty = j.n === "傭兵・護衛" || j.n === "軍務・兵站";
  const civilianPeaceScale = (isLandship || (!activeWarDuty && !s.fl.veteran && warPressureVal <= 1)) ? 0.2 : 1;
  const cityBombardment = !isLandship && warPressureVal > 1 && s.home === "移動都市" && !activeWarDuty;
  A(
    cityBombardment ? war * P("life.warMortalityBase") * 0.25 : 0,
    "都市モジュール衝突・砲撃被災",
    [
      "移動都市同士の交戦による主砲射爆と装甲モジュールの破断・衝突に巻き込まれ、命を落とした。",
      "砲撃による移動都市の外壁崩落に居住区ごと押し潰され、命を落とした。"
    ]
  );
  A(
    !isLandship ? war * P("life.warMortalityBase") * (activeWarDuty ? 2 : s.fl.veteran ? 1.4 : 0.45) * civilianPeaceScale : 0,
    activeWarDuty ? "戦闘職務中の死亡" : "戦争に伴う民間人死亡",
    activeWarDuty
      ? j.n === "軍務・兵站"
        ? ["軍務・兵站の任務中、戦闘に巻き込まれて命を落とした。", "任務先で戦闘が起こり、帰らなかった。"]
        : ["護衛の任務中、戦闘に巻き込まれて命を落とした。", "警護先で戦闘が起こり、帰らなかった。"]
      : ["戦乱の影響が暮らしに及ぶなか、亡くなった。", "争いの続く地域で命を落とした。"]
  );
  const crime = s.fl.informant || s.fl.criminal_yakuza ? P("death.crimeAssociationScale") : 1;
  A(
    !isLandship && a >= P("death.homicideAgeMin") ? P("life.homicideMortalityBase") * (t.vio || 1) * crime * 0.68 : 0,
    "他殺（犯罪）",
    ["犯罪に巻き込まれ、殺害された。", "街で起きた暴力事件に巻き込まれて亡くなった。"]
  );

  // --- ロドス・アイランド所属・本艦居住者特有の死因 ---
  if (isLandship || s.fl?.rhodes) {
    const jobName = j.n || "";
    // 1. ロドス外勤オペレーター・行動予備隊の殉職
    const isCombatDuty = /外勤オペレーター|行動予備隊/.test(jobName);
    if (isCombatDuty) {
      const fieldRisk = P("life.warMortalityBase") * 1.35 * (s.h < 35 ? 1.5 : 1.0) * (warPressureVal > 1 ? 1.3 : 1.0);
      A(fieldRisk, "殉職（ロドス外勤作戦）", [
        "ロドスの作戦オペレーターとして紛争地域の感染者救出任務に出動し、敵性勢力の強襲を食い止める殿軍を務めて戦死した。",
        "危険地帯での極秘回収作戦中、激しい交戦により致命傷を負い、同僚たちを脱出させた後に息を引き取った。"
      ]);
    }

    // 2. トランスポーターの殉職（天災観測・救護輸送）
    const isTransporterDuty = /トランスポーター/.test(jobName);
    if (isTransporterDuty) {
      const transRisk = P("life.disasterMortalityBase") * 1.25 * (s.h < 40 ? 1.4 : 1.0);
      A(transRisk, "殉職（天災観測・救護輸送）", [
        "荒野での天災進路観測と感染者避難民の誘導任務中、急激に進路を変えた天災の二次波及に巻き込まれ、通信を最後に消息を絶った。",
        "補給路を遮断された孤立小隊へ医療物資を届ける強行輸送任務の最中、荒野の悪天候と暴徒の待ち伏せに遭い、積荷を守り抜いて殉職した。"
      ]);
    }

    // 3. 艦内研究・機関事故
    const isFacilityStaff = isLandship && /研究|整備/.test(jobName);
    if (isFacilityStaff) {
      const facilityRisk = accident * 0.28 * safety;
      A(facilityRisk, "事故死（ロドス艦内研究・機関事故）", [
        "艦内研究室での高活性源石サンプルの安定化実験中、予期せぬアーツ干渉による共振暴走が発生し、防護隔壁を閉鎖して同僚を避難させた末に殉職した。",
        "航行中の本艦主機関部における超高圧蒸気パイプ破断事故に際し、艦の暴走を防ぐため機関室に踏みとどまり、緊急バルブを遮断して命を落とした。"
      ]);
    }

    // Medical-department endings above use the same recorded disease progression
    // and care modifiers as other residents; infection alone is not terminal.
  }
  const threat = m.threat?.status === "active",
    protect = m.threat?.safeUntilYear >= s.year ? 0.35 : 1;
  A(
    threat
      ? P("mortality.violentThreatBase") *
          protect *
          (s.fl.criminal_yakuza || s.fl.debt_yakuza || s.fl.siracusa_feud ? 1.3 : 1)
      : 0,
    s.fl.criminal_yakuza || s.fl.debt_yakuza || s.fl.siracusa_feud
      ? "他殺（抗争・報復）"
      : "他殺（迫害・脅迫）",
    s.fl.criminal_yakuza || s.fl.debt_yakuza || s.fl.siracusa_feud
      ? ["対立していた集団の暴力に巻き込まれ、亡くなった。", "過去の抗争が再燃し、命を落とした。"]
      : ["以前から続いていた脅迫が暴力事件に発展し、亡くなった。", "排斥を伴う暴力に巻き込まれて亡くなった。"]
  );
  const crisis = m.crisis,
    crisisRisk = crisis?.status === "active" && crisis.years >= 2 && s.age >= 14;
  A(
    crisisRisk
      ? P("mortality.suicideCrisisBase") *
          (crisis.supportedUntilYear >= s.year ? 0.2 : 1) *
          Math.min(1.8, 0.7 + crisis.years * 0.15) *
          (s.p < 15 ? 1.5 : 1)
      : 0,
    "自死",
    ["深刻な苦しさが続く中、自ら命を絶った。そこに至った事情を一つの原因だけで説明することはできない。"]
  );
  const execution = s.legal?.executionWarrant,
    basis = execution?.basis,
    grounded =
      execution?.status === "issued" &&
      Number.isInteger(execution.year) &&
      execution.year <= s.year &&
      ["rebellion_conviction", "security_conviction", "documented_purge"].includes(basis) &&
      typeof execution.sourceEventId === "string";
  if (grounded)
    A(a >= 16 ? P("death.executionBase") : 0, basis === "documented_purge" ? "粛清による死亡" : "刑の執行", [
      basis === "documented_purge"
        ? "政治的な粛清により、命を落とした。"
        : "記録に残る判決により、刑が執行された。"
    ]);
  // Additional Terra-specific cause models
  if (s.inf && displaced) {
    A(0.0035 * (po ? 1.8 : 1) * (s.h < 30 ? 1.5 : 1), "隔離・追放による衰弱死", [
      "移動都市を追放された後、医療も水も得られない緩衝区画で行き倒れ、衰弱して息を引き取った。",
      "都市の外周隔離地帯で配給と医療を断たれ、飢えと衰弱により命を落とした。"
    ]);
  }
  const coldZone = !isLandship && (r.n === "サーミ" || (r.n === "ウルサス" && (s.local?.city === "クライニ・セーヴェル" || s.home !== "移動都市")));
  if (coldZone && (po || displaced || travel || s.h < 25)) {
    A(0.003 * (po ? 1.8 : 1) * (displaced ? 2.2 : 1) * (s.h < 25 ? 1.5 : 1), "凍死（極寒・吹雪での遭難）", [
      "激しい吹雪と極度の冷え込みの中、暖をとる術を失って低体温症で亡くなった。",
      "極北の荒野で行く手を雪嵐に阻まれ、凍死した。"
    ]);
  }
  const desertZone = !isLandship && r.n === "サルゴン" && (s.home === "固定集落" || travel || displaced || s.local?.kind === "交易・市場都市");
  if (desertZone && (travel || displaced || po || s.h < 25)) {
    A(0.0028 * (travel || displaced ? 2 : 1) * (po ? 1.4 : 1), "遭難死（熱砂・脱水）", [
      "熱砂の荒野で水が尽き、脱水症状により行き倒れて亡くなった。",
      "砂嵐に巻かれて隊商から逸脱し、灼熱の砂漠で命を落とした。"
    ]);
  }
  const coastalAegir = !isLandship && r.n === "イベリア" && (s.local?.kind === "漁村・沿岸集落" || s.r?.n === "エーギル" || travel);
  if (coastalAegir) {
    A(0.001 * (s.r?.n === "エーギル" ? 2 : 1) * (s.p < 30 ? 1.5 : 1), "海の怪異（恐魚の捕食・同化・海への喪失）", [
      "海から這い上がった異形の怪物に引きずり込まれるか、あるいは自ら海へ還るように姿を消した。",
      "打ち捨てられた沿岸で未知の深海怪異に接触し、肉体と意識が異形に変貌した末に波間へ消えた。"
    ]);
  }
  const samiDemon = !isLandship && r.n === "サーミ" && (s.job === 6 || travel || s.home !== "移動都市");
  if (samiDemon) {
    A(0.0009 * (s.p < 30 ? 1.5 : 1), "極北の虚無・悪魔（未知の侵食による消失）", [
      "北方の大地で名状しがたい影と接触し、肉体と精神の輪郭を失って消息を絶った。",
      "極北の氷原深部で人智を超えた虚無の怪異に触れ、存在そのものを世界から削ぎ落とされた。"
    ]);
  }
  const wildBeastHazard = !isLandship && (travel || s.job === 16 || s.home === "固定集落" || s.home === "荒野") &&
    ["サルゴン", "クルビア", "サーミ", "リム・ビリトン", "カズデル"].includes(r.n);
  if (wildBeastHazard) {
    A(0.0035 * (po ? 1.4 : 1) * (travel ? 1.8 : 1), "獣害（狂暴化源石獣の襲撃）", [
      "荒野の輸送路で狂暴化した源石獣の群れに襲撃され、荒野の土となった。",
      "隊商の移動中に狂暴化した猛獣の襲撃を受け、車両ごと蹂躙されて命を落とした。"
    ]);
  }
  const highDiscrimCity = !isLandship && ["ウルサス", "リターニア", "ヴィクトリア", "シラクーザ"].includes(r.n);
  const clinicRefused = s.fl?.ed_clinic_delayed || s.fl?.ed_clinic_deferred_again || s.fl?.ed_relief_unserved;
  if (s.inf && highDiscrimCity && (po || clinicRefused) && (active("injury") || s.h < 30)) {
    A(0.004 * (po ? 1.8 : 1) * (s.h < 25 ? 1.6 : 1), "医療拒絶による病死（敗血症・門前払い）", [
      "本来なら手当てできたはずの傷口から菌が回り、どの診療所からも門前払いを食らった末に高熱で命を落とした。",
      "感染者であることを理由に診察を拒まれ、悪化した傷と高熱のなかで路地裏で息を引き取った。"
    ]);
  }
  const clinicalTrialRisk = !isLandship && (r.n === "クルビア" || s.debt >= 30000) && (s.fl?.col_tech_waiver_signed || s.fl?.rhine_whistleblower);
  if (clinicalTrialRisk) {
    A(0.006 * (s.debt >= 50000 ? 1.8 : 1), "生体実験・未承認薬投与による死亡", [
      "製薬企業の隔離施設で未承認の新薬を投与され、激しい急性拒絶反応により実験台の上で事切れた。",
      "高濃度源石触媒の過剰投与によるショック症状を起こし、実験台の上で息絶えた。"
    ]);
  }
  const lynchRisk = (s.r?.n === "サルカズ" || s.fl?.exposed || (s.ob || 0) >= 40) && highDiscrimCity &&
    (s.fl?.ed_violent_threat || s.fl?.ed_sarkaz_lodging_refused || s.fl?.housing_exclusion);
  if (lynchRisk) {
    A(0.0045 * (s.r?.n === "サルカズ" ? 1.5 : 1) * (s.fl?.ed_violent_threat ? 1.8 : 1), "私刑による死亡（暴徒のリンチ・放火）", [
      "興奮した排斥暴徒にアパートを取り囲まれ、火を放たれるか集団暴行を受けて命を落とした。",
      "排斥を叫ぶ暴徒に取り囲まれて住居を焼き討ちされ、逃げ場のないまま命を落とした。"
    ]);
  }
  const urbanSmog = !isLandship && (r.n === "ヴィクトリア" || s.local?.kind === "移動都市の下層・工業区") &&
    (active("respiratory") || ea > 60 || a < 8) && (po || s.local?.hazard > 0);
  if (urbanSmog) {
    A(0.0035 * (active("respiratory") ? 2 : 1) * (po ? 1.4 : 1), "事故死（都市煤煙・急性スモッグ窒息）", [
      "移動都市の機関部から噴出した濃厚な有毒煤煙が下層区画に滞留し、急性窒息により命を落とした。",
      "過密工業区に滞留した源石煤煙を吸い込み、肺胞を焼かれて窒息死した。"
    ]);
  }
  const mineCollapseRisk = !isLandship && (work || s.job === 2 || s.f === 8) && ["レム・ビリトン", "ウルサス", "カズデル"].includes(r.n);
  if (mineCollapseRisk) {
    A(accident * 0.4 * (j.ex || 1) * safety, "事故死（落盤・坑道崩落生き埋め）", [
      "支柱の破断とともに頭上の岩盤が崩落し、暗黒の地下深くに生き埋めとなった。",
      "坑道の落盤事故に巻き込まれ、退路を断たれて地下深くで命を落とした。"
    ]);
  }
  const arenaRisk = !isLandship && ((r.n === "カジミエーシュ" && s.job === 4) || s.fl?.arena || s.fl?.street_fighter);
  if (arenaRisk) {
    A(0.006 * (s.h < 40 ? 1.6 : 1), "闘技場での致命傷（競技・地下闘技）", [
      "熱狂する観衆の歓声の中、対戦相手の無慈悲な一撃を受けて競技場の砂の上に倒れ伏した。",
      "地下闘技場での過激な死闘の末に致命傷を負い、蘇生措置も間に合わずに絶命した。"
    ]);
  }
  const omertaRisk = !isLandship && r.n === "シラクーザ" && (s.fl?.criminal_yakuza || s.fl?.siracusa_feud || s.fl?.informant) &&
    m.threat?.status === "active";
  if (omertaRisk) {
    A(0.0055 * (s.fl?.informant ? 1.8 : 1), "暗殺・粛清（組織の掟・オメルタの執行）", [
      "ファミリーの掟に触れたか、対立組織のヒットマンにより夜の路地で銃撃され命を落とした。",
      "沈黙の掟を破った代償として、雨の夜の路地裏で暗殺者の凶弾に倒れた。"
    ]);
  }
  const whistleblowerRisk = a >= 16 && (s.fl?.cyber_trace || s.fl?.rhine_whistleblower || s.fl?.informant) &&
    (m.threat?.status === "active" || s.fl?.detained || s.fl?.custody_contact);
  if (whistleblowerRisk) {
    A(0.008, "国家機密漏洩・密告者処刑", [
      "国家の暗部に関わる機密に触れた代償として情報機関に拘束され、公式記録から抹消されたまま処刑された。",
      "軍事機密の漏洩に関わったとして秘密警察に連行され、裁判なしで処刑された。"
    ]);
  }
  const honorMartyrdomRisk = a >= 16 &&
    (s.fl?.detained || s.fl?.custody_contact || s.fl?.ursus_katorga_detained) &&
    (s.job === 4 || s.fl?.veteran || (r.n === "ラテラーノ" && s.r?.n === "サンクタ" && s.job === 4));
  if (honorMartyrdomRisk) {
    A(0.018, "名誉の自決（矜持・信仰・拷問拒絶の自裁）", [
      "敵の過酷な拷問に耐えかねて同胞を売る屈辱を拒み、あるいは騎士としての矜持を守り通すため、誇り高く自ら命を絶った。",
      "捕縛された屈辱と主家への背信を拒み、武人の誇りを守るため自ら刃を取って果てた。"
    ]);
  }
  const artsCapable = s.job === 3 || (s.arts || 0) >= 40 || !!s.lifeRecord?.skills?.some(x => x.id?.includes("arts") || x.title?.includes("アーツ"));
  if (artsCapable && s.inf && (s.p < 22 || s.ob >= 65)) {
    A(0.0055 * (s.p < 15 ? 1.6 : 1), "アーツ暴走による自壊", [
      "感情の昂ぶりとともに体内の源石結晶が過剰励起を起こし、アーツの暴走により肉体が内側から自壊した。",
      "極度の苦痛の中で制御を失ったアーツが体内を焼き尽くし、源石の結晶化が急激に全身へ暴発して命を落とした。"
    ]);
  }
  const inZelgrad = !isLandship && r.n === "ウルサス" && s.local?.city === "ゼルグラード";
  if (s.year === 1102 && inZelgrad && s.inf && !s.fl?.zelgrad_evacuated) {
    A(0.28, "迫害死（ゼルグラード燃料化虐殺）", [
      "1102年初頭のゼルグラードにおいて、都市燃料の枯渇に直面した当局により、炉心の源石燃料として感染者集約施設で虐殺された。"
    ]);
  }
  return o;
}
