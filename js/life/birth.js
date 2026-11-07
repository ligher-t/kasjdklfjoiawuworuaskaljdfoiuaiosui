function birthLocalityWeightPool(options, weights) {
  const pool = options.map(opt => {
    const raw = weights[opt.n];
    return { n: opt.n, w: raw === 0 ? 0 : Math.max(1, raw ?? 1) };
  });
  if (pool.some(opt => opt.w > 0)) return pool;
  // An impossible all-zero override falls back to the original locality table.
  const base = options.map(opt => ({ n: opt.n, w: Math.max(0, opt.w ?? opt.p ?? 0) }));
  return base.some(opt => opt.w > 0) ? base : options.map(opt => ({ n: opt.n, w: 1 }));
}
function pickBirthLocalityKind(home, g, w, par, care) {
  const isMobile = home === "移動都市";
  const options = isMobile ? SIM_TABLES.locality.mobile : SIM_TABLES.locality.fixed;
  const wi = w?.i ?? 2;
  const hasInfectedParent = !!(par?.fa?.inf || par?.mo?.inf);
  const regionStigma = g?.st ?? 0.5;

  let pool;
  if (isMobile) {
    const weights = {
      "移動都市の居住区": [3, 20, 55, 75, 90][wi],
      "移動都市の周縁区": [42, 55, 38, 25, 10][wi],
      "移動都市の避難・労働区画": [55, 25, 7, 0, 0][wi]
    };
    if (hasInfectedParent) {
      if (regionStigma >= 0.6) {
        if (wi < 4) {
          weights["移動都市の居住区"] = 0;
          weights["移動都市の周縁区"] = wi <= 1 ? 25 : 50;
          weights["移動都市の避難・労働区画"] = wi <= 1 ? 75 : 50;
        } else {
          weights["移動都市の居住区"] = 30;
          weights["移動都市の周縁区"] = 60;
          weights["移動都市の避難・労働区画"] = 10;
        }
      } else {
        weights["移動都市の居住区"] = Math.max(5, weights["移動都市の居住区"] * 0.5);
        weights["移動都市の周縁区"] += 20;
        weights["移動都市の避難・労働区画"] += 10;
      }
    }
    if (care?.kind === "避難・離散した世帯で育つ") {
      weights["移動都市の居住区"] = 0;
      weights["移動都市の周縁区"] = 25;
      weights["移動都市の避難・労働区画"] = 75;
    }
    pool = birthLocalityWeightPool(options, weights);
  } else {
    const weights = {
      "固定都市の街区": [5, 15, 40, 65, 80][wi],
      "工業・採掘地域": [35, 35, 20, 10, 5][wi],
      "小規模な定住地": [25, 30, 30, 25, 15][wi],
      "辺境・移動の多い居住地": [35, 20, 10, 0, 0][wi]
    };
    if (hasInfectedParent) {
      if (regionStigma >= 0.6) {
        if (wi < 4) {
          weights["固定都市の街区"] = 0;
          weights["工業・採掘地域"] += 30;
          weights["辺境・移動の多い居住地"] += 30;
        } else {
          weights["固定都市の街区"] = 20;
          weights["工業・採掘地域"] += 20;
        }
      } else {
        weights["固定都市の街区"] = Math.max(5, weights["固定都市の街区"] * 0.6);
        weights["小規模な定住地"] += 20;
      }
    }
    if (care?.kind === "避難・離散した世帯で育つ") {
      weights["固定都市の街区"] = 0;
      weights["辺境・移動の多い居住地"] += 50;
    }
    pool = birthLocalityWeightPool(options, weights);
  }
  return wp(pool).n;
}

