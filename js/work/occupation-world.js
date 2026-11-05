// Fixed-seed work areas and generic, non-canonical employers.
// Values are gameplay hypotheses from REGIONAL_EMPLOYMENT_MATRIX_20261104.json.
const OCCUPATION_SECTORS = Object.freeze(["AGR","MIN","MFG","LOG","COM","CIV","MIL","MED","EDU","SCI","CRE","REL","REC"]);
const OCCUPATION_REGION_TIERS = Object.freeze({
  "炎国": [
    3,
    2,
    3,
    3,
    3,
    3,
    2,
    2,
    2,
    2,
    2,
    2,
    2
  ],
  "龍門": [
    0,
    0,
    2,
    3,
    3,
    3,
    3,
    2,
    2,
    2,
    3,
    1,
    1
  ],
  "ヴィクトリア": [
    2,
    2,
    3,
    3,
    3,
    3,
    3,
    2,
    3,
    2,
    2,
    1,
    2
  ],
  "ウルサス": [
    1,
    3,
    3,
    2,
    2,
    3,
    3,
    1,
    2,
    2,
    2,
    1,
    2
  ],
  "ラテラーノ": [
    3,
    2,
    2,
    3,
    3,
    3,
    2,
    3,
    3,
    2,
    3,
    3,
    1
  ],
  "カジミエーシュ": [
    3,
    1,
    2,
    3,
    3,
    2,
    2,
    2,
    2,
    1,
    3,
    1,
    1
  ],
  "クルビア": [
    2,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    3,
    1,
    2
  ],
  "極東": [
    2,
    1,
    3,
    2,
    3,
    2,
    3,
    2,
    2,
    2,
    3,
    3,
    2
  ],
  "イベリア": [
    1,
    1,
    1,
    1,
    1,
    2,
    2,
    1,
    1,
    1,
    1,
    2,
    3
  ],
  "シラクーザ": [
    1,
    1,
    1,
    2,
    3,
    2,
    2,
    2,
    2,
    1,
    2,
    2,
    1
  ],
  "サルゴン": [
    3,
    2,
    1,
    2,
    2,
    1,
    3,
    1,
    1,
    1,
    1,
    3,
    2
  ],
  "カズデル": [
    2,
    2,
    2,
    1,
    1,
    1,
    3,
    1,
    1,
    1,
    1,
    3,
    3
  ],
  "サーミ": [
    3,
    0,
    0,
    1,
    1,
    0,
    2,
    0,
    0,
    1,
    1,
    3,
    2
  ],
  "リターニア": [
    2,
    1,
    2,
    2,
    2,
    3,
    2,
    2,
    3,
    3,
    3,
    3,
    1
  ],
  "イェラグ": [
    3,
    2,
    2,
    2,
    2,
    1,
    2,
    1,
    1,
    1,
    2,
    3,
    2
  ],
  "レム・ビリトン": [
    1,
    3,
    3,
    3,
    2,
    1,
    2,
    2,
    1,
    2,
    1,
    1,
    3
  ],
  "ボリバル": [
    3,
    3,
    2,
    2,
    2,
    1,
    3,
    1,
    1,
    1,
    2,
    2,
    2
  ],
  "シエスタ": [
    1,
    1,
    1,
    3,
    3,
    2,
    1,
    2,
    2,
    2,
    3,
    1,
    3
  ],
  "ミノス": [
    3,
    1,
    1,
    2,
    2,
    2,
    2,
    2,
    2,
    1,
    3,
    3,
    1
  ]
});
const OCCUPATION_TIER_PROBABILITIES = Object.freeze([0.04, 0.20, 0.55, 0.85]);
// Only ordinary recruitment roles. Military, clergy, and registered professions
// require their own appointment/qualification route; their sectors can still exist.
const OCCUPATION_SECTOR_GENERAL_JOBS = Object.freeze({
  AGR: [1, 23], MIN: [3], MFG: [2, 18, 22], LOG: [16, 1],
  COM: [17, 21], CIV: [19, 21], MIL: [],
  MED: [20], EDU: [12], SCI: [7], CRE: [25], REL: [], REC: [17, 25]
});

