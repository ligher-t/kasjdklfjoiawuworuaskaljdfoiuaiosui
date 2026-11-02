'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const annual = require('./support/annual-cases.cjs');

const root = path.resolve(__dirname, '..');
const { ctx, storage } = annual.context(root);

console.log('--- Test 1: Language master data and registry contracts ---');
const { GAME_DATA, TERRA_RULES } = ctx.window;

assert(GAME_DATA.LANGUAGE_REGISTRY, 'LANGUAGE_REGISTRY must be published');
assert(GAME_DATA.REGION_LANGUAGE_PROFILES, 'REGION_LANGUAGE_PROFILES must be published');
assert(GAME_DATA.LANGUAGE_CONTEXTS, 'LANGUAGE_CONTEXTS must be published');

assert(GAME_DATA.LANGUAGE_REGISTRY.victorian, 'Victorian language registered');
assert(GAME_DATA.LANGUAGE_REGISTRY.taran_heritage, 'Taran heritage language registered');
assert(GAME_DATA.LANGUAGE_REGISTRY.ursus_civic, 'Ursus civic language registered');
assert(GAME_DATA.LANGUAGE_REGISTRY.sarkaz_languages, 'Sarkaz languages registered');
assert.equal(GAME_DATA.LANGUAGE_REGISTRY.victorian.certainty, 'J/T');
assert(Array.isArray(GAME_DATA.LANGUAGE_REGISTRY.victorian.sourceRefs));

console.log('--- Test 2: Rule service contracts ---');
assert.equal(typeof TERRA_RULES.services.language.getSkill, 'function');
assert.equal(typeof TERRA_RULES.services.language.getLevel, 'function');
assert.equal(typeof TERRA_RULES.services.language.assess, 'function');
assert.equal(typeof TERRA_RULES.services.language.canRead, 'function');

console.log('--- Test 3: Language state initialization at birth ---');
annual.setup(ctx, { id: 'lang-birth-vic', seed: 12345, region: 'ヴィクトリア', age: 0 });

const sVictoria = vm.runInContext('currentLifeState()', ctx);
assert(sVictoria.languageState, 'Language state must be initialized at birth');
assert.equal(sVictoria.languageState.version, 1);
assert(Array.isArray(sVictoria.languageState.homeLanguageIds));
assert(sVictoria.languageState.skills);

console.log('--- Test 4: Not hardcoding race = language ---');
annual.setup(ctx, { id: 'lang-birth-col', seed: 54321, region: 'クルビア', age: 0 });
const sColumbia = vm.runInContext('currentLifeState()', ctx);
assert(sColumbia.languageState.homeLanguageIds.includes('columbia_local'));

console.log('--- Test 5: Oral vs written skill separation ---');
const { taranListen, taranRead, taranLevel } = vm.runInContext(`
  const sCustom = {
    age: 20,
    year: 1097,
    res: { n: "ヴィクトリア", pm: 1, md: 1, sc: 1 },
    languageState: {
      version: 1,
      homeLanguageIds: ["taran_heritage"],
      firstSocialLanguageId: "victorian",
      skills: {
        taran_heritage: { listen: 80, speak: 75, read: 0, write: 0, formalRegister: 0, lastUsedYear: 1097, acquisition: ["home"], evidence: [] },
        victorian: { listen: 60, speak: 50, read: 40, write: 30, formalRegister: 15, lastUsedYear: 1097, acquisition: ["school"], evidence: [] }
      },
      scripts: {},
      repertoires: {},
      milestones: [],
      encounters: [],
      accessArrangements: []
    }
  };
  globalThis.sCustom = sCustom;
  ({
    taranListen: getLanguageSkill(sCustom, "taran_heritage", "listen"),
    taranRead: getLanguageSkill(sCustom, "taran_heritage", "read"),
    taranLevel: getLanguageSummaryLevel(sCustom, "taran_heritage")
  });
`, ctx);

assert.equal(taranListen, 80);
assert.equal(taranRead, 0);
assert(taranLevel >= 1);

console.log('--- Test 6: Pure assessment without RNG mutation ---');
const { beforeRngState, afterRngState, assessment } = vm.runInContext(`
  const before = RANDOM_STATE;
  const res = assessCommunication(globalThis.sCustom, "victoria-office-application");
  const after = RANDOM_STATE;
  ({ beforeRngState: before, afterRngState: after, assessment: res });
`, ctx);

assert.equal(beforeRngState, afterRngState, 'assessCommunication must be pure and consume no RNG');
assert.equal(typeof assessment.understood, 'boolean');

