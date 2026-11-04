/* Event data construction. Runtime values are published only by data/finalize.js. */
(function () {
  "use strict";
  if (window.TERRA_DATA_BUILD) throw new Error("Data construction is already active");
  const order = [
      "model/guide",
      "model/sources",
      "model/schema",
      "model/flags",
      "model/world",
      "model/languages",
      "base/initialize",
      "base/childhood-attitudes",
      "base/career-entry",
      "base/life-and-health",
      "base/family-and-livelihood",
      "base/daily-childhood",
      "base/daily-adulthood",
      "base/daily-family",
      "base/regional-west",
      "base/regional-east",
      "base/regional-conflict",
      "base/world-and-contacts",
      "base/daily-regional",
      "base/daily-war-and-identity",
      "regional/yan",
      "regional/lungmen",
      "regional/higashi",
      "regional/ursus",
      "regional/victoria",
      "regional/leithanien",
      "regional/laterano",
      "regional/columbia",
      "regional/kazimierz",
      "regional/siracusa",
      "regional/siesta",
      "regional/sargon",
      "regional/sami",
      "regional/kjerag",
      "regional/kazdel",
      "regional/iberia",
      "regional/bolivar",
      "regional/rim-billiton",
      "regional/minos",
      "base/confinement-and-education",
      "extensions/social-and-care",
      "model/flag-usage",
      "extensions/education-and-later-life",
      "world/history",
      "extensions/family-and-community",
      "health/mortality",
      "social/organizations-and-infection",
      "routes/rhodes-and-factions",
      "routes/regional-careers",
      "world/class-and-locality",
      "world/facilities",
      "relationships/facility-people",
      "life/goals-and-family",
      "work/contracts",
      "social/learning",
      "social/conflict",
      "review/choice-policy",
      "relationships/person-ties",
      "review/historical-reviews",
      "information/current-routes",
      "relationships/close-disclosure",
      "review/current-review",
      "finalize"
    ],
    target = Object.create(null);
  let completed = 0,
    constructing = false;
  const fragments = new Map();
  function readFragment(name) {
    if (!constructing) throw new Error("Data fragments are only available during construction");
    const entry = fragments.get(name);
    if (!entry || entry.phase !== order[completed])
      throw new Error("Missing or already consumed data fragment: " + name);
    fragments.delete(name);
    const initialize = entry.initialize;
    return initialize($terraData, $define, window.TERRA_RULES.services, readFragment);
  }
  const $terraData = new Proxy(target, {
    get(object, key) {
      if (!Object.prototype.hasOwnProperty.call(object, key))
        throw new ReferenceError("Data binding is not initialized: " + String(key));
      return Reflect.get(object, key);
    },
    set(object, key, value) {
      if (!Object.prototype.hasOwnProperty.call(object, key)) {
        throw new ReferenceError("Data binding is not initialized: " + String(key));
      }
      return Reflect.set(object, key, value);
    }
  });
  function $define(name, value, mutable = false, inferName = false) {
    if (Object.prototype.hasOwnProperty.call(target, name))
      throw new Error("Duplicate data binding: " + name);
    if (inferName && typeof value === "function" && !value.name)
      Object.defineProperty(value, "name", { value: name, configurable: true });
    Object.defineProperty(target, name, { value, writable: mutable, enumerable: true });
  }
  $define(
    "flagAliases",
    function flagAliases() {
      const count = Object.keys($terraData.FLAG_REGISTRY).length;
      if (count !== $terraData._flagAliasCount) {
        $terraData._flagAliases = new Map();
        for (const [id, meta] of Object.entries($terraData.FLAG_REGISTRY)) {
          const words = [id, ...(Array.isArray(meta.tags) ? meta.tags : [])];
          for (const word of words) {
            if (!$terraData._flagAliases.has(word)) $terraData._flagAliases.set(word, new Set());
            $terraData._flagAliases.get(word).add(id);
          }
        }
        $terraData._flagAliasCount = count;
      }
      return $terraData._flagAliases;
    },
    true
  );
  $define(
    "refreshFlagUsage",
    function refreshFlagUsage() {
      const producers = new Map(),
        clearers = new Map(),
        consumers = new Map();
      for (const event of $terraData.EV) {
        const changes = new Map();
        const readResult = node => {
          if (!node || typeof node !== "object") return;
          if (Array.isArray(node)) {
            for (const row of node) readResult(row);
            return;
          }
          if (node.fl || ["primary","case:commit","case:commit-grant","case:commit-loan"].includes(node.educationAction))
            for (const [id, value] of Object.entries({...node.fl,...(["primary","case:commit","case:commit-grant","case:commit-loan"].includes(node.educationAction) ? {sch:1} : {})})) {
              if (!changes.has(id)) changes.set(id, new Set());
              changes.get(id).add(value);
            }
          for (const outcome of node.o || []) readResult(outcome?.[2]);
        };
        readResult(event.fx);
        for (const choice of event.c || []) for (const outcome of choice.o || []) readResult(outcome?.[2]);
        for (const [id, values] of changes) {
          if (values.has(1)) {
            if (!producers.has(id)) producers.set(id, []);
            producers.get(id).push(event.id);
          }
          if (values.has(0)) {
            if (!clearers.has(id)) clearers.set(id, []);
            clearers.get(id).push(event.id);
          }
        }
        for (const id of $terraData.eventFlagRefs(event)) {
          if (!consumers.has(id)) consumers.set(id, []);
          consumers.get(id).push(event.id + " の条件");
        }
      }
      for (const [id, meta] of Object.entries($terraData.FLAG_REGISTRY)) {
        meta.producers = producers.get(id) || [];
        meta.clearers = clearers.get(id) || [];
        meta.consumers = [meta.engine, ...(consumers.get(id) || [])];
      }
    },
    true
  );
  $define(
    "srAffiliationStatus",
    function srAffiliationStatus(s, id) {
      return s.lifeRecord?.affiliations?.find(x => x.id === id)?.status || null;
    },
    true
  );
  $define(
    "srOnStaff",
    function srOnStaff(s) {
      return (
        ["active", "crisis"].includes($terraData.srAffiliationStatus(s, "rhodes-staff")) &&
        window.TERRA_RULES.services.affiliations.canWork(s, "rhodes-staff") &&
        [
          $terraData.SR_JOBS.service,
          $terraData.SR_JOBS.maintenance,
          $terraData.SR_JOBS.research,
          $terraData.SR_JOBS.field,
          $terraData.SR_JOBS.transporter,
          $terraData.SR_JOBS.reserve
        ].includes(s.job) &&
        !s.fl?.retired
      );
    },
    true
  );
  $define(
    "srArenaEmployee",
    function srArenaEmployee(s) {
      return (
        s.res.n === "カジミエーシュ" &&
        s.job === $terraData.SR_ARENA_JOB &&
        ["active", "crisis"].includes($terraData.srAffiliationStatus(s, "kazimierz-arena-staff")) &&
        !s.fl?.retired
      );
    },
    true
  );
  window.TERRA_DATA_BUILD = Object.freeze({
    fragment(phase, name) {
      return initialize => {
        if (constructing || order[completed] !== phase)
          throw new Error("Data phase order for fragment: " + phase);
        if (fragments.has(name)) throw new Error("Duplicate data fragment: " + name);
        if (typeof initialize !== "function")
          throw new TypeError("Data fragment must be a function: " + name);
        fragments.set(name, { phase, initialize });
      };
    },
    run(name, initialize) {
      if (order[completed] !== name)
        throw new Error("Data phase order: expected " + order[completed] + ", received " + name);
      constructing = true;
      try {
        initialize($terraData, $define, window.TERRA_RULES.services, readFragment);
        if (fragments.size) throw new Error("Unused data fragments in phase: " + name);
      } finally {
        constructing = false;
      }
      completed++;
    },
    complete() {
      if (constructing || fragments.size || completed !== order.length || !window.GAME_DATA)
        throw new Error("Incomplete game data construction");
      delete window.TERRA_DATA_BUILD;
    }
  });
})();
