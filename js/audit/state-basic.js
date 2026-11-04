function auditCommunityAndRandomState(s, problems, services = STATE_AUDIT_SERVICES) {
  if(s.infectionOnset && (!s.inf || !["dust","wound","deep-wound","mixed","unconfirmed"].includes(s.infectionOnset.route) ||
    !Number.isInteger(s.infectionOnset.year) || s.infectionOnset.year > s.year ||
    !Number.isFinite(s.infectionOnset.initialLoad) || s.infectionOnset.initialLoad < 0 || s.infectionOnset.initialLoad > 100 ||
    typeof s.infectionOnset.acute !== "boolean"))problems.push("感染初期病状の記録が不正");
  if(s.debtPlan && (!["frugal","maintain"].includes(s.debtPlan.action) ||
    !Number.isInteger(s.debtPlan.year) || s.debtPlan.year > s.year))problems.push("家計再建方針の記録が不正");
  if (s.local?.districtId && (!s.local.placeId || s.local.identitySignature !== residenceSignature(s)))
    problems.push("生活圏の識別子と所在地が不一致");
  if (s.residenceBase && !s.lifeRecord?.affiliations?.some(a=>a.id===s.residenceBase.affiliationId && ["active","crisis","suspended"].includes(a.status)))
    problems.push("所属を離れた後も本艦・野営地の居住が残っている");
  const community = s.community;
  if (community) {
    if (
      community.key !== services.localityKey(s) ||
      !Number.isInteger(community.lastYear) ||
      community.lastYear > s.year ||
      !Array.isArray(community.history) ||
      community.history.length > 20 ||
      !Array.isArray(community.actions) ||
      community.actions.length > 32 ||
      services.localityAxes.some(
        axis =>
          !Number.isFinite(community.metrics?.[axis]) ||
          community.metrics[axis] < 0 ||
          community.metrics[axis] > 1
      )
    )
      problems.push("生活圏の状態・記録に不整合");
  }
  const localities = [community, ...Object.values(s.world?.localityArchive || {})].filter(Boolean);
  const historicalShockIds = new Set((services.LOCALITY_MODEL?.shocks || []).map(shock => shock.id));
  if (
    localities.some(area => {
      const context = area.historicalShockContext;
      return (
        context != null &&
        (context.version !== 1 ||
          !Array.isArray(context.applied) ||
          context.applied.length > 8 ||
          new Set(context.applied).size !== context.applied.length ||
          context.applied.some(id => typeof id !== "string" || !id))
      );
    })
  )
    problems.push("生活圏の過去圧力復元記録が不正");
  if (
    localities.some(area =>
      Array.isArray(area.history) &&
      area.history.some(row =>
        Array.isArray(row.types) &&
        row.types.some(id => historicalShockIds.has(id) && !area.historicalShockContext?.applied?.includes(id))
      )
    )
  )
    problems.push("生活圏の過去圧力履歴と適用記録が不一致");
  const hasRandomContract = ["randomSeed", "rngState", "randomAlgorithm"].some(key =>
    Object.prototype.hasOwnProperty.call(s, key)
  );
  if (
    hasRandomContract &&
    (!Number.isInteger(s.randomSeed) ||
      s.randomSeed <= 0 ||
      !Number.isInteger(s.rngState) ||
      s.rngState <= 0 ||
      s.randomAlgorithm !== services.RANDOM_ALGORITHM)
  )
    problems.push("再現用乱数のseed/state/algorithmが不整合");
}

