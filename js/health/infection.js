// Route-specific onset ranges are narrative game assumptions, not clinical statistics.
function initializeInfection(s, route = "unconfirmed", extraLoad = 0) {
  const profiles = { dust:[6,20,0.16,"呼吸器"], wound:[14,32,0.28,"創傷部"],
    "deep-wound":[28,50,0.48,"深い創傷部"], mixed:[12,34,0.3,"創傷部・呼吸器"] },
    profile = profiles[route] || [P("infection.diagnosisRollMin"),P("infection.diagnosisRollMax"),P("infection.acuteShare"),null],
    initialLoad = Math.min(100,Math.max(s.ob||0,rnd(profile[0],profile[1])) + Math.max(0,extraLoad||0));
  if(route !== "unconfirmed" && !profiles[route])throw Error("源石曝露の経路が不正");
  s.inf=1;s.ob=initialLoad;s.ac=R()<profile[2];
  s.infectionOnset={route:profiles[route]?route:"unconfirmed",initialLoad,acute:!!s.ac,
    affectedArea:profile[3],year:s.year,basis:"game-model"};
  if(route==="deep-wound")startMortalityEpisode(s,"injury",3,"crystal-penetration");
}
function oriState(s) {
  if (!s.oripathyExposure || typeof s.oripathyExposure !== "object")
    s.oripathyExposure = {
      version: 3,
      history: [],
      protectionUntilYear: null,
      reviewDueYear: null,
      screeningRequestedYear: null
    };
  const o = s.oripathyExposure;
  if (!Array.isArray(o.history)) o.history = [];
  return o;
}
function oriRecord(s, kind, note, extra = {}) {
  const o = oriState(s);
  o.history.push({ year: s.year, kind, note, region: s.res?.n || null, ...extra });
  o.history = o.history.slice(-36);
}
function oriAnnualChance(s) {
  if (isRhodesLandshipResident(s)) {
    const jobName = J[s.job]?.n || "";
    // ロドス外勤オペレーターまたはトランスポーターのみ、荒野・危険作戦現場出動に伴うごく稀なリスク
    if (/外勤オペレーター|トランスポーター/.test(jobName)) {
      return 0.004;
    }
    return 0; // 本艦内生活・勤務職員は厳重な防護・換気・医療管理により環境感染ゼロ
  }
  const o = oriState(s),
    jobName = J[s.job]?.n || "";
  // Civil wars, generic neighbourhood danger and species labels are not, by
  // themselves, physical infection routes. Occupational proximity is only
  // a gameplay proxy; explicit crystal/dust accidents are separate events.
  const sourceWork =
    /鉱夫|工場労働者|アーツ技師|修理・整備工|建設・水道設備|測量・天災後の復旧|トランスポーター|軍務・兵站|技師/.test(
      jobName
    );
  const work = sourceWork ? Math.max(0.75, Math.min(2.4, J[s.job]?.ex || 1)) * 1.12 : 1;
  const industrial = s.local?.kind === "工業・採掘地域";
  const district = industrial ? P("infection.worksiteFactor") : 1;
  const sourceProximity = P("infection.hazardBase") + (industrial ? P("infection.hazardScale") * 0.8 : 0);
  const crisis =
    s.fl?.disaster_displaced || s.fl?.war_displaced || s.fl?.kazdel_displaced
      ? P("infection.warDisplacementFactor")
      : 1;
  const protection = o.protectionUntilYear >= s.year ? P("infection.protectionMultiplier") : 1;
  const sarkazSusceptibility = s.r?.n === "サルカズ" ? 1.65 : 1;
  return Math.max(
    0,
    Math.min(
      0.22,
      s.res.inf * P("infection.regionRateScale") * sourceProximity * work * district * crisis * protection * sarkazSusceptibility
    )
  );
}
function oriSuspectedSetting(s) {
  const job = J[s.job]?.n || "仕事の記録なし";
  if (s.fl?.disaster_displaced || s.fl?.war_displaced)
    return { code: "debris", label: "避難・復旧時に接した瓦礫や粉塵", basis: "exposure-setting-estimate" };
  if (s.local?.kind === "工業・採掘地域")
    return {
      code: "industrial",
      label: "工業・採掘区域での源石を含む物質への接触機会",
      basis: "exposure-setting-estimate"
    };
  if ((J[s.job]?.ex || 1) > 1.25)
    return {
      code: "occupational",
      label: job + "の業務環境における源石への接触機会",
      basis: "exposure-setting-estimate"
    };
  return { code: "environment", label: "生活圏内の源石への接触機会", basis: "exposure-setting-estimate" };
}
function oriApplyAction(s, action) {
  const o = oriState(s);
  const actions = {
    protect: "安全装備と危険作業の手順を確認して作業を調整した",
    inspect: "汚染や換気について作業場・管理者へ説明を求めた",
    avoid: "危険な資材への接触を避けた",
    screen: "鉱石病の検査を受けた",
    followup: "検査・診察の継続について確認した",
    "defer-screening": "検査を受けず、改めて相談する時期を決めた",
    document: "いつどこで源石物質に接した可能性があるか記録を残した",
    "adjust-assignment": "負担の大きい工程を外れる配置へ変更した",
    unsafe: "防護が足りないまま危険作業を続けた",
    share: "源石による曝露と感染者への偏見は違うことを周囲と確認した"
  };
  if (!Object.hasOwn(actions, action)) throw new Error("源石曝露の対処コードが不正: " + action);
  oriRecord(s, action, actions[action]);
  // Asking for an inspection or avoiding one object does not automatically
  // confer years of workplace-wide protection. Only an enacted protective change does.
  if (action === "protect") o.protectionUntilYear = s.year + P("infection.protectionYears");
  if (action === "unsafe") o.protectionUntilYear = null;
  if (action === "screen" || action === "followup") {
    o.screeningRequestedYear = s.year;
    if (!s.fl.dg) o.reviewDueYear = s.year + P("infection.uncertainExposureReviewYears");
    // This action records an appointment/examination, not a positive diagnosis.
    // Positive test results are explicitly recorded by the event outcome's fl.dg.
  }
  if (action === "defer-screening") {
    if (s.fl?.dg) throw Error("診断済みの状態で未受診の検査を延期できない");
    o.screeningRequestedYear = s.year;
    o.reviewDueYear = s.year + P("infection.uncertainExposureReviewYears");
  }
}
function advanceIllnessState(s) {
  if (!s.illness && (s.h <= 18 || (s.inf && s.ob >= P("death.oripathyStart") && s.h <= 28))) {
    s.illness = {
      kind: s.inf ? "oripathy_complication" : "chronic",
      stage: 1,
      startedYear: s.year,
      reviewed: 0,
      treated: !!s.fl.tx,
      causeTexts: [
        "長く続いた病状が悪化し、治療が間に合わず亡くなった",
        "療養を続けたが、臓器の働きが戻らず亡くなった"
      ]
    };
    L(
      `<span class="bad">体力が大きく落ち、日々の仕事や食事にも支障が出始めた。病状を見てもらい、これからの療養を考える必要がある。</span>`
    );
  }
  const illness = s.illness;
  if (!illness || s.year <= illness.startedYear) return;
  const elapsed = s.year - illness.startedYear;
  if (illness.treated) {
    if (elapsed >= 1) {
      s.illness = null;
      L(
        '<span class="nt">受診と休養を続け、強い症状は引いていった。体力が戻るまで無理をしないことにした。</span>'
      );
    }
    return;
  }
  illness.stage = elapsed === 1 ? 2 : 3;
  if (illness.stage === 2)
    L(
      '<span class="bad">休んでも症状が引かず、仕事や身の回りのことが難しくなった。診療所を探すか、周囲に助けを頼むか決める時期に来た。</span>'
    );
  else if (illness.stage === 3)
    L(
      '<span class="bad">療養を続けても回復せず、食事や移動にも手助けが要る。治療の見込みと、そばにいてくれる人を確かめた。</span>'
    );
  if (elapsed >= 4 && s.h > 28) {
    s.illness = null;
    L('<span class="nt">長引いた不調は少しずつ落ち着き、日常の用事を自分でできるようになった。</span>');
  }
}

/* v78: 出自(種族)、本人が名乗る民族・文化、家庭で使う言語、法的な資格は別の軸。
 * 旧セーブには見えない文化・本人の意思・権利を作り足さない。 */
