'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const nodes = new Map(),
  storage = new Map();
let createdNode = 0;
function node(id) {
  if (!nodes.has(id))
    nodes.set(id, {
      id,
      hidden: false,
      value: '',
      textContent: '',
      innerHTML: '',
      dataset: {},
      style: {},
      children: [],
      classList: { toggle() {}, add() {}, remove() {} },
      setAttribute() {},
      append(...items) {
        this.children.push(...items);
      },
      appendChild(item) {
        this.children.push(item);
      },
      insertAdjacentHTML(_position, text) {
        this.innerHTML += text;
      },
      replaceChildren(...items) {
        this.children = items;
        this.innerHTML = '';
      },
      querySelectorAll() {
        return [];
      },
      addEventListener() {},
      focus() {},
      click() {}
    });
  return nodes.get(id);
}
const document = {
  currentScript: null,
  getElementById: node,
  querySelectorAll() {
    return [];
  },
  createElement(tag) {
    return {
      tagName: tag.toUpperCase(),
      value: '',
      textContent: '',
      selected: false,
      children: [],
      append(...items) {
        this.children.push(...items);
      }
    };
  },
  createTextNode(text) {
    return { textContent: text };
  },
  addEventListener() {},
  activeElement: { tagName: 'BODY' },
  documentElement: { style: { setProperty() {} }, removeAttribute() {}, setAttribute() {} },
  head: { appendChild() {} }
};
const context = vm.createContext({
  window: require('./support/annual-cases.cjs').mockBrowserWindow(),
  document,
  console,
  Date,
  setTimeout() {},
  setInterval() {},
  alert() {},
  confirm() {
    return true;
  },
  localStorage: {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, String(value))
  }
});
const runtime = require('../tools/runtime.cjs');
const documentHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
context.documentHtml = documentHtml;
vm.runInContext(runtime.readData(root), context, { timeout: 30000 });
vm.runInContext(runtime.readEngine(root), context, { timeout: 30000 });
vm.runInContext("HL=0;AU='r';STAT.ev={};STAT.op={};STAT.choiceMonths=new Set();rd=()=>{};L=()=>{};tab=()=>{};", context);
const result = JSON.parse(JSON.stringify(vm.runInContext(
  `(() => {
    const picker = $('birth-year'), choices = window.GAME_DATA.EV;
    const historyDiscovery = HIST.find(row => row.flag === 'sarcophagus_discovery');
    const rebellion = HIST.find(row => row.flag === 'ursus_great_rebellion');
    const sandSoldiers = HIST.find(row => row.flag === 'sandsoldier_incident');
    const elSolFoundation = HIST.find(row => row.flag === 'el_sol_founded');
    const elSolRename = HIST.find(row => row.flag === 'el_sol_renamed_dossoles');
    const worksite = choices.find(row => row.id === 'life_chernobog_worksite_errand');
    const reopening = choices.find(row => row.id === 'life_chernobog_neighbourhood_reopening');
    const setResident = (by, age, year, city = 'チェルノボーグ') => {
      born({ seed: 917001, by, region: 'ウルサス' });
      S.age = age;
      S.year = year;
      S.res = REG.find(row => row.n === 'ウルサス');
      S.home = '移動都市';
      S.local = { ...makeLocality(S.home, S.res.n, '移動都市の居住区'), city };
      S.birthLocality = { region: 'ウルサス', city, home: '移動都市', kind: '移動都市の居住区' };
      S.world.events.sarcophagus_discovery = 1070;
      S.world.events.chernobog_incident = 1096;
      return S;
    };
    const citySamples = (region, year, count = 1200, month = null) => {
      const result = [];
      for (let seed = 1; seed <= count; seed++) {
        seedLifeRandom(seed);
        result.push(makeLocality('移動都市', region, undefined, year, month).city);
      }
      return result;
    };
    const preLaunch = citySamples('ボリバル', 1006);
    const elSolYears = citySamples('ボリバル', 1085);
    const postRenameYears = citySamples('ボリバル', 1086);
    const preGrypherburg = citySamples('ウルサス', 1032);
    const grypherburgTransitionYear = citySamples('ウルサス', 1033);
    const postGrypherburgTransition = citySamples('ウルサス', 1034);
    const preZelgrad = citySamples('ウルサス', 1099);
    const firstZelgradYear = citySamples('ウルサス', 1100, 8000);
    const postZelgrad = citySamples('ウルサス', 1101, 8000);
    const siestaBeforeMigration = citySamples('シエスタ', 1097, 1200, 7);
    const siestaAfterFestival = citySamples('シエスタ', 1097, 1200, 8);
    const siestaFirstFullYear = citySamples('シエスタ', 1098, 1200, 1);
    const siestaBirthHomeBeforeMigration = chooseHomeForRegion('シエスタ', 0.1, 0.32, 1096, null);
    const siestaBirthHomeUnknownMonth = chooseHomeForRegion('シエスタ', 0.1, 0.32, 1097, null);
    const siestaResidenceAfterFestival = chooseHomeForRegion('シエスタ', 0.1, 0.32, 1097, 8);
    const siestaMobileRequestBeforeFestival = normalizeHomeForRegion('移動都市', 'シエスタ', 1097, 7);
    const legacyMobileSiesta = {
      res: { n: 'シエスタ' }, home: '移動都市', year: 1097,
      local: { kind: '移動都市の居住区', city: 'シエスタ' }
    };
    repairResidenceModel(legacyMobileSiesta);
    const preCrisisCityResident = setResident(1082, 18, 1100, 'ゼルグラード');
    preCrisisCityResident.job = 2;
    const zelgradEvents = choices.filter(row => row.id?.includes('life_ursus_zelgrad'));
    const zelgradRoutesHiddenBeforeCrisis = zelgradEvents.every(row => !elig(row, preCrisisCityResident, tags(preCrisisCityResident)));
    const cityDrawCounts = [1033, 1034].map(year => {
      let draws = 0;
      DEBUG_RANDOM = () => { draws++; return 0.99; };
      makeLocality('移動都市', 'ウルサス', undefined, year);
      DEBUG_RANDOM = null;
      return draws;
    });
    const zelgradDrawCounts = [1099, 1100, 1101].map(year => {
      let draws = 0;
      DEBUG_RANDOM = () => { draws++; return 0.99; };
      makeLocality('移動都市', 'ウルサス', undefined, year);
      DEBUG_RANDOM = null;
      return draws;
    });
    const oldCity = { res: { n: 'ウルサス' }, local: { city: 'チェルノボーグ' } };
    const awayCity = { res: { n: 'ウルサス' }, local: { city: 'ゼルグラード' } };
    const anonymousCity = { res: { n: 'ウルサス' }, local: { city: null } };
    const youngLocal = setResident(1091, 6, 1097);
    youngLocal.mo = 1;
    const youngReopeningHiddenInJanuary = !elig(reopening, youngLocal, tags(youngLocal));
    youngLocal.mo = 2;
    const youngReopeningVisible = elig(reopening, youngLocal, tags(youngLocal));
    const eligibleWorksite = setResident(1050, 20, 1070);
    const worksiteVisible = elig(worksite, eligibleWorksite, tags(eligibleWorksite));
    const wrongCity = { ...eligibleWorksite, local: { ...eligibleWorksite.local, city: 'ゼルグラード' } };
    const worksiteHiddenOutsideCity = !elig(worksite, wrongCity, tags(wrongCity));
    const oldCityNameState = {
      res: { n: 'ボリバル' }, home: '移動都市', year: 1086,
      local: { city: 'エル・ソル' }, birthLocality: { city: 'エル・ソル' }
    };
    repairHistoricalCityName(oldCityNameState);
    return {
      yearBounds: [Number(picker.min), Number(picker.max)],
      defaultSelected: picker.value,
      htmlOffersDefault: documentHtml.includes('beginLifeAtSelectedYear()') && documentHtml.includes('1077年'),
      cityTableHasElSol: window.GAME_DATA.SIM_TABLES.namedCities['ボリバル'].includes('エル・ソル'),
      historyCityMatches: historyIsNearby(historyDiscovery, oldCity),
      historyCityRejectsOtherNamedCity: !historyIsNearby(historyDiscovery, awayCity),
      historyCityRejectsUnspecifiedCity: !historyIsNearby(historyDiscovery, anonymousCity),
      preLaunchHasNoCity: preLaunch.every(city => city == null),
      elSolOnlyBeforeRename: elSolYears.every(city => city == null || city === 'エル・ソル'),
      hasElSolExample: elSolYears.includes('エル・ソル'),
      DossolesOnlyAfterRename: postRenameYears.every(city => city == null || city === 'ドッソレス'),
      hasDossolesExample: postRenameYears.includes('ドッソレス'),
      noGrypherburgMobileCityBeforeTransition: preGrypherburg.every(city => city !== 'サンクト・グリファーブルク'),
      grypherburgTransitionYearIsConservative: grypherburgTransitionYear.every(city => city !== 'サンクト・グリファーブルク'),
      grypherburgAvailableAfterTransitionYear: postGrypherburgTransition.includes('サンクト・グリファーブルク'),
      grypherburgDrawCounts: cityDrawCounts,
      grypherburgBoundaryPreservesRandomDraws: cityDrawCounts[0] === 7 && cityDrawCounts[1] === 7,
      zelgradFirstYearAvailable: firstZelgradYear.includes('ゼルグラード'),
      noZelgradBeforeEstablishment: preZelgrad.every(city => city !== 'ゼルグラード'),
      zelgradAvailableAfterEstablishment: postZelgrad.includes('ゼルグラード'),
      zelgradDrawCounts,
      noSiestaMobileCityBeforeJuly: siestaBeforeMigration.every(city => city == null),
      siestaMigrationCityAfterFestival: siestaAfterFestival.includes('シエスタ'),
      siestaCityAvailableInNextYear: siestaFirstFullYear.includes('シエスタ'),
      siestaBirthsStayFixedBeforeMigration: [siestaBirthHomeBeforeMigration, siestaBirthHomeUnknownMonth].every(home => home === '固定集落'),
      siestaResidentsCanMoveAfterFestival: siestaResidenceAfterFestival === '移動都市',
      siestaMobileRequestRejectedBeforeFestival: siestaMobileRequestBeforeFestival === '固定集落',
      legacySiestaHomePreserved: legacyMobileSiesta.home === '移動都市' && legacyMobileSiesta.local.city === 'シエスタ',
      zelgradRoutesHiddenBeforeCrisis,
      zelgradRouteCount: zelgradEvents.length,
      worksiteVisible,
      worksiteHiddenOutsideCity,
      youngReopeningVisible,
      youngReopeningHiddenInJanuary,
      worksiteSourcesExist: worksite.references.every(id => !!window.GAME_DATA.SETTING_SOURCES[id]),
      birthLocalityTraceCaptured: traceState(eligibleWorksite).birthLocality.city === 'チェルノボーグ',
      timelineSourcesExist: historyDiscovery.references.every(id => !!window.GAME_DATA.SETTING_SOURCES[id]),
      chronologyAnchors: [elSolFoundation.y, rebellion.y, sandSoldiers.y],
      dossolesRenameIsLocalAndLowConfidence: elSolRename?.y === 1086 && elSolRename.city === 'ドッソレス' && elSolRename.conf === 'D' && elSolRename.infoScope === 'local_news',
      sandSoldierRegion: sandSoldiers.r[0],
      sandSoldierNotConfusedWithChernobog: !sandSoldiers.t.includes('チェルノボーグ'),
      birthLocalitySurvivesMove: (() => {
        const birth = eligibleWorksite.birthLocality;
        eligibleWorksite.local.city = 'ゼルグラード';
        return birth.city === 'チェルノボーグ' && eligibleWorksite.birthLocality === birth;
      })(),
      namedCityAfterRename: oldCityNameState.local.city,
      birthCityNamePreserved: oldCityNameState.birthLocality.city
    };
  })()`,
  context,
  { timeout: 60000 }
)));
assert.deepEqual(result.yearBounds, [1000, 1100], 'the year input covers 1000 through 1100');
assert.equal(result.defaultSelected, '1077');
assert(result.htmlOffersDefault, 'the initial screen offers an unselected 1077 default');
assert(result.cityTableHasElSol);
assert(result.historyCityMatches && result.historyCityRejectsOtherNamedCity && result.historyCityRejectsUnspecifiedCity);
assert(result.preLaunchHasNoCity, 'the city is not assigned before it exists');
assert(result.elSolOnlyBeforeRename && result.hasElSolExample);
assert(result.DossolesOnlyAfterRename && result.hasDossolesExample);
assert(result.noGrypherburgMobileCityBeforeTransition, 'St. Grypherburg is not a mobile-city location before the 1033 transition');
assert(result.grypherburgTransitionYearIsConservative, 'the uncertain 1033 transition year is excluded from whole-year birthplace draws');
assert(result.grypherburgAvailableAfterTransitionYear, 'the city becomes available after the 1033 transition year');
assert(result.grypherburgBoundaryPreservesRandomDraws, 'the city boundary does not shift other locality rolls: ' + JSON.stringify(result.grypherburgDrawCounts));
assert(result.noZelgradBeforeEstablishment && result.zelgradFirstYearAvailable && result.zelgradAvailableAfterEstablishment);
assert.deepEqual(result.zelgradDrawCounts, [7, 7, 8], 'the 1100 city candidate adds no random draw and leaves later-year draws unchanged');
assert(result.noSiestaMobileCityBeforeJuly && result.siestaMigrationCityAfterFestival && result.siestaCityAvailableInNextYear,
  'Siesta is not assigned as a mobile city before the 1097 summer festival boundary');
