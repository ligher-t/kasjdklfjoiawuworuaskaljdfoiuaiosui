const emptyLifeRecord = () => ({
  version: 4,
  goals: [],
  skills: [],
  affiliations: [],
  groupStandings: [],
  regionalImpacts: [],
  organizations: [],
  bodyChanges: [],
  careerChanges: [],
  milestones: [],
  hobbies: [],
  artifacts: [],
  workRelationships: []
});
function ensureLifeRecord(s) {
  if (!s) return null;
  const old = s.lifeRecord && typeof s.lifeRecord === "object" && !Array.isArray(s.lifeRecord) ? s.lifeRecord : {};
  s.lifeRecord = { ...emptyLifeRecord(), ...old, version: 4 };
  for (const key of [
    "goals",
    "skills",
    "affiliations",
    "groupStandings",
    "regionalImpacts",
    "organizations",
    "bodyChanges",
    "careerChanges",
    "milestones",
    "hobbies",
    "artifacts",
    "workRelationships"
  ])
    s.lifeRecord[key] = Array.isArray(s.lifeRecord[key]) ? s.lifeRecord[key] : [];
  return s.lifeRecord;
}
function lifeRecordSource() {
  return {
    year: S.year,
    age: S.age,
    eventId: TRACE_RESOLUTION?.id || null,
    choice: TRACE_RESOLUTION?.label || null
  };
}
function applyHobbyJourney(key, action, note = "") {
  const meta = HOBBY_META[key];
  if (!meta || !S?.fl) throw new Error("趣味の記録対象がありません");
  const r = ensureLifeRecord(S),
    source = lifeRecordSource();
  let item = r.hobbies.find(row => row.id === key);
  if (!item) {
    item = {
      id: key,
      title: meta.title,
      status: "active",
      startedYear: source.year,
      practiceYears: 0,
      history: []
    };
    r.hobbies.push(item);
  }
  if (action === "start" || action === "resume") item.status = "active";
  else if (action === "pause") item.status = "paused";
  else if (action === "end") item.status = "ended";
  else if (action !== "practice") throw new Error("趣味の経過区分が不正");
  if (action === "practice") item.practiceYears++;
  item.lastChangedYear = source.year;
  item.history.push({ ...source, action, note: String(note || "").slice(0, 180) });
  if (item.history.length > 32) item.history.shift();
  return item;
}
function advanceHobbyJourneys(s) {
  const life = ensureLifeRecord(s);
  for (const [key, meta] of Object.entries(HOBBY_META)) {
    if (!s.fl?.[key] || restricted(s)) continue;
    let item = life.hobbies.find(row => row.id === key);
    if (!item) item = applyHobbyJourney(key, "start", "継続中の趣味を記録");
    if (item.status !== "active") applyHobbyJourney(key, "resume", "生活の中で再開");
    applyHobbyJourney(key, "practice", "一年続けた");
    applyLifeSkill({
      id: `hobby-${key}`,
      title: meta.skill,
      delta: meta.delta,
      context: `${meta.title}を続けた`
    });
    if (item.practiceYears >= 3 && !life.artifacts.some(row => row.hobbyId === key)) {
      const artifact = {
        id: `hobby-artifact-${key}`,
        hobbyId: key,
        title: {
          hobby_music: "人前で披露した一曲",
          hobby_craft: "手元に残した手仕事",
          hobby_garden: "育てた植物の記録",
          hobby_sport: "身につけた型と稽古帳",
          hobby_collect: "整理した収集品の目録",
          hobby_story: "覚えて語り継いだ話"
        }[key],
        status: "kept",
        createdYear: s.year,
        history: [{ year: s.year, action: "made", basis: "継続年数から記録" }]
      };
      life.artifacts.push(artifact);
      if (life.artifacts.length > 40) life.artifacts.shift();
    }
  }
}
function shouldApplyLifeGoal(input, goal) {
  return !input.onlyIfActive || (!!goal && ["active", "compromised"].includes(goal.status));
}
function applyLifeGoal(input) {
  const r = ensureLifeRecord(S),
    action = input.action || "start";
  let id = String(input.id || "").trim(),
    goal =
      id === "current"
        ? r.goals
            .slice()
            .reverse()
            .find(item => ["active", "compromised", "paused"].includes(item.status))
        : r.goals.find(item => item.id === id);
  if (id === "current") id = goal?.id || "";
  if (input.onlyIfActive && !shouldApplyLifeGoal(input, goal)) return goal || null;
  if (
    !id ||
    id.length > 64 ||
    (!input.title && !goal) ||
    !["start", "continue", "compromise", "pause", "complete", "abandon"].includes(action)
  )
    throw new Error("人生目標の記録形式が不正");
  // A later employment episode must not undo an already completed life goal.
  if (action === "start" && input.preserveAchievement && goal?.status === "achieved")
    return goal;
  const source = lifeRecordSource();
  if (!goal) {
    goal = {
      id,
      title: String(input.title).slice(0, 120),
      priority: input.priority || "unranked",
      status: "active",
      startedYear: source.year,
      history: []
    };
    r.goals.push(goal);
  } else if (input.title) goal.title = String(input.title).slice(0, 120);
  if (input.priority) goal.priority = input.priority;
  const from = goal.status;
  goal.status =
    action === "complete"
      ? "achieved"
      : action === "abandon"
        ? "abandoned"
        : action === "pause"
          ? "paused"
          : action === "compromise"
            ? "compromised"
            : "active";
  goal.history.push({
    ...source,
    action,
    from,
    to: goal.status,
    note: String(input.note || "").slice(0, 240)
  });
  goal.history = goal.history.slice(-20);
  goal.lastChangedYear = source.year;
  return goal;
}
function applyLifeSkill(input) {
  const r = ensureLifeRecord(S),
    jobSpecific = input.id === "current-job" && input.title === "current_job",
    id = jobSpecific ? `job-${S.job}` : String(input.id || "").trim(),
    title = jobSpecific ? `${J[S.job]?.n || "現在"}の実務` : String(input.title || "");
  if (!id || !title || !Number.isFinite(input.delta) || input.delta < 0 || input.delta > 100)
    throw new Error("技能の記録形式が不正");
  let skill = r.skills.find(item => item.id === id);
  if (!skill) {
    skill = { id, title, level: 0, practiceCount: 0, history: [] };
    r.skills.push(skill);
  }
  skill.title = title;
  const before = skill.level;
  skill.level = clamp(before + input.delta, 0, 100);
  skill.practiceCount++;
  skill.history.push({
    ...lifeRecordSource(),
    before,
    after: skill.level,
    context: String(input.context || "").slice(0, 200)
  });
  skill.history = skill.history.slice(-20);
  return skill;
}
function applyLifeWorkRelationship(input) {
  const life = ensureLifeRecord(S),
    action = input.action || "offer",
    source = lifeRecordSource();
  if (action === "offer") {
    if (
      !["accepted", "declined"].includes(input.response) ||
      life.workRelationships.some(row => row.id === input.id)
    )
      throw new Error("同僚との指導関係の申出記録が不正");
    const sex = R() < P("birth.femaleShare") ? "女" : "男",
      age = clamp(S.age + rnd(-12, 12), 18, 80),
      person = {
        id: newRelativeId(S),
        nm: nmUnique_(S, sex, S.res),
        sx: sex,
        r: pickRaceFor(S.res),
        by: S.by + S.age - age,
        metYear: S.year,
        jobId: S.job
      };
    const row = {
      id: String(input.id).slice(0, 64),
      kind: "workplace-mentorship",
      title: String(input.title || "整備作業の同僚").slice(0, 100),
      status: input.response === "accepted" ? "active" : "declined",
      person,
      startedYear: source.year,
      consent: input.response === "accepted",
      history: [
        {
          ...source,
          action: "offer",
          response: input.response,
          note:
            input.response === "accepted"
              ? "本人が短い練習の申し出を受け入れた"
              : "本人が今回は申し出を断った"
        }
      ]
    };
    life.workRelationships.push(row);
    return row;
  }
  if (action === "record-employment-exclusion") {
    if (
      life.workRelationships.some(row => row.id === input.id) ||
      !["excluded", "manager-overruled"].includes(input.decision) ||
      !["left-after-exclusion", "asked-for-criteria"].includes(input.applicantResponse)
    )
      throw new Error("採用排除の個人記録が不正");
    const employer =
      input.employerId === "current"
        ? [...life.affiliations]
            .reverse()
            .find(row => row.kind === "employer" && ["active", "crisis"].includes(row.status))
        : life.affiliations.find(
            row =>
              row.id === input.employerId &&
              row.kind === "employer" &&
              ["active", "crisis"].includes(row.status)
          );
    if (!employer) throw new Error("現役の雇用記録がないため求職者との出来事を結べない");
    const sex = R() < P("birth.femaleShare") ? "女" : "男",
      age = clamp(18 + rnd(0, 24), 18, 42),
      race = RACE.find(row => row.n === "サルカズ");
    if (!race) throw new Error("サルカズの種族定義がない");
    const person = {
      id: newRelativeId(S),
      nm: nmUnique_(S, sex, S.res),
      sx: sex,
      r: race,
      by: S.year - age,
      metYear: S.year,
      jobId: 0
    };
    const row = {
      id: String(input.id).slice(0, 64),
      kind: "workplace-exclusion-case",
      title: "サルカズの求職者との面接",
      status: input.decision,
      person,
      startedYear: source.year,
      consent: false,
      employer: { id: employer.id, title: employer.title, role: employer.role || null },
      region: S.res?.n || null,
      home: S.home || null,
      localityKind: S.local?.kind || null,
      localityCity: S.local?.city || null,
      applicantResponse: input.applicantResponse,
      followupYear: source.year + 2,
      review: null,
      history: [
        {
          ...source,
          action: "interview-decision",
          decision: input.decision,
          applicantResponse: input.applicantResponse,
          note:
            input.applicantResponse === "left-after-exclusion"
              ? "差別的な排除を受けて面接を終えた"
              : "採用基準と勤務条件を尋ねた",
          scope: "一人の応募者と一つの職場での出来事。採用慣行や他の人への適用は未確認"
        }
      ]
    };
    life.workRelationships.push(row);
    return row;
  }
  const row = life.workRelationships.find(item => item.id === input.id);
  if (row?.kind === "workplace-exclusion-case" && action === "review-employment-exclusion") {
    if (
      row.review ||
      source.year < row.followupYear ||
      !["case-current", row.employer.id].includes(input.employerId) ||
      !["maintain", "narrow", "contest"].includes(input.decision)
    )
      throw new Error("採用判断の後年確認が不正");
    const employer = life.affiliations.find(
      item =>
        item.id === row.employer.id && item.kind === "employer" && ["active", "crisis"].includes(item.status)
    );
    if (!employer) throw new Error("同じ雇用先での後年確認ができない");
    row.review = {
      year: source.year,
      age: source.age,
      decision: input.decision,
      eventId: source.eventId,
      choice: source.choice,
      scope: "この応募者と同じ職場での再検討。採用、補償、謝罪、方針変更は未確認"
    };
    row.history.push({ ...source, action: "local-review", decision: input.decision, note: row.review.scope });
    row.history = row.history.slice(-8);
    return row;
  }
  if (!row || row.kind !== "workplace-mentorship" || row.status !== "active")
    throw new Error("継続中の同僚関係だけ後年の確認を記録できます");
  if (action !== "close") throw new Error("同僚との指導関係の更新区分が不正");
  row.status = "concluded";
  row.endedYear = source.year;
  row.history.push({
    ...source,
    action: "close",
    note: String(input.note || "定期の指導役を終えた").slice(0, 180)
  });
  row.history = row.history.slice(-8);
  return row;
}
function workRelationshipValid(row, s) {
  if (
    !row?.id ||
    !row.title ||
    !row.person?.id ||
    !row.person?.nm ||
    !RACE.some(r => r.n === row.person?.r?.n) ||
    !Number.isInteger(row.person?.by) ||
    !Number.isInteger(row.startedYear) ||
    row.startedYear > s.year ||
    !Array.isArray(row.history) ||
    row.history.length < 1 ||
    row.history.length > 8 ||
    row.history.some(
      entry => !Number.isInteger(entry.year) || entry.year < row.startedYear || entry.year > s.year
    )
  )
    return false;
  if (row.kind === "workplace-mentorship")
    return (
      ["active", "declined", "concluded"].includes(row.status) &&
      row.consent === (row.status !== "declined") &&
      (row.status === "concluded"
        ? Number.isInteger(row.endedYear) && row.endedYear >= row.startedYear && row.endedYear <= s.year
        : row.endedYear == null) &&
      row.history.every((entry, index) =>
        index === 0
          ? entry.action === "offer" && ["accepted", "declined"].includes(entry.response)
          : entry.action === "close" && row.status === "concluded"
      )
    );
  if (
    row.kind !== "workplace-exclusion-case" ||
    !RACE.some(r => r.n === "サルカズ" && r.n === row.person.r.n) ||
    row.person.by > row.startedYear - 18 ||
    row.person.by < row.startedYear - 42 ||
    (row.status !== "excluded" && row.status !== "manager-overruled") ||
    row.consent !== false ||
    !row.employer?.id ||
    !row.employer.title ||
    !s.lifeRecord?.affiliations?.some(
      a => a.id === row.employer.id && a.kind === "employer" && a.title === row.employer.title
    ) ||
    !REG.some(r => r.n === row.region) ||
    !allowedHomesForRegion(row.region).includes(row.home) ||
    typeof row.localityKind !== "string" ||
    !row.localityKind ||
    row.applicantResponse !== (row.status === "excluded" ? "left-after-exclusion" : "asked-for-criteria") ||
    row.followupYear !== row.startedYear + 2 ||
    !row.history.every((entry, index) =>
      index === 0
        ? entry.action === "interview-decision" &&
          entry.decision === row.status &&
          entry.applicantResponse === row.applicantResponse
        : entry.action === "local-review" &&
          row.review?.year === entry.year &&
          row.review.decision === entry.decision
    )
  )
    return false;
  if (row.review != null)
    return (
      Number.isInteger(row.review.year) &&
      row.review.year >= row.followupYear &&
      row.review.year <= s.year &&
      ["maintain", "narrow", "contest"].includes(row.review.decision) &&
      row.review.eventId != null &&
      typeof row.review.scope === "string"
    );
  return row.history.length === 1;
}
function applyBodyChange(input) {
  const r = ensureLifeRecord(S),
    id = String(input.id || "").trim(),
    actions = ["start", "adapt", "review", "resolve"];
  if (!id || !input.title || !actions.includes(input.action || "start"))
    throw new Error("身体変化の記録形式が不正");
  let item = r.bodyChanges.find(row => row.id === id);
  const source = lifeRecordSource();
  if (!item) {
    if ((input.action || "start") !== "start") throw new Error("未登録の身体変化は開始から記録してください");
    item = {
      id,
      title: String(input.title).slice(0, 120),
      cause: String(input.cause || "未記録").slice(0, 180),
      function: String(input.function || "未記録").slice(0, 180),
      status: "recovering",
      startedYear: source.year,
      reviewYear:
        source.year +
        (Number.isInteger(input.reviewDelay) ? Math.max(1, Math.min(input.reviewDelay, 30)) : 1),
      accommodation: null,
      history: []
    };
    r.bodyChanges.push(item);
  } else {
    if (input.title) item.title = String(input.title).slice(0, 120);
    if (input.function) item.function = String(input.function).slice(0, 180);
    if (input.action === "adapt") {
      item.status = "adapted";
      item.accommodation = String(input.accommodation || "暮らしや役割を身体に合わせて調整").slice(0, 180);
      item.reviewYear = null;
    } else if (input.action === "resolve") {
      item.status = "resolved";
      item.reviewYear = null;
    } else if (input.action === "review") {
      item.reviewYear = Number.isInteger(input.reviewDelay)
        ? source.year + Math.max(1, Math.min(input.reviewDelay, 30))
        : source.year + 2;
      if (input.status && ["recovering", "adapted", "ongoing", "resolved"].includes(input.status))
        item.status = input.status;
      if (input.accommodation) item.accommodation = String(input.accommodation).slice(0, 180);
    }
  }
  item.history.push({
    ...source,
    action: input.action || "start",
    status: item.status,
    function: item.function,
    accommodation: item.accommodation,
    note: String(input.note || "").slice(0, 220)
  });
  item.history = item.history.slice(-20);
  return item;
}
function recordCareerChange(s, fromJobId, toJobId, source = TRACE_RESOLUTION) {
  if (fromJobId === toJobId || !J[fromJobId] || !J[toJobId]) return null;
  const rows = ensureLifeRecord(s).careerChanges,
    item = {
      id: `career-${s.year}-${rows.length + 1}`,
      year: s.year,
      age: s.age,
      fromJobId,
      toJobId,
      fromTitle: J[fromJobId].n,
      toTitle: J[toJobId].n,
      eventId: source?.id || null,
      choice: source?.label || null
    };
  rows.push(item);
  if (rows.length > 60) rows.splice(0, rows.length - 60);
  return item;
}
const CAREER_PLACEMENTS = [
  { id: "rhodes-staff", jobs: [28, 29, 30, 31, 33, 34, 35, 36, 37], region: null, goal: "rhodes-work" },
  { id: "bsw-contract", jobs: [35, 36, 37], region: "クルビア", goal: "bsw-work" },
  { id: "rhine-lab", jobs: [38, 39, 40], region: "クルビア", goal: "rhine-research" },
  { id: "kazimierz-arena-staff", job: 32, region: "カジミエーシュ", goal: "kazimierz-arena-work" },
  { id: "columbia-technical-work", job: 7, region: "クルビア", goal: "columbia-technical-work" },
  { id: "victoria-insurance-clerk", job: 21, region: "ヴィクトリア", goal: "victoria-clerk-livelihood" },
  { id: "higashi-service", job: 14, region: "極東", goal: "higashi-service" }
];
function currentCareerPlacement(s, id) {
  const placement = CAREER_PLACEMENTS.find(row => row.id === id);
  return (
    !!placement &&
    (placement.jobs ? placement.jobs.includes(s.job) : s.job === placement.job) &&
    (placement.region == null || s.res?.n === placement.region) &&
    !s.fl?.retired &&
    !restricted(s) &&
    affiliationWorkAvailable(s, id) &&
    !!s.lifeRecord?.affiliations?.some(row => row.id === id && ["active", "crisis"].includes(row.status))
  );
}
function reconcileGenericWorkGoal(s) {
  const goal=s?.lifeRecord?.goals?.find(row=>row.id==="craft");
  if(!goal)return;
  const pauseNote="現在の仕事を離れたため、仕事の技能目標を休止";
  if(s.job===0 && ["active","compromised"].includes(goal.status)) {
    applyLifeGoal({id:"craft",action:"pause",note:pauseNote});
    return;
  }
  if(s.job>0 && goal.status==="paused" && goal.history?.at(-1)?.note===pauseNote)
    applyLifeGoal({id:"craft",action:"continue",note:"新しい仕事に就き、仕事の技能目標を再開"});
}
function reconcileCareerPlacements(s, preserveCurrentPay = false, assignedPlacements = null) {
  if (s !== S) return;
  const jobAtStart = s.job;
  for (const placement of CAREER_PLACEMENTS) {
    const affiliation = s.lifeRecord?.affiliations?.find(row => row.id === placement.id),
      holdsPlacementJob = placement.jobs ? placement.jobs.includes(s.job) : s.job === placement.job;
    if (
      !affiliation ||
      !["active", "crisis"].includes(affiliation.status) ||
      (holdsPlacementJob &&
        (placement.region == null || s.res?.n === placement.region) &&
        !s.fl?.retired &&
        !restricted(s) &&
        (!assignedPlacements || assignedPlacements.includes(placement.id)))
    )
      continue;
    const note =
      "現在の職業・雇用選択・居住地域・勤務状態を照合し、この職場での勤務終了を確認した。過去の未記録の終了時点は補っていない";
    applyLifeAffiliation({ id: placement.id, action: "leave", note });
    const goal = s.lifeRecord.goals.find(row => row.id === placement.goal);
    if (goal && ["active", "paused"].includes(goal.status))
      applyLifeGoal({
        id: goal.id,
        action: "compromise",
        note: "この職場での継続を終え、次の暮らしを考える"
      });
    if (!preserveCurrentPay) s.workPayBonus = 0;
    if (!preserveCurrentPay && holdsPlacementJob) {
      const previousJob = s.job;
      s.job = 0;
      s.fl.workplace_hazard = 0;
      recordCareerChange(s, previousJob, 0);
    }
  }
  reconcileAffiliationWork(s, preserveCurrentPay);
  reconcileGenericWorkGoal(s);
  if (s.job !== jobAtStart) {
    siteAffiliation(s, "workplace");
    reconcileWorkContract(s);
  }
}
function lifeAffiliationAtRecordedLocality(s, id) {
  const affiliation = s?.lifeRecord?.affiliations?.find(row => row.id === id),
    currentKey = s?.res?.n && s?.local ? localityKey(s) : null;
  return !affiliation?.localityKey || affiliation.localityKey === currentKey;
}
function lifeAffiliationAwayFromRecordedLocality(s, id) {
  const affiliation = s?.lifeRecord?.affiliations?.find(row => row.id === id),
    currentKey = s?.res?.n && s?.local ? localityKey(s) : null;
  return !!affiliation?.localityKey && !!currentKey && affiliation.localityKey !== currentKey;
}
function applyLifeAffiliation(input) {
  const employerKey = employmentOrganizationKey(input);
  if (["join", "assign", "return"].includes(input?.action || "join") &&
      EMPLOYER_PLAYER_ACCESS_MODES[employerKey] === "BLOCKED")
    throw Error("プレイヤーの新規加入対象外となる組織への所属");
  const r = ensureLifeRecord(S),
    id = String(input.id || "").trim(),
    requestedAction = input.action || "join";
  let action = requestedAction;
  if (
    !id ||
    (!input.title && !r.affiliations.some(item => item.id === id)) ||
    ![
      "contact",
      "followup",
      "join",
      "assign",
      "continue",
      "role",
      "crisis",
      "leave",
      "return",
      "suspend",
      "review",
      "decline"
    ].includes(action)
  )
    throw new Error("所属の記録形式が不正");
  let a = r.affiliations.find(item => item.id === id);
  if (action === "join" && a?.status === "left") action = "return";
  if (!a && !["contact", "join", "assign"].includes(action))
    throw new Error("接触または加入の前に所属状態を変更できません");
  if (!a) {
    a = {
      id,
      title: String(input.title).slice(0, 120),
      kind: String(input.kind || "community").slice(0, 40),
      status: "outside",
      role: null,
      startedYear: null,
      endedYear: null,
      episodes: [],
      history: []
    };
    r.affiliations.push(a);
  }
  if (!Array.isArray(a.episodes)) a.episodes = [];
  const from = a.status,
    source = lifeRecordSource();
  if (action === "assign") {
    if (!["outside", "contacted"].includes(a.status) || a.episodes.some(row => row.endedYear == null))
      throw new Error("既存の在籍期間へ強制配属を重ねられません");
    a.startedYear ??= source.year;
    a.endedYear = null;
    a.status = "active";
    if (input.role) a.role = String(input.role).slice(0, 80);
    a.episodes.push({
      startedYear: source.year,
      endedYear: null,
      roleAtStart: a.role || null,
      returning: a.episodes.some(row => Number.isInteger(row.endedYear)),
      basis: "coercive-assignment"
    });
  } else if (action === "contact") {
    if (["active", "crisis", "suspended", "contacted"].includes(a.status))
      throw new Error("継続中の所属を新規接触状態へ戻せません");
    a.status = "contacted";
    a.contactedYear ??= source.year;
    a.lastContactYear = source.year;
    if (input.role) a.role = String(input.role).slice(0, 80);
  } else if (action === "followup") {
    if (a.status !== "contacted") throw new Error("返答待ちとして接触中の所属だけを追跡できます");
    a.lastContactYear = source.year;
    if (input.role) a.role = String(input.role).slice(0, 80);
  } else if (action === "join" || action === "return") {
    if (action === "join" && !["outside", "contacted"].includes(a.status))
      throw new Error("再参加には復帰の記録を使ってください");
    if (action === "return" && !["left", "suspended", "crisis", "contacted"].includes(a.status))
      throw new Error("復帰できる中断・離脱記録がありません");
    const resumeCurrent = action === "return" && ["suspended", "crisis"].includes(a.status),
      currentEpisode = a.episodes.at(-1);
    if (resumeCurrent && (!currentEpisode || currentEpisode.endedYear != null))
      throw new Error("再開する所属期間がありません");
    if (!resumeCurrent && a.episodes.some(row => row.endedYear == null))
      throw new Error("終了していない所属期間が残っています");
    if (input.bindToLocality) {
      if (requestedAction !== "join" || !S.res?.n || !S.local)
        throw new Error("生活圏への所属記録には加入時の居住地が必要です");
      a.localityKey = localityKey(S);
    }
    a.startedYear ??= source.year;
    a.endedYear = null;
    a.status = input.resumePriorStatus && a.pausedFrom === "crisis" ? "crisis" : "active";
    if (input.role) a.role = String(input.role).slice(0, 80);
    if (!resumeCurrent)
      a.episodes.push({
        startedYear: source.year,
        endedYear: null,
        roleAtStart: a.role || null,
        returning: action === "return" || a.episodes.some(row => Number.isInteger(row.endedYear)),
        basis: "recorded"
      });
  } else if (action === "continue") {
    if (["active", "crisis", "suspended"].includes(a.status)) {
      const currentEpisode = a.episodes.at(-1);
      if (!currentEpisode || currentEpisode.endedYear != null)
        throw new Error("継続する所属期間がありません");
      a.status = "active";
      if (input.role) a.role = String(input.role).slice(0, 80);
    } else if (["outside", "contacted", "left"].includes(a.status)) {
      if (a.episodes.some(row => row.endedYear == null))
        throw new Error("終了していない所属期間が残っています");
      a.startedYear ??= source.year;
      a.endedYear = null;
      a.status = "active";
      if (input.role) a.role = String(input.role).slice(0, 80);
      a.episodes.push({
        startedYear: source.year,
        endedYear: null,
        roleAtStart: a.role || null,
        returning: a.episodes.some(row => Number.isInteger(row.endedYear)),
        basis: "recorded"
      });
    } else throw new Error("現在の所属状態から継続できません");
  } else if (action === "decline") {
    if (a.status !== "contacted") throw new Error("接触状態の所属だけ辞退できます");
    a.status = "outside";
    a.role = null;
    a.endedYear = null;
  } else if (action === "role") {
    if (!["active", "crisis"].includes(a.status)) throw new Error("所属していない集団で役割を変更できません");
    if (input.role) {
      let role = String(input.role).slice(0, 80);
      if (id === "rhodes-staff" && input.preserveRhodesPost) {
        const previous = String(a.role || ""),
          post = previous.startsWith("本艦")
            ? "本艦・船内居住"
            : previous.startsWith("地域支部")
              ? previous.split("／職務:")[0]
              : "";
        if (post) role = `${post}／職務:${role}`.slice(0, 80);
      }
      // A repeated success at the same rank is another incident, not another promotion.
      if (input.onlyIfRoleChanged && a.role === role) return a;
      a.role = role;
    }
  } else if (action === "crisis") {
    if (a.status !== "active") throw new Error("活動中でない所属に危機を記録できません");
    a.status = "crisis";
  } else if (action === "leave") {
    if (!["active", "crisis", "suspended"].includes(a.status))
      throw new Error("在籍していない所属から離脱できません");
    const episode = a.episodes.at(-1);
    if (!episode || episode.endedYear != null) throw new Error("終了する所属期間がありません");
    episode.endedYear = source.year;
    episode.endReason = String(input.note || "離脱").slice(0, 160);
    a.status = "left";
    a.endedYear = source.year;
  } else if (action === "suspend") {
    if (!["active", "crisis"].includes(a.status)) throw new Error("活動中の所属だけ一時中断できます");
    a.pausedFrom=a.status;
    a.pauseContext=String(input.pauseContext || "personal").slice(0,40);
    a.status = "suspended";
  } else if (action === "review") {
    if (a.status !== "suspended") throw new Error("休止中の所属だけ継続確認を記録できます");
  }
  if (id === "rhodes-staff" && action === "leave" && S.personTies) {
    const colleagues = S.personTies.rhodesColleagues ||
      (S.personTies.rhodesColleague ? [S.personTies.rhodesColleague] : []);
    for (const colleague of colleagues)
      if (colleague.actualStatus === "working") colleague.actualStatus = "former";
    if (S.personTies.rhodesColleague?.actualStatus === "working")
      S.personTies.rhodesColleague.actualStatus = "former";
  }
  if (a.status !== "suspended") { delete a.pauseContext; delete a.pausedFrom; }
  a.lastChangedYear = source.year;
  a.history.push({
    ...source,
    action,
    from,
    to: a.status,
    role: a.role,
    ...(action === "suspend" ? {pauseContext:a.pauseContext,pausedFrom:a.pausedFrom} : {}),
    episodeIndex: a.episodes.length ? a.episodes.length - 1 : null,
    note: String(input.note || "").slice(0, 240)
  });
  bindAffiliationPlace(S, a, {...input,newEpisode:["outside","contacted","left"].includes(from)});
  return a;
}
function applyGroupStanding(input) {
  const r = ensureLifeRecord(S),
    id = String(input.id || "").trim();
  if (!id || !input.title || !Number.isFinite(input.delta) || input.delta < -30 || input.delta > 30)
    throw new Error("集団評価の記録形式が不正");
  let standing = r.groupStandings.find(item => item.id === id);
  if (!standing) {
    standing = { id, title: String(input.title).slice(0, 120), value: 0, history: [] };
    r.groupStandings.push(standing);
  }
  const before = standing.value;
  standing.value = clamp(before + input.delta, -100, 100);
  standing.history.push({
    ...lifeRecordSource(),
    before,
    after: standing.value,
    reason: String(input.reason || "").slice(0, 240),
    basis: "ゲームモデル"
  });
  standing.history = standing.history.slice(-20);
  return standing;
}
function applyRegionalImpact(input) {
  const r = ensureLifeRecord(S),
    region = String(input.region || S.res?.n || "");
  if (!REG.some(item => item.n === region) || !input.entity || !input.kind || !input.description)
    throw new Error("地域への影響記録に地域・対象・種類・説明が必要です");
  const row = {
    ...lifeRecordSource(),
    region,
    entity: String(input.entity).slice(0, 120),
    kind: String(input.kind).slice(0, 60),
    description: String(input.description).slice(0, 300),
    basis: input.basis || "player-life-local-model",
    scope: "local"
  };
  r.regionalImpacts.push(row);
  r.regionalImpacts = r.regionalImpacts.slice(-40);
  return row;
}
function applyLifeOrganization(input) {
  const r = ensureLifeRecord(S),
    allowed = {
      "infected-exclusion": "感染者排除を求める住民会",
      "infected-mutual-aid": "感染者と家族の共同購入・診療連絡会"
    };
  let id = String(input.id || "").trim();
  const action = input.action || "review";
  if (id === "infected-current")
    id =
      r.organizations
        .slice()
        .reverse()
        .find(item => Object.hasOwn(allowed, item.id) && item.status === "active")?.id ||
      r.organizations
        .slice()
        .reverse()
        .find(item => Object.hasOwn(allowed, item.id))?.id ||
      "";
  if (
    !Object.hasOwn(allowed, id) ||
    ![
      "found",
      "review",
      "policy",
      "dues",
      "expense",
      "participation",
      "handover",
      "dissolve",
      "followup"
    ].includes(action)
  )
    throw new Error("組織運営記録の形式が不正");
  let org = r.organizations.find(item => item.id === id);
  const source = lifeRecordSource();
  if (action === "found") {
    if (org && org.status === "active") throw new Error("活動中の組織を重ねて設立できません");
    org = {
      id,
      title: String(input.title || allowed[id]).slice(0, 120),
      kind: String(input.kind || id).slice(0, 48),
      status: "active",
      startedYear: source.year,
      endedYear: null,
      formedRegion: S.res?.n || null,
      formedHome: S.home || null,
      formedLocalityKind: S.local?.kind || null,
      formedCity: S.local?.city || null,
      foundingCost: Math.max(0, Number(input.amount) || 0),
      contributionsTotal: Math.max(0, Number(input.amount) || 0),
      operatingReserve: 0,
      spentTotal: Math.max(0, Number(input.amount) || 0),
      policy: String(input.policy || "initial").slice(0, 80),
      participation: String(input.participation || "運営世話役").slice(0, 80),
      history: []
    };
    r.organizations.push(org);
  } else {
    if (!org) throw new Error("未設立の組織を更新できません");
    const amount = Math.max(0, Number(input.amount) || 0);
    if (action === "policy" && input.policy) org.policy = String(input.policy).slice(0, 80);
    if (action === "participation" && input.participation)
      org.participation = String(input.participation).slice(0, 80);
    if (action === "dues") {
      org.contributionsTotal += amount;
      org.operatingReserve += amount;
    }
    if (action === "expense") {
      if (input.funding === "personal") org.contributionsTotal += amount;
      else {
        if (amount > org.operatingReserve) throw new Error("組織の運営残額が不足しています");
        org.operatingReserve -= amount;
      }
      org.spentTotal += amount;
    }
    if (action === "handover" || action === "dissolve") {
      org.status = action === "handover" ? "handed-over" : "dissolved";
      org.endedYear = source.year;
    }
    if (action === "followup") org.lastFollowupYear = source.year;
  }
  org.history.push({
    ...source,
    action,
    amount: Math.max(0, Number(input.amount) || 0),
    funding: input.funding === "personal" ? "personal" : null,
    policy: org.policy,
    participation: org.participation || null,
    status: org.status,
    note: String(input.note || "").slice(0, 240)
  });
  org.history = org.history.slice(-24);
  return org;
}