function occupationWorkAreaKey(s) {
  if (!s?.res?.n || !s.local) return null;
  const local = s.local;
  // The existing residenceSequence/districtId identify visits, not a stable work area.
  // Retain the locality profile for unnamed settlements and the physical base for mobile sites.
  const anchor = s.residenceBase?.id
    ? "base:" + s.residenceBase.id
    : local.city ? "city:" + local.city : "unnamed";
  const profile = [local.kind || "", s.home || "", local.access, local.hazard, local.info]
    .map(value => Number.isFinite(value) ? Number(value).toFixed(6) : String(value ?? "")).join(":");
  return JSON.stringify([s.res.n, anchor, profile, s.randomSeed ?? 0]);
}

function occupationSectorPresence(s, areaId, sector, tier, index) {
  let chance = OCCUPATION_TIER_PROBABILITIES[tier];
  const district = s.local?.kind || "";
  if (/採掘|工業/.test(district)) {
    if (sector === "MIN" || sector === "MFG") chance += 0.16;
    if (sector === "SCI") chance -= 0.10;
  } else if (/村|定住|農村/.test(district)) {
    if (sector === "AGR") chance += 0.12;
    if (sector === "SCI") chance -= 0.12;
  } else if (/商業|中心|街区/.test(district)) {
    if (sector === "COM" || sector === "LOG") chance += 0.10;
  }
  // Correlated geographic factor: transport, manufacturing and mining should
  // not be independently sprinkled over isolated settlements.
  const infrastructure = keyedRoll("occupation-geography:" + areaId);
  if (["MFG","LOG","SCI","MED"].includes(sector))
    chance += (infrastructure - 0.5) * 0.18;
  if (sector === "MIN" && tier === 0) return false;
  return keyedRoll("occupation-sector:" + areaId + ":" + index) <
    Math.max(0, Math.min(0.98, chance));
}

function ensureOccupationWorkArea(s) {
  const areaId = occupationWorkAreaKey(s);
  if (!areaId) return null;
  const world = s.world || (s.world = { events: {} });
  const occupationWorld = world.occupationWorld ||= {
    version: 1, areas: {}, employers: {}, sites: {}, positions: {}, openings: {}, transitions: []
  };
  if (occupationWorld.areas[areaId]) return occupationWorld.areas[areaId];
  const region = OCCUPATION_REGION_TIERS[s.res.n];
  if (!region) return null;
  const area = {
    areaId, region: s.res.n, city: s.local?.city || null,
    districtKind: s.local?.kind || null, createdYear: s.year,
    sectorTiers: {}, sectorPresence: {}, siteIds: [],
    basis: "regional-sector-presence-game-model"
  };
  for (let i = 0; i < OCCUPATION_SECTORS.length; i++) {
    const sector = OCCUPATION_SECTORS[i], tier = region[i];
    area.sectorTiers[sector] = tier;
    const present = occupationSectorPresence(s, areaId, sector, tier, i);
    area.sectorPresence[sector] = present;
    if (!present) continue;
    // This is an anonymous local operator, never a branch of a named organization.
    // The existence of a sector/site does not guarantee a job or a vacant slot.
    const employerId = "local-operator:" + areaId + ":" + sector,
      siteId = "local-site:" + areaId + ":" + sector,
      roles = OCCUPATION_SECTOR_GENERAL_JOBS[sector],
      capacity = 3 + Math.floor(keyedRoll(siteId + ":capacity") * 10);
    occupationWorld.employers[employerId] = {
      employerId, organizationKey: null, areaId, sector, kind: "anonymous-operator",
      basis: "game-model"
    };
    const site = occupationWorld.sites[siteId] = {
      siteId, employerId, areaId, sector, status: "open", createdYear: s.year,
      lastYear: s.year, history: [], positionIds: [],
      capacityBand: capacity < 6 ? "micro" : "small",
      basis: "game-model"
    };
    for (let roleIndex = 0; roleIndex < roles.length; roleIndex++) {
      const jobId = roles[roleIndex],
        positionId = "local-position:" + areaId + ":" + sector + ":j" + jobId,
        openingId = "local-opening:" + areaId + ":" + sector + ":j" + jobId + ":" + s.year,
        roleCapacity = Math.floor(capacity / roles.length) +
          (roleIndex < capacity % roles.length ? 1 : 0),
        occupied = Math.floor(keyedRoll(positionId + ":occupied") * (roleCapacity + 1)),
        vacant = roleCapacity - occupied,
        advertised = vacant > 0 && keyedRoll(openingId + ":recruitment") < 0.45;
      site.positionIds.push(positionId);
      occupationWorld.positions[positionId] = {
        positionId, siteId, sector, jobId, capacity: roleCapacity,
        aggregateOccupiedSlots: occupied, identifiedOccupiedSlots: 0,
        reservedSlots: 0, vacancyCount: vacant,
        openingIds: advertised ? [openingId] : [], basis: "game-model"
      };
      if (advertised) occupationWorld.openings[openingId] = {
        openingId, positionId, employerId, siteId, areaId,
        kind: "general-public", validFromYear: s.year,
        status: "open", slots: Math.min(2, vacant), basis: "game-model",
        // A world's vacancy must be learned by this person before applying.
        visibleToPlayer: false
      };
    }
    area.siteIds.push(siteId);
  }
  occupationWorld.areas[areaId] = area;
  return area;
}

