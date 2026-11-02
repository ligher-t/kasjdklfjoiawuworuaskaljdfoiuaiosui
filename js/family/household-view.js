function pickStarterJob(s) {
  const region = s.res?.n,
    lowAccess = s.local?.access < P("birth.lowAccessThreshold");
  const byRegion = {
    "ウルサス": [1, 2, 3, 14, 17, 22, 23],
    "レム・ビリトン": [1, 2, 3, 16, 18, 19, 23, 27],
    "ラテラーノ": [1, 2, 5, 9, 15, 17, 21, 22],
    "カズデル": [1, 4, 16, 22, 23, 26, 27],
    "イェラグ": [1, 5, 16, 17, 22, 23, 26],
    "シラクーザ": [1, 5, 15, 16, 17, 22, 24, 25],
    "クルビア": [1, 2, 5, 7, 16, 17, 18, 19, 21, 24],
    "龍門": [1, 2, 5, 15, 16, 17, 18, 21, 24],
    "炎国": [1, 5, 9, 16, 17, 19, 22, 23, 24],
    "ヴィクトリア": [1, 2, 5, 6, 14, 16, 17, 18, 19, 22],
    "リターニア": [1, 5, 9, 11, 12, 13, 17, 22],
    "カジミエーシュ": [1, 2, 5, 10, 16, 17, 22, 24],
    "サルゴン": [1, 4, 5, 16, 22, 23, 24, 26, 27],
    "ボリバル": [1, 2, 4, 5, 14, 16, 17, 23, 24],
    "極東": [1, 5, 9, 16, 17, 19, 22, 23],
    "シエスタ": [1, 5, 16, 17, 22, 23, 24],
    "ミノス": [1, 5, 10, 17, 19, 22, 23],
    "サーミ": [1, 4, 16, 22, 23, 26],
    "ヒガシ": [1, 5, 9, 16, 17, 19, 22, 23]
  };
  const ids = [...(byRegion[region] || [1, 2, 5, 16, 17, 22, 23, 24])];
  // Learning can lead to a chance to apply, but points alone are not a diploma.
  // J[8] combines physicians and researchers; do not assign it by a generic draw.
  if (s.k >= 20 || educationCredential(s, "vocational") || educationCredential(s, "university"))
    ids.push(6, 7, 11, 12, 20, 21);
  if (s.socialClass?.originGroup === "landed" && s.k >= 24) ids.push(5, 14);
  const roles = {
    6: "administrator",
    7: "technical",
    8: "clinical",
    9: "clergy",
    11: "arts-technician",
    12: "teacher",
    20: "medical-assistant",
    21: "office-assistant"
  };
  const candidates = [...new Set(ids)]
    .filter(id => id !== 8 && careerOpeningAssessment(s, { role: roles[id] || "general", automatic: true }).canBeAssigned)
    .map(id => ({
      id,
      // Low access reduces opportunities, not a person's ability or every job's legality.
      w: (id === 1 ? 3 : 1) * (lowAccess && [6, 7, 11, 12, 20, 21].includes(id) ? 0.45 : 1)
    }));
  // This broad livelihood path prevents a false specialist assignment or empty draw.
  if (!candidates.length) candidates.push({ id: 1, w: 1 });
  return wp(candidates).id;
}
const newHouseholdSetupCost = s => m(120000 * (s.res?.pm || 1) * (s.priceIndex || 1));
const newHouseholdKinSetupCost = s => m(40000 * (s.res?.pm || 1) * (s.priceIndex || 1));
const hobbyExamples = s => {
  const byRegion = {
    "ウルサス": "木彫りや冬物の手入れ、街区の歌会",
    "レム・ビリトン": "鉱石標本の整理や道具の手入れ、採掘跡地の菜園",
    "ラテラーノ": "合唱や印刷物の収集、近所の共同炊事",
    "カズデル": "旅先の話を書き留めることや、衣類と装備の繕い",
    "イェラグ": "編み物や山道の草木の記録、冬越しの保存食づくり",
    "シラクーザ": "広場の踊りや歌、露店の品を集めること",
    "クルビア": "ラジオの修理や野球めいた球技、機械部品の収集",
    "龍門": "市場の食べ歩きや路地の園芸、芝居の見物",
    "炎国": "茶葉の飲み比べや筆写、近所の武術稽古",
    "ヴィクトリア": "読書会や合唱、古い機械の手入れ",
    "リターニア": "楽器の稽古や小劇場の手伝い、楽譜の収集",
    "カジミエーシュ": "競技の観戦や木剣の稽古、行商の品を集めること",
    "サルゴン": "革細工や水場の世話、季節の草木を記録すること",
    "ボリバル": "港の踊りや釣り、祭りの飾りづくり",
    "極東": "網や道具の補修、書や季節の草花を楽しむこと",
    "シエスタ": "海辺の遊泳や貝殻集め、演奏会の手伝い",
    "ミノス": "鍛冶の見学や身体を動かす稽古、競技の観戦",
    "サーミ": "木や骨の細工、足跡と天候の記録",
    "ヒガシ": "書や庭の手入れ、祭礼の準備"
  };
  let text = byRegion[s.res?.n] || "近所の読み聞かせや手仕事、屋外の遊び";
  if (s.r?.n === "サルカズ") text += "。サルカズの知人がいれば、旅の話や家ごとに伝わる手仕事を習うこともある";
  else if (s.r?.n === "サンクタ") text += "。同じ地域に礼拝堂や合唱の集まりがあれば、そこへ顔を出す人もいる";
  else if (s.r?.n === "コータス") text += "。共同菜園や野外の集まりに参加する機会もある";
  return text;
};

