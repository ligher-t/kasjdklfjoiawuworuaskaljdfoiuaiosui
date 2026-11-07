// Life record and summary presentation.
function lifeRecordFacts(s) {
  const life = ensureLifeRecord(s),
    activeGoals = life.goals.filter(x => ["active", "paused", "compromised"].includes(x.status)),
    recordedAffiliations = life.affiliations.filter(x => x.status !== "outside" || x.history?.length);
  return {
    workRelationships: life.workRelationships.map(row =>
      row.kind === "workplace-exclusion-case"
        ? `${row.person?.nm || "名前未記録"}（${row.region}・${row.startedYear}年、面接時の応答: ${
            row.applicantResponse === "left-after-exclusion"
              ? "差別的な排除を受けて面接を終えた"
              : "採用基準を尋ねた"
          }` +
          `。勤務先「${row.employer.title}」の後年確認: ${
            row.review
              ? { maintain: "当時の判断を維持", narrow: "判断範囲を狭めた", contest: "判断に異議を述べた" }[
                  row.review.decision
                ]
              : "未確認"
          }` +
          `。採用・謝罪・補償は未確認）`
        : `${row.person?.nm || "名前未記録"}（${
            row.status === "active"
              ? "本人の同意を得た指導が継続中"
              : row.status === "declined"
                ? "申し出を辞退"
                : `指導役を${row.endedYear}年に終了`
          }` + `）`
    ),
    goals: life.goals.map(
      x =>
        `${x.title}（${
          { active: "継続中", paused: "保留", achieved: "達成", abandoned: "断念", compromised: "妥協" }[
            x.status
          ]
        }` + `）`
    ),
    skills: life.skills
      .filter(x => x.practiceCount)
      .map(x => `${x.title} ${Math.round(x.level)}/100（練習${x.practiceCount}回）`),
    hobbies: life.hobbies.map(
      x =>
        `${x.title}（${{ active: "継続中", paused: "休止中", ended: "終了" }[x.status] || "状態不明"}・開始${x.startedYear}年・継続${x.practiceYears || 0}年）`
    ),
    artifacts: life.artifacts.map(
      x =>
        `${x.title}（${x.createdYear}年、${
          { kept: "手元に保管", shared: "人に分けた", transferred: "譲渡", lost: "失われた" }[x.status] ||
          "状態未記録"
        }` + `）`
    ),
    affiliations: recordedAffiliations.map(
      x =>
        `${x.title}${x.role ? `・${x.role}` : ""}（${
          (x.status === "outside" && x.history?.length
            ? x.kind === "employment-application"
              ? "応募記録あり"
              : "以前に接触"
            : {
                outside: "接触前",
                contacted: "接触・返答待ち",
                active: "継続中",
                crisis: "内部危機",
                suspended: "一時中断",
                left: "離脱"
              }[x.status]) || "状態未記録"
        }` +
        (`${
          x.kind === "employment-application" && x.history?.length
            ? `・${x.history.at(-1).note || x.history.at(-1).action}`
            : ""
        }` +
          `${Number.isInteger(x.startedYear) ? `・初回加入${x.startedYear}年` : ""}`) +
        (`${
          x.episodes?.length
            ? `・在籍期間: ${x.episodes.map(row => `${row.startedYear}〜${row.endedYear ?? "現在"}年`).join("、")}`
            : ""
        }` +
          `）`)
    ),
    organizations: life.organizations.map(
      x =>
        `${x.title}（${{ active: "運営中", "handed-over": "引継ぎ", dissolved: "解散" }[x.status] || "状態不明"}・${x.startedYear}年設立${x.endedYear ? `、${x.endedYear}年まで` : ""}` +
        `・会費累計${m(x.contributionsTotal)}` +
        (`・運営費${m(x.spentTotal)}${x.operatingReserve ? `・残額${m(x.operatingReserve)}` : ""}・方針:${x.policy}` +
          `・本人の役割:${x.participation || "未記録"}${x.lastFollowupYear ? `・後年の確認${x.lastFollowupYear}年` : ""}`) +
        `）`
    ),
    standing: life.groupStandings.map(x => `${x.title} ${x.value > 0 ? "+" : ""}${Math.round(x.value)}/100`),
    impact: life.regionalImpacts.length
      ? `地域に残した局所記録 ${life.regionalImpacts.length}件。直近: ${life.regionalImpacts.at(-1).year}年、${life.regionalImpacts.at(-1).region}` +
        `で${life.regionalImpacts.at(-1).description}`
      : "本人が関与した地域の影響記録なし",
    goalOverview: activeGoals.length
      ? activeGoals
          .map(x => `${x.title}（${{ active: "継続", paused: "保留", compromised: "妥協" }[x.status]}）`)
          .join("／")
      : "継続中の目標なし"
  };
}
function lifeChapterRecords(s) {
  const life = ensureLifeRecord(s),
    rows = [];
  let sequence = 0;
  const add = (year, age, kind, text, eventId = null) => {
    if (!Number.isInteger(year) || year < s.by || year > s.year || typeof text !== "string" || !text.trim())
      return;
    const actualAge = Number.isInteger(age) ? age : year - s.by;
    if (actualAge < 0 || actualAge > s.age) return;
    rows.push({ year, age: actualAge, kind, text: text.trim().slice(0, 320), eventId, sequence: sequence++ });
  };
  const actionLabels = {
    start: "始めた",
    continue: "続けた",
    compromise: "やり方を見直した",
    pause: "休止した",
    complete: "区切りをつけた",
    abandon: "断念した",
    contact: "連絡を取った",
    followup: "返事を待ち、確認した",
    join: "加わった",
    role: "役割を変えた",
    crisis: "内部の危機に直面した",
    leave: "離れた",
    return: "戻った",
    suspend: "一時休止した",
    decline: "申し出を断った",
    adapt: "暮らし方を調整した",
    review: "経過を見直した",
    resolve: "区切りを記録した",
    found: "立ち上げた",
    policy: "方針を変えた",
    participation: "担う役割を変えた",
    handover: "引き継いだ",
    dissolve: "解散した",
    dues: "会費を納めた",
    expense: "費用を支出した",
    offer: "申し出をした",
    close: "関係を終えた",
    made: "作った"
  };
  for (const goal of life.goals)
    for (const row of goal.history || [])
      add(
        row.year,
        row.age,
        "願い",
        `${goal.title} — ${row.choice || actionLabels[row.action] || "状態を更新"}${row.note ? `。${row.note}` : ""}`,
        row.eventId
      );
  for (const skill of life.skills)
    for (const row of skill.history || [])
      add(
        row.year,
        row.age,
        "技能",
        `${skill.title}${
          Number.isFinite(row.after)
            ? `（${Math.round(row.before || 0)}から${Math.round(row.after)}/100）`
            : ""
        }` + `${row.context ? ` — ${row.context}` : ""}`,
        row.eventId
      );
  for (const affiliation of life.affiliations)
    for (const row of affiliation.history || [])
      add(
        row.year,
        row.age,
        "所属",
        `${affiliation.title} — ${row.role || actionLabels[row.action] || "関わり方を記録"}${row.note ? `。${row.note}` : ""}`,
        row.eventId
      );
  for (const row of life.careerChanges)
    add(
      row.year,
      row.age,
      "仕事",
      `${row.fromTitle}から${row.toTitle}へ移った${row.choice ? `。${row.choice}` : ""}`,
      row.eventId
    );
  for (const body of life.bodyChanges)
    for (const row of body.history || [])
      add(
        row.year,
        row.age,
        "身体と暮らし",
        `${body.title} — ${
          row.note || row.accommodation || row.function || actionLabels[row.action] || "経過を記録"
        }`,
        row.eventId
      );
  for (const row of life.regionalImpacts)
    add(row.year, row.age, "地域", `${row.region}で${row.entity}に関わった。${row.description}`, row.eventId);
  for (const standing of life.groupStandings)
    for (const row of standing.history || [])
      add(
        row.year,
        row.age,
        "周囲との関係",
        `${standing.title}からの評価 ${Number.isFinite(row.after) ? `${row.after > 0 ? "+" : ""}${Math.round(row.after)}/100` : ""}` +
          `${row.reason ? ` — ${row.reason}` : ""}`,
        row.eventId
      );
  for (const org of life.organizations)
    for (const row of org.history || [])
      add(
        row.year,
        row.age,
        "組織",
        `${org.title} — ${row.note || actionLabels[row.action] || "運営を記録"}${Number.isFinite(row.amount) && row.amount > 0 ? `（${m(row.amount)}）` : ""}`,
        row.eventId
      );
  for (const relation of life.workRelationships)
    for (const row of relation.history || [])
      add(
        row.year,
        row.age,
        "仕事仲間",
        `${relation.person?.nm || "同僚"}との${relation.title} — ${row.note || actionLabels[row.action] || "関係を記録"}`,
        row.eventId
      );
  for (const hobby of life.hobbies)
    for (const row of hobby.history || [])
      if (!["practice", "legacy_snapshot"].includes(row.action))
        add(
          row.year,
          row.age,
          "余暇",
          `${hobby.title}を${actionLabels[row.action] || row.action}${row.note ? `。${row.note}` : ""}`,
          row.eventId
        );
  for (const artifact of life.artifacts)
    add(
      artifact.createdYear,
      null,
      "手元に残った品",
      `${artifact.title}を作り、${
        { kept: "手元に残した", shared: "人に分けた", transferred: "譲った", lost: "失った" }[
          artifact.status
        ] || "後の状態を記録していない"
      }`,
      null
    );
  if (s.dead && s.mortality?.history?.length)
    for (const row of s.mortality.history.slice(-12)) add(row.year, row.age, "体調・安全", row.text, null);
  if (s.dead)
    add(
      s.year,
      s.age,
      "最期",
      `${s.age}歳で${s.dc || "死因未記録"}により生涯を終えた${s.dl ? `。${s.dl}` : ""}`,
      null
    );
  rows.sort((a, b) => a.year - b.year || a.age - b.age || a.sequence - b.sequence);
  return rows;
}
function lifeChaptersMarkup(s, collapsible = false) {
  const rows = lifeChapterRecords(s);
  if (!rows.length)
    return collapsible
      ? `<details class="life-chapters"><summary>人生の節目（0件）</summary><p>まだ経歴に残る節目はありません。</p></details>`
      : `<section class="life-chapters"><h3>人生の節目</h3><p>まだ経歴に残る節目はありません。</p></section>`;
  const limit = 100,
    shown = rows.length > limit ? [...rows.slice(0, 50), ...rows.slice(-50)] : rows,
    groups = [];
  for (const row of shown) {
    let group = groups.at(-1);
    if (!group || row.year - group.lastYear > 4) {
      group = { firstYear: row.year, lastYear: row.year, firstAge: row.age, lastAge: row.age, rows: [] };
      groups.push(group);
    }
    group.lastYear = row.year;
    group.lastAge = row.age;
    group.rows.push(row);
  }
  const formatPeriod = group =>
    group.firstYear === group.lastYear
      ? `${group.firstYear}年ごろ・${group.firstAge}歳ごろ`
      : `${group.firstYear}〜${group.lastYear}年ごろ・${group.firstAge}〜${group.lastAge}歳ごろ`;
  const content =
    `<p class="nt">残された足跡を古い順に辿っています。記されていない歳月にも、名もない日々が流れていました。</p>${groups
      .map(
        group =>
          `<section class="life-chapter"><h4>${esc(formatPeriod(group))}</h4><ol>${group.rows
            .map(row => `<li><strong>${esc(row.kind)}:</strong> ${esc(row.text)}</li>`)
            .join("")}` + `</ol></section>`
      )
      .join("")}` +
    `${
      rows.length > limit
        ? `<p class="nt">節目を${limit}件表示しています。ほか${rows.length - limit}件の詳細は各経歴欄に残っています。</p>`
        : ""
    }`;
  return collapsible
    ? `<details class="life-chapters"><summary>人生の節目（${rows.length}件）</summary>${content}</details>`
    : `<section class="life-chapters"><h3>人生の節目</h3>${content}</section>`;
}
function careerStepperMarkup(s, life) {
  if (!s || !life) return "";
  const changes = life.careerChanges || [];
  const currentTitle = (typeof occupationLabel === "function" ? occupationLabel(s) : ((typeof J !== "undefined" && J[s.job]?.n) || "無職"));
  if (!changes.length && (currentTitle === "無職" || currentTitle === "学生") && s.age < 15) return "";

  const steps = [];
  if (changes.length > 0) {
    steps.push({
      year: changes[0].year,
      title: changes[0].fromTitle || "無職",
      isCurrent: false
    });
    for (let i = 0; i < changes.length; i++) {
      const isLast = i === changes.length - 1;
      steps.push({
        year: changes[i].year,
        title: changes[i].toTitle,
        isCurrent: isLast && changes[i].toTitle === currentTitle
      });
    }
    if (steps.at(-1)?.title !== currentTitle && currentTitle !== "無職") {
      steps.push({
        year: s.year,
        title: currentTitle,
        isCurrent: true
      });
    } else if (steps.length > 0) {
      steps[steps.length - 1].isCurrent = true;
    }
  } else {
    const startYear = s.by ? (s.by + Math.min(s.age, 15)) : s.year;
    steps.push({
      year: startYear,
      title: currentTitle,
      isCurrent: true
    });
  }

  if (s.fl?.workshop_opened && !steps.some(st => st.title.includes("工房"))) {
    steps.push({
      year: s.fl.workshop_opened_year || s.year,
      title: "自営工房開業",
      isCurrent: true,
      badge: "事業持分"
    });
  }

  const stepHtml = steps.map((step, idx) => {
    const isCurrentClass = step.isCurrent ? " current" : "";
    const badgeText = step.badge ? `<span class="ui-career-badge">${esc(step.badge)}</span>` : step.isCurrent ? `<span class="ui-career-badge">現在</span>` : "";
    return (
      (idx > 0 ? `<div class="ui-career-arrow" aria-hidden="true">➔</div>` : "") +
      `<div class="ui-career-step${isCurrentClass}">` +
      `<span class="ui-career-year">${step.year}年</span>` +
      `<span class="ui-career-title">${esc(step.title)}</span>${badgeText}</div>`
    );
  }).join("");

  return (
    `<div class="ui-career-stepper" role="region" aria-label="職歴・キャリアの歩み">` +
    `<div class="ui-career-header"><span class="ui-career-tag">CAREER PATH</span><span class="ui-career-label">経歴タイムライン</span></div>` +
    `<div class="ui-career-flow">${stepHtml}</div></div>`
  );
}