/**
 * Annual operational availability for already placed anonymous sites.
 * A local economic shock may suspend recruitment, but does not fabricate a
 * canonical company closure or cancel employment episodes.
 */
function advanceOccupationWorkArea(s, year, metrics) {
  const area = ensureOccupationWorkArea(s);
  if (!area || !Number.isInteger(year)) return area;
  const work = s.world.occupationWorld;
  const jobAccess = Number.isFinite(metrics?.jobs) ? metrics.jobs : 0.7;
  for (const siteId of area.siteIds) {
    const site = work.sites[siteId];
    if (!site || (site.lastYear ?? site.createdYear) >= year) continue;
    // Temporary limitations affect the ability to advertise new vacancies.
    const nextStatus = jobAccess < 0.40 ? "strained" : "open";
    if (nextStatus !== site.status) {
      site.history ||= [];
      site.history.push({
        year, from: site.status, to: nextStatus, basis: "local-economic-pressure-game-model"
      });
    }
    site.status = nextStatus;
    site.lastYear = year;
    for (const positionId of site.positionIds) {
      const position = work.positions[positionId];
      if (!position) continue;
      for (const id of position.openingIds || []) {
        const prior = work.openings[id];
        if (!prior || prior.status !== "open") continue;
        prior.status = "expired";
        prior.validToYear = year - 1;
      }
      position.openingIds = [];
      position.vacancyCount = Math.max(0,
        position.capacity - position.aggregateOccupiedSlots -
        position.identifiedOccupiedSlots - position.reservedSlots);
      if (site.status !== "open" || position.vacancyCount === 0) continue;
      const openingId = positionId.replace("local-position:", "local-opening:") + ":" + year;
      if (keyedRoll(openingId + ":recruitment") >= 0.45) continue;
      work.openings[openingId] = {
        openingId, positionId, employerId: site.employerId,
        siteId, areaId: area.areaId, kind: "general-public",
        validFromYear: year, status: "open",
        slots: Math.min(2, position.vacancyCount),
        basis: "game-model", visibleToPlayer: false
      };
      position.openingIds.push(openingId);
    }
  }
  return area;
}

// Read-only candidate lookup. Seeking work never causes the world to generate a vacancy.
function occupationOpeningsFor(s, jobId) {
  if (!Number.isInteger(jobId) || jobId <= 0 || s?.fl?.retired ||
      s?.fl?.detained || s?.fl?.segregated || s?.age < 16) return [];
  const areaId = occupationWorkAreaKey(s), work = s.world?.occupationWorld;
  if (!areaId || !work?.areas?.[areaId]) return [];
  return Object.values(work.openings).filter(row => {
    const site = work.sites[row.siteId], position = work.positions[row.positionId];
    return row.areaId === areaId && row.status === "open" && row.slots > 0 &&
      (row.validFromYear == null || s.year >= row.validFromYear) &&
      (row.validToYear == null || s.year <= row.validToYear) &&
      site?.status === "open" && site.areaId === areaId &&
      site.employerId === row.employerId &&
      position?.siteId === site.siteId && position.jobId === jobId &&
      position.vacancyCount > 0;
  }).sort((a,b)=>a.openingId.localeCompare(b.openingId));
}
function occupationOpeningFor(s, jobId) {
  return occupationOpeningsFor(s, jobId)[0] || null;
}

function occupationAreaSnapshot(s) {
  // Read-only; a UI inquiry never initializes a site, opening or RNG.
  const areaId = occupationWorkAreaKey(s);
  return areaId ? s.world?.occupationWorld?.areas?.[areaId] || null : null;
}
