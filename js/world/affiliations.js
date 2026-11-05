function recordIntergroupContact(s, action) {
  if (
    !action ||
    !["institution", "workplace", "school", "community", "border"].includes(action.context) ||
    typeof action.response !== "string"
  )
    throw Error("地域・種族間の接触記録が不正");
  s.intergroupHistory ||= [];
  s.intergroupHistory.push({
    year: s.year,
    region: s.res.n,
    areaKey: s.community?.key || null,
    personRace: s.r.n,
    context: action.context,
    response: action.response,
    topic: action.topic || "異なる出自の人々との接点",
    basis: "scenario-simulation"
  });
  s.intergroupHistory = s.intergroupHistory.slice(-60);
}

/* 出自・職種・地区の変化に追随する施設への所属。医院は「問い合わせ先」であり患者登録ではない。
   旧データの第1施設IDを保持し、過去の契約があったように遡及生成しない。 */
function siteAffiliation(s, kind) {
  if (kind === "workplace" && currentPlayerEmployment(s)) {
    const episode = currentPlayerEmployment(s), site = s.world?.occupationWorld?.sites?.[episode?.siteId];
    return site && episode.kind === "wage-employment" ? { facilityId: site.siteId,
      areaKey: site.areaId, kind, extra: String(episode.jobId), sinceYear: episode.startYear,
      relation: "employment", basis: "occupation-episode" } : null;
  }
  const area = ensureLocalityState(s);
  if (!area) return null;
  ensureFacilityRecords(s, area);
  s.siteAffiliations ||= {};
  s.siteAffiliationHistory ||= [];
  const eligible = kind !== "workplace" || (s.job > 0 && !s.fl?.retired && !restricted(s));
  const extra = kind === "workplace" ? String(s.job) : "";
  let current = s.siteAffiliations[kind];
  if (
    current &&
    (current.areaKey !== area.key ||
      current.extra !== extra ||
      !eligible ||
      !area.facilities[current.facilityId])
  ) {
    s.siteAffiliationHistory.push({
      year: s.year,
      kind,
      facilityId: current.facilityId,
      areaKey: current.areaKey,
      action: "ended",
      reason:
        current.areaKey !== area.key
          ? "relocation"
          : current.extra !== extra
            ? "occupation_changed"
            : "eligibility_changed",
      basis: "game-model"
    });
    delete s.siteAffiliations[kind];
    current = null;
  }
  if (!eligible) return null;
  if (!current) {
    // v74の既知施設は旧IDを優先。施設との以前の接触がなくても過去を創作しない。
    const old = (s.facilityContacts || [])
      .concat(s.facilityPeopleContacts || [])
      .filter(c => c.areaKey === area.key && c.kind === kind && area.facilities[c.facilityId]);
    const preserved = old.at(-1)?.facilityId;
    const sites = localSites(area, kind, extra);
    for (const site of sites) if (site.lastYear !== s.year) facilityAdvance(s, area, s.year);
    const available = sites.filter(x => x.status !== "limited" && x.status !== "closed");
    const candidates = available.length ? available : sites;
    const chosen =
      (preserved && area.facilities[preserved]) ||
      (area.legacyDefaultSite ? candidates[0] : null) ||
      candidates[
        Math.floor(
          keyedRoll(`terra-site-selection-v75:${s.by}:${s.nm}:${area.key}:${kind}:${extra}`) * candidates.length
        )
      ] ||
      candidates[0];
    if (!chosen) return null;
    current = {
      facilityId: chosen.id,
      areaKey: area.key,
      kind,
      extra,
      sinceYear: s.year,
      relation:
        kind === "workplace" ? "employment" : kind === "school" && s.fl?.sch ? "study" : "contact-point",
      basis: "game-model"
    };
    s.siteAffiliations[kind] = current;
    s.siteAffiliationHistory.push({
      year: s.year,
      kind,
      facilityId: chosen.id,
      areaKey: area.key,
      action: "established",
      reason: old.length ? "known-site-restored" : "current-year-model",
      basis: "game-model"
    });
  }
  // 学び舎に実際に在籍していることと、施設の存在を知っていることを混同しない。
  if (kind === "school") current.relation = s.fl?.sch && !restricted(s) ? "study" : "contact-point";
  s.siteAffiliationHistory = s.siteAffiliationHistory.slice(-96);
  return current;
}
function activeFacility(s, kind) {
  if (kind === "workplace" && currentPlayerEmployment(s)) {
    const link = siteAffiliation(s, kind), site = s.world?.occupationWorld?.sites?.[link?.facilityId];
    return site ? { ...site, id: site.siteId, kind, extra: link.extra,
      status: site.status === "open" ? "available" : site.status === "closed" ? "limited" : site.status } : null;
  }
  const area = ensureLocalityState(s);
  if (!area) return null;
  const link = siteAffiliation(s, kind);
  if (!link) return null;
  const f = area.facilities[link.facilityId];
  if (f && f.lastYear !== s.year) facilityAdvance(s, area, s.year);
  return f || null;
}
function alternativeFacility(s, kind) {
  const current = activeFacility(s, kind);
  if (!current) return null;
  return (
    localSites(s.community, kind, current.extra).find(
      x =>
        x.id !== current.id &&
        x.status !== "limited" &&
        (kind !== "workplace" || !contractEligibleJob(s) || ensureWorkplaceLedger(s, x)?.openings > 0)
    ) || null
  );
}
function applySiteAction(s, action) {
  if (!action || !["clinic", "school", "workplace"].includes(action.kind) || action.action !== "switch")
    throw Error("施設変更の記録が不正");
  if (action.kind === "school" && (!s.fl?.sch || restricted(s)))
    throw Error("在学中でないため通学先を変更できない");
  const original = activeFacility(s, action.kind),
    target = alternativeFacility(s, action.kind);
  if (!original || !target) throw Error("変更先の施設が利用できない");
  const record = s.siteAffiliations[action.kind];
  s.siteAffiliationHistory.push({
    year: s.year,
    kind: action.kind,
    facilityId: original.id,
    areaKey: s.community.key,
    action: "ended",
    reason: "chosen-transfer",
    basis: "player-choice"
  });
  record.facilityId = target.id;
  record.sinceYear = s.year;
  record.basis = "player-choice";
  s.siteAffiliationHistory.push({
    year: s.year,
    kind: action.kind,
    facilityId: target.id,
    areaKey: s.community.key,
    action: "transferred",
    reason: "confirmed-placement",
    basis: "player-choice"
  });
  s.siteAffiliationHistory = s.siteAffiliationHistory.slice(-96);
  s.facilityContacts ||= [];
  s.facilityContacts.push({
    year: s.year,
    areaKey: s.community.key,
    facilityId: target.id,
    kind: action.kind,
    action: "new-site",
    description:
      action.kind === "workplace"
        ? "同じ職種で別の勤務先へ移った"
        : action.kind === "school"
          ? "別の学び舎へ通うことになった"
          : "別の診療窓口を今後の問い合わせ先にした"
  });
  s.facilityContacts = s.facilityContacts.slice(-80);
  if (action.kind === "workplace") {
    s.fl.workplace_hazard=0;
    reconcileWorkContract(s);
    reconcileAffiliationWork(s, true);
  }
  return target;
}
/* 身近な施設を介して知り合った人物の持続履歴。具体の原作人物・施設職員名簿ではない。 */
const FACILITY_PERSON_ROLES = {
  clinic: "診療拠点の案内担当",
  school: "学び舎で教える人",
  workplace: "同じ仕事場の働き手"
};
function facilityPersonFor(s, kind, personId = null) {
  const f = activeFacility(s, kind),
    area = s.community;
  if (!f || !area?.people) return null;
  // Explicitly named interactions never silently switch to the newest colleague.
  const candidates = Object.values(area.people).filter(
    p => p.facilityId === f.id && p.kind === kind && Number.isInteger(p.metYear) && p.metYear <= s.year
  );
  return personId
    ? candidates.find(p => p.id === personId) || null
    : candidates.sort((a, b) => b.metYear - a.metYear)[0] || null;
}
