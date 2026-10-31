// Presentation of existing record markup only. Absence of a record is not
// evidence that an event never happened; zero and uncertainty stay visible.
function recordTableMarkup(markup, group = "records", foldRelations = false) {
  const emptyValues = new Set(["記録なし", "まだ記録なし", "まだ記録なし。", "未記録", "追跡記録なし",
    "練習の記録なし", "継続中の所属記録なし", "運営記録なし", "評価の記録なし",
    "個別の親以外の支援記録なし", "個人記録なし", "変更の記録なし", "個人関係の記録なし",
    "本人が知った事件への選択記録はまだありません"]);
  const relationLabels = new Set(["恋愛・縁談", "配偶者", "過去の関係", "子", "友人", "近所の人", "直近の移動"]);
  const empty = [], inactive = [];
  const present = markup.replace(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g, (pair, label, value) => {
    if (emptyValues.has(value.trim())) { empty.push(pair); return ""; }
    if (foldRelations && value.trim() === "なし" && relationLabels.has(label)) { inactive.push(pair); return ""; }
    return pair;
  });
  const disclosure = (rows, key, label) => rows.length
    ? `<details class="ui-empty-records" data-record-group="${esc(group + key)}"><summary>${label}（${rows.length}）</summary><dl>${rows.join("")}</dl></details>` : "";
  return (present ? `<dl>${present}</dl>` : "") +
    disclosure(inactive, "-relations", "その他の関係・経過") + disclosure(empty, "-unrecorded", "未記録の項目");
}
const UI_RECORD_MARKUP = new WeakMap();
function setRecordMarkup(target, markup) {
  if (!target || UI_RECORD_MARKUP.get(target) === markup) return;
  const states = new Map([...(target.querySelectorAll?.("details[data-record-group]") || [])]
    .map(node => [node.dataset.recordGroup, node.open]));
  const active = typeof document !== "undefined" ? document.activeElement : null;
  const focused = active?.tagName === "SUMMARY" && target.contains?.(active)
    ? active.closest?.("details[data-record-group]")?.dataset.recordGroup : null;
  target.innerHTML = markup;
  UI_RECORD_MARKUP.set(target, markup);
  for (const node of target.querySelectorAll?.("details[data-record-group]") || []) {
    if (states.has(node.dataset.recordGroup)) node.open = states.get(node.dataset.recordGroup);
    if (node.dataset.recordGroup === focused) node.querySelector("summary")?.focus({preventScroll:true});
  }
}
function recordLinesMarkup(text, separator = "\n") {
  return '<ul class="ui-record-lines">' + String(text).split(separator).filter(Boolean)
    .map(line => `<li>${esc(line)}</li>`).join("") + '</ul>';
}
function organizeLifeRecordSections() {
  const text = id => document.getElementById(id)?.textContent?.trim() || "";
  const groups = [
    ["family", [
      ["family-disclosure-record", text("close-knowledge") !== "相手を特定した情報のやり取りは、まだ記録されていません。"],
      ["family-people-record", text("facility-people") !== "この生活圏で、名前を知っている施設関係者はまだいません。" ||
        text("facility-people-history") !== "個人との交流履歴はまだありません。" ||
        text("person-tie-summary") !== "まだ個別の関係の記録はありません。"]
    ]],
    ["place", [["place-known-record", text("known") !== "まだ本人が把握した年表事件はありません。事件の発生記録と本人が知る情報は別に管理されます。"]]]
  ];
  for (const [kind, rows] of groups) {
    const home = document.getElementById(kind + "-record-sections"), archive = document.getElementById(kind + "-unrecorded"),
      body = document.getElementById(kind + "-unrecorded-body");
    if (!home || !archive || !body) continue;
    let empty = 0;
    for (const [id, recorded] of rows) {
      const section = document.getElementById(id);
      if (!section) continue;
      if (recorded) { if (section.parentNode !== home) home.insertBefore?.(section, archive); }
      else { empty++; if (section.parentNode !== body) body.append?.(section); }
    }
    archive.hidden = !empty;
    const label = archive.querySelector?.("summary");
    if (label) label.textContent = `未記録の資料（${empty}）`;
  }
}
function lifeRows(s) {
  const known = Object.keys(s.known || {}).filter(k => s.known[k]).length;
  const last = s.moves?.[s.moves.length - 1];
  const recentContact = (s.infoLog || []).slice(-1)[0];
  const infectionWorkplaceRecord = (() => {
    const record = s.infectionWorkplace;
    if (!record)
      return s.fl?.infection_work_disclosed ? "雇用先への診断開示（勤務先の回答履歴なし）" : "記録なし";
    const firstResponse =
        record.firstResponse === "leave-approved-once" ? "初回の休みは承認" : "初回の休みは未決",
      status =
        record.status === "awaiting-review"
          ? `再相談予定 ${record.reviewDueYear}年`
          : record.status === "reviewed"
            ? `${record.reviewedYear}年に再相談・${
                {
                  "leave-approved-again": "休みを再承認",
                  "leave-unresolved": "休みは未決",
                  "hours-approved": "短時間勤務を承認",
                  "hours-declined": "短時間勤務を拒否",
                  "assignment-approved": "負担の大きい工程から配置変更",
                  "assignment-declined": "配置変更は認められず"
                }[record.reviewOutcome] || "回答を記録"
              }`
            : record.status === "left-employment"
              ? `${record.reviewedYear}年に本人が退職`
              : `${record.closedYear}年に${record.reviewOutcome === "occupation-changed" ? "職種" : "勤務先"}が変わり相談終了`;
    return `${record.disclosedYear}年・${J[record.disclosedJobId]?.n || "仕事"}・${firstResponse}・${status}`;
  })();
  const rhodesCareRecord = (() => {
    const record = s.lifeRecord?.affiliations?.find(row => row.id === "rhodes-care");
    if (!record?.history?.length) return null;
    const role =
        record.status === "contacted"
          ? "返答待ち"
          : record.status === "left"
            ? "ロドスとの連絡を終了"
            : record.status === "outside"
              ? record.history.at(-1)?.note || "相談を見送り"
            : ({
                "巡回診療の予約あり":
                  record.lastChangedYear >= s.year ? "巡回相談を予約・次の年次に受診候補" : "巡回診療を予約・受診待ち",
                "巡回受診を延期中": "受診を延期・再調整待ち",
                "巡回診療を受診済み": "診察を受け、療養方針の確認待ち",
                "巡回診療後、療養を選択": s.fl?.tx ? "本人が療養を選び、継続中" : "療養を選択した後に休止",
                "巡回診療後、療養を休止": "本人が療養を一時休止"
              }[record.role] || record.role || "相談経過を記録"),
      last = record.history.at(-1);
    return `${last.year}年・${role}`;
  })();
  const familyCareHistory =
    (s.familyCareHistory || [])
      .slice(-4)
      .reverse()
      .map(
        row =>
          `${row.year}年・${
            {
              started: "支援開始",
              contribution_paused: "本人の療養費分担を中断",
              sibling_contribution: "きょうだいが療養費を支払った",
              sibling_contribution_unavailable: "きょうだいは今年の分担を見送った",
              reviewed: "終了後に再相談",
              capacity_review: "負担方式を見直し",
              capacity_ended: "本人の担当を終了",
              period_ended: "支援期間終了"
            }[row.type] || "ケアの記録"
          }` +
          (`・${row.targetName || "親"}${row.fromPlan ? `・${row.fromPlan}から${row.plan}へ` : ""}${row.contributorSiblingName ? `・${row.contributorSiblingName}` : ""}` +
            `${row.treatmentSupport ? "・療養費支援" : ""}`) +
          `${row.amount ? `・${m(row.amount)}` : ""}${row.treatmentStillActive ? "・親の治療継続状態は別記録" : ""}${row.reason ? `・${row.reason}` : ""}`
      )
      .join(" ／ ") || "記録なし";
  const knownSiblingSupport =
    siblingsOf(s)
      .filter(x => x.knownParentSupportChangeCount > 0)
      .map(
        x =>
          `${x.nm}: ${x.knownParentSupportStatus === "active" ? "親世帯へ定期拠出中" : "定期拠出を終了"}・把握累計 ${m(x.knownParentSupportPaidTotal || 0)}` +
          `（${x.parentSupportKnownYear || "年不明"}年確認）`
      )
      .join(" ／ ") || "まだ聞いていない";
  const siblingContactIntent =
    siblingsOf(s)
      .map(x => {
        const row = x.contactHistory?.at(-1);
        if (!row) return null;
        const actor =
          row.initiatedBy === "sibling" ? x.nm : row.initiatedBy === "protagonist" ? "あなた" : "記録上不明";
        const action =
          row.state === "recontact_invited"
            ? "再接触を望む便りを送った"
            : row.state === "ended"
              ? "連絡を終える意思を示した"
              : row.state === "declined"
                ? "届いた便りへの返事を見送った"
                : row.state === "reopened"
                  ? "返事を受けて連絡を再開した"
                  : "関係を見直した";
        return `${actor}が${row.year}年に${action}`;
      })
      .filter(Boolean)
      .join(" ／ ") || "記録なし";
  const parentLedger = s.house?.parentLedger,
    parentNeed = siblingsOf(s)
      .filter(x => x.parentNeedKnownStatus && x.parentNeedKnownStatus !== "unknown")
      .sort((a, b) => (b.parentNeedKnownYear || 0) - (a.parentNeedKnownYear || 0))[0],
    parentHouseholdNews =
      parentLedger?.status === "tracked"
        ? `${parentLedger.knownRegion || "居住地未確認"}${
            (parentLedger.moveHistory?.length || 0) > (parentLedger.knownMoveCount || 0)
              ? "・転居の知らせはまだ受けていない"
              : ""
          }` +
          `${
            parentNeed
              ? `・家計について${parentNeed.parentNeedKnownStatus === "strained" ? "心配との便り" : "持ち直したとの便り"}（${parentNeed.parentNeedKnownYear || "年不明"}年）`
              : "・家計の詳しい近況は未確認"
          }`
        : parentLedger?.status === "legacy_unknown"
          ? "旧記録のため、家計や居住地の推移は不明"
          : "追跡記録なし";
  const rows = [
    ["出生地", `${s.g?.n || "未記録"}${s.birthLocality?.city ? `・${s.birthLocality.city}` : s.birthLocality ? "・都市名未特定" : "・旧記録では都市名未記録"}`],
    ["居住地", s.residenceBase?.label || `${s.res.n}${s.local.city ? `・${s.local.city}` : ""}／${s.local.kind}`],
    ["生活圏の状況（ゲーム仮定）", localityDisplay(s)],
    [
      "生活圏の支援・確認履歴",
      (s.community?.actions || [])
        .slice(-5)
        .map(a => `${a.year}年・${a.description}`)
        .join(" ／ ") || "まだ記録なし"
    ],
    [
      "現在地での生活費・収入補正（ゲーム仮定）",
      `生活費 ×${localityLivingMultiplier(s).toFixed(2)}／地域就業補正 ×${localityEarningsMultiplier(s).toFixed(2)}` +
        `・現在の仕事場を含む本人の就業補正 ×${personalWorkEarningsMultiplier(s).toFixed(2)}／自発的移住の目安運賃 ×${localityTravelMultiplier(s).toFixed(2)}`
    ],
    [
      "市民資格",
      s.legal?.status === "recorded"
        ? `${s.legal.citizenshipCountry}（出生時記録・ゲーム仮定）`
        : "未確認（出生地だけでは判定しない）"
    ],
    [
      "地域固有の家族手続き",
      (s.legal?.familyProceedings || []).length
        ? s.legal.familyProceedings
            .map(
              x =>
                `${x.year}年・ノタリアルホールへ${x.caseType === "estate_guardianship_inquiry" ? "親権・遺品を照会" : "手続き照会"}（結果未確定）`
            )
            .join("、")
        : "記録なし"
    ],
    [
      "生活環境値（ゲーム仮定）",
      `制度・学習アクセス ${Math.round(s.local.access * 100)} / 危険度 ${Math.round(s.local.hazard * 100)}`
    ],
    ["周辺の地勢", s.local.ecology || "未特定"],
    ["居住都市", s.local.city || "都市名未特定"],
    [
      "追放の履歴",
      s.fl.exiled
        ? `追放元: ${s.exileFrom || "旧記録のため不明"}${s.exileFrom && s.res.n === s.exileFrom ? "（現在は同地域へ帰還）" : ""}`
        : "なし"
    ],
    ["情報網（ゲーム仮定）", `${Math.round(s.local.info * 100)} / 100`],
    [
      "移動",
      `${(s.moves || []).length}回${
        last
          ? `。直近: ${last.year}年 ${last.from}から${last.to}へ、${last.fromHome || "住居種別不明"}から${last.toHome || "住居種別不明"}へ（${last.householdSize || 1}` +
            `人／${last.fareCovered ? "移送側が運賃を負担" : "移動費目安 " + m(last.routeFare || 0)}）`
          : ""
      }`
    ],
    [
      "生業・教育",
      `${occupationLabel(s)}／${EL[eduLv(s)]}${s.fl.sch && !restricted(s) && s.age < P("life.schoolEnrollmentEndAge") ? "（在学中）" : ""}` +
        `${
          s.study
            ? `（${s.study.kind === "uni" ? "大学" : "職業課程"}・${s.study.yearsPaid}/${s.study.duration}年${s.study.suspended ? "・通学中断" : ""}）`
            : ""
        }`
    ],
    [
      "趣味の費用形態履歴",
      (s.hobbyModeHistory || [])
        .slice(-6)
        .map(
          row =>
            `${row.year}年・${
              {
                hobby_music: "音楽",
                hobby_craft: "手仕事",
                hobby_garden: "植物",
                hobby_sport: "運動・武術",
                hobby_collect: "収集",
                hobby_story: "物語・唄・信仰"
              }[row.key] || "趣味"
            }` +
            `・${
              { full: "通常", reduced: "頻度縮小", shared: "共同利用・現金支出なし", paused: "休止" }[
                row.mode
              ] || row.mode
            }`
        )
        .join(" ／ ") || "記録なし"
    ],
    [
      "親族の療養支援",
      s.familyCare
        ? `${s.par?.[s.familyCare.target]?.nm || "親族"}を支援中（${
            s.familyCare.plan === "shared"
              ? "きょうだいと分担"
              : s.familyCare.plan === "network"
                ? "親族・近隣と調整"
                : "自分が中心"
          }` +
          `${s.familyCare.treatmentSupport ? "・本人の療養費分担中" : ""}${
            s.familyCare.siblingContributorId
              ? `・${
                  siblingsOf(s).find(person => person.id === s.familyCare.siblingContributorId)?.nm ||
                  "きょうだい"
                }` + `の実支払累計 ${m(s.familyCare.siblingContributionPaidTotal || 0)}`
              : ""
          }` +
          `）・残り${s.familyCare.yearsRemaining}年`
        : "なし"
    ],
    ["親族ケアの履歴", familyCareHistory],
    ...(rhodesCareRecord ? [["ロドスの診療経路", rhodesCareRecord]] : []),
    ["きょうだいから聞いた親世帯支援", knownSiblingSupport],
    ["きょうだいとの関係意向", siblingContactIntent],
    [
      "離婚後の養育連絡意向",
      (s.relationshipHistory || [])
        .filter(
          person => person.ending === "離婚" && person.parentingPlan && person.parentingPlan !== "completed"
        )
        .map(
          person =>
            `${person.nm || "以前の配偶者"}・${
              {
                unreviewed: "相談前",
                coordinate: "直接提案",
                mediated: "仲介を希望",
                low_contact: "当面連絡を控える"
              }[person.parentingPlan] || "記録あり"
            }` +
            `${person.parentingReviewPending ? "・相談時期" : ""}${Number.isFinite(person.parentingReviewYear) ? `・次回目安 ${person.parentingReviewYear}年` : ""}`
        )
        .join(" ／ ") || "記録なし"
    ],
    [
      "きょうだいとの親世帯支援相談",
      s.siblingParentSupportConference
        ? (s.siblingParentSupportConference.status === "scheduled"
            ? `${s.siblingParentSupportConference.dueYear}年に相談予定`
            : s.siblingParentSupportConference.status === "completed"
              ? `${s.siblingParentSupportConference.heldYear}年に本人が選んだ対応・${s.siblingParentSupportConference.outcome}`
              : "相談中止") +
          `（${(s.siblingParentSupportConference.participantIds || []).length}人へ声をかけた）`
        : "記録なし"
    ],
    ["親世帯の近況", parentHouseholdNews],
    [
      "実家への一時送金",
      (s.house?.parentLedger?.parentGiftHistory || []).length
        ? s.house.parentLedger.parentGiftHistory
            .map(
              row => `${row.year}年 ${m(row.amount)}（負債 ${m(row.debtPaid)}返済・現金 ${m(row.cashAdded)}）`
            )
            .join(" ／ ")
        : "なし"
    ],
    [
      "避難後の生活再建",
      s.displacement
        ? ({
            shelter: "避難・仮住まい中",
            housed: "親類・知人宅を頼って再建",
            rebuilt: "避難後の暮らしを再建"
          }[s.displacement.status] || "記録あり") +
          (s.displacement.resolvedYear ? `（${s.displacement.resolvedYear}年）` : "")
        : "なし"
    ],
    ["現在の勤め先の賃金改善", `基準給金へ +${Math.round((s.workPayBonus || 0) * 100)}%`],
    [
      "勤務先との契約",
      s.workContract
        ? `${s.workContract.startYear}年から勤務。契約の条件確認：${s.workContract.knownConditions === "reviewed" ? "実施" : "未実施"}` +
          `。給金交渉分 +${Math.round(s.workContract.wagePremium * 100)}%` +
          `${s.workContract.assignment === "adjusted" ? "。担当工程を変更" : ""}`
        : "現在は個別の勤務契約を記録していません"
    ],
    ...(s.infectionWorkplace || s.fl?.infection_work_disclosed
      ? [["鉱石病を伝えた勤務先との経過", infectionWorkplaceRecord]]
      : []),
    ["異なる出自をめぐる生活上の経験", `${(s.intergroupHistory || []).length}件の記録`],
    [
      "現在の勤め先で受けている不利益",
      s.age >= P("life.workStartAge") && s.job > 0 && employmentDiscriminationPenalty(s) > 0
        ? `実際の勤務先で記録した不利益による年収補正 −${Math.round(employmentDiscriminationPenalty(s) * 100)}%（ゲーム仮定）`
        : "現在の勤務先についての補正なし（過去の経験は履歴に保持）"
    ],
    [
      "差別経験による信用目標の補正",
      equityCreditPenalty(s) > 0
        ? `確認された扱いに基づく単一補正 −${Math.round(equityCreditPenalty(s) * 10) / 10}点（最大値を採用）`
        : "補正なし"
    ],
    [
      "差別・排斥に伴う不利益の記録",
      (() => {
        const e = reconcileEquity(s).episodes;
        return e.length
          ? `${e.length}件（現在の条件に作用 ${e.filter(x => x.status === "active").length}件、解消・期間終了 ${e.filter(x => x.status === "ended").length}` +
              `件、就業先不明 ${e.filter(x => x.status === "observed-only").length}件）`
          : `過去の具体的な被害記録は未登録（旧セーブの経験フラグを自動推定しない）`;
      })()
    ],
    [
      "養育・ケア",
      `${s.care?.kind || "未記録"}／支援 ${s.care ? Math.round(s.care.support * 100) : "?"}・安定 ${s.care ? Math.round(s.care.stability * 100) : "?"}`
    ],
    [
      "養育期の担い手",
      s.care?.supportNetwork
        ? (s.care.supportNetwork.members || [])
            .map(
              person =>
                `${person.nm}（${Math.max(0, s.year - person.by)}歳・${J[person.j]?.n || "生業不明"}・${person.roles.join("／")}・${
                  person.knownLifeStatus === "missing"
                    ? `最後に聞いた居住地 ${person.knownMissingLastRegion || person.knownRegion || "未確認"}`
                    : person.knownRegion
                      ? `聞いた居住地 ${person.knownRegion}`
                      : "居住地は未確認"
                }` +
                `・${
                  person.knownLifeStatus === "dead"
                    ? `訃報を受けた ${person.deathYear}年`
                    : person.knownLifeStatus === "missing"
                      ? `消息不明の知らせを ${person.knownLifeStatusYear}年に受けた`
                      : person.knownLifeStatus === "alive"
                        ? `最終安否確認 ${person.knownLifeStatusYear}年に存命`
                        : "安否記録なし"
                }` +
                (`／${
                  person.careStatus === "former"
                    ? "役割終了 " + person.careStatusKnownYear + "年・以降の安否未追跡"
                    : "役割継続"
                }` +
                  `）`)
            )
            .join("、") || "旧記録では個人別の記録なし"
        : "個人記録なし"
    ],
    ["感染と治療", s.fl?.dg ? `鉱石病の診断記録あり${s.fl.tx ? "・治療中" : "・治療継続の記録なし"}` : "診断記録なし"],
    [
      "診療への到達しやすさ",
      `${Math.round(infectionCareAccess(s) * 100)} / 100（地勢・居住地に基づく通院負担。差別圧力とは別指標）`
    ],
    ["世界の事件記録", `本人が把握した出来事 ${known}件`],
    [
      "情報接触の記録",
      `${(s.infoLog || []).length}件${recentContact ? `。直近: ${recentContact.heardYear}年・${recentContact.route}` : ""}`
    ],
    [
      "年表情報への応答",
      (s.informationResponses || [])
        .slice(-5)
        .map(
          row =>
            `${row.year}年・${row.factId}に${
              {
                "household-preparation": "家計と家族連絡の確認",
                "look-up-relief": "地域の相談・配給予定の確認",
                "withhold-unverified-report": "未確認の話を広めず仕事を継続"
              }[row.response] || "応答"
            }` +
            `（${row.route || "伝達経路未記録"}から${row.heardYear ? `${row.heardYear}年に受領` : `受領年不明`}）`
        )
        .join(" ／ ") || "本人が知った事件への選択記録はまだありません"
    ],
    
  ];
  const playerKnownRows = new Set([
    "出生地", "居住地", "生活圏の状況（ゲーム仮定）", "生活圏の支援・確認履歴",
    "市民資格", "地域固有の家族手続き", "追放の履歴", "移動", "生業・教育",
    "趣味の費用形態履歴", "親族の療養支援", "親族ケアの履歴", "ロドスの診療経路",
    "きょうだいから聞いた親世帯支援", "きょうだいとの関係意向", "離婚後の養育連絡意向",
    "きょうだいとの親世帯支援相談", "親世帯の近況", "実家への一時送金", "避難後の生活再建",
    "現在の勤め先の賃金改善", "勤務先との契約", "鉱石病を伝えた勤務先との経過",
    "異なる出自をめぐる生活上の経験", "現在の勤め先で受けている不利益",
    "差別経験による信用目標の補正", "差別・排斥に伴う不利益の記録", "養育期の担い手",
    "感染と治療", "診療への到達しやすさ", "世界の事件記録", "情報接触の記録", "年表情報への応答"
  ]);
  return rows.filter(([label]) => playerKnownRows.has(label));
}
const careEngagementMarkup = s => {
  const rows =
    (s.careInclinationHistory || [])
      .slice(-4)
      .reverse()
      .map(row => `${row.year}年「${esc(row.choice)}」 ${row.before.toFixed(0)}→${row.after.toFixed(0)}`)
      .join(" ／ ") || "具体的なケア分担経験はまだ記録されていない。辞退理由や家族への思いは推定しない。";
  return `<dt>家族ケアへの関与傾向</dt><dd>${Math.round(s.careInclination ?? 50)}/100（初期値50は中立のゲーム仮定。実際に引き受けた支援経験で更新。ケアの辞退や制約から気持ちを推定しない）<br>${rows}</dd>`;
};
function basisMarkup() {
  const params = SIM_PARAMS.map(x => {
    const value =
      x.valueType === "table"
        ? x.value
            .map(
              v =>
                `${v.n} (${Object.entries(v)
                  .filter(([, n]) => typeof n === "number")
                  .map(([k, n]) => `${k}=${n}`)
                  .join(", ")}` + `)`
            )
            .join(" / ")
        : x.valueType === "thresholds"
          ? x.value.map((n, i) => `${EL[i] || `段階${i}`}: ${n}`).join(" / ")
          : Array.isArray(x.value)
            ? x.value.join("–")
            : x.value;
    const refs = (x.references || [])
      .map(id => SETTING_SOURCES[id])
      .filter(Boolean)
      .map(s => `${s.title} p.${s.pages}（${s.kind}）`)
      .join("、");
    return (
      `<div class="basis-item"><b>${esc(x.label)}</b>: ${esc(value)} ${esc(x.unit)} <small>${esc(x.status)}・${esc(x.scope)}` +
      `・${esc(x.description)} 出所区分: ${esc(x.source)}。${refs ? `参考資料: ${esc(refs)}。` : ""}</small></div>`
    );
  }).join("");
  const sources = Object.values(SETTING_SOURCES)
    .map(
      s =>
        `<div class="basis-item"><b>${esc(s.title)}</b><small>${esc(s.file || s.url || "資料記載なし")} p.${esc(s.pages)}・${esc(s.kind)}` +
        `。${esc(s.note)}</small></div>`
    )
    .join("");
  const tables = Object.entries(DATASET_META)
    .map(
      ([name, meta]) =>
        `<div class="basis-item"><b>${esc(name)}</b><small>${esc(meta.source)}。${Object.entries(meta.fields)
          .map(([k, v]) => `${esc(k)}=${esc(v[0])}（${esc(v[1])}）`)
          .join("、")}` + `</small></div>`
    )
    .join("");
  const socialPressure = Object.entries(SIM_TABLES.oripathyPressure)
    .filter(([region]) => region !== "default")
    .map(
      ([region, p]) =>
        `<div class="basis-item"><b>${esc(region)}</b><small>世間=${p.public}・雇用=${p.work}・住居=${p.housing}・医療差別圧力=${p.medical}` +
        `・隠蔽圧力=${p.disclosure}</small></div>`
    )
    .join("");
  const effects = Object.entries(EVENT_FIELD_META)
    .map(
      ([k, v]) =>
        `${esc(k)}: ${esc(v.status)}・${esc(v.valueType || "未登録")}・${esc(v.meaning)}（${esc(v.unit)}）`
    )
    .join(" / ");
  const flags = Object.entries(FLAG_REGISTRY)
    .map(
      ([id, f]) =>
        `<div class="basis-item"><b>${esc(f.label)}</b> <code>${esc(id)}</code><small>${esc(f.type)}・${esc(f.valueDomain)}` +
        `。${esc(f.description)} 状況タグ別名: ${esc((f.tags || []).join("、") || "なし")}` +
        (` 寿命: ${esc(f.lifecycle)} 生成: ${esc((f.producers || []).join("、") || "未登録")} イベント解除: ${esc((f.clearers || []).join("、") || "なし")}` +
          ` エンジン解除: ${esc((f.engineClearers || []).join("、") || "なし")}`) +
        ` 参照: ${esc((f.consumers || []).join("、") || "なし")}</small></div>`
    )
    .join("");
  return (
    params +
    `<h4>設定資料の参照台帳</h4>` +
    sources +
    `<h4>イベント・状態フラグ台帳</h4>` +
    flags +
    `<h4>出生・地域・種族などのデータ表</h4>` +
    tables +
    `<h4>鉱石病への地域別社会圧力（ゲーム用仮定）</h4>` +
    socialPressure +
    (`<p class="nt">${esc(DATA_GUIDE.modelPolicy.oripathyPressure)}` +
      ` 個人の「診療への到達しやすさ」は居住地のアクセス値などから別に算出し、差別圧力と混同しません。</p><h4>イベント効果の型・単位</h4><p class="nt">${effects}</p>` +
      `<p class="nt">${esc(DATA_GUIDE.modelPolicy.eventEffects)}` +
      ` ${esc(DATA_GUIDE.confidenceNote)} 設定資料はユーザー提供の整理資料を参照し、公式一次資料そのものとは区別します。</p>`)
  );
}