function lifeRecordMarkup(s, includeChapters = true) {
  const life = ensureLifeRecord(s),
    facts = lifeRecordFacts(s),
    body = life.bodyChanges.map(
      x =>
        `${x.title}（${
          { recovering: "回復中", ongoing: "経過観察", adapted: "暮らしを調整", resolved: "回復" }[
            x.status
          ] || "状態未記録"
        }` +
        `、${x.startedYear}年発生${x.reviewYear ? `・次回確認${x.reviewYear}年` : ""}` +
        `。影響: ${x.function}${x.accommodation ? `。工夫: ${x.accommodation}` : ""}）`
    ),
    career = life.careerChanges.map(
      x => `${x.year}年・${x.fromTitle}から${x.toTitle}へ${x.choice ? `（${x.choice}）` : ""}`
    );
  const rows = [
      ["目標", facts.goals.join("／") || "まだ言葉にしていない"],
      ["身につけたこと", facts.skills.join("／") || "練習の記録なし"],
      ["趣味の変遷", facts.hobbies.join("／") || "記録なし"],
      ["作ったもの・残した品", facts.artifacts.join("／") || "記録なし"],
      ["仕事の移り変わり", career.join("／") || "記録なし"],
      ["所属と役割", facts.affiliations.join("／") || "継続中の所属記録なし"],
      ["同僚との個人関係", facts.workRelationships.join("／") || "記録なし"],
      ["関わった組織の運営", facts.organizations.join("／") || "運営記録なし"],
      ["集団からの評価", facts.standing.join("／") || "評価の記録なし"],
      ["身体の変化と暮らしの工夫", body.join("／") || "記録なし"],
      ["地域に残したもの", facts.impact]
    ];
  const markup = rows.map(([key, value]) => `<dt>${esc(key)}</dt><dd>${esc(value)}</dd>`).join("");
  return (includeChapters ? lifeChaptersMarkup(s, true) : "") + careerStepperMarkup(s, life) + recordTableMarkup(markup, "career");
}
function lifeSummaryFacts(s) {
  const personStatus = (person, deadAt, knownAt) => {
    if (!person) return "記録なし";
    const name = person.nm || person.name || "名前未記録",
      recordedDeath =
        Number.isFinite(deadAt) && deadAt > 0
          ? deadAt
          : Number.isFinite(person.deathYear) && person.lifeStatus === "dead"
            ? person.deathYear
            : null;
    if (recordedDeath != null)
      return Number.isFinite(knownAt) && knownAt <= s.year
        ? `${name}（${recordedDeath}年没）`
        : `${name}（安否未確認）`;
    if (person.knownLifeStatus === "missing")
      return `${name}（${person.knownMissingSinceYear || "年不明"}年ごろから消息不明）`;
    if (person.knownLifeStatus === "unrecorded" || person.lifeStatus === "missing")
      return `${name}（安否未確認）`;
    if (person.knownLifeStatus === "alive" || person.lifeStatus === "alive" || deadAt === 0 || deadAt == null)
      return `${name}（存命記録）`;
    return `${name}（安否未確認）`;
  };
  const parents = [s.par?.fa, s.par?.mo]
    .filter(Boolean)
    .map(person => personStatus(person, person.d, person.deathKnownYear));
  const siblings = siblingsOf(s).map(person => {
    const status = personStatus(person, person.d, person.deathKnownYear),
      visits = Array.isArray(person.visitHistory) ? person.visitHistory : [];
    if (!visits.length) return status;
    const lastVisit = visits.at(-1);
    return (
      `${status}（訪問${visits.length}回・累計費用${m(person.visitTotal || 0)}・最終 ${lastVisit.year}年 ${lastVisit.from}→${lastVisit.to}` +
      ` ${m(lastVisit.fare)}・${lastVisit.paidBy === "household" ? "共有家計" : "本人家計"}）`
    );
  });

  const children = (s.kids || []).map(person => personStatus(person, person.d, person.deathKnownYear));
  const closeContacts = [
    ["友人", s.friendContact],
    ["近所の人", s.neighborContact]
  ]
    .filter(([, person]) => person)
    .map(
      ([label, person]) =>
        `${label} ${personStatus(
          person,
          person.lifeStatus === "dead" ? person.deathYear : null,
          person.deathKnownYear
        )}`
    );
  const romanceStageLabel = {
    known: "知り合い",
    dating: "交際中",
    committed: "結婚を含む将来を話し合った",
    cohabiting: "婚姻せず同居",
    arranged: "縁談"
  };
  const relationships = [
    s.sp
      ? `${s.sp.nm || s.sp.name || "名前未記録"}（配偶者${s.sp.marriageType ? `・${s.sp.marriageType}` : ""}${Number.isFinite(s.sp.marriedYear) ? `・${s.sp.marriedYear}年から` : ""}` +
        `${
          spouseEmploymentStatus(s.sp) === "unemployed"
            ? "・現在求職中"
            : J[s.sp.j]?.n
              ? `・現在の仕事:${J[s.sp.j].n}`
              : ""
        }` +
        (`${(s.sp.workHistory || []).length ? `・転職記録${(s.sp.workHistory || []).length}回` : ""}${s.sp.workPreference ? `・仕事の希望:${spouseWorkPreferenceLabel(s.sp.workPreference)}` : ""}` +
          `・家計分担:${spouseHouseholdArrangementSummary(s)}`) +
        `${
          s.sp.disclosureBoundary === "separate_rooms"
            ? "・鉱石病の告白後、別室で過ごしている"
            : s.sp.disclosureBoundary === "repaired"
              ? "・鉱石病の告白後に話し合いを再開"
              : ""
        }` +
        `${
          s.sp.visitCount
            ? `・訪問${s.sp.visitCount}回・累計費用${m(s.sp.visitTotal || 0)}${
                s.sp.visitHistory?.length
                  ? `・最終訪問 ${s.sp.visitHistory.at(-1).year}年 ${s.sp.visitHistory.at(-1).from}→${s.sp.visitHistory.at(-1).to} ${m(s.sp.visitHistory.at(-1).fare)}` +
                    `・${s.sp.visitHistory.at(-1).paidBy === "household" ? "共有家計" : "本人家計"}`
                  : ""
              }`
            : ""
        }` +
        `${
          !spouseLivesWithProtagonist(s)
            ? `・${
                spouseResidenceRegion(s).n === s.res.n
                  ? "同じ地域の別世帯"
                  : "別居中:" + spouseKnownResidenceRegion(s).n
              }` +
              `${
                s.sp.residenceMoveNotice && !Number.isInteger(s.sp.residenceMoveNotice.deliveredYear)
                  ? "（転居先の便り待ち）"
                  : ""
              }` +
              (`${s.sp.separateContact ? `・連絡費年${m(spouseSeparateContactAnnualCost(s))}` : ""}${s.sp.separateContactPaidTotal ? `・連絡費累計${m(s.sp.separateContactPaidTotal)}` : ""}` +
                `${
                  s.sp.separateContact
                    ? `・${
                        { regular: "連絡を継続", letters: "便り中心", paused: "連絡を休止" }[
                          s.sp.separateContact
                        ] || "連絡未確認"
                      }`
                    : ""
                }`) +
              `${
                s.sp.separateSupportPlan && s.sp.separateSupportPlan !== "none"
                  ? `・支援:${s.sp.separateSupportPlan === "medical" ? "療養費" : "生活費"}（累計${m(s.sp.separateSupportPaidTotal || 0)}）`
                  : ""
              }`
            : ""
        }` +
        `）`
      : null,
    s.romance
      ? `${s.romance.name || s.romance.nm || "名前未記録"}（${romanceStageLabel[s.romance.stage] || "関係段階未記録"}${Number.isFinite(s.romance.metYear) ? `・${s.romance.metYear}年から` : ""}` +
        `${s.romance.context ? `・${s.romance.context}` : ""}）`
      : null,
    ...(s.relationshipHistory || []).map(
      person =>
        `${person.name || person.nm || "名前未記録"}（${person.ending || "過去の関係"}${Number.isFinite(person.endedYear) ? `・${person.endedYear}年まで` : ""}）`
    )
  ].filter(Boolean);
  const moves = (s.moves || []).map(move => `${move.year}年 ${move.from}から${move.to}へ`).slice(-5);
  const knownMoves = (s.moves || []).length;
  const family =
    `親 ${parents.length ? parents.join("・") : "記録なし"}／きょうだい ${siblings.length ? siblings.join("・") : "記録なし"}／子 ${children.length ? children.join("・") : "記録なし"}` +
    `／配偶者・恋愛関係 ${relationships.length ? relationships.join("・") : "記録なし"}` +
    `／友人・近所 ${closeContacts.length ? closeContacts.join("・") : "記録なし"}`;
  const diagnosisLabel = s.fl?.dg ? "診断年 " + (s.infection?.diagnosedYear ?? "未記録") : "診断の記録なし";
  const route = s.infection?.basis === "event-recorded" ? s.infection.cause : null;
  const health = s.fl?.dg
    ? `鉱石病（${diagnosisLabel}・${s.fl?.tx ? "継続治療中" : "継続治療なし"}）。${route ? "感染時の記録："+route+"。" : "感染経路は未記録。"}`
    : "鉱石病の診断記録なし（感染の有無は未確定）";
  const attitudeRows = (s.attitudeHistory || []).filter(x => x.formation),
    attitudeLabels = { infected: "感染者への見方", sarkaz: "サルカズへの見方" },
    attitudeHistory = attitudeRows.length
      ? `${attitudeRows
          .slice(0, 4)
          .map(
            x =>
              `${x.year}年・${x.age}歳、${attitudeLabels[x.attitude] || "人々への見方"}に関わる経験「${x.choice || "選択の記録なし"}」${x.effectiveDelta === 0 ? "（数値上の変化なし）" : ""}`
          )
          .join("／")}` + `${attitudeRows.length > 4 ? `／ほか${attitudeRows.length - 4}件` : ""}`
      : "態度を形作った経験の記録なし";
  const displacementStatus = s.displacement
    ? { shelter: "避難・仮住まい中", housed: "親類・知人宅を頼って再建", rebuilt: "避難後の暮らしを再建" }[
        s.displacement.status
      ] || "状態未記録"
    : "";
  const life = ensureLifeRecord(s),
    body =
      life.bodyChanges
        .map(
          x =>
            `${x.title}（${x.status}、影響: ${x.function}${x.accommodation ? `、工夫: ${x.accommodation}` : ""}）`
        )
        .join("／") || "記録なし",
    career =
      life.careerChanges.map(x => `${x.year}年${x.fromTitle}から${x.toTitle}へ移った`).join("／") ||
      "職業の移り変わり記録なし",
    trajectory = lifeRecordFacts(s);
  return {
    birth: `テラ暦${s.by}年${s.bd || "生年月日未記録"}、${s.g?.n || "出生地未記録"}${s.birthLocality?.city ? `・${s.birthLocality.city}` : s.birthLocality ? "・都市名未特定" : "・旧記録では都市名未記録"}で生まれた${s.r?.n || "種族未記録"}。養育記録: ${s.care?.kind || "未記録"}。`,
    workAndEducation: `最終記録の生業: ${occupationLabel(s)}。学歴・就学: ${educationStandingLabel(s)}。`,
    trajectory:
      `目標: ${trajectory.goals.join("／") || "未記録"}。技能: ${trajectory.skills.join("／") || "未記録"}。仕事: ${career}。所属: ${trajectory.affiliations.join("／") || "未記録"}` +
      `。組織運営: ${trajectory.organizations.join("／") || "未記録"}` +
      `。集団評価: ${trajectory.standing.join("／") || "未記録"}。身体の経過: ${body}。${trajectory.impact}`,
    movement: knownMoves
      ? `居住地の移動記録 ${knownMoves}回。${moves.join("／")}${knownMoves > moves.length ? "／ほか過去の記録あり" : ""}`
      : "地域間の移動記録なし。",
    family,
    familyRecords: [["親", parents.join("・") || "記録なし"], ["きょうだい", siblings.join("・") || "記録なし"],
      ["子", children.join("・") || "記録なし"], ["配偶者・恋愛関係", relationships.join("・") || "記録なし"],
      ["友人・近所", closeContacts.join("・") || "記録なし"]],
    health,
    attitudes: attitudeHistory,
    displacement: s.displacement
      ? `避難後の暮らしの記録: ${displacementStatus}${s.displacement.resolvedYear ? `（${s.displacement.resolvedYear}年）` : ""}。`
      : "避難後の再建記録なし。",
    ending: s.dead
      ? `${s.year}年${s.mo || "月不明"}、${s.res?.n || "居住地未記録"}で${s.age}歳の生涯を終えた。死因分類: ${s.dc || "未記録"}。`
      : "生涯継続中の記録。",
    finalNetAssets: Math.round((s.cash || 0) + (s.investment || 0) - (s.debt || 0))
  };
}
function lifeSummaryMarkup(s) {
  const facts = lifeSummaryFacts(s),
    trajectory = lifeRecordFacts(s),
    chapters = lifeChaptersMarkup(s, true),
    rows = [
      ["出生・養育", facts.birth],
      ["生業・学び", facts.workAndEducation],
      ["目標・技能・所属・地域への影響", facts.trajectory],
      [
        "趣味と手元に残った品",
        `${trajectory.hobbies.join("／") || "記録なし"}。成果: ${trajectory.artifacts.join("／") || "記録なし"}`
      ],
      ["移動", facts.movement],
      [
        "勤務契約と職場の条件",
        (s.workContractHistory || [])
          .slice(-6)
          .map(h =>
            h.action === "assignment"
              ? `${h.year}年 担当工程の変更を${h.outcome === "approved" ? "承認" : "拒否"}`
              : `${h.year}年 ${h.action}${h.assignment === "adjusted" && h.action === "ended" ? "（工程変更あり）" : ""}`
          )
          .join("／") || "記録なし"
      ],
      [
        "地域・種族間の接点",
        (s.intergroupHistory || [])
          .slice(-6)
          .map(h => `${h.year}年 ${h.topic}：${h.response}`)
          .join("／") || "記録なし"
      ],
      [
        "職場・学び舎・医療窓口の変更",
        (s.siteAffiliationHistory || [])
          .filter(x => x.action === "transferred")
          .slice(-8)
          .map(x => `${x.year}年 ${x.kind}の利用先を変更`)
          .join("／") || "変更の記録なし"
      ],
      [
        "施設と仕事・学び・医療の接点",
        (s.facilityContacts || [])
          .slice(-8)
          .map(x => `${x.year}年 ${x.description}`)
          .join("／") || "記録なし"
      ],
      ["職場で関わった人", trajectory.workRelationships.join("／") || "個人関係の記録なし"],
      [
        "施設で出会った人",
        (s.facilityPeopleContacts || [])
          .slice(-10)
          .map(x => `${x.year}年 ${x.description}`)
          .join("／") || "まだ記録なし"
      ],
      ["家族・近しい関係", facts.family],
      ["健康", facts.health],
      ["考え方を形作った経験", facts.attitudes],
      ["避難と再建", facts.displacement],
      ["最期", facts.ending],
      ["契約した借金と返済", (s.loanContracts||[]).map(contract=>{
        const paid=(contract.history||[]).filter(row=>row.kind==="payment").reduce((sum,row)=>sum+(row.amount||0),0),
          status={open:"返済中",overdue:"期限超過",paid:"完済", "unresolved-at-death":"死亡時未解決"}[contract.status]||contract.status;
        return (contract.account==="household"?"世帯":"本人")+"／"+contract.creditor+"（金額単位："+(contract.currency||"龍門幣換算")+"）：元本"+Math.round(contract.principal).toLocaleString("ja-JP")+
          "、総額"+Math.round(contract.totalDue).toLocaleString("ja-JP")+"、返済"+Math.round(paid).toLocaleString("ja-JP")+
          "、残額"+Math.round(contract.balance).toLocaleString("ja-JP")+"、"+status+"（期限"+contract.dueYear+"年）。"+contract.terms+
          " 支払履歴："+(contract.history||[]).filter(row=>row.kind==="payment"||row.kind==="disputed-charge")
            .map(row=>row.year+"年"+(row.kind==="payment"?"返済":"契約外請求")+Math.round(row.amount||0).toLocaleString("ja-JP")).join("／");
      }).join("。")||"契約した借金の記録なし。"],
      ["家計の立て直し", s.debtPlan ? `${s.debtPlan.year}年、${s.debtPlan.action === "frugal" ? "日々の支出を絞り、生活の余剰から返済する方針" : "暮らしの支出を保ち、収入の余剰から返済する方針"}${s.debt <= 0 ? "。現在は負債なし。" : "。"}` : "方針の記録なし"],
      ["本人が残した希望", s.personalWishes?.status==="written"
        ? s.personalWishes.year+"年、"+s.personalWishes.recipientName+"へ記した希望："+s.personalWishes.content+
          (s.personalWishes.afterDeathStatus==="unverified"?" 死後の実施状況は未確認。":"")
        : s.personalWishes?.status==="not-written" ? s.personalWishes.year+"年、書面を残さないと選択した。" : "希望の記録なし。"],
      ["最終純資産（龍門幣換算）", m(facts.finalNetAssets)]
    ];
  const table = (items, key) => recordTableMarkup(items.map(([label, value]) =>
    `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join(""), key);
  const chapterRecords = lifeChapterRecords(s);
  const highlights = chapterRecords.slice(-3);
  const latest = highlights.length ? '<ol class="ui-life-highlights" aria-label="最後に記録された節目">' + highlights.map(row =>
    `<li><p>${esc(row.year)}年・${esc(row.age)}歳</p><strong>${esc(row.kind)}</strong><span>${esc(row.text)}</span></li>`).join("") + '</ol>' :
    '<p class="ui-record-note">経歴に残る節目の記録はありません。</p>';
  const namedRow = label => rows.find(row=>row[0]===label);
  const files = [
    {key:"life-home", title:"生い立ちと暮らし", open:true, content:table([rows[0],rows[1],rows[4],namedRow("家計の立て直し"),namedRow("最終純資産（龍門幣換算）")], "ending-home")},
    {key:"life-work", title:"生業・学び・残したもの", content:lifeRecordMarkup(s, false) + table(rows.slice(5,9), "ending-work")},
    {key:"life-people", title:"家族と人とのつながり", content:table([...facts.familyRecords, rows[10]], "ending-people")},
    {key:"life-body", title:"身体・経験・最期", content:table(rows.slice(12).filter(row=>!["家計の立て直し","最終純資産（龍門幣換算）"].includes(row[0])), "ending-body")}
  ];
  return `<div class="life-summary"><p class="ui-record-note">この人生で確かめられた足跡と経緯をまとめています。本人の知り得なかった事情や、記録に残らない胸の内までは補っていません。</p>` +
    latest + (chapterRecords.length ? chapters : "") + files.map((file, index) =>
      `<details class="ui-life-file" data-record-group="${file.key}"${file.open ? " open" : ""}><summary><span class="ui-file-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>${file.title}</summary><div class="ui-life-file-body">${file.content}</div></details>`
    ).join("") + '</div>';
}

// P2: a record-side provenance viewer based solely on events the player
// actually experienced. Catalog references describe design evidence, not
// what the fictional resident could know or what caused a random outcome.
function lifeEvidenceEntries(s) {
  const history = Array.isArray(s?.trace) ? s.trace : [];
  const catalog = new Map((typeof EV !== "undefined" ? EV : []).map(e => [e.id, e]));
  const experienced = history.filter(row =>
    (row.kind === "daily" || row.kind === "choice") &&
    typeof row.id === "string" && row.details && typeof row.details.text === "string");
  return experienced.map((row,index) => {
    const event = catalog.get(row.id);
    const prerequisite = event?.after?.id
      ? experienced.slice(0,index).reverse().find(prior =>
          prior.id === event.after.id &&
          row.year - prior.year >= (event.after.min || 0) &&
          (event.after.max == null || row.year - prior.year <= event.after.max))
      : null;
    return {row, event, prerequisite};
  }).filter(x=>!x.event || x.event.after || x.event.references?.length || x.row.kind === "choice");
}
function lifeEvidenceMarkup(s) {
  const rows = lifeEvidenceEntries(s);
  if (!rows.length) return '<p class="nt">この人生では出所を照会できる出来事が記録されていません。記録がないことは出来事がなかった証拠ではありません。</p>';
  const confidence = {
    A:"作中で明示",B:"本文・相対年代の整合",C:"所在地・前後関係からの推定",
    D:"資料矛盾・仮説段階",S:"ゲーム上の仮定","?":"未確認"
  };
  const shown = rows.slice(-40).reverse();
  const quote = value => esc(String(value || "").replace(/\s+/g," ").slice(0,170));
  return '<p class="nt">本人が経験した選択・日常記録から、製作時に参照した資料を表示します。<strong>資料の根拠区分は、この人物の出来事が原作で起こった確率を表しません。</strong>「先行記録」は発生条件に用いた関係であり、歴史的な因果の断定ではありません。</p>' +
    '<p class="ui-evidence-count">RECORDED EVIDENCE / 全'+rows.length+'件のうち直近'+shown.length+'件</p>'+
    '<ol class="ui-evidence-list">'+shown.map(({row,event,prerequisite})=>{
      const conf = event?.conf || "?";
      const sources = (event?.references || []).map(id =>
        typeof SETTING_SOURCES !== "undefined" ? SETTING_SOURCES[id] : null).filter(Boolean);
      const sourceText = sources.length
        ? '<ul>'+sources.slice(0,4).map(ref=>{
            const title=quote(ref.title || "資料名未記録");
            const link=typeof ref.url==="string" && /^https:\/\//.test(ref.url)
              ? '<a href="'+esc(ref.url)+'" target="_blank" rel="noopener noreferrer">'+title+'</a>':title;
            return '<li>'+link+'<span> / '+quote(ref.kind || "区分未記録")+'</span></li>';
          }).join('')+'</ul>'+(sources.length>4?'<p class="nt">ほか'+(sources.length-4)+'件の参照あり</p>':'')
        : (event ? '<p class="nt">個別の出典参照が台帳にありません。出所を補って断定しません。</p>' : '<p class="nt">旧記録など、現在のイベント台帳に対応する定義がありません。出所を確定できません。</p>');
      const result = row.kind === "choice" && row.details.choice
        ? '<p><strong>本人・養育者の判断：</strong> '+quote(row.details.choice)+'</p>'+
          (row.details.result ? '<p><strong>記録された結果：</strong> '+quote(row.details.result)+'</p>':'')
        : '';
      const relation = prerequisite
        ? '<p class="ui-evidence-relation"><strong>発生条件が参照する先行記録：</strong> テラ暦'+prerequisite.year+'年「'+quote(prerequisite.details?.text)+'」</p>'
        : event?.after ? '<p class="nt">先行条件は指定されていますが、この保存記録から該当する経緯を特定できません。</p>'
          : '<p class="nt">この出来事を必然的に引き起こした原因は、記録から確定できません。</p>';
      return '<li><div class="ui-evidence-entry"><p class="ui-evidence-date">テラ暦'+Number(row.year)+'年・'+Number(row.age)+'歳 / '+(row.kind==="choice"?"選択":"日常")+'</p>'+
        '<p class="ui-evidence-event">'+quote(row.details.text)+'</p>'+result+relation+
        '<details><summary>設定資料と確度 '+esc(conf)+'</summary><p>設定上の根拠区分：'+esc(conf)+'（'+esc(confidence[conf] || "未確認")+'）</p>'+sourceText+'</details>'+
        '<button class="ui-evidence-jump" type="button" data-life-year="'+Number(row.year)+'">同じ年の記録へ移動</button></div></li>';
    }).join('')+'</ol>'+
    (rows.length>shown.length?'<p class="nt">残る記録はJSONエクスポートにも保存されています。ここでは直近40件のみを表示します。</p>':'');
}
function renderLifeEvidencePanel() {
  const panel = document.getElementById("life-evidence");
  const target = document.getElementById("life-evidence-body");
  if (!panel?.open || !target || typeof S === "undefined" || !S) return;
  target.innerHTML = lifeEvidenceMarkup(S);
  target.querySelectorAll(".ui-evidence-jump").forEach(button => {
    const notice = document.createElement("p");
    notice.className = "ui-evidence-nav-status nt";
    notice.setAttribute("role", "status");
    button.after(notice);
    button.addEventListener("click", () => {
      const year = Number(button.dataset.lifeYear);
      const list = document.getElementById("lg");
      const match = [...(list?.querySelectorAll("li") || [])].find(row =>
        Number(row.dataset.lifeYear || lifeLogYear(row)) === year &&
        lifeLogMatchesFilter(row, list.className));
      if (match) {
        match.tabIndex = -1;
        match.focus?.({preventScroll:true});
        // Let CSS (including reduced motion) decide scrolling behavior.
        match.scrollIntoView?.({block:"center"});
        notice.textContent = "テラ暦" + year + "年の記録へ移動しました。";
      } else notice.textContent = "表示中の記録にはこの年がありません。上部の絞り込み条件を確認してください。";
    });
  });
}
