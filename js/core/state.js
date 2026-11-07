/* ===== ENGINE STATE ===== */
let sp = 1,
  acc = 0,
  AU = "",
  HL = 0,
  DEBUG_RANDOM = null,
  RANDOM_STATE = null,
  RANDOM_SEED = null;
const RANDOM_ALGORITHM = "xorshift32-v1",
  RANDOM_SOURCE = Math.random;
function seedLifeRandom(seed) {
  const value = Number(seed);
  RANDOM_SEED = Number.isSafeInteger(value) ? value >>> 0 : Math.floor(RANDOM_SOURCE() * 0x100000000) >>> 0;
  if (!RANDOM_SEED) RANDOM_SEED = 0x6d2b79f5;
  RANDOM_STATE = RANDOM_SEED;
  return RANDOM_SEED;
}
function restoreLifeRandom(s) {
  RANDOM_SEED = Number.isInteger(s?.randomSeed) && s.randomSeed > 0 ? s.randomSeed >>> 0 : null;
  RANDOM_STATE = Number.isInteger(s?.rngState) && s.rngState > 0 ? s.rngState >>> 0 : null;
}
function nextLifeRandom() {
  if (!RANDOM_STATE) return RANDOM_SOURCE();
  let x = RANDOM_STATE >>> 0;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  RANDOM_STATE = x >>> 0;
  if (S) S.rngState = RANDOM_STATE;
  return RANDOM_STATE / 4294967296;
}
const DUM = new Proxy(function () {}, { get: () => DUM, set: () => true, apply: () => DUM });
const $ = i => (HL ? DUM : document.getElementById(i));
const R = () =>
    DEBUG_RANDOM ? DEBUG_RANDOM() : Math.random !== RANDOM_SOURCE ? Math.random() : nextLifeRandom(),
  rnd = (a, b) => Math.floor(a + R() * (b - a + 1)),
  pick = a => a[Math.floor(R() * a.length)];
const revalueInvestmentShare = (value, draw = R()) =>
  Math.max(
    0,
    value *
      (1 +
        P("economy.workshopShareAnnualGrowth") +
        (2 * draw - 1) * P("economy.workshopShareAnnualVolatility"))
  );
const revalueWorkshopShare = (value, draw = R()) => revalueInvestmentShare(value, draw);
function investmentProjectName(s) {
  return (
    {
      "ウルサス": "地域の配給倉庫と運搬組合",
      "レム・ビリトン": "採掘道具と鉱石運搬の共同組合",
      "ラテラーノ": "印刷所と小規模な修繕組合",
      "カズデル": "隊商の補給と安全な宿の持分",
      "クルビア": "工業区の部品供給会社",
      "龍門": "市場の露店と荷運び組合",
      "炎国": "茶店・薬草市の共同仕入れ",
      "イェラグ": "山道の宿と冬季備蓄組合",
      "リターニア": "楽器職人と演奏会の共同基金",
      "シラクーザ": "食堂・運送の家族共同事業",
      "サルゴン": "灌漑水路と市場の共同維持",
      "ボリバル": "農産物の集荷と港への運送",
      "ヴィクトリア": "港湾・鉄道周辺の小口事業",
      "極東": "漁具・船着場の共同維持"
    }[s?.res?.n] || "近隣の仕入れ・修繕・運搬を担う小規模な共同事業"
  );
}
const clamp = (v, a = P("state.defaultMinimum"), b = P("state.defaultMaximum")) =>
  Math.max(a, Math.min(b, v));
const eduLv = s => ELT.reduce((a, t, i) => (s.ep >= t ? i : a), 0);
// An education score measures learning, never an awarded credential.
const educationCredential = (s, kind) =>
  (kind === "university" && !!s.fl?.uni) ||
  (kind === "vocational" && !!s.fl?.voc) ||
  (kind === "arts" && !!s.fl?.arts_grad);