function born(birth = {}) {
  if (!HL) cancelEndingPeerComparison();
  seedLifeRandom(birth.seed);
  const requestedBirthYear = Number(birth.by),
    birthYear = Number.isInteger(requestedBirthYear) && requestedBirthYear >= BIRTH_YEAR_MIN && requestedBirthYear <= BIRTH_YEAR_MAX
      ? requestedBirthYear
      : START;
  const g = REG.find(x => x.n === (birth.region || birth.country)) || wp(REG.map(x => ({ w: x.w, ...x })));
  const w =
      WEALTH.find(x => x.n === birth.wealth) ||
      WEALTH[
        Number.isInteger(birth.wealthIndex) ? clamp(birth.wealthIndex, 0, WEALTH.length - 1) : wp(WEALTH).i
      ],
    t = wp(TR),
    sx = birth.sex || (R() < P("birth.femaleShare") ? "女" : "男"),
    initialName = nm_(sx, g),
    familyNames = [initialName],
    reserveYears = [0.2, 0.55, 1.1, 2.5, 5.5][w.i] * (0.7 + R() * 0.6);
  // 養育形態を先に決め、出自と親の職業の抽選へ接続する。いずれも公式人口統計ではない。
  const care = makeCare(g.n, birthYear),
    originSocial = birth.socialPosition || pickBirthSocialPosition(g, w, care),
    originGroup = classOriginGroup(originSocial);
  const jobAffinity =
    {
      landed: { 5: 1.45, 6: 1.55 },
      professional: { 6: 1.8, 7: 1.7, 8: 1.6 },
      merchant: { 5: 2.2, 7: 1.15 },
      labor: { 1: 1.55, 2: 1.4, 3: 1.3 },
      displaced: { 1: 1.4, 2: 1.25, 4: 1.2 }
    }[originGroup] || {};
  const parentJobPool = SIM_TABLES.parentJobs.map(p => ({
    ...p,
    w:
      p.w * (p.jobId <= 2 ? [3, 2, 1, 0.5, 0.2][w.i] : [0.2, 0.5, 1, 2, 4][w.i]) * (jobAffinity[p.jobId] || 1)
  }));
  const pf = (sx, race) => {
    const jobId = wp(parentJobPool).jobId,
      by = birthYear - rnd(P("birth.parentAgeAtBirthMin"), P("birth.parentAgeAtBirthMax")),
      name = nmUnique_(null, sx, g, familyNames, null, { race });
    familyNames.push(name);
    const parentInfected = R() < g.inf * (race.n === "サルカズ" ? 2.2 : 1) * P("birth.parentInfectionChanceScale");
    const parentSarkaz = race.n === "サルカズ";
    return {
      nm: name,
      sx,
      r: race,
      j: jobId,
      by,
      beliefs: {
        infected: parentInfected
          ? Math.round(clamp(R() * 15, 0, 20))
          : Math.round(clamp(12 + (g.st || 0) * 15 + R() * 58, 0, 95)),
        sarkaz: parentSarkaz
          ? Math.round(clamp(R() * 10, 0, 15))
          : Math.round(clamp(12 + (g.n === "ラテラーノ" ? 12 : 0) + (g.st || 0) * 11 + R() * 56, 0, 95)),
        basis: "出生時の家庭人物モデル"
      },
      inf: parentInfected,
      tx: 0,
      treatmentHistory: [],
      treatmentPriority: R(),
      jobHistory: [],
      knownJobId: jobId,
      knownJobChangeCount: 0,
      jobKnownYear: birthYear,
      workReviewYear:
        birthYear + rnd(P("family.parentWorkReviewMinYears"), P("family.parentWorkReviewMaxYears")),
      health: rnd(P("family.parentHealthInitialMin"), P("family.parentHealthInitialMax")),
      workShare: 1,
      healthUpdatedYear: birthYear,
      d: 0
    };
  };
  const fatherRace = RACE.find(x => x.n === birth.fatherRace) || pickRaceFor(g),
    motherRace = RACE.find(x => x.n === birth.motherRace) || pickHouseholdMateRace(g, fatherRace),
    par = { fa: pf("男", fatherRace), mo: pf("女", motherRace) };
  const pr = RACE.find(x => x.n === birth.race) || (R() < P("birth.parentRaceShare") ? par.fa.r : par.mo.r);
  const householdFamilyName = npcFamilyPart(R() < 0.8 ? par.fa.nm : par.mo.nm, npcPoolFor(g.n, pr).style);
  const nm = nmUnique_(null, sx, g, [par.fa.nm, par.mo.nm], householdFamilyName, { race: pr });
  familyNames[0] = nm;
  const siblings = Array.from({ length: rnd(P("birth.siblingCountMin"), P("birth.siblingCountMax")) }, () => {
    const sex = R() < P("birth.femaleShare") ? "女" : "男",
      siblingRace = pickChildRace([fatherRace, motherRace], g),
      name = nmUnique_(null, sex, g, familyNames, householdFamilyName, { race: siblingRace });
    familyNames.push(name);
    return {
      nm: name,
      sx: sex,
      r: siblingRace,
      j: null,
      by: birthYear - rnd(1, 15),
      d: 0,
      inf: 0,
      infCause: null
    };
  });
  if (pr.n === "サルカズ" || par.fa.r.n === "サルカズ" || par.mo.r.n === "サルカズ") {
    par.fa.beliefs.sarkaz = Math.min(par.fa.beliefs.sarkaz, 15);
    par.mo.beliefs.sarkaz = Math.min(par.mo.beliefs.sarkaz, 15);
  }
  if (par.fa.inf || par.mo.inf || birth.inf) {
    par.fa.beliefs.infected = Math.min(par.fa.beliefs.infected, 18);
    par.mo.beliefs.infected = Math.min(par.mo.beliefs.infected, 18);
  }
  const legal =
    g.n === "ラテラーノ" && pr.n === "サンクタ" && R() < P("law.lateranoBirthRecordShare")
      ? {
          citizenshipCountry: "ラテラーノ",
          status: "recorded",
          basis: "birth-record-assumption",
          familyProceedings: []
        }
      : { citizenshipCountry: null, status: "unverified", basis: null, familyProceedings: [] };
  const birthHomeRoll = R(),
    home = chooseHomeForRegion(g.n, birthHomeRoll, P("birth.mobileCityShare"), birthYear, null);
  // Keep the old 1097 Siesta draw count when the old stream would have selected
  // a mobile home and then rolled for its named city, although this birth lacks a month.
  if (g.n === "シエスタ" && birthYear === 1097 && birthHomeRoll < P("birth.mobileCityShare")) R();
  const localKind = pickBirthLocalityKind(home, g, w, par, care),
    local = makeLocality(home, g.n, localKind, birthYear, null),
    birthLocality = { region: g.n, city: local.city || null, home, kind: local.kind };
  if (care.kind === "片親と暮らす") {
    const presentKey = pick(["fa", "mo"]),
      absentKey = presentKey === "fa" ? "mo" : "fa";
    care.parentKeys = [presentKey];
    care.presentParent = presentKey;
    care.absentParent = absentKey;
    const reasonRoll = keyedRoll(`${RANDOM_SEED || 0}|${birthYear}|care-absence`);
    if (reasonRoll < 0.45) {
      care.absenceReason = "天災または鉱山事故による死別";
      par[absentKey].absenceReason = "天災または鉱山事故による死別";
      par[absentKey].separated = true;
    } else if (reasonRoll < 0.75) {
      care.absenceReason = "遠方の移動都市・鉱山への長期出稼ぎ";
      par[absentKey].absenceReason = "遠方の移動都市・鉱山への長期出稼ぎ";
      par[absentKey].separated = true;
    } else {
      care.absenceReason = "生活難や家庭事情による離別";
      par[absentKey].absenceReason = "生活難や家庭事情による離別";
      par[absentKey].separated = true;
    }
  } else if (care.kind === "後見人・養育者と暮らす") {
    care.parentKeys = [];
    care.absenceReason = "天災・病・生活破綻により実親と離れ、後見人のもとで育つ";
    par.fa.separated = true;
    par.mo.separated = true;
    par.fa.absenceReason = "遠隔地または消息不明";
    par.mo.absenceReason = "遠隔地または消息不明";
  } else if (care.kind === "避難・離散した世帯で育つ") {
    care.parentKeys = [];
    care.absenceReason = "天災または戦乱による家族の離散";
    par.fa.separated = true;
    par.mo.separated = true;
    par.fa.absenceReason = "天災・戦乱による離散";
    par.mo.absenceReason = "天災・戦乱による離散";
  } else if (care.kind === "氏族・共同体で育つ") {
    care.parentKeys = [];
    care.absenceReason = "氏族・共同体の共同養育のもとで育つ";
  } else {
    care.parentKeys = ["fa", "mo"];
  }
  // Keep the historical random stream stable while withholding an unsupported month/day.
  const birthDate = birth.bd == null
    ? (rnd(1, P("birth.monthCount")), rnd(1, P("birth.daysPerMonth")), "月日未記録")
    : birth.bd;
  replaceCurrentLife({
    nm,
    householdFamilyName,
    sx,
    by: birthYear,
    // Age advances by simulation year, not by birthday. Do not invent an exact birth date.
    bd: birthDate,
    randomSeed: RANDOM_SEED,
    rngState: RANDOM_STATE,
    randomAlgorithm: RANDOM_ALGORITHM,
    debugSeed: Number.isSafeInteger(Number(birth.seed)) ? Number(birth.seed) >>> 0 : null,
    nextRelativeId: 1,
    lifeRecord: emptyLifeRecord(),
    g,
    origin: g,
    birthLocality,
    originWealth: w,
    res: g,
    home,
    local,
    care,
    legal,
    culturalIdentity: null,
    languageState: null,
    socialConflict: null,
    socialAftermath: null,
    personTies: null,
    closeKnowledge: null,
    infectionAwareness: null,
    infectionWorkplace: null,
    informationResponses: [],
    informationClaims: [],
    moves: [],
    exileFrom: null,
    world: { events: {} },
    known: {},
    infoLog: [],
    r: pr,
    par,
    siblings,
    sp: null,
    kids: [],
    relationshipHistory: [],
    friendContact: null,
    neighborContact: null,
    w,
    t,
    age: 0,
    year: birthYear,
    householdExitAge:
      care.kind === "氏族・共同体で育つ"
        ? rnd(16, 21)
        : care.kind === "避難・離散した世帯で育つ"
          ? rnd(16, 18)
          : rnd(17, 21),
    familyBudgetTalkAge: rnd(13, 20),
    familyContribution: 0,
    priceIndex: 1,
    socialPosition: originSocial,
    lineageModelVersion: 2,
    residenceArrangement: "family_home_shared_budget",
    residenceHistory: [],
    inf: 0,
    infection: null,
    biasInfected: 0,
    biasSarkaz: 0,
    socialLearning: null,
    educationRecord: { version: 1, enrollments: [], awards: [] },
    careInclination: 50,
    careInclinationHistory: [],
    romance: null,
    ob: 0,
    ac: 0,
    h:
      rnd(P("birth.initialHealthMin"), P("birth.initialHealthMax")) -
      (w.i < P("condition.povertyWealthIndex") ? P("birth.povertyHealthPenalty") : 0) -
      local.hazard * P("birth.hazardHealthScale"),
    p: clamp(P("birth.initialMood") + (care.support - 0.5) * P("birth.careMoodScale")),
    k: P("birth.initialKnowledge"),
    rl: clamp(P("birth.initialRelations") + (care.support - 0.5) * P("birth.careRelationScale")),
    ar: rnd(P("birth.initialArtsMin"), P("birth.initialArtsMax")),
    cr: P("birth.initialCredit"),
    ep: 0,
    job: 0,
    workPayBonus: 0,
    workContract: null,
    workContractHistory: [],
    intergroupHistory: [],
    cash: 0,
    debt: 0,
    loanContracts: [],
    personalWishes: null,
    investment: 0,
    investmentDelta: 0,
    inc: 0,
    exp: 0,
    flow: null,
    flowHistory: [],
    moneyLog: [],
    study: null,
    familyCare: null,
    familyCareHistory: [],
    displacement: null,
    insurancePaidYear: null,
    pet: null,
    petSinceYear: null,
    petCareUntil: null,
    /* 養育家計は本人資産と別管理し、資産階層に応じた準備金と養育者収入を持つ。 */
    house: { cash: EXP[w.i] * reserveYears, debt: 0, inc: 0, exp: 0 },
    f: 0,
    fl: {},
    ev: null,
    dead: 0,
    hs: [],
    sn: {},
    hd: {},
    cn: { g: 0, b: 0, n: 0 },
    majorEventMonth: null,
    minorEventMonth: null,
    textDeck: {},
    trace: [],
    dataFingerprintAtBirth: DATA_FINGERPRINT,
    sourceFingerprintAtBirth: SOURCE_FINGERPRINT
  });
  S.raceProfile = createRaceProfile(S.r);
  S.artsProfile = createArtsProfile(S.ar);
  S.artsEquipment = createArtsEquipmentState();
  ensureLocalityState(S);
  initializeLifeSystems(S);
  ensureEducationWorldForResidence(S);
  educationCreateMobilityState(S);
  educationReconcileWorldAt(S,S.year,S.mo??0);
  ensureIdentity(S, {
    // 公式の民族人口比ではない。地域の家の伝承を独立抽選し、種族では確定させない。
    affiliation:
      birth.ethnicity ||
      birth.culturalAffiliation ||
      (g.n === "ヴィクトリア" && R() < 0.16
        ? "ターラー系"
        : g.n === "カズデル" && R() < 0.23
          ? "カズデル系"
          : g.n === "イベリア" && pr.n === "エーギル" && R() < 0.32
            ? "イベリアのエーギル系"
            : null),
    homeLanguage: birth.homeLanguage || null
  });
  if (S.culturalIdentity.affiliation === "ターラー系" && !S.culturalIdentity.homeLanguage && R() < 0.63) {
    S.culturalIdentity.homeLanguage = "家で伝えられたターラー系の言葉";
    S.culturalIdentity.homeLanguageBasis = "出生時の家庭環境抽選（ゲーム用仮定）";
  }
  ensureLanguageState(S, birth);
  conflictState(S);
  socialModel(S, false);
  if (S.par.fa.beliefs && S.par.mo.beliefs) {
    for (const k of ["infected", "sarkaz"])
      S.socialLearning.familyNorms[k] = Math.round((S.par.fa.beliefs[k] + S.par.mo.beliefs[k]) / 2);
  }
  if (S.r.n === "サルカズ" || S.par.fa.r.n === "サルカズ" || S.par.mo.r.n === "サルカズ") {
    S.socialLearning.familyNorms.sarkaz = 0;
    S.biasSarkaz = 0;
  }
  if (S.inf || S.par.fa.inf || S.par.mo.inf) {
    S.socialLearning.familyNorms.infected = Math.min(S.socialLearning.familyNorms.infected || 0, 8);
    S.biasInfected = 0;
  }
  initializeSocialClass(S);
  initializeCareNetworkPeople(S);
  assignRelativeIds(S);
  playerEmploymentState(S);
  for (const parent of Object.values(S.par)) if (parent && !parent.d)
    recordDependentEmployment(S, parent, {jobId:parent.j,region:S.res.n,
      source:"family-background-at-birth",kind:"background-livelihood",month:1});
  advanceRelativeMilestones(S);
  if (S.inf) {
    S.ob = rnd(P("infection.diagnosisRollMin"), P("infection.diagnosisRollMax"));
    S.ac = R() < P("infection.acuteShare");
    S.infection = { year: S.year, cause: "出生時から保有（結晶曝露の経路未記録）" };
  }
  S.playSettings=newLifePlaySettings();
  acc = 0;
  replaceWorldKnowledge(S.known);
  const birthPlace = `${g.n}${local.city ? `・${local.city}` : ""}`;
  // Hidden comparison lives share the runtime but must never replace the
  // visible player's ending, log or toolbar. Simulation state still initializes.
  if (!HL) {
    $("s0").hidden = 1;
    $("s1").hidden = 0;
    $("rs").hidden = 1;
    $("md").hidden = 1;
    $("ctl").hidden = 0;
    $("lg").innerHTML = "";
    tab("c");
    L(
      `テラ暦${birthYear}年、${birthPlace}に${S.r.n}の${S.sx === "男" ? "男の子" : "女の子"}として生まれた。家庭の経済状況は「${w.n}」。気質は「${t.n}」。`
    );
  }
  educationSynchronizeDependents(S);
  recordTrace("birth", null, { text: `テラ暦${birthYear}年、${birthPlace}に生まれた。` });
  hist();
  sched();
  rd();
}