console.log('--- Test 7: Condition evaluation with ok() ---');
const { condPass, condFail, condAssisted } = vm.runInContext(`
  const mockTags = new Set(["成人", "就労中"]);
  const p = ok({ lang: { language: "victorian", mode: "read", threshold: 35 } }, globalThis.sCustom, mockTags);
  const f = ok({ lang: { language: "victorian", mode: "read", threshold: 70 } }, globalThis.sCustom, mockTags);
  globalThis.sCustom.languageState.accessArrangements.push({
    kind: "helper", languageId: "victorian", mode: "read",
    region: "ヴィクトリア", year: sCustom.year,
    expiresYear: sCustom.year, purpose: "language-condition"
  });
  const a = ok({ lang: { language: "victorian", mode: "read", threshold: 55, alternatives: ["helper"] } }, globalThis.sCustom, mockTags);
  ({ condPass: p, condFail: f, condAssisted: a });
`, ctx);

assert.equal(condPass, true);
assert.equal(condFail, false);
assert.equal(condAssisted, true);

console.log('--- Test 8: applyLanguageAction effect execution ---');
const { afterRead, cantComprehension } = vm.runInContext(`
  applyLanguageAction(globalThis.sCustom, { type: "learn", languageId: "victorian", mode: "read", amount: 10 });
  const readVal = getLanguageSkill(globalThis.sCustom, "victorian", "read");
  applyLanguageAction(globalThis.sCustom, { type: "repertoire", cantId: "ursus_mine_jargon", amount: 25 });
  const cantVal = globalThis.sCustom.languageState.repertoires["ursus_mine_jargon"].comprehension;
  ({ afterRead: readVal, cantComprehension: cantVal });
`, ctx);

assert.equal(afterRead, 50);
assert.equal(cantComprehension, 25);

console.log('--- Test 9: State audit validation ---');
const { validProblems, corruptedProblems } = vm.runInContext(`
  born({ region: "ヴィクトリア", by: 1077, seed: 7777 });
  const realS = currentLifeState();
  const vProblems = auditLifeState(realS);
  const corrupted = JSON.parse(JSON.stringify(realS));
  corrupted.languageState.skills.victorian.read = 999;
  const cProblems = auditLifeState(corrupted);
  ({ validProblems: vProblems, corruptedProblems: cProblems });
`, ctx);

assert.equal(validProblems.some(p => p.includes('言語状態')), false);
assert(corruptedProblems.some(p => p.includes('言語状態')), 'Audit must reject corrupted language skills');

console.log('--- Test 10: Save and resume normalization roundtrip ---');
const normalized = vm.runInContext(`
  annualSetup = true;
  born({ region: "ヴィクトリア", by: 1077, seed: 9999 });
  const snapshot = makeResumeSnapshot();
  normalizeResumeImport(snapshot);
`, ctx);

assert(normalized.S.languageState, 'Language state must survive resume save roundtrip');
assert.equal(normalized.S.languageState.version, 1);

console.log('--- Test 11: Annual progression ---');
const { initListen, afterTickListen } = vm.runInContext(`
  born({ region: "ヴィクトリア", by: 1077, seed: 1111 });
  const initListen = getLanguageSkill(S, "victorian", "listen");
  tick(); // Advance 1 year
  const afterTickListen = getLanguageSkill(S, "victorian", "listen");
  ({ initListen, afterTickListen });
`, ctx);

assert(afterTickListen >= initListen, 'Annual language progression must advance natural exposure');

console.log('--- Test 12: Language UI presentations (Profile, Ledger Details, Ledger Metrics) ---');
const { profileSummary, ledgerHtml, workMetric } = vm.runInContext(`
  const prof = formatLanguageSummaryForProfile(globalThis.sCustom);
  const ledger = formatLanguageLearningDetails(globalThis.sCustom);
  const metric = formatLanguageMetric(globalThis.sCustom);
  ({ profileSummary: prof, ledgerHtml: ledger, workMetric: metric });
`, ctx);

assert(profileSummary.includes('ターラーの家庭言語'), 'Profile summary must include home language');
assert(profileSummary.includes('ヴィクトリアの言葉'), 'Profile summary must include second language');
assert(ledgerHtml.includes('ui-language-roster'), 'Ledger details must contain ui-language-roster');
assert(ledgerHtml.includes('聴解'), 'Ledger details must display four skill modes');
assert(ledgerHtml.includes('現場語彙・符牒・スラング'), 'Ledger details must show acquired repertoires');
assert(ledgerHtml.includes('ウルサス鉱山の現場俗語'), 'Ledger details must show repertoire name');
assert(workMetric.includes('ターラーの家庭言語') || workMetric.includes('ヴィクトリアの言葉'), 'Work ledger metric must show primary language');

assert.equal(typeof TERRA_RULES.services.language.formatProfileSummary, 'function');
assert.equal(typeof TERRA_RULES.services.language.formatLedgerDetails, 'function');
assert.equal(typeof TERRA_RULES.services.language.formatMetric, 'function');

console.log('ALL LANGUAGE SYSTEM TESTS PASSED SUCCESSFULLY!');