// Only a completed course or explicitly issued award may add a credential.
// This record carries the event provenance, rather than inferring a diploma from ep.
function recordEducationTransition(s, program, action, sourceEventId = null) {
  const record = s.educationRecord || (s.educationRecord = { version: 1, enrollments: [], awards: [] });
  if (!["general-school", "university", "vocational", "arts-academy", "preparatory"].includes(program))
    throw new Error("未定義の教育課程");
  if (!["start", "advance", "finish", "stop"].includes(action))
    throw new Error("未定義の学籍変更");
  const current = [...record.enrollments].reverse().find(x => x.program === program && x.status === "enrolled");
  if (action === "start" && current) return;
  if (action === "finish" && !current)
    throw new Error("在籍記録のない課程を修了したことにはできません");
  if (action === "start") {
    record.enrollments.push({
      id: `enrol-${record.enrollments.length + 1}`, program, status: "enrolled",
      startedYear: s.year, endedYear: null, region: s.res?.n || null, sourceEventId
    });
  } else if (current) {
    current.lastReviewedYear = s.year;
    if (action === "finish" || action === "stop") {
      current.status = action === "finish" ? "completed" : "interrupted";
      current.endedYear = s.year;
      current.endingEventId = sourceEventId;
    }
  }
  const formal=s.educationPath?.offeringId &&
    s.educationPath.currentEnrollmentId===current?.id &&
    ["completed","enrolled"].includes(s.educationPath.status);
  const credits=formal?educationTransferredCreditIds(s,current.id)
    .map(id=>s.educationCredits.items[id]).filter(Boolean):[];
  if(action==="finish" && formal &&
     (credits.length<s.educationPath.duration ||
       s.educationPath.yearsCompleted<s.educationPath.duration))
    throw new Error("実際の履修認定を欠く課程に卒業資格は発行できない");
  if(action==="finish" && formal && program==="general-school"){
    record.schoolCertificates||=[];
    const id=current.id+":school-certificate";
    if(!record.schoolCertificates.some(x=>x.id===id))
      record.schoolCertificates.push({
        id,enrollmentId:current.id,
        offeringId:s.educationPath.offeringId,
        stage:s.educationPath.stage,issuer:s.educationPath.institutionId,
        awardedYear:s.year,
        sourceCreditIds:credits.map(x=>x.id)
      });
  }
  if(action==="finish" && formal && program==="preparatory"){
    const assessment=s.educationPath.completionAssessment;
    if(!assessment?.passed || assessment.enrollmentId!==current.id ||
       !assessment.evidenceRef || !assessment.assessedAt?.year ||
       assessment.assessedAt.year!==s.year)
      throw new Error("準備課程の正式な同等資格評価が未確認");
    record.schoolCertificates||=[];
    const id=current.id+":upper-equivalency";
    if(!record.schoolCertificates.some(x=>x.id===id))
      record.schoolCertificates.push({
        id,enrollmentId:current.id,
        offeringId:s.educationPath.offeringId,
        stage:"upper",qualification:"upper-equivalency",
        issuer:s.educationPath.institutionId,awardedYear:s.year,
        assessmentEvidenceId:assessment.evidenceRef,
        sourceCreditIds:credits.map(x=>x.id)
      });
  }
  if (action === "finish" && program !== "general-school" && program !== "preparatory" &&
      !record.awards.some(x => x.program === program &&
        (formal ? x.enrollmentId===current.id : !x.enrollmentId))) {
    record.awards.push({
      id: `award-${record.awards.length + 1}`, program, awardedYear: s.year,
      region: s.res?.n || null, sourceEventId,
      issuer: formal?s.educationPath.institutionId:"個別課程（機関名未記録）",
      certainty: "game-course-completion",
      ...(formal?{
        enrollmentId:current.id,offeringId:s.educationPath.offeringId,
        issuerInstitutionId:s.educationPath.institutionId,
        sourceCreditIds:credits.map(x=>x.id)
      }:{})
    });
  }
  // Formal enrollment and award provenance remain a lifelong ledger.
  // Only UI or daily narrative history may be windowed.
}
// One opening's work, evidence and stated requirements are distinct from an
// unsupported general law. The inquiry must not mutate state or consume RNG.
function careerOpeningAssessment(s, opening) {
  const role = opening.role || "general",
    skills = s.lifeRecord?.skills || [],
    skill = pattern => skills.some(x => pattern.test(x.id) && x.level >= 12),
    uni = educationCredential(s, "university"),
    voc = educationCredential(s, "vocational"),
    arts = educationCredential(s, "arts"),
    literacy = Number.isFinite(s.socialLearning?.literacy)
      ? s.socialLearning.literacy
      : Math.min(75, eduLv(s) * 18 + (s.k || 0) * 0.32);
  let qualified = true, reason = null;
  if (role === "research-lead") {
    qualified = uni && s.k >= 50 && literacy >= 45;
    reason = "研究に必要な修了課程と専門知識が確認できない";
  } else if (role === "clinical") {
    // Graduation alone must not create an unrestricted medical license.
    // Accredited clinical training is represented by recorded practical evidence.
    qualified = uni && skill(/clinical|medical-clinical|physician-practice/) &&
      s.k >= 45 && literacy >= 45;
    reason = "臨床業務の課程修了と実務認定が確認できない";
  } else if (role === "technical") {
    qualified = (uni || voc || skill(/technical|repair|engineering|job-18/)) && s.k >= 25 && literacy >= 30;
    reason = "修了課程または技術の実務経験がまだ確認できない";
  } else if (role === "arts-technician") {
    qualified = (arts || skill(/arts|originium/)) &&
      (s.artsProfile?.techSkills?.["unit-maintenance"] >= 10 ||
       s.artsProfile?.techSkills?.["unit-inspection"] >= 10) && literacy >= 30;
    reason = "アーツ器具を扱う訓練・実務経験が未確認";
  } else if (role === "teacher") {
    qualified = (uni || voc || skill(/teach|literacy-tutor/)) && literacy >= 40;
    reason = "教育に関わる学習・指導経験がまだ確認できない";
  } else if (role === "administrator") {
    qualified = (uni || skill(/office|admin|clerk/)) && s.k >= 28 && literacy >= 40;
    reason = "事務・行政の知識と経験がまだ確認できない";
  } else if (role === "medical-assistant") {
    qualified = literacy >= 35 && s.k >= 20;
    reason = "補助業務に必要な読み書きと基礎知識が不足";
  } else if (role === "office-assistant") {
    qualified = literacy >= 30;
    reason = "帳票を扱う読み書きの経験が不足";
  } else if (role === "clergy" && opening.automatic) {
    qualified = false;
    reason = "個別の宗教組織による受け入れが未確認";
  }
  // No nationwide employment ban is inferred from infection, diagnosis or race.
  const policy = opening.policy;
  const documentedRestriction = policy && policy.certainty === "verified" &&
    policy.region === s.res?.n && policy.role === role &&
    typeof policy.sourceRef === "string" && policy.sourceRef.length > 0 &&
    (policy.fromYear == null || s.year >= policy.fromYear) &&
    (policy.toYear == null || s.year <= policy.toYear);
  // An employer knows a diagnosis only through recorded, site-specific information.
  // General rumors, a previous employer's knowledge and the applicant's diagnosis
  // cannot be silently transferred to a new workplace.
  const siteId = opening.worksiteId || opening.siteId || null,
    sameWorksite = typeof siteId === "string" && !!siteId &&
      s.workContract?.status === "active" && s.workContract.siteId === siteId,
    recordedAwareness = sameWorksite && !!s.inf && !!s.fl?.dg &&
      (s.infectionAwareness?.entries || []).some(row =>
        row.subject === "protagonist" &&
        ["employer", "workplace"].includes(row.audience) &&
        row.certainty === "confirmed" && row.subjectMatch === "confirmed" &&
        row.region === s.res?.n && row.recipientRef === siteId
      ),
    disclosedHere = sameWorksite && !!s.inf && !!s.fl?.dg &&
      !!s.fl?.infection_work_disclosed &&
      s.infectionWorkplace?.siteId === siteId &&
      s.infectionWorkplace.disclosedJobId === s.job &&
      ["awaiting-review", "reviewed"].includes(s.infectionWorkplace.status),
    employerKnowsDiagnosis = !!(recordedAwareness || disclosedHere),
    recordedWorkplaceHarm = !!sameWorksite && (s.equityLedger?.episodes || []).some(row =>
      row.domain === "work" && row.status === "active" &&
      row.siteId === siteId && row.jobId === s.job
    );
  const employerGate = assessPlayerEmploymentAccess(s, opening),
    employmentAllowed = employerGate.canApply;
  return {
    canApply: qualified && !documentedRestriction && employmentAllowed,
    canBeAssigned: qualified && !documentedRestriction && employmentAllowed,
    qualification: qualified ? "eligible" : "needs-training",
    reason: !qualified ? reason : documentedRestriction
      ? "この募集に記録された資格・制度上の制限がある"
      : !employmentAllowed ? "この応募経路では職務と募集先の条件が整っていない" : null,
    restriction: documentedRestriction ? policy.sourceRef : null,
    employerKnowsDiagnosis,
    // Only an observed incident tied to the current employer counts as workplace harm.
    discriminationRecorded: recordedWorkplaceHarm
  };
}
function educationStandingLabel(s) {
  const level = eduLv(s),
    studying = educationLive(s) || !!s.fl?.sch && !restricted(s) && s.age < P("life.schoolEnrollmentEndAge"),
    stages = {primary:"初等課程",lower:"前期中等課程",upper:"後期中等課程",
      preparatory:"同等資格の準備課程",university:"大学課程",vocational:"職業専門課程",arts:"アーツ専門学院"},
    currentCourse = educationLive(s) ?
      stages[s.educationPath.stage] + "・" + (s.educationPath.yearsCompleted + 1) + "年次在籍中" : null,
    generalCompleted = ["upper", "lower", "primary"].find(stage => s.educationPath?.completed?.includes(stage)),
    completed = [
      generalCompleted ? stages[generalCompleted] + "修了" : null,
      educationCredential(s, "university") ? "大学課程修了" : null,
      educationCredential(s, "vocational") ? "職業課程修了" : null,
      educationCredential(s, "arts") ? "アーツ学院修了" : null
    ].filter(Boolean);
  const progress = level > 0 ? `学習到達：${EL[level]}相当（修了とは別）` : "修了を示す学習履歴なし";
  return [
    ...completed,
    currentCourse || (s.study ? (s.study.kind === "uni" ? "大学課程に在籍中" : "職業課程に在籍中") : null),
    studying && !currentCourse && !s.study ? "学校に在籍中" : null,
    s.educationPath?.status==="deceased" ? "在学中に死亡（課程未修了）" : null,
    s.educationPath?.status==="paused" ? "課程休学中" : null,
    !completed.length && !studying && !s.study && !level &&
      (s.socialLearning?.schoolAccessYears > 0 || s.fl?.sch) ? "通学経験あり" : null,
    progress
  ].filter(Boolean).join("・");
}
const wp = a => {
  let t = a.reduce((s, x) => s + (x.w || x.p || 0), 0) * R();
  for (const x of a) if ((t -= x.w || x.p || 0) < 0) return x;
  return a[a.length - 1];
};
const m = v => Math.round(v).toLocaleString() + "龍門幣";