assert(result.siestaBirthsStayFixedBeforeMigration && result.siestaResidentsCanMoveAfterFestival && result.siestaMobileRequestRejectedBeforeFestival,
  '1097 births without a known month stay in fixed settlements, while later relocation is allowed');
assert(result.legacySiestaHomePreserved, 'a previously saved Siesta mobile residence is not rewritten');
assert(result.zelgradRoutesHiddenBeforeCrisis, 'the 1100 birthplace candidate does not unlock later Zelgrad crisis/labor routes early');
assert(result.worksiteVisible && result.worksiteHiddenOutsideCity, JSON.stringify(result));
assert(result.youngReopeningHiddenInJanuary && result.youngReopeningVisible, 'a young Chernobog resident sees local aftermath after the incident window without becoming a decision-maker for adults');
assert(result.worksiteSourcesExist && result.timelineSourcesExist);
assert(result.birthLocalityTraceCaptured, 'the birthplace city is included in the versioned life trace');
assert.deepEqual(result.chronologyAnchors, [1007, 1074, 1075]);
assert(result.dossolesRenameIsLocalAndLowConfidence);
assert.equal(result.sandSoldierRegion, 'サルゴン');
assert(result.sandSoldierNotConfusedWithChernobog);
assert(result.birthLocalitySurvivesMove);
assert.deepEqual([result.namedCityAfterRename, result.birthCityNamePreserved], ['ドッソレス', 'エル・ソル']);
const selectedYear = year => {
  node('birth-year').value = String(year);
  context.beginLifeAtSelectedYear();
  return JSON.parse(JSON.stringify(vm.runInContext('({by:S.by,year:S.year})', context)));
};
context.born();
assert.equal(vm.runInContext('S.by', context), 1077, 'omitting a year defaults to 1077');
assert.deepEqual(selectedYear(1000), { by: 1000, year: 1000 });
assert.deepEqual(selectedYear(1100), { by: 1100, year: 1100 });
const beforeInvalid = vm.runInContext('S.by', context);
selectedYear(1101);
assert.equal(vm.runInContext('S.by', context), beforeInvalid, 'out-of-range UI input does not start a life');
assert(node('birth-year-error').textContent.includes('1000〜1100'));
vm.runInContext('S.birthLocality=undefined; repairResidenceModel(S); hist();', context);
assert.equal(vm.runInContext('S.birthLocality', context), undefined, 'legacy records keep an unknown birthplace city instead of guessing');
for (const [region, share] of [['サーミ', 0.03], ['サルゴン', 0.04]]) {
  for (const fallback of [0, 1]) {
    context.regionalHomeCase = { region, share, fallback };
    assert.equal(vm.runInContext('chooseHomeForRegion(regionalHomeCase.region, regionalHomeCase.share - 0.000001, regionalHomeCase.fallback)', context), '移動都市');
    assert.equal(vm.runInContext('chooseHomeForRegion(regionalHomeCase.region, regionalHomeCase.share, regionalHomeCase.fallback)', context), '固定集落');
  }
}
for (const region of ['イベリア', 'イェラグ']) {
  context.regionalHomeCase = { region };
  assert.equal(vm.runInContext('chooseHomeForRegion(regionalHomeCase.region, 0, 1)', context), '固定集落');
  assert.equal(vm.runInContext("normalizeHomeForRegion('移動都市', regionalHomeCase.region)", context), '固定集落');
}
assert.equal(vm.runInContext("chooseHomeForRegion('ヴィクトリア', 0.2, 0.3)", context), '移動都市');
assert.equal(vm.runInContext("chooseHomeForRegion('ヴィクトリア', 0.3, 0.3)", context), '固定集落');