function currentHouseholdMembers(s) {
  const arrangement = s.residenceArrangement || "family_home_shared_budget",
    // Household members are other people sharing the home; the protagonist
    // is described separately in the profile and must not appear here.
    members = [],
    familyHome = arrangement.startsWith("family_home_");
  if (familyHome) {
    const caregiverKeys = s.care?.parentKeys;
    for (const key of ["fa", "mo"]) {
      const parent = s.par?.[key];
      if (parent && !parent.d && !parent.separated &&
          (!Array.isArray(caregiverKeys) || caregiverKeys.includes(key)))
        members.push(parent.nm || "親");
    }
    for (const sibling of siblingsOf(s))
      if (!sibling.d && !sibling.independentSinceYear) members.push(sibling.nm);
  }
  if (arrangement === "partner_shared" && s.romance?.stage === "cohabiting")
    members.push(s.romance.name || s.romance.nm || "同居する恋人");
  if (arrangement === "spouse_parent_home") members.push("配偶者の親族（個別記録なし）");
  if (s.sp && !s.sp.d && (arrangement.startsWith("spouse_") || spouseLivesWithProtagonist(s)))
    members.push(s.sp.nm || "配偶者");
  for (const child of s.kids || [])
    if (!child.d && child.householdStatus !== "independent" && child.householdResidencePlan !== "former")
      members.push(child.nm || "子");
  return members.length ? [...new Set(members)].join("、") : "なし";
}
const fam = s => {
  const knowsParentInfection = x => !!x?.infectionKnown || !!(x?.d && x?.inf),
    knowsDeath = x =>
      !!x?.d &&
      !x.deathNoticePending &&
      Number.isFinite(x.deathKnownYear) &&
      x.deathKnownYear <= s.year,
    p = x => {
      const tracked =
          s.house?.parentLedger?.status === "tracked" &&
          (s.house.parentLedger.caregiverIds || []).includes(x.id),
        jobId = tracked && Number.isInteger(x.knownJobId) ? x.knownJobId : x.j || 0;
      return `${x.r?.n || "不明"}・${J[jobId]?.n || "不明"}${x.inf && knowsParentInfection(x) ? "・感染者" : ""}${
        knowsDeath(x)
          ? "・" +
            x.d +
            "年没" +
            (x.deathKnownYear > x.d ? "・知らせ" + x.deathKnownYear + "年" : "")
          : ""
      }`;
    };
  const last = s.moves?.[s.moves.length - 1];
  const parent = (key, x) =>
    `${x.nm || "名前未記録"}（${
      Number.isFinite(x.by)
        ? `${Math.max(0, s.year - x.by)}歳・${
            knowsDeath(x) ? "死亡" : x.d ? "安否未確認" : x.lifeStage || STG[stg({ age: Math.max(0, s.year - x.by), r: x.r || s.r })]
          }`
        : "年齢未記録"
    }` +
    `）・${p(x)}${
      s.house?.parentLedger?.status === "tracked" &&
      (s.house.parentLedger.caregiverIds || []).includes(x.id) &&
      (x.jobHistory?.length || 0) > (x.knownJobChangeCount || 0)
        ? "・仕事の変化はまだ未確認"
        : ""
    }` +
    `${
      !x.d
        ? `・体調 ${Math.round(x.health ?? 0)}/100・就労可能度 ${Math.round((x.workShare ?? 1) * 100)}%${s.parentUnemploymentTargetKey === key ? "・失職中" : ""}` +
          `${x.inf && knowsParentInfection(x) ? `・鉱石病${x.tx ? "・家計で療養中" : "・継続療養なし"}` : ""}`
        : ""
    }` +
    (`${
      knowsParentInfection(x) && x.treatmentHistory?.length
        ? `・直近の療養判断 ${x.treatmentHistory.at(-1).year}年「${x.treatmentHistory.at(-1).cause}」`
        : ""
    }` +
      `${x.legacyRepair?.length ? "・旧記録補完" : ""}`) +
    (s.care?.parentKeys && !s.care.parentKeys.includes(key) ? "・主な養育者ではない" : "");
  const siblingVisitDetails = x => {
    const history = Array.isArray(x.visitHistory) ? x.visitHistory : [];
    if (!history.length) return "";
    const shown = history.slice(-5),
      older = history.length - shown.length;
    return (
      `<details class="family-visit-history"><summary>訪問履歴 ${history.length}回</summary><p>記録上の累計費用 ${m(x.visitTotal || 0)}` +
      `${older ? `・それ以前の記録 ${older}回` : ""}</p><ol>${shown
        .map(
          visit =>
            `<li>${visit.year}年 ${esc(visit.from)} → ${esc(visit.to)}・${m(visit.fare)}（${visit.paidBy === "household" ? "共有家計" : "本人家計"}）</li>`
        )
        .join("")}` +
      `</ol></details>`
    );
  };
  const siblingBereavementDetails = x => {
    const finance = x.postDeathFamilyFinance;
    if (
      !finance ||
      !x.d ||
      x.deathNoticePending ||
      !Number.isFinite(x.deathKnownYear) ||
      x.deathKnownYear > s.year
    ) return "";
    const transfers = x.bereavementSupportHistory || [];
    return (
      `<small class="family-note">遺された家族の家計は${finance.deathYear}年以降未追跡（最終確認 ${finance.lastKnownYear ?? "不明"}年）${
        transfers.length
          ? `・葬送後の一時支援 ${transfers
              .map(
                row =>
                  `${row.year}年 ${m(row.amount)}${
                    row.recipientIds?.length
                      ? `／記録された受取人 ${row.recipientIds.length}人`
                      : "／受取人は個別記録なし"
                  }`
              )
              .join("、")}`
          : ""
      }` + `</small>`
    );
  };
  const sibs = siblingsOf(s),
    sibText = sibs.length
      ? sibs
          .map(
            x =>
              `${x.nm}(${x.r.n}・${Math.max(0, s.year - x.by)}歳・${
                x.d
                  ? x.deathNoticePending || !Number.isFinite(x.deathKnownYear) || x.deathKnownYear > s.year
                    ? "安否未確認"
                    : "死亡"
                  : x.lifeStage || STG[stg({ age: Math.max(0, s.year - x.by), r: x.r })]
              }` +
              `・${siblingOccupationLabel(x)}${
                x.d
                  ? x.deathNoticePending || !Number.isFinite(x.deathKnownYear) || x.deathKnownYear > s.year
                    ? "・安否未確認"
                    : "・" + x.d + "年没" + (x.deathKnownYear > x.d ? "・知らせ" + x.deathKnownYear + "年" : "")
                  : x.inf && x.infKnown
                    ? x.tx === 1
                      ? "・鉱石病・家族が継続通院を支援中"
                      : x.tx === 0
                        ? "・鉱石病・家族負担の継続費なし"
                        : "・鉱石病・継続支援は未記録"
                    : x.inf
                      ? "・健康情報未確認"
                      : x.exposurePending
                        ? "・曝露後の検査待ち"
                        : x.exposureClosedYear
                          ? "・曝露後未診断・再診保留"
                          : "・存命"
              }` +
              (x.exposureEmployerResponse === "partial-cost"
                ? "・勤務先は前回の検査費を一部負担"
                : x.exposureEmployerResponse === "denied"
                  ? "・勤務先は曝露報告を否認"
                  : "") +
              (`${
                x.independentSinceYear
                  ? `・別居${x.independentSinceYear}年〜・${x.knownRegion || "居住地未確認"}（${x.regionKnownYear || "年不明"}年確認）`
                  : ""
              }` +
                `${
                  x.independenceOpeningReserve > 0
                    ? `・独立時の準備金 ${m(x.independenceOpeningReserve)}（${x.independenceOpeningReserveYear || "年不明"}年）`
                    : ""
                }`) +
              (`${
                Number.isFinite(x.knownHealth)
                  ? `・本人が把握する体調 ${Math.round(x.knownHealth)}/100（${x.healthKnownYear || "年不明"}年確認）`
                  : ""
              }` +
                `${
                  x.independentSinceYear && x.knownFinancialStatus
                    ? `・本人が把握する家計 ${x.knownFinancialStatus === "strained" ? "逼迫" : "持ちこたえている"}（${x.financialKnownYear || "年不明"}年確認）`
                    : ""
                }`) +
              (`${
                x.knownFamilyYear
                  ? `・本人が把握する家族 ${x.knownFamilyPartner ? "同居相手あり" : "単身"}・子${x.knownFamilyChildren || 0}人（${x.knownFamilyYear}年確認）`
                  : ""
              }` +
                `${
                  x.visitCount
                    ? `・訪問${x.visitCount}回・累計費用${m(x.visitTotal || 0)}${
                        x.visitHistory?.length
                          ? `・最終訪問 ${x.visitHistory.at(-1).year}年 ${x.visitHistory.at(-1).from} → ${x.visitHistory.at(-1).to}・${m(x.visitHistory.at(-1).fare)}` +
                            `（${x.visitHistory.at(-1).paidBy === "household" ? "共有家計" : "本人家計"}）`
                          : ""
                      }`
                    : ""
                }`) +
              (`${
                Number.isFinite(x.lastHealthAidYear)
                  ? `・診療・移動の一時援助 ${x.lastHealthAidYear}年・${m(x.lastHealthAidAmount || 0)}`
                  : ""
              }` +
                `${
                  x.contactState
                    ? `・${
                        x.contactState === "paused"
                          ? "連絡を待っている"
                          : x.contactState === "ended"
                            ? "連絡を絶っている"
                            : x.contactReopenedYear
                              ? `連絡を再開・${x.contactReopenedYear}年`
                              : "連絡を続けている"
                      }` + `${x.lastContactYear ? `・最終連絡${x.lastContactYear}年` : ""}`
                    : ""
                }`) +
              (`${
                Number.isFinite(x.lastAidYear)
                  ? `・一時援助${x.lastAidYear}年・${m(x.lastAidAmount || 0)}`
                  : ""
              }` +
                `${
                  x.careSupportAnnual > 0
                    ? `・療養支援中・年額${m(x.careSupportAnnual)}（${x.careSupportStartedYear || "年不明"}年〜）`
                    : x.careSupportEndedYear
                      ? `・療養支援終了${x.careSupportEndedYear}年`
                      : ""
                }`) +
              `${x.aidReceivedTotal > 0 ? `・支援受領累計${m(x.aidReceivedTotal)}` : ""}${x.legacyRepair?.length ? "・旧記録補完" : ""}${
                Number.isFinite(x.infectionDiscussedYear)
                  ? `・感染の家族相談${x.infectionDiscussedYear}年`
                  : ""
              }` +
              `)${siblingVisitDetails(x)}${siblingBereavementDetails(x)}`
          )
          .join("、") +
        (s.legacySiblingCount ? `、旧記録の人数のみ ${s.legacySiblingCount}人（個別情報未記録）` : "")
      : s.legacySiblingCount
        ? `${s.legacySiblingCount}人・旧記録の人数のみ（個別情報未記録）`
        : `${siblingCount(s)}人・個別記録なし`,
    pastRelationships = (s.relationshipHistory || [])
      .slice(-4)
      .map(
        x =>
          `${x.name || x.nm || "相手"}と${x.ending || "関係終了"}（${x.endedYear || "年不明"}年${
            x.deathYear && !x.deathNoticePending && Number.isFinite(x.deathKnownYear) && x.deathKnownYear <= s.year
              ? `・${x.deathYear}年没${
                  x.deathKnownYear > x.deathYear ? `・訃報${x.deathKnownYear}年` : ""
                }${x.deathCause ? `・${x.deathCause}` : ""}`
              : ""
          }` + `${x.legacyRepair?.length ? "・旧記録補完" : ""}）`
      )
      .join("、");
  const op = infectionSocialPressure(s),
    rom = s.romance?.stage
      ? `${s.romance.name}（${
          s.romance.stage === "known"
            ? "知り合い"
            : s.romance.stage === "dating"
              ? "交際中"
              : s.romance.stage === "committed"
                ? "結婚を考えている"
                : s.romance.stage === "cohabiting"
                  ? "婚姻せず同居"
                  : "縁談"
        }` + `・${s.romance.metYear}年から）`
      : "なし",
    familyCare = s.familyCare
      ? `${s.par?.[s.familyCare.target]?.nm || "親族"}を支援中（あと${s.familyCare.yearsRemaining}年）`
      : "なし",
    displacement = s.displacement
      ? ({ shelter: "避難・仮住まい中", housed: "親類・知人宅を頼って再建", rebuilt: "避難後の暮らしを再建" }[
          s.displacement.status
        ] || "記録あり") + (s.displacement.resolvedYear ? `・${s.displacement.resolvedYear}年` : "")
      : "なし";
  const contact = (x, kind) => {
    if (!x) return "なし";
    const deathKnown = x.knownLifeStatus === "dead",
      lifeUnconfirmed =
        !deathKnown && (x.lifeStatus === "dead" || x.lifeStatus === "missing" || x.status === "deceased"),
      status = deathKnown
        ? "死亡"
        : x.knownLifeStatus === "missing"
          ? "消息不明"
          : lifeUnconfirmed
            ? "安否未確認"
            : x.status === "missing" && x.lifeStatus === "alive"
              ? "生存確認・居場所未確認"
              : {
                  "新しい隣人": "越してきたばかり",
                  "知人": "知り合い",
                  acquaintance: "挨拶を交わす",
                  familiar: "顔なじみ",
                  moved: "転居で離れた",
                  deceased: "安否未確認",
                  loan_outstanding: "貸した金の返済待ち",
                  reconciled: "貸し借りを整理",
                  severed: "疎遠"
                }[x.status] ||
                x.status ||
                "関係あり",
      loan = x.loanAmount ? `・未返済 ${m(x.loanAmount)}` : "",
      ageYear = deathKnown ? (x.deathYear ?? s.year) : s.year,
      known =
        x.knownLifeStatus === "missing"
          ? `・${x.knownMissingSinceYear || "年不明"}年ごろから消息不明（最後に聞いた地域 ${x.knownMissingLastRegion || "未確認"}）`
          : x.knownLifeStatus === "alive" && x.knownLifeHistory?.some(row => row.foundYear)
            ? `・${x.knownLifeHistory.at(-1).foundYear}年に生存確認、居場所は未確認`
            : "",
      recontact =
        x.knownRecontactStatus === "requested"
          ? "・返事待ち"
          : x.knownRecontactStatus === "reconnected"
            ? "・便りの往復を再開"
            : x.knownRecontactStatus === "closed"
              ? "・便りの往復を終了"
              : "";
    return (
      `${x.nm}（${x.r?.n || "不明"}・${Math.max(0, ageYear - (x.by ?? x.metYear ?? s.year))}歳・${x.knownLifeStatus === "missing" ? "消息不明" : status}` +
      `${loan}${known}${recontact}${
        deathKnown
          ? `・${x.deathYear || ""}年没${x.deathKnownYear ? `・訃報${x.deathKnownYear}年` : ""}${x.deathCause ? `・${x.deathCause}` : ""}`
          : ""
      }` +
      `）`
    );
  };
  const attitudeHistory =
    (s.attitudeHistory || [])
      .slice(-4)
      .map(
        x =>
          `${x.year}年・${x.age}歳 ${x.attitude === "infected" ? "感染者への見方" : "サルカズへの見方"} ${x.before.toFixed(1)}→${x.after.toFixed(1)}` +
          `（${esc(x.choice || "経験")}` +
          `${
            x.effectiveDelta !== x.inputDelta
              ? `・変化 ${x.effectiveDelta > 0 ? "+" : ""}${x.effectiveDelta.toFixed(1)}（元の作用 ${x.inputDelta > 0 ? "+" : ""}${x.inputDelta.toFixed(1)}）`
              : ""
          }` +
          `）`
      )
      .join("<br>") || "まだ記録なし";
  const supportNetwork = s.care?.supportNetwork,
    lastKnownNetworkMove = supportNetwork?.knownMoveHistory?.at(-1),
    networkText = supportNetwork
      ? `${supportNetwork.label}（養育期の役割: ${(supportNetwork.roles || []).join("・")}）・家計支援: ${
          supportNetwork.fundingStatus === "ended"
            ? `終了 ${supportNetwork.fundingEndedYear || "年不明"}年`
            : "記録上継続"
        }` +
        `・連絡: ${
          {
            within_care: "養育期間中",
            active: "続いている",
            distant: "間を置いている",
            ended: "終了",
            unrecorded: "未確認"
          }[supportNetwork.contactState] || "未確認"
        }` +
        (`${
          supportNetwork.knownRegion
            ? `・居住地 ${supportNetwork.knownRegion}（${supportNetwork.moveKnownYear || "確認年不明"}年に確認）`
            : "・居住地 未確認"
        }` +
          `${
            lastKnownNetworkMove
              ? `・転居の知らせ ${lastKnownNetworkMove.heardYear}年に確認（${lastKnownNetworkMove.from} → ${lastKnownNetworkMove.to}）`
              : ""
          }`) +
        `${supportNetwork.lastContactYear ? `・最終連絡 ${supportNetwork.lastContactYear}年` : ""}・法的後見の扱い: ${
          supportNetwork.formalGuardianship === "unconfirmed"
            ? "未確認"
            : supportNetwork.formalGuardianship === "yes"
              ? "記録あり"
              : "記録なし"
        }` +
        `${
          supportNetwork.contributionHistory?.length
            ? `・家計が受けた直近の支援 ${supportNetwork.contributionHistory.at(-1).year}年 ${m(supportNetwork.contributionHistory.at(-1).amount)}`
            : ""
        }`
      : "個別の親以外の支援記録なし";
  const householdTiming = s.fl?.household_separated
    ? "本人の収支は別管理。親世帯との同居は住居欄に表示"
    : s.age >= householdEndAge(s)
      ? "家計分離の年齢目安は経過。実際の同居・家計は本人と家族が決める"
      : `${householdEndAge(s) - s.age}年後が独立相談の目安（自動的に家を出るわけではない）`;
  return [
    ["養育環境", s.care?.kind || "未記録"],
    ["一緒に暮らす人", currentHouseholdMembers(s)],
    [
      "住まい・家計の形",
      {
        family_home_shared_budget: "家族と同じ住居・共有家計",
        family_home_separate_budget: "家族と同じ住居・本人の収支を別管理",
        independent_rental: "別の賃貸住居で独立",
        independent_owned: "自己所有の住居で独立",
        spouse_shared: "配偶者と同居",
        partner_shared: "婚姻前の恋人と同居（本人の家計は別管理）",
        post_cohabitation_housing_unconfirmed: "同居解消後・住居と契約の状況を確認中（転居の記録なし）",
        spouse_parent_home: "配偶者の親族宅で同居（他の同居者は未記録）"
      }[s.residenceArrangement] || "旧記録では未確認"
    ],
    ["親以外の養育関係", networkText],
    ["家計を分ける目安", householdTiming],
    ["周囲の支援", s.care ? Math.round(s.care.support * 100) + "/100" : "未記録"],
    ["父", parent("fa", s.par.fa)],
    ["母", parent("mo", s.par.mo)],
    ["きょうだい", sibText],
    [
      "シラクーザのファミリー関係",
      s.siracusaFamilyTie
        ? `${
            {
              active: "仕事・保護のつながりが続いている",
              distant: "仕事の依頼から距離を置いている",
              left: "離脱の意思を伝えた",
              declined: "加入の誘いを断った"
            }[s.siracusaFamilyTie.status] || "状態未確認"
          }` +
          `${
            Number.isInteger(s.siracusaFamilyTie.startedYear)
              ? `・関係開始 ${s.siracusaFamilyTie.startedYear}年`
              : s.siracusaFamilyTie.startYearBasis === "legacy-unrecorded"
                ? "・旧記録のため開始年不明"
                : ""
          }` +
          `${
            s.siracusaFamilyTie.history?.length
              ? `・履歴 ${(s.siracusaFamilyTie.history || [])
                  .map(row => `${row.year}年 ${row.to}`)
                  .join("、")}`
              : ""
          }`
        : s.fl?.family
          ? "旧記録の組織的ファミリー関係（経緯不明）"
          : "記録なし"
    ],
    ["恋愛・縁談", rom],
    [
      "配偶者",
      s.sp
        ? `${s.sp.nm}(${s.sp.r.n}${Number.isFinite(s.sp.by) ? `・${Math.max(0, s.year - s.sp.by)}歳` : ""})${s.sp.inf && !s.sp.infHidden ? "・鉱石病" : ""}` +
          `${
            s.sp.disclosureBoundary === "separate_rooms"
              ? "・告白後、別室で過ごしている"
              : s.sp.disclosureBoundary === "repaired"
                ? "・告白後に話し合いを再開"
                : ""
          }` +
          `${s.sp.marriageType ? "・" + s.sp.marriageType : ""}${
            s.sp.d
            ? !knowsDeath(s.sp)
                ? "・安否未確認"
                : `・${s.sp.deathKnownYear}年に死亡の知らせ・${s.sp.infHidden ? "死因の詳細は届いていない" : s.sp.deathCause || "死因不明"}`
              : ""
          }`
        : "なし"
    ],
    ["過去の関係", pastRelationships || "なし"],
    [
      "子",
      s.kids.length
        ? s.kids
            .map(k => {
              const knowsDeath =
                  !!k.d && Number.isFinite(k.deathKnownYear) && k.deathKnownYear <= s.year,
                age = Math.max(0, (knowsDeath ? k.d : s.year) - k.by),
                death = k.d
                  ? !knowsDeath
                    ? "・安否未確認"
                    : `・死亡${k.d}年・訃報${k.deathKnownYear}年${k.deathCause ? "・" + k.deathCause : ""}`
                  : "・存命",
                arrangement =
                  {
                    study: "・進学中",
                    working: `・家で働く${J[k.jobId]?.n ? "/" + J[k.jobId].n : ""}`,
                    supported: "・家族が生活を支援",
                    independent:
                      `・別居${k.independentSinceYear || ""}年〜${
                        k.knownRegion
                          ? `・${k.knownRegion}（${k.regionKnownYear || "年不明"}年確認）`
                          : `・居住地未確認`
                      }` +
                      `${Number.isInteger(k.knownJobId) ? `・仕事:${J[k.knownJobId]?.n || "不明"}` : `・仕事未確認`}`
                  }[k.householdStatus] || "",
                training = k.trainingCompletedYear ? `・訓練修了${k.trainingCompletedYear}年` : "",
                contact = k.contactState
                  ? `・${k.contactState === "paused" ? "連絡を待っている" : "連絡を続けている"}${k.lastContactYear ? `・最終連絡${k.lastContactYear}年` : ""}`
                  : "",
                returning =
                  (Number.isFinite(k.returnRequestYear) ? "・本人から帰宅希望" : "") +
                  (Number.isFinite(k.returnOfferYear) ? "・帰宅の返事待ち" : "") +
                  (Number.isFinite(k.returnRoomSetupYear)
                    ? `・帰宅準備 ${k.returnRoomSetupYear}年・${m(k.returnRoomSetupCost)}`
                    : ""),
                remit =
                  (k.remittanceAnnual ? `・送金年額${m(k.remittanceAnnual)}` : "") +
                  (Number.isFinite(k.budgetKnownNet)
                    ? `・${k.budgetKnownYear}年に確認した年間収支の目安（推計）${k.budgetKnownNet >= 0 ? "+" : ""}${m(k.budgetKnownNet)}`
                    : "") +
                  (k.aidReceivedTotal ? `・一時援助累計${m(k.aidReceivedTotal)}` : ""),
                visits = k.visitCount
                  ? `・訪問${k.visitCount}回・累計移動費${m(k.visitTotal || 0)}${k.visitHistory?.length ? `・最終訪問${k.visitHistory.at(-1).year}年` : ""}`
                  : "",
                returned = k.returnedHomeYear ? `・再同居${k.returnedHomeYear}年〜` : "",
                exposure = k.exposurePending
                  ? `・曝露後の再診予定${k.exposureReviewYear}年・感染未確定`
                  : k.exposureClosedYear
                    ? `・曝露後の特別検査待ちは${k.exposureClosedYear}年に終了`
                    : "",
                residenceProposal = k.householdResidenceProposal
                  ? `・${k.householdResidenceProposal.year}年に${
                      k.householdResidenceProposal.recipientRole === "child"
                        ? "子ども本人へ"
                        : "元配偶者へ"
                    }生活先の案を伝えた（返事待ち: ${
                      {
                        self: "こちらで暮らす",
                        former_support: `元配偶者側で暮らす・任意年額 ${m(k.householdResidenceProposal.annualSupport || 0)}`,
                        former: "元配偶者側で暮らす",
                        shared: "二つの家を行き来する",
                        unresolved: "生活先の案は保留"
                      }[k.householdResidenceProposal.plan] || "内容未記録"
                    }）`
                  : k.householdResidenceProposalHistory?.at(-1)?.status === "closed_co_parent_death"
                    ? `・${k.householdResidenceProposalHistory.at(-1).year}年の元配偶者への生活先提案は、訃報を受けて返事未確認のまま終了`
                    : "",
                futureSupport = k.futurePlanSupportHistory?.length
                  ? (() => {
                      const item = k.futurePlanSupportHistory.at(-1),
                        label = {
                          "study-funds": "学費の足し",
                          "work-introduction": "見習い先の紹介探し",
                          "household-open": "家での暮らしの支援を伝えた",
                          "move-funds": "別居の支度金",
                          revisit: "進路を再相談"
                        }[item.kind] || "進路支援";
                      return `・${item.year}年に${label}${item.amount ? ` ${m(item.amount)}` : ""}`;
                    })()
                  : "",
                careState =
                  k.careSupport === 1
                    ? "・家族が療養を支援"
                    : k.careSupport === 0
                      ? "・家計の継続支援を探している"
                      : "";
              return (
                `${k.nm}(${k.r.n}・${age}歳${death}${arrangement}${
                  k.householdResidencePlan
                    ? `・${childResidencePlanLabel(k.householdResidencePlan, age)}${
                        k.householdResidencePlan === "former_support" && age < P("life.adultStartAge")
                          ? `・任意年額 ${m(divorceChildSupportAnnualCost(s, k))}`
                          : ""
                      }`
                    : ""
                }` +
                (`${
                  Number.isFinite(k.householdResidenceReviewYear) && !k.householdResidencePlan
                    ? "・離婚後の生活先相談待ち"
                    : ""
                }` +
                  `${residenceProposal}${futureSupport}${training}${contact}${returning}${remit}${visits}`) +
                (`${returned}${exposure}${
                  k.inf
                    ? `・鉱石病${k.tx ? "・診療継続中" : ""}${careState}${k.infCause ? "・" + k.infCause : ""}`
                    : ""
                }` +
                  `)`)
              );
            })
            .join("、")
        : "なし"
    ],
    ["友人", contact(s.friendContact, "friend")],
    ["近所の人", contact(s.neighborContact, "neighbor")],
    [
      "居住地の感染者への圧力",
      `世間 ${Math.round(op.public * 100)}・仕事 ${Math.round(op.work * 100)}・住居 ${Math.round(op.housing * 100)}・医療 ${Math.round(op.medical * 100)}` +
        `/100`
    ],
    [
      "感染曝露の記録",
      s.infection
        ? `${Number.isFinite(s.infection.year) ? `${s.infection.year}年` : `年不明`}・${s.infection.cause}${
            s.infection.basis === "annual-risk-estimate"
              ? "（年次モデルによる推定・具体的接触は未記録）"
              : s.infection.basis === "event-recorded"
                ? "（個別の出来事を記録）"
                : "（曝露経路の区分なし）"
          }`
        : s.inf
          ? "感染中・経路未記録"
          : "なし"
    ],
    ["感染者への個人的な偏見", Math.round(s.biasInfected || 0) + "/100"],
    ["サルカズへの個人的な偏見", Math.round(s.biasSarkaz || 0) + "/100"],
    ["態度を形作った経験", attitudeHistory],
    ["居住地の移動", (s.moves || []).length + "回"],
    ["直近の移動", last ? `${last.year}年: ${last.from} → ${last.to}` : "なし"]
  ]
    .map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`)
    .join("");
};
function formerSpouseLifeMarkup(s) {
  return (s.relationshipHistory || [])
    .filter(person => person.ending === "離婚" && person.lifeStatus)
    .map(person => {
      const name = esc(person.nm || person.name || "以前の配偶者"),
        age = Number.isFinite(person.by) ? `・${Math.max(0, s.year - person.by)}歳` : "",
        knownRegion = REG.find(
          region => region.n === (person.knownResidenceRegion || person.residenceRegion)
        )?.n,
        visible = person.moveNoticeHistory || [],
        shown = visible.slice(-4),
        movement = shown.length
          ? `・移転の知らせ ${shown
              .map(row => `${row.moveYear}年 ${esc(row.from)}→${esc(row.to)}（${row.year}年確認）`)
              .join("、")}`
          : "",
        pending = person.residenceMoveNotice && !Number.isInteger(person.residenceMoveNotice.deliveredYear),
        status =
          person.lifeStatus === "dead"
            ? person.deathNoticePending || !Number.isFinite(person.deathKnownYear) || person.deathKnownYear > s.year
              ? "・安否未確認"
              : `・${person.deathYear || person.actualDeathYear}年没${person.deathKnownYear ? `・訃報${person.deathKnownYear}年に確認` : ""}` +
                `${person.deathCause ? `・${esc(person.deathCause)}` : ""}`
            : `・離婚後の安否は未確認${knownRegion ? `・最終確認地域 ${esc(knownRegion)}` : ""}${pending ? "・転居先の知らせ待ち" : ""}${movement}`;
      return `<dt>元配偶者の近況</dt><dd>${name}${age}${status}</dd>`;
    })
    .join("");
}

function generationTreeMarkup(s) {
  if (!s) return "";
  const knowsParentInfection = x => !!x?.infectionKnown || !!(x?.d && x?.inf);
  const knowsDeath = x =>
    !!x?.d &&
    !x.deathNoticePending &&
    Number.isFinite(x.deathKnownYear) &&
    x.deathKnownYear <= s.year;

  // 第1世代: 親世帯
  const parentNodes = [];
  const fa = s.par?.fa;
  if (fa) {
    const isDead = knowsDeath(fa);
    const age = Number.isFinite(fa.by) ? (isDead ? (fa.d - fa.by) : Math.max(0, s.year - fa.by)) : null;
    const deadText = isDead ? `・${fa.d}年没` : fa.d ? "・安否未確認" : "";
    const infText = fa.inf && knowsParentInfection(fa) ? '<span class="ui-gen-tag is-inf">鉱石病</span>' : "";
    const statusText = isDead ? '<span class="ui-gen-tag is-dead">没</span>' : "";
    parentNodes.push(
      `<div class="ui-gen-node is-parent"><div class="node-role">父</div>` +
      `<div class="node-name">${esc(fa.nm || "父")}${infText}${statusText}</div>` +
      `<div class="node-meta">${esc(fa.r?.n || "不明")}${age != null ? `・${age}歳` : ""}${deadText}</div></div>`
    );
  }
  const mo = s.par?.mo;
  if (mo) {
    const isDead = knowsDeath(mo);
    const age = Number.isFinite(mo.by) ? (isDead ? (mo.d - mo.by) : Math.max(0, s.year - mo.by)) : null;
    const deadText = isDead ? `・${mo.d}年没` : mo.d ? "・安否未確認" : "";
    const infText = mo.inf && knowsParentInfection(mo) ? '<span class="ui-gen-tag is-inf">鉱石病</span>' : "";
    const statusText = isDead ? '<span class="ui-gen-tag is-dead">没</span>' : "";
    parentNodes.push(
      `<div class="ui-gen-node is-parent"><div class="node-role">母</div>` +
      `<div class="node-name">${esc(mo.nm || "母")}${infText}${statusText}</div>` +
      `<div class="node-meta">${esc(mo.r?.n || "不明")}${age != null ? `・${age}歳` : ""}${deadText}</div></div>`
    );
  }
  if (!parentNodes.length) {
    parentNodes.push(
      `<div class="ui-gen-node"><div class="node-role">養育関係</div>` +
      `<div class="node-name">${esc(s.care?.kind || "親族記録なし")}</div></div>`
    );
  }

  // 第2世代: 本人・配偶者・きょうだい
  const gen2Nodes = [];
  const selfInf = s.inf ? '<span class="ui-gen-tag is-inf">鉱石病</span>' : "";
  const selfDead = s.dead ? '<span class="ui-gen-tag is-dead">永眠</span>' : "";
  const selfJob = (typeof occupationLabel === "function" ? occupationLabel(s) : ((typeof J !== "undefined" && J[s.job]?.n) || "無職"));
  gen2Nodes.push(
    `<div class="ui-gen-node is-protagonist"><div class="node-role">[本人]</div>` +
    `<div class="node-name">${esc(s.nm || "本人")}${selfInf}${selfDead}</div>` +
    `<div class="node-meta">${esc(s.r?.n || "")}・${s.age}歳・${esc(selfJob)}</div></div>`
  );
  if (s.sp) {
    const spDead = s.sp.d && knowsDeath(s.sp);
    const spAge = Number.isFinite(s.sp.by) ? (spDead ? (s.sp.d - s.sp.by) : Math.max(0, s.year - s.sp.by)) : null;
    const spInf = s.sp.inf && !s.sp.infHidden ? '<span class="ui-gen-tag is-inf">鉱石病</span>' : "";
    const spDeadTag = spDead ? '<span class="ui-gen-tag is-dead">没</span>' : "";
    gen2Nodes.push(
      `<div class="ui-gen-node is-spouse"><div class="node-role">配偶者</div>` +
      `<div class="node-name">${esc(s.sp.nm || "配偶者")}${spInf}${spDeadTag}</div>` +
      `<div class="node-meta">${esc(s.sp.r?.n || "")}${spAge != null ? `・${spAge}歳` : ""}${spDead ? `・${s.sp.d}年没` : ""}</div></div>`
    );
  }
  const sibs = (typeof siblingsOf === "function" ? siblingsOf(s) : []) || [];
  if (sibs.length) {
    const aliveCount = sibs.filter(x => !x.d).length;
    gen2Nodes.push(
      `<div class="ui-gen-node"><div class="node-role">きょうだい</div>` +
      `<div class="node-name">${sibs.length}人（存命 ${aliveCount}人）</div>` +
      `<div class="node-meta">${sibs.map(x => esc(x.nm)).slice(0, 3).join("・")}${sibs.length > 3 ? "…他" : ""}</div></div>`
    );
  }

  // 第3世代: 子女
  const kids = s.kids || [];
  const childNodes = [];
  let totalGrandkids = 0;
  for (const k of kids) {
    const isDead = k.d && Number.isFinite(k.deathKnownYear) && k.deathKnownYear <= s.year;
    const age = Math.max(0, (isDead ? k.d : s.year) - k.by);
    const infText = k.inf ? '<span class="ui-gen-tag is-inf">鉱石病</span>' : "";
    const deadText = isDead ? '<span class="ui-gen-tag is-dead">没</span>' : "";
    const status = k.householdStatus === "independent" ? "独立" : k.householdStatus === "working" ? "就労" : k.householdStatus === "study" ? "就学" : "同居";
    const gCount = (k.knownFamilyChildren || 0) + (k.kids?.length || 0);
    totalGrandkids += gCount;
    childNodes.push(
      `<div class="ui-gen-node is-child"><div class="node-role">子</div>` +
      `<div class="node-name">${esc(k.nm || "子")}${infText}${deadText}</div>` +
      `<div class="node-meta">${esc(k.r?.n || "")}・${age}歳・${status}${gCount ? `・子${gCount}人` : ""}</div></div>`
    );
  }

  // 第4世代: 孫
  if (s.fl?.grandchild_count) totalGrandkids = Math.max(totalGrandkids, s.fl.grandchild_count);
  if (Array.isArray(s.grandkids)) totalGrandkids = Math.max(totalGrandkids, s.grandkids.length);
  const grandchildNodes = [];
  if (totalGrandkids > 0 || s.fl?.grandchild_interaction || s.fl?.grandchild_visited) {
    const count = totalGrandkids > 0 ? `${totalGrandkids}人` : "確認あり";
    grandchildNodes.push(
      `<div class="ui-gen-node is-grandchild"><div class="node-role">孫</div>` +
      `<div class="node-name">孫世代（${count}）</div>` +
      `<div class="node-meta">${s.fl?.grandchild_interaction ? "便り・交流あり" : "健やかに成長中"}</div></div>`
    );
  }

  let html = `<div class="ui-generation-tree" role="region" aria-label="世代の系譜">` +
    `<div class="ui-gen-header"><span class="ui-gen-badge">GENEALOGY</span><span class="ui-gen-title">血統と世代の系譜</span></div>` +
    `<div class="ui-gen-levels">` +
    `<div class="ui-gen-level"><div class="ui-gen-level-label">第1世代: 親</div><div class="ui-gen-nodes">${parentNodes.join("")}</div></div>` +
    `<div class="ui-gen-connector"><span class="ui-gen-line"></span></div>` +
    `<div class="ui-gen-level"><div class="ui-gen-level-label">第2世代: 本人</div><div class="ui-gen-nodes">${gen2Nodes.join("")}</div></div>`;

  if (childNodes.length) {
    html += `<div class="ui-gen-connector"><span class="ui-gen-line"></span></div>` +
      `<div class="ui-gen-level"><div class="ui-gen-level-label">第3世代: 子</div><div class="ui-gen-nodes">${childNodes.join("")}</div></div>`;
  }
  if (grandchildNodes.length) {
    html += `<div class="ui-gen-connector"><span class="ui-gen-line"></span></div>` +
      `<div class="ui-gen-level"><div class="ui-gen-level-label">第4世代: 孫</div><div class="ui-gen-nodes">${grandchildNodes.join("")}</div></div>`;
  }
  html += `</div></div>`;
  return html;
}