function auditPersonalFlagsAndLimits(s, problems, services = STATE_AUDIT_SERVICES) {
  const isValidName = name =>
    typeof name === "string" && name.trim().length > 0 && name.length <= 50 && !/[<>]/.test(name);
  if (!isValidName(s.nm)) problems.push("名前が不正");
  if (s.sp && !isValidName(s.sp.nm)) problems.push("配偶者の名前が不正");
  if (Array.isArray(s.kids) && s.kids.some(k => k && k.nm != null && !isValidName(k.nm))) problems.push("子どもの名前が不正");
  if (Array.isArray(s.siblings) && s.siblings.some(sib => sib && sib.nm != null && !isValidName(sib.nm))) problems.push("きょうだいの名前が不正");
  if (s.par?.fa && !isValidName(s.par.fa.nm)) problems.push("父親の名前が不正");
  if (s.par?.mo && !isValidName(s.par.mo.nm)) problems.push("母親の名前が不正");
  if (s.friendContact && !isValidName(s.friendContact.nm)) problems.push("友人の名前が不正");
  if (s.neighborContact && !isValidName(s.neighborContact.nm)) problems.push("隣人の名前が不正");
  if (s.romance?.name != null && !isValidName(s.romance.name)) problems.push("恋愛相手の名前が不正");
  if (Array.isArray(s.relationshipHistory) && s.relationshipHistory.some(r => r && r.nm != null && !isValidName(r.nm))) problems.push("関係履歴の名前が不正");
  if (Array.isArray(s.care?.supportNetwork?.members) && s.care.supportNetwork.members.some(m => m && m.nm != null && !isValidName(m.nm))) problems.push("養育ネットワーク構成員の名前が不正");
  if (!Number.isInteger(s.by) || s.by < services.BIRTH_YEAR_MIN || s.by > services.BIRTH_YEAR_MAX)
    problems.push("出生年が選択可能な範囲外");
  if (s.birthLocality != null) {
    const place = s.birthLocality;
    if (
      !services.REG.some(region => region.n === place.region) ||
      place.region !== s.g?.n ||
      !["移動都市", "固定集落"].includes(place.home) ||
      !services.SIM_TABLES.locality[place.home === "移動都市" ? "mobile" : "fixed"].some(row => row.n === place.kind) ||
      (place.city != null &&
        (place.home !== "移動都市" || !services.SIM_TABLES.namedCities[place.region]?.includes(place.city)))
    )
      problems.push("出生時の地域・都市・居住形態が不整合");
  }
  for (const key of ["h", "p", "k", "rl", "ar", "cr"])
    if (s[key] < 0 || s[key] > 100) problems.push(`${key}が0〜100の範囲外`);
  for (const key of ["cash", "debt", "investment", "ep"]) if (s[key] < 0) problems.push(`${key}が負`);
  if (s.unpaidExpenses != null && (!Number.isFinite(s.unpaidExpenses) || s.unpaidExpenses < 0)) problems.push("未払滞納費用が負または不正");
  if (s.ob < 0 || s.ob > services.P("infection.terminalThreshold")) problems.push("感染度が範囲外");
  const education = s.educationRecord;
  if (!education || education.version !== 1 ||
      !Array.isArray(education.enrollments) ||
      !Array.isArray(education.awards) ||
      education.enrollments.some(row =>
        !row.id || !["general-school", "university", "vocational", "arts-academy", "preparatory"].includes(row.program) ||
        !["enrolled", "completed", "interrupted", "transferred"].includes(row.status) ||
        !Number.isInteger(row.startedYear) || row.startedYear > s.year ||
        (row.endedYear != null && (!Number.isInteger(row.endedYear) ||
          row.endedYear < row.startedYear || row.endedYear > s.year)) ||
        (row.status === "enrolled" && row.endedYear != null) ||
        (row.status !== "enrolled" && row.endedYear == null)
      ) ||
      education.awards.some(row =>
        !row.id || !["university", "vocational", "arts-academy"].includes(row.program) ||
        !Number.isInteger(row.awardedYear) || row.awardedYear > s.year ||
        typeof row.sourceEventId !== "string" || !row.sourceEventId
      ) ||
      education.awards.some(row =>
        !s.fl?.[row.program === "university" ? "uni" : row.program === "vocational" ? "voc" : "arts_grad"] ||
        !education.enrollments.some(course =>
          course.program === row.program && course.status === "completed" &&
          course.endedYear === row.awardedYear && course.endingEventId === row.sourceEventId
        )
      )
  ) problems.push("教育在籍・修了記録が現行状態と不整合");
  const school = s.educationPath;
  if (school && (
    school.version !== 1 ||
    !["outside","enrolled","paused","completed","withdrawn","deceased"].includes(school.status) ||
    !Array.isArray(school.completed) ||
    !Array.isArray(school.history) || school.history.length > 64 ||
    school.completed.some(stage => !["primary","lower","upper","preparatory","university","vocational","arts"].includes(stage)) ||
    (school.status !== "outside" && (
      !["primary","lower","upper","preparatory","university","vocational","arts"].includes(school.stage) ||
      !Number.isInteger(school.startedYear) || school.startedYear > s.year ||
      !Number.isInteger(school.stageStartYear) || school.stageStartYear > s.year ||
      !Number.isInteger(school.duration) || school.duration < 1 ||
      !Number.isInteger(school.yearsCompleted) || school.yearsCompleted < 0 ||
      school.yearsCompleted > school.duration ||
      (school.endedYear != null && school.endedYear > s.year)
    )) ||
    (school.status === "enrolled" && ["primary","lower","upper"].includes(school.stage) && !s.fl.sch) ||
    (school.status === "enrolled" && ["university","vocational","arts"].includes(school.stage) && !s.study) ||
    (school.status === "enrolled" && school.mode !== "working" && s.job > 0) ||
    (school.status === "completed" && school.stage === "university" && !s.fl.uni) ||
    (school.status === "completed" && school.stage === "vocational" && !s.fl.voc) ||
    (school.status === "completed" && school.stage === "arts" && !s.fl.arts_grad) ||
    (school.status === "enrolled" && school.lastProcessedYear > s.year) ||
    (school.status === "completed" && school.yearsCompleted < school.duration) ||
    (school.fundedYear != null && (!Number.isInteger(school.fundedYear) ||
      school.fundedYear < school.stageStartYear || school.fundedYear > s.year))
  )) problems.push("教育学籍の年限・就業・資格記録に矛盾");
  if(s.educationDecision && (
    !["primary","lower-path","upper-path","higher-path","funding","resume","graduation","transfer","case-review"].includes(s.educationDecision.kind) ||
    !Number.isInteger(s.educationDecision.year) || s.educationDecision.year > s.year
  )) problems.push("教育上の必須進路判断が不正");
  if(s.educationDecision?.kind==="case-review" &&
    (s.educationCases?.activeCaseId!==s.educationDecision.caseId ||
      s.educationCases?.items?.[s.educationDecision.caseId]?.status!=="active"))
    problems.push("進路案件の選択対象と進行中の案件が一致しない");
  if(s.educationCases && (
    s.educationCases.version!==1 ||
    !Number.isInteger(s.educationCases.sequence) || s.educationCases.sequence<0 ||
    !Array.isArray(s.educationCases.history) || !s.educationCases.items ||
    typeof s.educationCases.items!=="object" ||
    Object.values(s.educationCases.items).some(item=>!item || item.stepsUsed>3 ||
      item.stepsUsed<0 || !["active","resolved"].includes(item.status) ||
      !["intent","planning","application","contract","continuity","resolved"].includes(item.phase))
  )) problems.push("進路案件の年次・状態遷移記録が不正");
  if(typeof educationCheckFinanceInvariants==="function" &&
    educationCheckFinanceInvariants(s).length)
    problems.push("教育費の請求・領収・返金台帳に矛盾");
  if(typeof educationAttendanceInvariants==="function" &&
    educationAttendanceInvariants(s).length)
    problems.push("教育の月次出席・年次履修認定記録に矛盾");
  if(typeof educationAccessIdentityInvariants==="function" &&
    educationAccessIdentityInvariants(s).length)
    problems.push("学校・教師の感染認知または言語支援に不整合");
  if(typeof educationDependentInvariants==="function" &&
    educationDependentInvariants(s).length)
    problems.push("子・きょうだいの教育記録に不整合");
  if(typeof educationNonformalInvariants==="function" &&
    educationNonformalInvariants(s).length)
    problems.push("学校外学習または技能認定記録に不整合");
  if(typeof educationServiceInvariants==="function" && educationServiceInvariants(s).length)
    problems.push("教育窓口の申請・回答記録に不整合");
  if(s.educationAnnualFee && (
    !Number.isInteger(s.educationAnnualFee.year) ||
    s.educationAnnualFee.year > s.year ||
    !Number.isFinite(s.educationAnnualFee.amount) ||
    s.educationAnnualFee.amount < 0 ||
    !["personal","household","mixed","contract","mixed-contract"].includes(s.educationAnnualFee.payer) ||
    ["contract","mixed-contract"].includes(s.educationAnnualFee.payer) &&
      (!Number.isFinite(s.educationAnnualFee.paidByContract) || s.educationAnnualFee.paidByContract<=0 ||
       !(s.loanContracts||[]).some(row=>row.id===s.educationAnnualFee.contractId))
  )) problems.push("年間教育費と支払主体が不正");
  if(s.loanContracts!=null && !Array.isArray(s.loanContracts))
    problems.push("契約債務台帳の形式が不正");
  const contracts=Array.isArray(s.loanContracts)?s.loanContracts:[],
    contractIds=new Set(), contractTotals={personal:0,household:0};
  for(const row of contracts) {
    const valid=row && typeof row==="object" &&
      typeof row.id==="string" && !!row.id && !contractIds.has(row.id) &&
      typeof row.borrower==="string" && typeof row.creditor==="string" &&
      typeof row.region==="string" && typeof row.currency==="string" &&
      ["personal","household"].includes(row.account) &&
      ["personal-loan","education-credit"].includes(row.kind) &&
      Number.isFinite(row.principal) && row.principal>0 &&
      Number.isFinite(row.totalDue) && row.totalDue>=row.principal &&
      Number.isFinite(row.balance) && row.balance>=0 &&
      Number.isFinite(row.installment) && row.installment>0 &&
      Number.isFinite(row.nonContractualCharges) && row.nonContractualCharges>=0 &&
      Number.isInteger(row.signedYear) && row.signedYear<=s.year &&
      Number.isInteger(row.dueYear) && row.dueYear>row.signedYear &&
      ["open","overdue","paid","unresolved-at-death"].includes(row.status) &&
      typeof row.terms==="string" && !!row.terms &&
      Array.isArray(row.history) && row.history.length>0 && row.history.length<=100 &&
      row.history.every(item=>item && Number.isInteger(item.year) && item.year<=s.year &&
        ["signed","payment","disputed-charge","unresolved-at-death"].includes(item.kind) &&
        (item.amount==null || Number.isFinite(item.amount) && item.amount>=0));
    if(!valid) {
      problems.push("契約債務の署名条件・履歴・状態が不正");
      continue;
    }
    contractIds.add(row.id);
    contractTotals[row.account]+=row.balance;
    if((row.status==="paid")!==(row.balance===0) ||
       row.status==="unresolved-at-death" && (!s.dead || row.balance<=0) ||
       row.status==="overdue" && row.dueYear>=s.year)
      problems.push("契約債務の残高・期限・死亡時状態が不一致");
  }
  if((Number.isFinite(s.debt) && s.debt>=0 && contractTotals.personal>s.debt+0.01) ||
     (Number.isFinite(s.house?.debt ?? 0) && (s.house?.debt ?? 0)>=0 && contractTotals.household>(s.house?.debt ?? 0)+0.01))
    problems.push("契約債務の詳細残高と集計負債が不一致");
  if(s.personalWishes!=null) {
    const w=s.personalWishes;
    if(!w || w.version!==1 || !["written","not-written"].includes(w.status) ||
       !Number.isInteger(w.year) || w.year>s.year ||
       !Array.isArray(w.history) || w.history.length>12 ||
       w.history.some(row=>!row || !Number.isInteger(row.year) || row.year>s.year) ||
       w.status==="written" && (typeof w.recipientId!=="string" || typeof w.recipientName!=="string" ||
         typeof w.content!=="string" || !w.content) ||
       w.status==="not-written" && (w.recipientId!=null || w.content!=null) ||
       w.afterDeathStatus!=null && (w.afterDeathStatus!=="unverified" || !s.dead ||
         !Number.isInteger(w.deathYear) || w.deathYear>s.year))
      problems.push("本人の希望メモまたは死後の確認状態が不正");
  }
  if (
    s.oripathyExposure &&
    (!Array.isArray(s.oripathyExposure.history) || s.oripathyExposure.history.length > 36)
  )
    problems.push("鉱石病曝露・防護の履歴が不正");
  if (!Number.isInteger(s.job) || !services.J[s.job]) problems.push("職業IDが不正");
  if (
    s.reducedWorkStartedYear != null &&
    (!Number.isInteger(s.reducedWorkStartedYear) ||
      s.reducedWorkStartedYear > s.year ||
      !s.fl.reduced_work)
  )
    problems.push("勤務縮小の開始年が不正");
  if (!!s.fl.pet_companion !== !!s.pet) problems.push("飼育動物と飼育状態フラグが一致しない");
  if (
    s.pet &&
    (!Number.isInteger(s.petSinceYear) ||
      !Number.isInteger(s.petCareUntil) ||
      s.petSinceYear > s.year ||
      s.petCareUntil <= s.petSinceYear)
  )
    problems.push("飼育動物の経過年・相談年が不正");
  if (!s.pet && (s.petSinceYear != null || s.petCareUntil != null || s.fl.pet_care_extended))
    problems.push("飼育動物がいないのに飼育期間・延長状態が残っている");
  if (s.fl.pet_care_extended && (!s.pet || s.petCareUntil <= s.petSinceYear))
    problems.push("飼育期間延長フラグの対象または期限が不正");
  if (!services.REG.some(r => r.n === s.res?.n)) problems.push("居住地域が不正");
  if (
    !s.legal ||
    ![
      ["recorded", "ラテラーノ"],
      ["unverified", null]
    ].some(([status, country]) => s.legal.status === status && s.legal.citizenshipCountry === country)
  )
    problems.push("市民資格記録が不正");
  if (
    s.legal?.executionWarrant != null &&
    (!["issued", "revoked", "unverified"].includes(s.legal.executionWarrant.status) ||
      !Number.isInteger(s.legal.executionWarrant.year) ||
      s.legal.executionWarrant.year > s.year ||
      !["rebellion_conviction", "security_conviction", "documented_purge"].includes(
        s.legal.executionWarrant.basis
      ) ||
      typeof s.legal.executionWarrant.sourceEventId !== "string" ||
      !s.legal.executionWarrant.sourceEventId)
  )
    problems.push("処刑命令・有罪判決の根拠記録が不正");
  if (s.legal?.familyProceedings != null && !Array.isArray(s.legal.familyProceedings))
    problems.push("地域固有の家族手続き記録が配列ではない");
  for (const proceeding of s.legal?.familyProceedings || []) {
    const deceased = (s.relationshipHistory || []).find(
      x => x.id === proceeding.relativeId && x.ending === "死別" && x.deathYear
    );
    if (
      s.legal.status !== "recorded" ||
      s.legal.citizenshipCountry !== "ラテラーノ" ||
      proceeding.caseType !== "estate_guardianship_inquiry" ||
      proceeding.outcome !== "照会済み・法的結果未確定" ||
      !Number.isInteger(proceeding.year) ||
      proceeding.year > s.year ||
      !deceased ||
      !Array.isArray(proceeding.children) ||
      proceeding.children.some(id => !s.kids.some(k => k.id === id))
    )
      problems.push("ラテラーノ家族手続き照会の記録が不正");
  }
  if (!["移動都市", "固定集落"].includes(s.home)) problems.push("居住形態が不正");
  else if (
    !services.SIM_TABLES.locality[s.home === "移動都市" ? "mobile" : "fixed"].some(x => x.n === s.local?.kind)
  )
    problems.push("居住形態と地区が不一致");
  if (s.fl.detained && s.fl.segregated) problems.push("収容と隔離が同時に有効");
  if (s.fl.seg_work && !s.fl.segregated) problems.push("隔離外で区画内勤務が有効");
  if (s.fl.tx && !s.inf) problems.push("非感染者に鉱石病治療が有効");
  if (s.fl.dg && !s.inf) problems.push("非感染者に感染診断が有効");
  if (s.workPayBonus < 0 || s.workPayBonus > services.P("economy.maxJobPayBonus"))
    problems.push("賃金改善率が範囲外");
  if (s.workPayBonus && (!s.job || s.fl.retired || services.restricted(s)))
    problems.push("離職中の賃金改善率が残存");
  for (const [flag, value] of Object.entries(s.fl))
    if (!services.FLAG_REGISTRY[flag] || (value !== 0 && value !== 1))
      problems.push(`不正な状態フラグ ${flag}`);
  problems.push(...auditPlaySettings(s),...auditTravelState(s),...auditHistoricalExposureState(s));
  if (s.house)
    for (const key of ["cash", "debt", "inc", "exp"])
      if (!Number.isFinite(s.house[key]) || s.house[key] < 0) problems.push(`家計${key}が不正`);
}