const localityZeroReview = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const initial = birthLocalityWeightPool([{n:'A',w:60},{n:'B',w:40}],{A:0,B:30});
  const fallback = birthLocalityWeightPool([{n:'A',w:60},{n:'B',w:40}],{A:0,B:0});
  const uniform = birthLocalityWeightPool([{n:'A',w:0},{n:'B',w:0}],{A:0,B:0});
  const oldRandom = DEBUG_RANDOM;
  let draws = 0;
  const invalid = [];
  try {
    for (const home of ['移動都市','固定集落'])
      for (let wealth=0;wealth<5;wealth++)
        for (const infected of [false,true])
          for (const displaced of [false,true]) {
            const forbidden = [];
            if (home === '移動都市') {
              if (displaced || (infected && wealth < 4)) forbidden.push('移動都市の居住区');
              if (!displaced && !infected && wealth >= 3) forbidden.push('移動都市の避難・労働区画');
            } else {
              if (displaced || (infected && wealth < 4)) forbidden.push('固定都市の街区');
              if (!displaced && !infected && wealth >= 3) forbidden.push('辺境・移動の多い居住地');
            }
            for (let i=0;i<128;i++) {
              DEBUG_RANDOM = () => (i+0.5)/128;
              const chosen = pickBirthLocalityKind(home,{st:0.8},{i:wealth},
                {fa:{inf:infected},mo:{inf:false}},
                {kind:displaced?'避難・離散した世帯で育つ':'両親と暮らす'});
              draws++;
              if (forbidden.includes(chosen)) invalid.push({home,wealth,infected,displaced,chosen});
            }
          }
  } finally { DEBUG_RANDOM = oldRandom; }
  return {initial,fallback,uniform,draws,invalid};
})()`,context)));
assert.deepEqual(localityZeroReview.initial,[{n:'A',w:0},{n:'B',w:30}],
  'explicit zero weights remain excluded');
assert.deepEqual(localityZeroReview.fallback,[{n:'A',w:60},{n:'B',w:40}],
  'an impossible all-zero override returns to the authored base distribution');
assert.deepEqual(localityZeroReview.uniform,[{n:'A',w:1},{n:'B',w:1}],
  'even an all-zero base table remains drawable');
assert.equal(localityZeroReview.draws,5120);
assert.deepEqual(localityZeroReview.invalid,[],'zero-weight birth localities are never selected');

console.log(JSON.stringify({
  passed: true,
  scope: 'birth-year start flow, historical city naming, city-filtered history, and local event gates',
  selectableYears: 101,
  defaultYear: 1077,
  auditedCityTransitions: ['El Sol', 'Dossoles', 'St. Grypherburg 1033/1034', 'Zelgrad'],
  grypherburgBoundaryDraws: result.grypherburgDrawCounts,
  localHistoryAndEvents: 3
}, null, 2));
