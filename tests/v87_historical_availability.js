'use strict';
const path = require('node:path');
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const document = {
  currentScript: null,
  getElementById() {
    return { hidden: false, textContent: '', value: '', dataset: {}, innerHTML: '', insertAdjacentHTML() {}, replaceChildren() {} };
  },
  querySelectorAll() { return []; }
};
const context = {
  window: {}, document, console, Date,
  localStorage: { getItem() { return null; }, setItem() {} },
  setTimeout() {}, setInterval() {}
};
const runtime = require('../tools/runtime.cjs');
vm.runInNewContext(runtime.readData(root), context, { timeout: 30000 });
vm.runInNewContext(runtime.readEngine(root).split('/* ===== UI ===== */')[0], context, { timeout: 30000 });
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/save/resume.js'), 'utf8'), context, { timeout: 15000 });
vm.runInContext("HL=0;AU='r';STAT.ev={};STAT.op={};STAT.choiceMonths=new Set();L=()=>{};rd=()=>{};", context);

const data = context.window.GAME_DATA;
assert.match(fs.readFileSync(path.join(root, 'js/events/dispatch.js'), 'utf8'), /activateHistoricalWorldEvents\(s\);\s*releasePendingHistoricalNews\(s\);/, 'monthly slots activate dated flags before releasing held news');
const event = id => data.EV.find(row => row.id === id);
const history = flag => data.HIST.find(row => row.flag === flag);
assert.equal(data.HIST.length, 37, 'the historical scope inventory covers every current anchor');
assert.equal(new Set(data.HIST.map(row => row.flag)).size, data.HIST.length, 'historical flags are unique');
const historicalScopeCounts = data.HIST.reduce((counts, row) => {
  const scope = row.infoScope || 'public';
  counts[scope] = (counts[scope] || 0) + 1;
  return counts;
}, {});
assert.deepEqual(historicalScopeCounts, { local_news: 17, public: 10, local_rumor: 5, sealed: 5 },
  'the documented information-scope totals match the current history catalog');
assert(data.HIST.filter(row => row.infoScope === 'sealed').every(row => !row.e),
  'sealed historical entries cannot retain personal news effects that the receipt path never applies');
assert.match(history('thelazia_dead')?.t || '', /テレジアが暗殺された。その後、カズデル軍事委員会がロンディニウムへ進駐した。/,
  'the Theresa report distinguishes the assassination from the later advance without inventing a separate date');
assert.equal(history('victoria_leak')?.infoScope, 'local_rumor',
  'the unresolved Victoria incident remains a local rumor rather than distant public news');
assert.equal(history('talulah_leave')?.infoScope, 'sealed',
  'an individual departure with unresolved location is not automatically broadcast as public news');
const bolivarWarEvent = event('bol_war');
assert.equal(bolivarWarEvent.ge.year, 1048, 'Bolivar civil-war life events cannot appear before the recorded 1048 start');
assert.deepEqual([...bolivarWarEvent.need], ['国:ボリバル'],
  'Bolivar civil-war life events require residence in the affected country');
assert.equal(typeof bolivarWarEvent.show, 'function', 'the Bolivar event checks world chronology separately from personal knowledge');
const bolivarWarAvailability = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed:871048,by:1018,region:'ボリバル'});
  S.age=30;S.res=REG.find(row=>row.n==='ボリバル');
  const row=EV.find(item=>item.id==='bol_war');
  S.year=1047;S.mo=12;activateHistoricalWorldEvents(S);
  const beforeFlag=!!S.world.events.bolivar_civil_war,before=elig(row,S,tags(S));
  S.year=1048;S.mo=1;activateHistoricalWorldEvents(S);
  const startFlag=!!S.world.events.bolivar_civil_war,inside=elig(row,S,tags(S));
  const personallyKnown=!!S.known.bolivar_civil_war;
  delete S.world.events.bolivar_civil_war;
  const missingFlag=elig(row,S,tags(S));
  const currentCountry=S.res;
  S.res=REG.find(row=>row.n==='クルビア');
  S.world.events.bolivar_civil_war=1048;
  const outsideCountry=elig(row,S,tags(S));
  return {beforeFlag,before,startFlag,inside,personallyKnown,missingFlag,outsideCountry,countryRestored:S.res!==currentCountry};
})()`, context)));
assert.deepEqual(bolivarWarAvailability,
  {beforeFlag:false,before:false,startFlag:true,inside:true,personallyKnown:false,missingFlag:false,outsideCountry:false,countryRestored:true},
  'Bolivar civil-war life events begin with the historical world flag without requiring personal news, and remain local to Bolivar');
const historyPanelNodes = new Map();
const historyPanelServices = {
  $: id => {
    if (!historyPanelNodes.has(id)) historyPanelNodes.set(id, { innerHTML: "" });
    return historyPanelNodes.get(id);
  },
  lifeRows: () => [],
  esc: value =>
    String(value).replace(/[&<>"']/g, char =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]
    ),
  lifeRecordMarkup: () => "",
  basisMarkup: () => "",
  HIST: data.HIST,
  SETTING_SOURCES: data.SETTING_SOURCES || {},
  informationClaimLaterReportMarkup: () => ""
};
vm.runInNewContext(fs.readFileSync(path.join(root, "js/ui/panels/life-and-knowledge.js"), "utf8"), context);
context.renderLifeAndKnowledgePanel(
  {
    known: {
      columbia_independence: 1,
      rim_billiton_independence: 1,
      sandsoldier_incident: 1,
      victoria_leak: 1
    },
    infoLog: []
  },
  historyPanelServices
);
const historyPanelMarkup = historyPanelNodes.get("known").innerHTML;
assert.match(historyPanelMarkup, /<b>1019年<\/b>/, "precise annual anchors retain their year label");
assert.match(historyPanelMarkup, /<b>1070年代<\/b>/, "decade-only history does not display its internal representative year");
assert.match(historyPanelMarkup, /<b>1075〜1076年頃<\/b>/, "a contested absolute year is displayed as an approximate range");
assert.match(historyPanelMarkup, /<b>1084〜1085年頃<\/b>/, "a disputed year remains a range in the player knowledge panel");
assert.doesNotMatch(historyPanelMarkup, /<b>1075年<\/b>|<b>1085年<\/b>/, "the panel does not expose those internal anchors as exact years");
const theresaAftermathKnowledge = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({ seed: 109409, by: 1064, region: 'ヴィクトリア' });
  S.age = 30; S.year = 1094; S.mo = 9;
  S.world.events.thelazia_dead = 1094;
  const event = EV.find(row => typeof row.t === 'string' && row.t.startsWith('食堂で一人の名が出ると'));
  const eventFlagOnly = elig(event, S, tags(S));
  S.known.thelazia_dead = 1;
  const receivedNews = elig(event, S, tags(S));
  return { eventId: event.id, eventFlagOnly, receivedNews };
})()`, context)));
assert.equal(theresaAftermathKnowledge.eventFlagOnly, false,
  'the global 1094 event flag alone does not give a person knowledge of the assassination');
assert.equal(theresaAftermathKnowledge.receivedNews, true,
  'the aftermath scene remains available after the person has recorded the news as known');
const reopeningBoundary = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({ seed: 109701, by: 1091, region: 'ウルサス' });
  S.age = 6; S.year = 1097; S.mo = 1;
  S.res = REG.find(row => row.n === 'ウルサス');
  S.home = '移動都市'; S.local = { ...makeLocality(S.home, 'ウルサス'), city: 'チェルノボーグ' };
  S.world.events.chernobog_incident = 1096;
  const reopening = EV.find(row => row.id === 'life_chernobog_neighbourhood_reopening');
  const january = elig(reopening, S, tags(S));
  S.mo = 2; const february = elig(reopening, S, tags(S));
  S.year = 1098; S.mo = 1; const followingJanuary = elig(reopening, S, tags(S));
  S.year = 1099; S.mo = 1; const lateNotice = elig(reopening, S, tags(S));
  return { january, february, followingJanuary, lateNotice };
})()`, context)));
assert.deepEqual({ ...reopeningBoundary }, { january: false, february: true, followingJanuary: true, lateNotice: false },
  'Chernobog school-reopening notice begins after the crisis and cannot first appear years later');
const acuteChernobogRoutes = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const setup = (year, month, age, role = null) => {
    born({ seed: 871096, by: year - age, region: 'ウルサス' });
    S.age = age; S.year = year; S.mo = month;
    S.res = REG.find(row => row.n === 'ウルサス');
    S.home = '移動都市';
    S.local = { ...makeLocality(S.home, 'ウルサス'), city: 'チェルノボーグ' };
    S.inf = true;
    S.world.events.chernobog_incident = 1096;
    if (role) S.lifeRecord.affiliations.push({ id: 'reunion-1096', status: 'active', role });
    return S;
  };
  const eligible = id => {
    const row = EV.find(item => item.id === id);
    return elig(row, S, tags(S));
  };
  setup(1096, 11, 15);
  const schoolBefore = eligible('life_ursus_school_aid');
  S.mo = 12; const schoolDecember = eligible('life_ursus_school_aid');
  S.year = 1097; S.age = 16; S.mo = 1; const schoolJanuary = eligible('life_ursus_school_aid');
  S.mo = 2; const schoolAfter = eligible('life_ursus_school_aid');
  setup(1097, 1, 20);
  const localEntryJanuary = eligible('life_reunion_local_entry');
  S.mo = 2; const localEntryFebruary = eligible('life_reunion_local_entry');
  S.year = 1098; S.mo = 1; const localEntryLater = eligible('life_reunion_local_entry');
  setup(1096, 12, 20, 'チェルノボーグ臨時拠点・物資配給');
  const assignmentDecember = eligible('life_reunion_chernobog_base_assignment');
  const dailyDecember = eligible('life_reunion_chernobog_base_daily');
  S.year = 1097; S.age = 21; S.mo = 1;
  const assignmentJanuary = eligible('life_reunion_chernobog_base_assignment');
  const dailyJanuary = eligible('life_reunion_chernobog_base_daily');
  S.mo = 2;
  const assignmentAfter = eligible('life_reunion_chernobog_base_assignment');
  const dailyAfter = eligible('life_reunion_chernobog_base_daily');
  setup(1097, 11, 16);
  S.lifeRecord.affiliations.push({ id: 'ursus-school-aid', status: 'active', role: '同級生一人との便り・避難先の連絡' });
  S.sn.life_ursus_school_aid = 1096;
  const schoolFollowupNovember = eligible('life_ursus_school_aid_followup');
  S.mo = 12; const schoolFollowupDecember = eligible('life_ursus_school_aid_followup');
  S.year = 1098; S.age = 17; S.mo = 1;
  const schoolFollowupJanuary = eligible('life_ursus_school_aid_followup');
  S.mo = 2; const schoolFollowupFebruary = eligible('life_ursus_school_aid_followup');
  S.year = 1099; S.age = 18; S.mo = 1;
  const schoolFollowupLate = eligible('life_ursus_school_aid_followup');
  setup(1096, 12, 20, 'チェルノボーグ臨時拠点・物資配給');
  S.sn.life_reunion_chernobog_base_assignment = 1096;
  S.year = 1097; S.age = 21; S.mo = 1;
  const conflictJanuary = eligible('life_reunion_order_conflict');
  S.mo = 2; const conflictFebruary = eligible('life_reunion_order_conflict');
  S.mo = 3; const conflictAfter = eligible('life_reunion_order_conflict');
  setup(1097, 1, 21, 'チェルノボーグ臨時拠点・物資配給');
  S.sn.life_reunion_chernobog_base_assignment = 1097;
  S.mo = 2; const conflictNextMonthAfterJanuaryAssignment = eligible('life_reunion_order_conflict');
  return {
    schoolBefore, schoolDecember, schoolJanuary, schoolAfter,
    localEntryJanuary, localEntryFebruary, localEntryLater,
    assignmentDecember, dailyDecember, assignmentJanuary, dailyJanuary, assignmentAfter, dailyAfter,
    schoolFollowupNovember, schoolFollowupDecember, schoolFollowupJanuary, schoolFollowupFebruary, schoolFollowupLate,
    conflictJanuary, conflictFebruary, conflictAfter, conflictNextMonthAfterJanuaryAssignment
  };
})()`, context)));
assert.deepEqual(acuteChernobogRoutes, {
  schoolBefore: false, schoolDecember: true, schoolJanuary: true, schoolAfter: false,
  localEntryJanuary: true, localEntryFebruary: false, localEntryLater: false,
  assignmentDecember: true, dailyDecember: true, assignmentJanuary: true, dailyJanuary: true,
  assignmentAfter: false, dailyAfter: false, conflictJanuary: true, conflictFebruary: true, conflictAfter: false,
  schoolFollowupNovember: false, schoolFollowupDecember: true, schoolFollowupJanuary: true,
  schoolFollowupFebruary: false, schoolFollowupLate: false,
  conflictNextMonthAfterJanuaryAssignment: true
}, 'Chernobog crisis decisions and occupied-base routines stay within the late-1096/early-1097 route, before the separate aftermath period');
const sandSoldierHistory = history('sandsoldier_incident');
assert.equal(sandSoldierHistory?.y, 1075, 'the unresolved 1075/1076 historical year stays at its current low-confidence anchor');
assert.equal(sandSoldierHistory?.conf, 'D', 'the Sand Soldier absolute year remains explicitly low confidence');
assert.match(sandSoldierHistory?.availabilityBasis || '', /近似.*競合.*未確定/, 'the relative-year approximation and conflicting 1076 display remain documented');
assert.match(sandSoldierHistory?.t || '', /イバテー地方.*レッドホーン/);
assert.match(sandSoldierHistory?.t || '', /町の人々が武装衝突に巻き込まれた/);
assert.match(sandSoldierHistory?.publicText || '', /町の人々が武装衝突に巻き込まれた/);
assert.doesNotMatch(sandSoldierHistory?.t || '', /南部|開拓団|パーディシャー/,
  'the rumor no longer merges WD-1 with an unsupported southern-colony account');
assert(sandSoldierHistory?.references?.includes('SRC_SARGON_WD1_WD5'), 'the corrected event points to the WD-1 dossier');
const sandSoldierScope = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  const entry = HIST.find(row => row.flag === 'sandsoldier_incident');
  const outside = {res: {n: 'ウルサス'}, local: {}};
  const inside = {res: {n: 'サルゴン'}, local: {}};
  return {
    outsideNearby: historyIsNearby(entry, outside),
    outsideEligible: informationScopeDecision(entry, historyIsNearby(entry, outside)).eligible,
    insideNearby: historyIsNearby(entry, inside),
    insideEligible: informationScopeDecision(entry, historyIsNearby(entry, inside)).eligible
  };
})()`, context)));
assert.equal(sandSoldierScope.outsideNearby, false);
assert.equal(sandSoldierScope.outsideEligible, false, 'the Sargon-local rumor is not eligible outside its recorded region');
assert.equal(sandSoldierScope.insideNearby, true);
assert.equal(sandSoldierScope.insideEligible, true, 'Sargon residents remain eligible to hear the local rumor');
const victoriaLeakHistory = history('victoria_leak');
assert.equal(victoriaLeakHistory?.y, 1085, 'the disputed 1084/1085 year stays approximate rather than being silently resolved');
assert.equal(victoriaLeakHistory?.conf, 'C');
assert.match(victoriaLeakHistory?.availabilityBasis || '', /1085.*1084.*競合/,
  'the PV year and WD-8 relative-year reading remain explicitly unresolved');
assert.match(victoriaLeakHistory?.availabilityBasis || '', /ゲーム上の仮定/,
  'the local information boundary is identified as a gameplay model rather than canon evidence');
assert.equal(victoriaLeakHistory?.infoScope, 'local_rumor', 'the concealed Victoria incident is not a worldwide public bulletin');
assert(victoriaLeakHistory?.references?.includes('SRC_WD8_VICTORIA_SECRET_SCOPE'),
  'the event records the WD-8 source for its limited information scope');
const victoriaLeakScope = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  const entry = HIST.find(row => row.flag === 'victoria_leak');
  const outside = {res: {n: 'ウルサス'}, local: {}};
  const inside = {res: {n: 'ヴィクトリア'}, local: {}};
  return {
    outsideNearby: historyIsNearby(entry, outside),
    outside: informationScopeDecision(entry, historyIsNearby(entry, outside)),
    insideNearby: historyIsNearby(entry, inside),
    inside: informationScopeDecision(entry, historyIsNearby(entry, inside))
  };
})()`, context)));
assert.equal(victoriaLeakScope.outsideNearby, false);
assert.equal(victoriaLeakScope.outside.eligible, false, 'the Victoria rumor is not eligible for unrelated regions');
assert.equal(victoriaLeakScope.insideNearby, true);
assert.equal(victoriaLeakScope.inside.eligible, true, 'Victoria residents can still hear local rumors');
assert.equal(victoriaLeakScope.inside.chanceScale, 0.28,
  'the scoped rumor uses its configured local transmission chance');
const fourEmperorsHistory = history('four_emperors_war');
assert.match(fourEmperorsHistory?.t || '', /四国戦争は1031年に終わり/);
assert.match(fourEmperorsHistory?.t || '', /四皇会戦はその最終局面/);
assert.doesNotMatch(fourEmperorsHistory?.t || '', /四皇会戦でガリア/,
  'the final battle is no longer used as the name for the full war');
assert.match(fourEmperorsHistory?.publicText || '', /四国戦争の末/);
assert.match(fourEmperorsHistory?.availabilityBasis || '', /四国戦争と四皇会戦を区別/);
assert(fourEmperorsHistory?.references?.includes('SRC_COMMUNITY_FOUR_NATIONS_WAR'));
const sarcophagusPurgeHistory = history('sarcophagus_purge');
assert.equal(sarcophagusPurgeHistory?.availableFromMonth, 3, 'the institute attack is available from the modeled spring boundary');
assert.equal(sarcophagusPurgeHistory?.conf, 'B', 'the episode scene header provides a stronger year/season anchor than the secondary estimate');
assert(sarcophagusPurgeHistory?.references?.includes('SRC_URSUS_EP17_1'), 'the purge is tied to the Chapter 17 primary-story transcript');
assert.match(sarcophagusPurgeHistory?.availabilityBasis || '', /別段階/,
  'the purge boundary distinguishes the 1077 institute attack from the approximate 1070 facility/discovery date');
const columbiaIndependence = history('columbia_independence');
assert.equal(columbiaIndependence?.y, 1019, 'Columbia independence retains the well-supported year');
assert.equal(columbiaIndependence?.availableFromMonth, undefined,
  'a contested season is not encoded as a fixed month boundary');
assert.doesNotMatch(`${columbiaIndependence?.t || ''} ${columbiaIndependence?.publicText || ''}`, /秋|冬|春|夏/,
  'the 1019 independence text no longer borrows the season of the separate Camp Collus scene');
assert(columbiaIndependence?.references?.includes('SRC_COMMUNITY_COLUMBIA_REVOLUTION'),
  'the year-only entry records the source for the early-1019 account and its caveat');
const columbiaBoundary = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871019, by: 1000, region: 'クルビア'});
  S.year = 1019; S.mo = 1;
  S.pendingHistoricalNews = {
    columbia_independence: {route: '近隣・地域の伝達網', infoScope: 'local_news'}
  };
  activateHistoricalWorldEvents(S);
  releasePendingHistoricalNews(S);
  return {
    available: historyAvailabilityReached(HIST.find(row => row.flag === 'columbia_independence'), S),
    active: S.world.events.columbia_independence === 1019,
    noticeReleased: !!S.known.columbia_independence && !!S.hd.columbia_independence,
    heardMonth: S.infoLog.find(row => row.id === 'columbia_independence')?.heardMonth,
    pending: !!S.pendingHistoricalNews?.columbia_independence
  };
})()`, context)));
assert.deepEqual(columbiaBoundary, {
  available: true, active: true, noticeReleased: true, heardMonth: 1, pending: false
}, 'a current life activates the year-only event and releases its queued news in January');
const scenario = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({seed: 871025, by: 1000, region: 'ウルサス'});
  const state = S;
  const active = flag => Object.hasOwn(state.world.events, flag);
  state.year = 1031;
  state.mo = 8;
  activateHistoricalWorldEvents(state);
  const beforeAutumn = !active('kazdel_commission_founded') && !active('four_emperors_war');
  state.mo = 9;
  activateHistoricalWorldEvents(state);
  const autumnOnly = active('kazdel_commission_founded') && !active('four_emperors_war');
  state.mo = 12;
  activateHistoricalWorldEvents(state);
  const lateYear = active('four_emperors_war');

  state.year = 1077;
  state.mo = 2;
  activateHistoricalWorldEvents(state);
  const sarcophagusBeforeSpring = !active('sarcophagus_purge');
  state.mo = 3;
  activateHistoricalWorldEvents(state);
  const sarcophagusAtSpring = active('sarcophagus_purge');

  state.mo = 8;
  activateHistoricalWorldEvents(state);
  const leithBeforeAutumn = !active('leith_revolution');
  state.mo = 9;
  activateHistoricalWorldEvents(state);
  const leithAfterAutumn = active('leith_revolution');

  state.year = 1094;
  state.mo = 7;
  activateHistoricalWorldEvents(state);
  const theresaBeforeBoundary = !active('thelazia_dead');
  state.mo = 8;
  activateHistoricalWorldEvents(state);
  const theresaAfterBoundary = active('thelazia_dead');

  state.year = 1096;
  state.mo = 11;
  activateHistoricalWorldEvents(state);
  const chernobogBeforeYearEnd = !active('chernobog_incident');
  state.mo = 12;
  activateHistoricalWorldEvents(state);
  const chernobogAtYearEnd = active('chernobog_incident');

  state.year = 1101;
  state.mo = 11;
  activateHistoricalWorldEvents(state);
  const katorgaBeforeWinter = !active('katorga_incident');
  state.mo = 12;
  activateHistoricalWorldEvents(state);
  const katorgaInWinter = active('katorga_incident');

  state.year = 1097;
  state.mo = 0;
  activateHistoricalWorldEvents(state);
  const priorYearEventSurvives = active('chernobog_incident');
  return {
    birthDate: state.bd,
    beforeAutumn, autumnOnly, lateYear,
    sarcophagusBeforeSpring, sarcophagusAtSpring,
    leithBeforeAutumn, leithAfterAutumn,
    theresaBeforeBoundary, theresaAfterBoundary,
    chernobogBeforeYearEnd, chernobogAtYearEnd, katorgaBeforeWinter, katorgaInWinter,
    priorYearEventSurvives
  };
})()`, context)));

assert.equal(scenario.birthDate, '月日未記録', 'new lives do not invent a birthday while age advances by simulation year');
assert(scenario.beforeAutumn && scenario.autumnOnly && scenario.lateYear, 'fresh historical flags appear at their seasonal availability boundaries');
assert(scenario.sarcophagusBeforeSpring && scenario.sarcophagusAtSpring,
  'the 1077 institute attack stays absent before Spring and appears at the modeled spring boundary');
assert(scenario.leithBeforeAutumn && scenario.leithAfterAutumn, 'the Leith Revolution flag opens in the autumn game month');
assert(scenario.theresaBeforeBoundary && scenario.theresaAfterBoundary, 'Theresa’s death remains unavailable through July and appears at the August summer-end approximation');
assert(scenario.chernobogBeforeYearEnd && scenario.chernobogAtYearEnd, 'Chernobog flags do not open before late 1096');
assert(scenario.katorgaBeforeWinter && scenario.katorgaInWinter, 'Katorga incident flags do not open before winter');
assert(scenario.priorYearEventSurvives, 'a past-year historical event remains available after the year changes');
const babelScenario = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871086, by: 1000, region: 'カズデル'});
  S.year = 1086; S.mo = 5;
  activateHistoricalWorldEvents(S);
  const beforeSummer = !Object.hasOwn(S.world.events, 'babel_split');
  S.mo = 6; activateHistoricalWorldEvents(S);
  return {beforeSummer, atSummer: Object.hasOwn(S.world.events, 'babel_split')};
})()`, context)));
assert(babelScenario.beforeSummer && babelScenario.atSummer, 'Babel split remains hidden until the game-side summer boundary');

assert.equal(history('siesta_disaster')?.availableFromMonth, 7, 'the Siesta volcanic activity report begins in the modeled summer window');
assert.equal(history('siesta_disaster')?.infoScope, 'local_news', 'the Siesta activity report is limited to local news');
assert(history('siesta_disaster')?.references?.includes('SRC_COMMUNITY_SIESTA_VOLCANIC_ACTIVITY'));
assert.match(history('siesta_disaster')?.availabilityBasis || '', /7月.*ゲーム内境界.*正史の発生日ではない/,
  'the Siesta July boundary is explicitly a gameplay approximation');
const siestaTransitionBoundary = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({seed: 871097, by: 1070, region: 'シエスタ'});
  S.age = 27; S.year = 1097; S.mo = 6;
  S.res = REG.find(row => row.n === 'シエスタ');
  S.home = '固定集落'; S.local = {...makeLocality(S.home, 'シエスタ', undefined, 1097, 6), city: null};
  const transition = EV.find(row => row.id === 'sie_volcano');
  const eligible = () => elig(transition, S, tags(S));
  activateHistoricalWorldEvents(S);
  const routeBeforeSummer = eligible();
  S.mo = 7; activateHistoricalWorldEvents(S);
  const reportAtSummerBoundary = S.world.events.siesta_disaster === 1097;
  const routeWaitsUntilAfterFestival = !eligible();
  S.mo = 8;
  const migrationGuidanceAfterFestival = eligible();
  S.year = 1098; S.mo = 1;
  const routeRemainsOpenNextYear = eligible();
  return {routeBeforeSummer,reportAtSummerBoundary,routeWaitsUntilAfterFestival,migrationGuidanceAfterFestival,routeRemainsOpenNextYear};
})()`, context)));
assert.deepEqual(siestaTransitionBoundary,
  {routeBeforeSummer:false,reportAtSummerBoundary:true,routeWaitsUntilAfterFestival:true,migrationGuidanceAfterFestival:true,routeRemainsOpenNextYear:true},
  'Siesta activity begins at the summer boundary, and migration guidance waits until after the July festival');

const siestaTransfer = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const daily = EV.find(row => row.id === 'siesta_shop_reopens_after_move');
  const transition = EV.find(row => row.id === 'sie_volcano');
  const prepareMerchant = () => {
    born({seed: 91234, by: 1070, region: 'シエスタ'});
    S.age = 25; S.year = 1097; S.mo = 8; S.job = 5; S.f = 2; S.cash = 5e5;
    S.world.events.siesta_disaster = 1097;
    S.home = '固定集落'; S.local = makeLocality(S.home, 'シエスタ');
  };
  prepareMerchant();
  const fixedBeforeDecision = elig(daily, S, tags(S));
  ap(transition.c[0].o[0][2]);
  const movedHome = S.home;
  const reopenedAfterTransfer = elig(daily, S, tags(S));
  prepareMerchant();
  ap(transition.c[2].o[0][2]);
  return {
    fixedBeforeDecision,
    movedHome,
    reopenedAfterTransfer,
    stayedHome: S.home,
    reopenAfterStaying: elig(daily, S, tags(S))
  };
})()`, context)));
assert(!siestaTransfer.fixedBeforeDecision, 'the mobile-city shop follow-up remains closed while the person still lives in the fixed settlement');
assert.equal(siestaTransfer.movedHome, '移動都市', 'the transfer result changes the lived residence form');
assert(siestaTransfer.reopenedAfterTransfer, 'the shop follow-up opens after a successful transfer');
assert.equal(siestaTransfer.stayedHome, '固定集落', 'the stay result preserves fixed-settlement residence');
assert(!siestaTransfer.reopenAfterStaying, 'the mobile-city shop follow-up stays closed when the person remains in the settlement');

const pendingNews = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871077, by: 1057, region: 'リターニア'});
  S.age = 20; S.year = 1077; S.mo = 8;
  for (const entry of HIST) {
    const id = entry.flag || entry.t;
    if (entry.flag === 'leith_revolution') continue;
    if (entry.flag) S.known[entry.flag] = 1;
    else S.hd[id] = 1;
  }
  let draws = 0, logged = '';
  DEBUG_RANDOM = () => { draws++; return 0; };
  L = text => { logged += text; };
  hist();
  const queuedBeforeAutumn = !!S.pendingHistoricalNews?.leith_revolution;
  const hiddenBeforeAutumn = !S.known.leith_revolution && !S.hd.leith_revolution && !S.world.events.leith_revolution;
  const drawsBeforeAutumn = draws;
  S.mo = 9; activateHistoricalWorldEvents(S); releasePendingHistoricalNews(S);
  DEBUG_RANDOM = null;
  return {
    queuedBeforeAutumn,
    hiddenBeforeAutumn,
    drawsBeforeAutumn,
    drawsAfterRelease: draws,
    released: !!S.known.leith_revolution && !!S.hd.leith_revolution,
    logContainsEvent: logged.includes('双子の女帝が巫王を倒し')
  };
})()`, context)));
assert(pendingNews.queuedBeforeAutumn && pendingNews.hiddenBeforeAutumn, 'news rolls before its boundary are held without revealing a future event');
assert.equal(pendingNews.drawsBeforeAutumn, 1, 'a held news success consumes the same single information roll');
assert.equal(pendingNews.drawsAfterRelease, 1, 'releasing held news does not shift later random draws');
assert(pendingNews.released && pendingNews.logContainsEvent, 'held news is recorded only after the historical boundary is reached');

const personalDepartureScope = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871091, by: 1000, region: 'ウルサス'});
  S.age = 91; S.year = 1091; S.mo = 1;
  DEBUG_RANDOM = () => 0;
  hist();
  const result = {
    worldFlag: S.world.events.talulah_leave,
    known: !!S.known.talulah_leave,
    historyRecord: !!S.hd.talulah_leave,
    received: (S.infoLog || []).some(row => row.id === 'talulah_leave'),
    scope: informationScopeDecision(HIST.find(row => row.flag === 'talulah_leave'), true)
  };
  DEBUG_RANDOM = null;
  return result;
})()`, context)));
assert.equal(personalDepartureScope.worldFlag, 1091, 'the setting event remains available as a world-history flag');
assert(personalDepartureScope.historyRecord, 'the local history ledger still records the sealed event as considered');
assert(!personalDepartureScope.known && !personalDepartureScope.received,
  'a personal departure with unestablished location/reach is not broadcast to unrelated lives');
assert.equal(personalDepartureScope.scope.eligible, false, 'sealed personal history is ineligible for every information route');
assert.equal(history('talulah_leave')?.infoScope, 'sealed');

const informationAudit = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871078, by: 1057, region: 'リターニア'});
  S.age = 20; S.year = 1077; S.mo = 9;
  S.world.events.leith_revolution = 1077;
  S.known.leith_revolution = 1; S.hd.leith_revolution = 1;
  S.infoLog.push({
    id: 'leith_revolution', eventYear: 1077, eventAvailableFromMonth: 9,
    heardYear: 1077, heardMonth: 9, route: '近隣・地域の伝達網',
    settingConfidence: 'B', infoScope: 'public', textBasis: '公開範囲に合わせた要約'
  });
  const valid = auditLifeState(S).filter(row => /年表情報/.test(row));
  S.informationResponses = [];
  const response = recordInformationResponse(S, {
    factId: 'leith_revolution', response: 'withhold-unverified-report'
  }, EV[0].id);
  response.heardMonth = 8;
  const mismatchedResponse = auditLifeState(S).filter(row => row.includes('年表情報への応答が保存済み'));
  response.heardMonth = 9;
  S.infoLog[0].heardMonth = 8;
  const early = auditLifeState(S).filter(row => row.includes('公開月より前'));
  S.infoLog[0].heardMonth = 10;
  const future = auditLifeState(S).filter(row => row.includes('現在より後の月'));
  S.infoLog[0].heardMonth = null;
  delete S.infoLog[0].eventAvailableFromMonth;
  const missingMonth = auditLifeState(S).filter(row => row.includes('情報接触記録の伝達月・公開月が不正'));
  return {valid, mismatchedResponse, early, future, missingMonth};
})()`, context)));
assert.equal(informationAudit.valid.length, 0, 'a dated historical news receipt passes state audit');
assert.equal(informationAudit.mismatchedResponse.length, 1, 'a response must preserve the hearing month from its receipt');
assert.equal(informationAudit.early.length, 1, 'the audit detects historical news recorded before its release month');
assert.equal(informationAudit.future.length, 1, 'the audit detects a same-year receipt later than the current month');
assert.equal(informationAudit.missingMonth.length, 0, 'a missing month is allowed only when the current record has no month-level precision');

for (const [flag, month] of Object.entries({
  four_emperors_war: 12,
  kazdel_commission_founded: 9,
  leith_revolution: 9,
  londinium_war: 7,
  thelazia_dead: 8,
  chernobog_incident: 12,
  kazimierz_major: 6,
  katorga_incident: 12,
  babel_split: 6,
  kazdel_war_declared: 12,
  kazdel_border_battle: 12
})) assert.equal(history(flag)?.availableFromMonth, month, `${flag} has a deliberate month-level availability boundary`);
assert.match(history('thelazia_dead')?.availabilityBasis || '', /BB-ST-1.*Summer 1094.*二次年表とは競合/,
  'the Theresa death boundary follows the in-game summer aftermath while preserving the conflicting estimate');
assert(history('thelazia_dead')?.references?.includes('SRC_KAZDEL_BBST1'),
  'the dated aftermath source is attached to the event record');
assert.match(history('babel_split')?.availabilityBasis || '', /正確な発生日を示すものではない/, 'the Babel month boundary is documented as a gameplay approximation');
assert.match(history('londinium_war')?.availabilityBasis || '', /月次近似/, 'the Londinium battle boundary is documented as a month-level approximation');
assert.equal(history('kazdel_conflict_started')?.y, 1086, 'the Kazdel civil conflict begins in 1086');
assert.equal(history('kazdel_war_declared')?.y, 1091, 'formal war declaration is a distinct event in 1091');
assert.match(history('kazdel_war_declared')?.availabilityBasis || '', /近似/, 'the 1091 winter boundary is identified as a game-side approximation');
assert.equal(history('kazdel_border_battle')?.y, 1092, 'the border battlefield is a distinct 1092 event');
assert.deepEqual([...history('kazdel_civil_war').r], ['カズデル'], 'the ongoing-war flag applies only to Kazdel');
assert.doesNotMatch(history('kazdel_civil_war').t, /始ま/, 'the 1092 ongoing-war text does not describe the war as starting that year');
assert.deepEqual([...history('texas_family_purge').r], ['クルビア'], 'the Texas family purge is located in Columbia');
assert.equal(history('texas_family_purge')?.infoScope, 'sealed', 'the inferred Texas purge date does not make the event public knowledge');
assert.equal(history('texas_family_purge')?.conf, 'C', 'the absolute Texas purge year remains explicitly uncertain');
assert.match(history('texas_family_purge')?.availabilityBasis || '', /推定/, 'the Texas purge year is documented as an inference');
const kazdelBoundaryScenario = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({seed: 871091, by: 1000, region: 'カズデル'});
  S.year = 1091; S.mo = 11;
  activateHistoricalWorldEvents(S);
  const beforeDeclaration = !Object.hasOwn(S.world.events, 'kazdel_war_declared');
  S.mo = 12; activateHistoricalWorldEvents(S);
  const atDeclaration = Object.hasOwn(S.world.events, 'kazdel_war_declared');
  S.year = 1092; S.mo = 11;
  activateHistoricalWorldEvents(S);
  const beforeBorderBattle = !Object.hasOwn(S.world.events, 'kazdel_border_battle');
  S.mo = 12; activateHistoricalWorldEvents(S);
  return {beforeDeclaration, atDeclaration, beforeBorderBattle, atBorderBattle: Object.hasOwn(S.world.events, 'kazdel_border_battle')};
})()`, context)));
assert.deepEqual(kazdelBoundaryScenario, {beforeDeclaration:true, atDeclaration:true, beforeBorderBattle:true, atBorderBattle:true}, 'the Kazdel declaration and later border battle each appear only at their winter boundary');

const dailyText = row => JSON.stringify(row?.t || '');
const localClinic = data.EV.find(row => dailyText(row).includes('地域の診療所で体調の記録'));
assert(localClinic, 'routine medical care remains available through regional providers');
assert(!dailyText(localClinic).includes('ロドス') && localClinic.fx?.fl?.rhodes !== 1, 'a generic clinic visit does not invent early Rhodes contact');
assert.equal(event('wld_rhodes').ge.year, 1095);
const postReorganizationRhodesEvents = data.EV.filter(row =>
  /^(?:ori_rhodes|life_rhodes|sr_rhodes)_/.test(row.id) &&
  row.id !== 'life_rhodes_research_pause_review'
);
assert(postReorganizationRhodesEvents.length > 0, 'the Rhodes public-care and career routes are present');
for (const row of postReorganizationRhodesEvents) {
  assert.equal(row.ge?.year, 1095, `${row.id} waits until the first full year after the unresolved 1094 reorganization`);
}
const rhodesFollowup = data.EV.find(row => row.need?.includes('ロドスとの接触歴'));
assert.equal(rhodesFollowup?.ge?.year, 1095, 'a Rhodes follow-up waits until the organization exists');
assert.match(JSON.stringify(rhodesFollowup?.t || ''), /以前ロドスの窓口へ連絡したこと/,
  'the generic Rhodes follow-up relies only on the contact history shared by medical and employment routes');
assert.doesNotMatch(JSON.stringify(rhodesFollowup?.t || ''), /支援隊で教わった|薬の扱いを.*確かめ/,
  'a general contact flag does not invent that every visitor received medical instruction');

const spouseCare = event('family_spouse_infection_care');
const localSpouseSupport = spouseCare.c.find(choice => choice.l.includes('地域の診療所'));
const rhodesSpouseSupport = spouseCare.c.find(choice => choice.l.includes('ロドスの診療窓口'));
assert(localSpouseSupport && !localSpouseSupport.o.some(outcome => outcome[2].fl?.rhodes === 1), 'older local treatment does not establish Rhodes contact');
assert.equal(rhodesSpouseSupport.show.ge.year, 1095, 'the Rhodes choice becomes available after reorganization');
assert(rhodesSpouseSupport.o.some(outcome => outcome[2].fl?.rhodes === 1));

const rhodesReview = event('sr_rhodes_work_review');
const siracusaReview = event('sr_siracusa_trade_followup');
const rhodesServiceJob = data.J.findIndex(row => row.n === 'ロドスの物資・生活支援職員');
assert(rhodesServiceJob >= 0, 'the Rhodes service role exists in the job catalog');
const tenureAffiliation = (id, year) => ({
  id, status: 'active', startedYear: year,
  episodes: [{startedYear: year, endedYear: null}]
});
const rhodesTenureState = (year, startYear) => ({
  age: 24 + year - startYear, year, job: rhodesServiceJob, fl: {},
  lifeRecord: {affiliations: [tenureAffiliation('rhodes-staff', startYear)]}
});
const siracusaTenureState = (year, startYear) => ({
  year, res: {n: 'シラクーザ'}, local: {kind: '固定都市の街区'},
  lifeRecord: {affiliations: [tenureAffiliation('siracusa-independent-trade', startYear)]}
});
const tenureFollowups = {
  rhodesSameYear: rhodesReview.show(rhodesTenureState(1095, 1095)),
  rhodesBeforeTwoYears: rhodesReview.show(rhodesTenureState(1096, 1095)),
  rhodesAtTwoYears: rhodesReview.show(rhodesTenureState(1097, 1095)),
  rhodesLegacyAtTwoYears: rhodesReview.show({
    age: 26, year: 1097, job: rhodesServiceJob, fl: {},
    lifeRecord: {affiliations: [{id: 'rhodes-staff', status: 'active', startedYear: 1095}]}
  }),
  siracusaSameYear: siracusaReview.show(siracusaTenureState(1096, 1096)),
  siracusaAtOneYear: siracusaReview.show(siracusaTenureState(1097, 1096)),
  siracusaLegacyAtOneYear: siracusaReview.show({
    year: 1097, res: {n: 'シラクーザ'}, local: {kind: '固定都市の街区'},
    lifeRecord: {affiliations: [{id: 'siracusa-independent-trade', status: 'active', startedYear: 1096}]}
  })
};
assert.deepEqual(tenureFollowups, {
  rhodesSameYear: false,
  rhodesBeforeTwoYears: false,
  rhodesAtTwoYears: true,
  rhodesLegacyAtTwoYears: true,
  siracusaSameYear: false,
  siracusaAtOneYear: true,
  siracusaLegacyAtOneYear: true
}, 'route follow-ups with elapsed-time wording wait until the actual affiliation tenure has passed');

const pendingRhodesResume = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  const originalAsk = ask, originalLog = L;
  let resumed = false;
  ask = () => { resumed = true; };
  L = () => {};
  born({seed:871025,by:1000,region:'クルビア'});
  S.year=1025; S.age=25; S.mo=4; S.inf=1; S.fl.dg=1; S.fl.rhodes=1;
  S.local.access=0.8;
  const pending=EV.find(row=>row.id==='wld_rhodes');
  S.ev=pending; S.evBefore={}; S.sn[pending.id]=S.year;
  const blockedBeforeOrganization=!restorePendingChoice() && S.ev===null && !resumed;
  S.year=1095; S.age=25; S.mo=4; S.fl.rhodes=1;
  S.ev=pending; S.evBefore={}; S.sn[pending.id]=S.year;
  const restoredAtBoundary=restorePendingChoice() && resumed;
  ask=originalAsk; L=originalLog;
  return {blockedBeforeOrganization,restoredAtBoundary};
})()`, context)));
assert.deepEqual(pendingRhodesResume,{blockedBeforeOrganization:true,restoredAtBoundary:true},
  'resuming a saved Rhodes choice rechecks its event date gate without rejecting a valid post-boundary pending choice');

assert.equal(event('earth_discr_iberia_aegir_port').ge.year, 1038);
assert.equal(event('earth_discr_iberia_aegir_return').ge.year, 1038);
assert.deepEqual(JSON.parse(JSON.stringify(event('earth_discr_iberia_aegir_port').show)),
  {or:[{ge:{year:1039}},{ge:{year:1038,month:7},le:{year:1038}}]},
  'the Iberia port route uses a same-year month boundary and opens in later years');
assert.equal(history('great_silence')?.availableFromMonth, 7, 'the same-year Iberia event boundary follows the documented July gameplay approximation');
assert.match(history('great_silence')?.availabilityBasis || '', /SN-ST-1.*月は示さない.*非公式年表.*ゲーム上の近似/,
  'the month boundary distinguishes the story year from the community date and gameplay approximation');
assert(history('great_silence')?.references?.includes('SRC_SN_ST1_OLD_WELL'));
assert(history('great_silence')?.references?.includes('SRC_COMMUNITY_PROFOUND_SILENCE'));
const iberiaPortBoundary = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871038, by: 1000, region: 'イベリア'});
  S.age = 38; S.year = 1038; S.mo = 6;
  S.res = REG.find(row => row.n === 'イベリア');
  S.r = RACE.find(row => row.n === 'エーギル');
  const port = EV.find(row => row.id === 'earth_discr_iberia_aegir_port');
  const available = () => elig(port, S, tags(S));
  activateHistoricalWorldEvents(S);
  const beforeBoundary = available();
  S.mo = 7;
  activateHistoricalWorldEvents(S);
  const atBoundary = available();
  S.year = 1039; S.mo = 1;
  return {beforeBoundary, atBoundary, nextYear: available(), flagAtBoundary: S.world.events.great_silence};
})()`, context)));
assert.deepEqual(iberiaPortBoundary, {beforeBoundary:false,atBoundary:true,nextYear:true,flagAtBoundary:1038},
  'the post-Silence port route remains closed through June, opens in July, and stays available in later years');
assert.equal(event('kazdel_afterfall').ge.year, 1095);
const kazdelOngoingWar = history('kazdel_civil_war');
const kazdelBorderBattle = history('kazdel_border_battle');
assert.equal(kazdelOngoingWar?.displayDate, '1092年',
  'the year-level continuation report is not mislabeled as the later winter battlefield');
assert.equal(kazdelOngoingWar?.availableFromMonth, undefined,
  'the 1092 continuation may be reported from January because formal declaration is dated to winter 1091');
assert.match(kazdelOngoingWar?.availabilityBasis || '', /1091年冬.*年単位.*冬の国境戦場は別/,
  'the distinct date roles of the 1091 declaration and 1092 border battle are documented');
assert.equal(kazdelBorderBattle?.displayDate, '1092年冬');
assert.equal(kazdelBorderBattle?.availableFromMonth, 12,
  'the specific 1092 winter battlefield remains held until its separate winter boundary');
assert.equal(history('kazdel_commission_founded')?.availableFromMonth, 9,
  'the 1031 autumn founding is not available in the first eight months');
assert(history('kazdel_commission_founded')?.references?.includes('SRC_KAZDEL_BB1'),
  'the autumn founding boundary has a direct Babel episode reference');
assert.match(history('kazdel_commission_founded')?.availabilityBasis || '', /BB-1.*Autumn, 1031.*9月.*確定ではない/,
  'the 1031 month is explicitly an autumn-start gameplay approximation');
const kazdelWarTimeline = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871092, by: 1070, region: 'カズデル'});
  S.age = 22; S.year = 1092; S.mo = 1;
  S.res = REG.find(row => row.n === 'カズデル');
  S.world.events.kazdel_civil_war = 1092;
  S.world.events.kazdel_border_battle = 1092;
  activateHistoricalWorldEvents(S);
  const exile = EV.find(row => row.id === 'kaz_exile');
  const atYearStart = {
    ongoingReport: historyAvailabilityReached(HIST.find(row => row.flag === 'kazdel_civil_war'), S),
    battlefield: historyAvailabilityReached(HIST.find(row => row.flag === 'kazdel_border_battle'), S),
    battlefieldFlagHeld: !Object.hasOwn(S.world.events, 'kazdel_border_battle'),
    personallyKnowsWar: !!S.known.kazdel_civil_war,
    evacuationEvent: elig(exile, S, tags(S))
  };
  S.mo = 12;
  activateHistoricalWorldEvents(S);
  return {
    ...atYearStart,
    battlefieldInDecember: historyAvailabilityReached(HIST.find(row => row.flag === 'kazdel_border_battle'), S),
    battlefieldFlagInDecember: S.world.events.kazdel_border_battle === 1092
  };
})()`, context)));
assert.deepEqual(kazdelWarTimeline, {
  ongoingReport: true,
  battlefield: false,
  battlefieldFlagHeld: false,
  personallyKnowsWar: false,
  evacuationEvent: true,
  battlefieldInDecember: true,
  battlefieldFlagInDecember: true
}, 'the post-declaration war can affect Kazdel lives before the separate December battlefield flag is created');
assert.equal(event('life_reunion_local_entry').ge.year, 1097);
const reunionAftermath = event('life_reunion_chernobog_aftermath');
const reunionAftermathMember = {lifeRecord:{affiliations:[{id:'reunion-1096',status:'active'}]}};
reunionAftermathMember.year = 1097; reunionAftermathMember.mo = 1;
assert.equal(reunionAftermath.show(reunionAftermathMember), false, 'the Chernobog withdrawal aftermath is hidden during January 1097');
reunionAftermathMember.mo = 2;
assert.equal(reunionAftermath.show(reunionAftermathMember), true, 'the Chernobog withdrawal aftermath opens in February 1097');
reunionAftermathMember.year = 1098; reunionAftermathMember.mo = 1;
assert.equal(reunionAftermath.show(reunionAftermathMember), true, 'the later Reunion aftermath remains available after its initial dated window');
assert.deepEqual([...event('life_chernobog_resident_response').months], [12, 1, 2]);
const chernobogResidentMonths = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871096, by: 1070, region: 'ウルサス'});
  S.age = 26; S.res = REG.find(row => row.n === 'ウルサス');
  S.local = {kind: '固定都市の街区', city: 'チェルノボーグ'};
  const row = EV.find(event => event.id === 'life_chernobog_resident_response');
  const available = (year, month) => { S.year = year; S.mo = month; return elig(row, S, tags(S)); };
  S.year = 1096; S.mo = 11; activateHistoricalWorldEvents(S);
  const beforeIncidentFlag = available(1096, 12);
  S.mo = 12; activateHistoricalWorldEvents(S);
  return {
    beforeIncident: available(1096, 1),
    beforeIncidentFlag,
    atStart: available(1096, 12),
    nextJanuary: available(1097, 1),
    afterWindow: available(1097, 3),
    personallyKnowsIncident: !!S.known.chernobog_incident,
    wrongCity: (S.local.city = '地方都市', available(1097, 1))
  };
})()`, context)));
assert.deepEqual(chernobogResidentMonths,
  {beforeIncident:false,beforeIncidentFlag:false,atStart:true,nextJanuary:true,afterWindow:false,personallyKnowsIncident:false,wrongCity:false},
  'local response follows the world event, month window, and city without requiring a personal news report');
const chernobogDirectEvents = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871096, by: 1083, region: 'ウルサス'});
  S.age = 13; S.year = 1096; S.mo = 11;
  S.res = REG.find(row => row.n === 'ウルサス');
  S.local = {kind: '固定都市の街区', city: 'チェルノボーグ'};
  const schoolAid = EV.find(row => row.id === 'life_ursus_school_aid');
  const schoolBeforeFlag = elig(schoolAid, S, tags(S));
  S.mo = 12; activateHistoricalWorldEvents(S);
  const schoolDuringIncident = elig(schoolAid, S, tags(S));
  const schoolWithoutNews = !S.known.chernobog_incident;
  born({seed: 871097, by: 1070, region: 'ウルサス'});
  S.age = 27; S.year = 1097; S.mo = 1;
  S.res = REG.find(row => row.n === 'ウルサス');
  S.local = {kind: '固定都市の街区', city: 'チェルノボーグ'};
  S.world.events.chernobog_incident = 1096;
  const localEntry = EV.find(row => row.id === 'life_reunion_local_entry');
  const entryBeforeAffiliation = elig(localEntry, S, tags(S));
  S.year = 1096; S.mo = 12;
  S.lifeRecord.affiliations = [{id:'reunion-1096',status:'active',role:'チェルノボーグ臨時拠点・物資配給'}];
  S.inf = 1;
  const baseAssignment = EV.find(row => row.id === 'life_reunion_chernobog_base_assignment');
  const baseDaily = EV.find(row => row.id === 'life_reunion_chernobog_base_daily');
  const assignmentWithoutNews = elig(baseAssignment, S, tags(S));
  const dailyWithoutNews = elig(baseDaily, S, tags(S));
  return {schoolBeforeFlag,schoolDuringIncident,schoolWithoutNews,entryBeforeAffiliation,assignmentWithoutNews,dailyWithoutNews};
})()`, context)));
assert.deepEqual(chernobogDirectEvents,
  {schoolBeforeFlag:false,schoolDuringIncident:true,schoolWithoutNews:true,entryBeforeAffiliation:true,assignmentWithoutNews:true,dailyWithoutNews:true},
  'Chernobog school, local entry, and Reunion base scenes follow local chronology rather than personal news');
const firsthandHistoryEvents = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871096, by: 1070, region: '龍門'});
  S.age = 26; S.year = 1096; S.mo = 11;
  S.res = REG.find(row => row.n === '龍門');
  S.local = {kind:'移動都市の避難・労働区画',city:'龍門'};
  activateHistoricalWorldEvents(S);
  const missingFlag = !S.world.events.chernobog_incident;
  const coworkerBefore = elig(EV.find(row => row.id === 'f99'), S, tags(S));
  const refugeBefore = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.mo = 12; activateHistoricalWorldEvents(S);
  const coworker = elig(EV.find(row => row.id === 'f99'), S, tags(S));
  const refuge = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.year=1097;S.mo=4;
  const refugeApril = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.mo=5;
  const refugeMay = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.year=1098;S.mo=1;
  const refugeNextYear = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.year=1097;S.mo=4;S.local.city='地方都市';
  const refugeWrongCity = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  S.local.city='龍門';S.res=REG.find(row => row.n === 'ウルサス');
  const refugeWrongRegion = elig(EV.find(row => row.id === 'wld_chernobog'), S, tags(S));
  const noPersonalReport = !S.known.chernobog_incident;
  S.res=REG.find(row => row.n === '龍門');S.local.city='龍門';S.year=1101;S.mo=6;
  const coworkerLongSearch = elig(EV.find(row => row.id === 'f99'), S, tags(S));
  S.local.city='地方都市';
  const coworkerAfterEvacuationOutsideOriginCity = elig(EV.find(row => row.id === 'f99'), S, tags(S));
  S.res=REG.find(row => row.n === 'ウルサス');S.local.city='サンクト・グリファーブルク';
  const coworkerAfterEvacuationOutsideOriginRegion = elig(EV.find(row => row.id === 'f99'), S, tags(S));
  born({seed: 871097, by: 1070, region: 'ウルサス'});
  S.age=27;S.year=1097;S.mo=2;S.res=REG.find(row=>row.n==='ウルサス');S.home='移動都市';
  S.local={kind:'移動都市の避難・労働区画',city:'地方都市'};
  S.world.events.chernobog_incident=1096;
  const witnessAccount = elig(EV.find(row=>row.id==='sr_ursus_civilian_account'),S,tags(S));
  const witnessWithoutReport = !S.known.chernobog_incident;
  born({seed: 871092, by: 1070, region: 'カズデル'});
  S.age=22;S.year=1092;S.mo=1;S.res=REG.find(row=>row.n==='カズデル');
  S.local={kind:'固定都市の街区',city:'地方都市'};activateHistoricalWorldEvents(S);
  const mercenaryColumn = elig(EV.find(row=>row.id==='f95'),S,tags(S));
  const localExileDecision = elig(EV.find(row=>row.id==='kaz_exile'),S,tags(S));
  const kazdelWithoutReport = !S.known.kazdel_civil_war;
  S.year=1097;S.age=27;S.inf=1;S.fl.dg=1;S.world.events.chernobog_incident=1096;
  const travelingReunionNews = elig(EV.find(row=>row.id==='kaz_reunion'),S,tags(S));
  const siestaShop = EV.find(row=>row.id==='siesta_shop_reopens_after_move');
  const siestaDirectFlag = siestaShop.show({world:{events:{siesta_disaster:1097}}});
  const siestaNoFlag = siestaShop.show({world:{events:{}}});
  return {missingFlag,coworkerBefore,refugeBefore,coworker,refuge,refugeApril,refugeMay,refugeNextYear,refugeWrongCity,refugeWrongRegion,noPersonalReport,coworkerLongSearch,coworkerAfterEvacuationOutsideOriginCity,coworkerAfterEvacuationOutsideOriginRegion,witnessAccount,witnessWithoutReport,mercenaryColumn,localExileDecision,kazdelWithoutReport,travelingReunionNews,siestaDirectFlag,siestaNoFlag};
})()`, context)));
assert.deepEqual(firsthandHistoryEvents,
  {missingFlag:true,coworkerBefore:false,refugeBefore:false,coworker:true,refuge:true,refugeApril:true,refugeMay:false,refugeNextYear:false,refugeWrongCity:false,refugeWrongRegion:false,noPersonalReport:true,coworkerLongSearch:true,coworkerAfterEvacuationOutsideOriginCity:true,coworkerAfterEvacuationOutsideOriginRegion:true,witnessAccount:true,witnessWithoutReport:true,mercenaryColumn:true,localExileDecision:true,kazdelWithoutReport:true,travelingReunionNews:true,siestaDirectFlag:true,siestaNoFlag:false},
  'Chernobog refugee intake is a Lungmen scene during the Dec-1096 to Apr-1097 aftermath window; the family-search vignette explicitly follows one displaced coworker and does not imply the protagonist or family died');
assert.deepEqual(Array.from(event('kaz_exile').need), ['国:カズデル']);
assert(!event('f95').need.includes('事件:kazdel_civil_war'));
assert.deepEqual(Array.from(event('wld_chernobog').need), ['国:龍門', '都市:龍門']);
assert.deepEqual(Array.from(event('wld_chernobog').months), [12, 1, 2, 3, 4]);
assert.equal(event('f99').need, undefined, 'the displaced coworker can be encountered outside Lungmen after migration');
assert.equal(event('wld_chernobog').le.year, 1097);
assert.equal(event('f99').ge.year, 1096);
assert.equal(event('f99').le, undefined, 'an unresolved individual family search has no invented end date');
assert(!event('kaz_reunion').need.includes('事件:chernobog_incident'));
assert(!event('sr_ursus_civilian_account').need.includes('事件:chernobog_incident'));
assert(!event('siesta_shop_reopens_after_move').need.includes('事件:siesta_disaster'));
const leithanianDirectEvents = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871077, by: 1050, region: 'リターニア'});
  S.age=27;S.year=1077;S.mo=8;S.res=REG.find(row=>row.n==='リターニア');
  S.local={kind:'固定都市の街区',city:'地方都市'};activateHistoricalWorldEvents(S);
  const beforeFlag=[elig(EV.find(row=>row.id==='lei_witchking'),S,tags(S)),elig(EV.find(row=>row.id==='f102'),S,tags(S))];
  S.mo=9;activateHistoricalWorldEvents(S);
  const oldFacility=elig(EV.find(row=>row.id==='lei_witchking'),S,tags(S));
  const noticeBoard=elig(EV.find(row=>row.id==='f102'),S,tags(S));
  const personallyKnows=!S.known.leith_revolution;
  S.year=1078;S.age=28;
  const civicEntry=elig(EV.find(row=>row.id==='life_leithanian_civic_entry'),S,tags(S));
  return {beforeFlag,oldFacility,noticeBoard,personallyKnows,civicEntry};
})()`, context)));
assert.deepEqual(leithanianDirectEvents,
  {beforeFlag:[false,false],oldFacility:true,noticeBoard:true,personallyKnows:true,civicEntry:true},
  'Lethianian local aftermath begins at the revolution boundary without waiting for a separate personal news roll');
assert(!event('life_leithanian_civic_entry').need.includes('事件:leith_revolution'));
const chernobogPressure = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871097, by: 1070, region: 'ウルサス'});
  S.age = 26; S.year = 1096; S.mo = 0;
  const pressureAt = (year, month, region, city) => {
    S.year = year; S.mo = month;
    S.res = REG.find(row => row.n === region);
    S.local = {kind: '固定都市の街区', city};
    return worldPressure(S, 'war');
  };
  const annualStart1096 = pressureAt(1096, 0, 'ウルサス', 'チェルノボーグ');
  S.mo = 11; activateHistoricalWorldEvents(S);
  const beforeEventFlag = !Object.hasOwn(S.world.events, 'chernobog_incident');
  const beforeEvent = pressureAt(1096, 11, 'ウルサス', 'チェルノボーグ');
  S.mo = 12; activateHistoricalWorldEvents(S);
  const decemberFlag = Object.hasOwn(S.world.events, 'chernobog_incident');
  const december = pressureAt(1096, 12, 'ウルサス', 'チェルノボーグ');
  const annualStart1097 = pressureAt(1097, 0, 'ウルサス', 'チェルノボーグ');
  const januaryDeathMonth = worldPressureDeathMonth(S, '戦争に伴う民間人死亡');
  return {
    annualStart1096, beforeEventFlag, beforeEvent, decemberFlag, december, annualStart1097,
    januaryDeathMonth,
    januaryChernobog: pressureAt(1097, 1, 'ウルサス', 'チェルノボーグ'),
    february: pressureAt(1097, 2, 'ウルサス', 'チェルノボーグ'),
    lungmen: pressureAt(1097, 1, '龍門', '龍門'),
    otherUrsusCity: pressureAt(1097, 1, 'ウルサス', '地方都市'),
    otherLungmenCity: pressureAt(1097, 1, '龍門', '別の街区'),
    unknownCity: pressureAt(1097, 1, 'ウルサス', null),
    regionOnlyNetwork: worldPressure(S, 'war', 'ウルサス', null),
    followingYear: pressureAt(1098, 1, 'ウルサス', 'チェルノボーグ')
  };
})()`, context)));
assert.equal(chernobogPressure.beforeEventFlag, true, 'a fresh life has no crisis flag before December');
assert.equal(chernobogPressure.beforeEvent, 1, 'the city pressure does not appear before the December crisis boundary');
assert.equal(chernobogPressure.decemberFlag, true, 'the crisis flag becomes available at the December boundary');
assert.equal(chernobogPressure.december, 1.4, 'active crisis pressure applies in December 1096');
assert(Math.abs(chernobogPressure.annualStart1096 - (1 + 0.4 / 12)) < 1e-12, 'the 1096 annual roll includes only the December exposure before its event flag is published');
assert(Math.abs(chernobogPressure.annualStart1097 - (1 + 0.4 / 12)) < 1e-12, 'the 1097 annual roll includes only the January exposure');
assert.equal(chernobogPressure.januaryChernobog, 1.4, 'active crisis pressure applies in January 1097');
assert.equal(chernobogPressure.januaryDeathMonth, 1, 'a city war death in 1097 is dated inside the January exposure');
assert.equal(chernobogPressure.february, 1, 'the acute battle pressure ends before the February aftermath events');
assert.equal(chernobogPressure.lungmen, 1.4, 'the pressure also reaches recorded residents of Lungmen');
assert.equal(chernobogPressure.otherUrsusCity, 1, 'other Ursus cities are not treated as Chernobog exposure');
assert.equal(chernobogPressure.otherLungmenCity, 1, 'other Lungmen areas are not treated as battlefield exposure');
assert.equal(chernobogPressure.unknownCity, 1, 'an unrecorded city does not gain invented crisis exposure');
assert.equal(chernobogPressure.regionOnlyNetwork, 1, 'region-wide social networks do not inherit city-specific battle pressure');
assert.equal(chernobogPressure.followingYear, 1, 'acute battle pressure does not persist after the event window');
assert.deepEqual([...context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'chernobog_incident').cities], ['チェルノボーグ', '龍門']);
assert.deepEqual(
  [context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'chernobog_incident').fromMonth, context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'chernobog_incident').toMonth],
  [12, 1],
  'the pressure catalog matches the late-1096 to early-1097 crisis window'
);
const londiniumWarWindow = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871098, by: 1068, region: 'ヴィクトリア'});
  S.age = 30; S.res = REG.find(row => row.n === 'ヴィクトリア');
  S.local = {kind: '固定都市の街区', city: 'ロンディニウム'};
  S.year = 1098; S.mo = 0;
  const annualPressureBeforeFlag = worldPressure(S, 'war');
  const annualContext = worldPressureContext(S).active[0];
  const warDeathMonth = worldPressureDeathMonth(S, '戦争に伴う民間人死亡');
  const nonWarDeathMonth = worldPressureDeathMonth(S, '病死（鉱石病）');
  S.mo = 6;
  activateHistoricalWorldEvents(S);
  const beforeStartFlag = !Object.hasOwn(S.world.events, 'londinium_war');
  const news = EV.find(row => row.id === 'sr_londinium_distant_news');
  const beforeStart = elig(news, S, tags(S));
  S.mo = 7; activateHistoricalWorldEvents(S);
  const atStartFlag = Object.hasOwn(S.world.events, 'londinium_war');
  S.known.londinium_war = 1; S.hd.londinium_war = 1;
  const eligibleAt = (year, month) => {
    S.year = year; S.mo = month;
    S.local = {kind: '固定都市の街区', city: '地方都市'};
    return elig(news, S, tags(S));
  };
  const pressureAt = (year, month, city, region = 'ヴィクトリア') => {
    S.year = year; S.mo = month;
    S.res = REG.find(row => row.n === region);
    S.local = {kind: '固定都市の街区', city};
    return worldPressure(S, 'war');
  };
  return {
    beforeStartFlag, beforeStart, atStartFlag,
    july: eligibleAt(1098, 7), september: eligibleAt(1098, 9),
    october: eligibleAt(1098, 10), nextYear: eligibleAt(1099, 7),
    annualPressureBeforeFlag,
    annualContext,
    warDeathMonth,
    nonWarDeathMonth,
    beforeBattlePressure: pressureAt(1098, 6, 'ロンディニウム'),
    julyPressure: pressureAt(1098, 7, 'ロンディニウム'),
    septemberPressure: pressureAt(1098, 9, 'ロンディニウム'),
    octoberPressure: pressureAt(1098, 10, 'ロンディニウム'),
    otherCityPressure: pressureAt(1098, 8, '地方都市'),
    wrongRegionPressure: pressureAt(1098, 8, 'ロンディニウム', 'ウルサス'),
    unknownCityPressure: pressureAt(1098, 8, null),
    postwarPressure: pressureAt(1099, 0, 'ロンディニウム')
  };
})()`, context)));
assert(londiniumWarWindow.beforeStartFlag && !londiniumWarWindow.beforeStart && londiniumWarWindow.atStartFlag, 'the 1098 Londinium battle flag remains absent in June and appears in July');
assert(londiniumWarWindow.july && londiniumWarWindow.september && !londiniumWarWindow.october && !londiniumWarWindow.nextYear, 'distant reports of active fighting stop before the final battle month and do not repeat after the war');
assert.equal(londiniumWarWindow.annualPressureBeforeFlag, 1.15, 'the annual mortality/health pass receives a three-month exposure estimate before the July event flag is published');
assert.equal(londiniumWarWindow.annualContext?.annualExposureShare, 0.25, 'the audit snapshot records the annualized portion of the year');
assert([7, 8, 9].includes(londiniumWarWindow.warDeathMonth), 'a war death under annualized city pressure is dated inside its exposure months');
assert.equal(londiniumWarWindow.nonWarDeathMonth, null, 'unrelated causes keep the ordinary death-month handling');
assert.equal(londiniumWarWindow.beforeBattlePressure, 1, 'city battle pressure is absent before July in month-level evaluation');
assert.equal(londiniumWarWindow.julyPressure, 1.6, 'active-month city pressure applies at the July start');
assert.equal(londiniumWarWindow.septemberPressure, 1.6, 'active-month city pressure remains through September');
assert.equal(londiniumWarWindow.octoberPressure, 1, 'city battle pressure stops before the partial October ending month');
assert.equal(londiniumWarWindow.otherCityPressure, 1, 'a regional resident outside Londinium is not assigned the city battle pressure');
assert.equal(londiniumWarWindow.wrongRegionPressure, 1, 'the city name alone does not bypass the regional exposure boundary');
assert.equal(londiniumWarWindow.unknownCityPressure, 1, 'an unrecorded city does not invent battlefield exposure');
assert.equal(londiniumWarWindow.postwarPressure, 1, 'active war mortality pressure ends after the 1098 war year');
const londiniumCombatEvent = event('vic_war');
assert.deepEqual([...londiniumCombatEvent.months], [7, 8, 9], 'the local combat event shares the documented fighting months');
assert.deepEqual(Array.from(londiniumCombatEvent.need), ['国:ヴィクトリア', '都市:ロンディニウム'],
  'the local combat event requires residence in the city');
assert.equal(typeof londiniumCombatEvent.show, 'function', 'the Londinium event checks world chronology separately from personal knowledge');
assert.equal(londiniumCombatEvent.le.year, 1098, 'the local combat event cannot be selected in postwar years');
const londiniumCombatAvailability = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed:871099,by:1068,region:'ヴィクトリア'});
  S.age=30;S.res=REG.find(row=>row.n==='ヴィクトリア');
  S.local={kind:'固定都市の街区',city:'ロンディニウム'};
  const row=EV.find(item=>item.id==='vic_war'),at=(year,month,flag=true)=>{
    S.year=year;S.mo=month;
    if(flag)S.world.events.londinium_war=1098;else delete S.world.events.londinium_war;
    delete S.known?.londinium_war;
    return elig(row,S,tags(S));
  };
  const activeStart=at(1098,7),activeEnd=at(1098,9);
  return {beforeStart:at(1098,6),activeStart,activeEnd,afterEnd:at(1098,10),postwar:at(1099,7),withoutHistory:at(1098,7,false),outsideCity:(S.local.city='地方都市',at(1098,8))};
})()`,context)));
assert.deepEqual(londiniumCombatAvailability,
  {beforeStart:false,activeStart:true,activeEnd:true,afterEnd:false,postwar:false,withoutHistory:false,outsideCity:false},
  'active fighting is restricted to the recorded months and city, and does not require prior personal news');
assert.deepEqual([...event('sr_londinium_distant_news').months], [7, 8, 9]);
assert.equal(event('sr_londinium_distant_news').le.year, 1098);
assert.deepEqual([...context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'londinium_war').cities], ['ロンディニウム']);
assert.deepEqual(
  [context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'londinium_war').fromMonth, context.window.GAME_DATA.WORLD_PRESSURES.find(row => row.id === 'londinium_war').toMonth],
  [7, 9],
  'the pressure catalog matches the active city-combat months'
);
const londiniumOccupation = event('vic_occupy');
assert(londiniumOccupation.references?.includes('SRC_COMMUNITY_VICTORIA_OCCUPATION'),
  'the Londinium occupation boundary records the secondary chronology behind its autumn estimate');
assert.deepEqual(JSON.parse(JSON.stringify(londiniumOccupation.show)),
  {or:[{ge:{year:1095}},{ge:{year:1094,month:9},le:{year:1094}}]},
  'the occupation event uses a September 1094 gameplay boundary without delaying later years');
const londiniumOccupationWindow = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871094, by: 1064, region: 'ヴィクトリア'});
  S.age = 30;
  S.res = REG.find(row => row.n === 'ヴィクトリア');
  S.local = {kind: '固定都市の街区', city: 'ロンディニウム'};
  const occupation = EV.find(row => row.id === 'vic_occupy');
  const eligibleAt = (year, month) => {
    S.year = year; S.mo = month;
    return elig(occupation, S, tags(S));
  };
  return {
    august1094: eligibleAt(1094, 8), september1094: eligibleAt(1094, 9),
    december1094: eligibleAt(1094, 12), january1095: eligibleAt(1095, 1),
    december1097: eligibleAt(1097, 12), january1098: eligibleAt(1098, 1)
  };
})()`, context)));
assert.deepEqual(londiniumOccupationWindow,
  {august1094:false,september1094:true,december1094:true,january1095:true,december1097:true,january1098:false},
  'occupation-life event availability follows the autumn estimate, later occupied years, and recorded end year');
const londiniumCivilianRoute = event('life_londinium_civilian_response');
assert.equal(londiniumCivilianRoute.le.year, 1098, 'the active-crisis civilian entry does not recur as postwar combat');
assert.deepEqual([...londiniumCivilianRoute.months], [7, 8, 9], 'the crisis entry avoids the partial October ending month');
const londiniumCivilianAvailability = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871098, by: 1068, region: 'ヴィクトリア'});
  S.age = 30; S.year = 1098; S.mo = 7;
  S.res = REG.find(row => row.n === 'ヴィクトリア');
  S.local = {kind: '固定都市の街区', city: 'ロンディニウム'};
  S.world.events.londinium_war = 1098;
  delete S.known.londinium_war;
  const row = EV.find(item => item.id === 'life_londinium_civilian_response');
  const local = elig(row, S, tags(S));
  const withoutNews = !S.known.londinium_war;
  const streetNotice = elig(EV.find(item => item.id === 'f101'), S, tags(S));
  const workerSearch = elig(EV.find(item => item.id === 'f111'), S, tags(S));
  S.local.city = '地方都市';
  const outsideCity = elig(row, S, tags(S));
  const streetOutsideCity = elig(EV.find(item => item.id === 'f101'), S, tags(S));
  return {local,withoutNews,streetNotice,workerSearch,outsideCity,streetOutsideCity};
})()`, context)));
assert.deepEqual(londiniumCivilianAvailability,
  {local:true,withoutNews:true,streetNotice:true,workerSearch:true,outsideCity:false,streetOutsideCity:false},
  'local Londinium civilian scenes use the active city event before personal news arrives');
assert.deepEqual(Array.from(londiniumCivilianRoute.need), ['国:ヴィクトリア', '都市:ロンディニウム']);
const londiniumRelief = event('life_reunion_londinium_local_aid');
assert.equal(londiniumRelief.show({year:1098,mo:6,world:{events:{londinium_war:1098}}}), false, 'local relief stays hidden before the battle window');
assert.equal(londiniumRelief.show({year:1098,mo:7,world:{events:{londinium_war:1098}}}), true);
assert.equal(londiniumRelief.show({year:1099,mo:1,world:{events:{londinium_war:1098}}}), true, 'postwar relief remains available after active fighting ends');
assert.equal(londiniumRelief.show({year:1098,mo:7,world:{events:{}}}), false, 'local relief still waits for the world event flag');
assert(!londiniumRelief.need.includes('事件:londinium_war'), 'local relief does not depend on personally receiving the battle report');
const londiniumCivilianAfterwar = event('life_londinium_civilian_afterwar');
const londiniumAidAfterwar = event('life_londinium_aid_afterwar');
assert.deepEqual([...londiniumCivilianAfterwar.need], [
  '国:ヴィクトリア', '都市:ロンディニウム', 'ロンディニウム戦争期の生活を経験', 'ロンディニウムの地域互助に協力中'
], 'the civilian postwar follow-up stays tied to its active Londinium relief route');
assert.deepEqual([...londiniumAidAfterwar.need], [
  '国:ヴィクトリア', '都市:ロンディニウム', 'ロンディニウムの地域互助に協力中'
], 'the reorganization aid follow-up stays tied to Londinium');
const londiniumPostwarAvailability = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871100, by: 1068, region: 'ヴィクトリア'});
  S.age = 32; S.year = 1100; S.mo = 1;
  S.res = REG.find(row => row.n === 'ヴィクトリア');
  S.local = {kind: '固定都市の街区', city: 'ロンディニウム'};
  S.fl.londinium_civilian_route = 1;
  S.lifeRecord.affiliations.push({id: 'londinium-mutual-aid', status: 'active'});
  S.sn.life_londinium_civilian_response = 1098;
  S.sn.life_reunion_londinium_local_aid = 1098;
  const civilian = EV.find(row => row.id === 'life_londinium_civilian_afterwar');
  const aid = EV.find(row => row.id === 'life_londinium_aid_afterwar');
  const at = (row, year, region, city) => {
    S.year = year; S.res = REG.find(item => item.n === region);
    S.local = {kind: '固定都市の街区', city};
    return elig(row, S, tags(S));
  };
  return {
    civilianInLondinium: at(civilian, 1100, 'ヴィクトリア', 'ロンディニウム'),
    civilianBeforeWindow: at(civilian, 1099, 'ヴィクトリア', 'ロンディニウム'),
    civilianOtherCity: at(civilian, 1100, 'ヴィクトリア', '地方都市'),
    civilianOtherRegion: at(civilian, 1100, 'ウルサス', 'サンクト・グリファーブルク'),
    aidInLondinium: at(aid, 1100, 'ヴィクトリア', 'ロンディニウム'),
    aidBeforeWindow: at(aid, 1099, 'ヴィクトリア', 'ロンディニウム'),
    aidOtherCity: at(aid, 1100, 'ヴィクトリア', '地方都市'),
    aidOtherRegion: at(aid, 1100, 'ウルサス', 'サンクト・グリファーブルク')
  };
})()`, context)));
assert.deepEqual(londiniumPostwarAvailability, {
  civilianInLondinium: true, civilianBeforeWindow: false, civilianOtherCity: false, civilianOtherRegion: false,
  aidInLondinium: true, aidBeforeWindow: false, aidOtherCity: false, aidOtherRegion: false
}, 'postwar follow-ups require their recorded route, the 1100+ window, and current Londinium residence');
const londiniumStreetEvent = data.EV.find(row => Array.isArray(row.t) && row.t.some(variant => variant?.t?.includes('いつも通れる通りがふさがれていた')));
const londiniumStreetVariant = londiniumStreetEvent?.t.find(variant => variant?.t?.includes('いつも通れる通りがふさがれていた'));
assert.equal(typeof londiniumStreetVariant?.when, 'function', 'the city-street account has its own dated locality predicate');
const londiniumStreetMonths = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871098, by: 1068, region: 'ヴィクトリア'});
  S.age = 30; S.res = REG.find(row => row.n === 'ヴィクトリア');
  S.local = {kind: '固定都市の街区', city: 'ロンディニウム'};
  S.world.events.londinium_war = 1098;
  const row = EV.find(item => Array.isArray(item.t) && item.t.some(variant => variant?.t?.includes('いつも通れる通りがふさがれていた')));
  const variant = row.t.find(item => item?.t?.includes('いつも通れる通りがふさがれていた'));
  const available = (year, month, city='ロンディニウム', region='ヴィクトリア', withFlag=true) => {
    S.year=year;S.mo=month;S.res=REG.find(item=>item.n===region);S.local={kind:'固定都市の街区',city};
    if(withFlag)S.world.events.londinium_war=1098;else delete S.world.events.londinium_war;
    return ok(variant.when,S,tags(S));
  };
  return {
    before:available(1098,6),during:available(1098,7),activeEnd:available(1098,9),
    finalMonth:available(1098,10),postwar:available(1099,7),withoutHistory:available(1098,8,'ロンディニウム','ヴィクトリア',false),
    outsideCity:available(1098,8,'地方都市'),wrongRegion:available(1098,8,'ロンディニウム','ウルサス')
  };
})()`, context)));
assert.deepEqual(londiniumStreetMonths, {
  before:false,during:true,activeEnd:true,finalMonth:false,postwar:false,withoutHistory:false,outsideCity:false,wrongRegion:false
}, 'the Londinium-specific road closure variant follows the dated city and event window');
const londiniumBattleVignettes = [
  data.EV.find(item => typeof item.t === 'string' && item.t.includes('店の前の掲示板から、同じ通りに住む兵士の名が消えていた。')),
  data.EV.find(item => typeof item.t === 'string' && item.t.includes('工業区域の角で、工員たちが仲間を捜す準備をしていた。'))
];
assert(londiniumBattleVignettes.every(Boolean), 'both dated Londinium vignettes resolve from their stable text');
for (const row of londiniumBattleVignettes) {
  assert.deepEqual([...row.months], [7, 8, 9], 'direct battle vignette is limited to active campaign months');
  assert.equal(row.le.year, 1098, 'direct battle vignette does not persist into later years');
}
const londiniumVignetteAvailability = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed:871098,by:1068,region:'ヴィクトリア'});
  S.age=30;
  const rows=[
    EV.find(item=>typeof item.t==='string'&&item.t.includes('店の前の掲示板から、同じ通りに住む兵士の名が消えていた。')),
    EV.find(item=>typeof item.t==='string'&&item.t.includes('工業区域の角で、工員たちが仲間を捜す準備をしていた。'))
  ];
  const at=(year,month,city='ロンディニウム',region='ヴィクトリア',withFlag=true)=>{
    S.year=year;S.mo=month;S.res=REG.find(item=>item.n===region);
    S.local={kind:'固定都市の街区',city};
    if(withFlag)S.world.events.londinium_war=1098;else delete S.world.events.londinium_war;
    return rows.map(row=>elig(row,S,tags(S)));
  };
  return {
    beforeStart:at(1098,6),activeStart:at(1098,7),activeEnd:at(1098,9),
    partialEndingMonth:at(1098,10),laterYear:at(1099,7),withoutHistory:at(1098,7,'ロンディニウム','ヴィクトリア',false),
    outsideCity:at(1098,8,'地方都市'),wrongRegion:at(1098,8,'ロンディニウム','ウルサス')
  };
})()`, context)));
assert.deepEqual(londiniumVignetteAvailability, {
  beforeStart: [false, false], activeStart: [true, true], activeEnd: [true, true],
  partialEndingMonth: [false, false], laterYear: [false, false], withoutHistory: [false, false],
  outsideCity: [false, false], wrongRegion: [false, false]
}, 'both local Londinium vignettes require the dated city event, active months, and correct region');
assert.equal(event('bol_dossoles_championship_work').ge.year, 1097);
assert(event('bol_dossoles_championship_work').need.includes('都市:ドッソレス'));
const dossolesWork = event('bol_dossoles_championship_work');
const dossolesWorkText = JSON.stringify({
  labels: dossolesWork.c.map(choice => choice.l),
  outcomes: dossolesWork.c.flatMap(choice => choice.o || []).map(outcome => outcome[1])
});
assert.doesNotMatch(dossolesWorkText, /移動費/,
  'the local Dossoles job does not describe a travel expense that its result never records');
const dossolesWorkBoundary = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({seed: 871097, by: 1070, region: 'ボリバル'});
  S.age = 26; S.year = 1096; S.mo = 8;
  S.res = REG.find(row => row.n === 'ボリバル');
  S.home = '移動都市'; S.local = {...makeLocality(S.home, 'ボリバル', undefined, 1096), city: 'ドッソレス'};
  const row = EV.find(item => item.id === 'bol_dossoles_championship_work');
  const beforeStart = elig(row, S, tags(S));
  S.year = 1097; S.age = 27;
  const localResident = elig(row, S, tags(S));
  S.local.city = 'エル・ソル';
  const otherCityResident = elig(row, S, tags(S));
  return {beforeStart, localResident, otherCityResident};
})()`, context)));
assert.deepEqual(dossolesWorkBoundary, {beforeStart:false,localResident:true,otherCityResident:false},
  'the championship job is limited to the verified event year and residents of Dossoles');
assert.equal(event('bol_dossoles_traveler_account').ge.year, 1087, 'Dossoles travel stories wait until the city has borne that name for a full game year');
assert.deepEqual([...event('life_ursus_student_assembly_contact').months], [10, 11]);
assert.deepEqual([...event('life_ursus_student_assembly_meeting').months], [10, 11]);
assert.deepEqual([...event('life_ursus_student_assembly_protest').months], [12]);
const katorgaSequenceBoundary = JSON.parse(JSON.stringify(vm.runInContext(`(() => {
  born({seed: 871101, by: 1084, region: 'ウルサス'});
  S.age = 17; S.year = 1101; S.mo = 9;
  S.res = REG.find(row => row.n === 'ウルサス');
  S.home = '移動都市';
  S.local = {...makeLocality(S.home, 'ウルサス'), city: 'サンクト・グリファーブルク'};
  const contact = EV.find(row => row.id === 'life_ursus_student_assembly_contact');
  const meeting = EV.find(row => row.id === 'life_ursus_student_assembly_meeting');
  const protest = EV.find(row => row.id === 'life_ursus_student_assembly_protest');
  const available = row => elig(row, S, tags(S));
  const contactBeforeWindow = available(contact);
  S.mo = 10; const contactAtWindow = available(contact);
  S.fl.ursus_student_assembly_contacted = 1; S.sn[contact.id] = 1101;
  S.mo = 11; const meetingAtWindow = available(meeting);
  S.mo = 12; const meetingAfterWindow = available(meeting);
  S.fl.ursus_student_assembly_active = 1; S.sn[meeting.id] = 1101;
  S.pendingHistoricalNews = {katorga_incident:{route:'近隣・地域の伝達網',infoScope:'local_news'}};
  S.mo = 11;
  activateHistoricalWorldEvents(S);
  releasePendingHistoricalNews(S);
  const pendingNewsBeforeWinter = !!S.pendingHistoricalNews?.katorga_incident;
  const protestBeforeWinter = available(protest);
  S.mo = 12; activateHistoricalWorldEvents(S);
  const incidentAtWinter = S.world.events.katorga_incident;
  const protestBeforeNewsRelease = available(protest);
  const noPersonalNewsAtIncident = !S.known.katorga_incident;
  S.local.city = '地方都市';
  const protestOutsideCity = available(protest);
  S.local.city = 'サンクト・グリファーブルク';
  releasePendingHistoricalNews(S);
  const receivedNewsMonth = S.infoLog.find(row => row.id === 'katorga_incident')?.heardMonth ?? null;
  const protestAtWinter = available(protest);
  S.year = 1102; S.age = 18; S.mo = 1; activateHistoricalWorldEvents(S);
  const protestAfterYear = available(protest);
  return {contactBeforeWindow,contactAtWindow,meetingAtWindow,meetingAfterWindow,pendingNewsBeforeWinter,protestBeforeWinter,incidentAtWinter,protestBeforeNewsRelease,noPersonalNewsAtIncident,protestOutsideCity,receivedNewsMonth,protestAtWinter,protestAfterYear};
})()`, context)));
assert.deepEqual(katorgaSequenceBoundary,
  {contactBeforeWindow:false,contactAtWindow:true,meetingAtWindow:true,meetingAfterWindow:false,pendingNewsBeforeWinter:true,protestBeforeWinter:false,incidentAtWinter:1101,protestBeforeNewsRelease:true,noPersonalNewsAtIncident:true,protestOutsideCity:false,receivedNewsMonth:12,protestAtWinter:true,protestAfterYear:false},
  'the Katorga protest is a direct local scene in December, while off-city news remains separate and the route closes after 1101');
assert.deepEqual(Array.from(event('life_ursus_student_assembly_protest').need),
  ['ursus_student_assembly_active', '国:ウルサス', '都市:サンクト・グリファーブルク'],
  'the Katorga protest requires active local participation and residence in its city');

const invalidResponse = vm.runInNewContext(`(() => {
  born({seed: 871094, by: 1064, region: 'カズデル'});
  S.age = 30; S.year = 1094; S.mo = 7;
  S.known.thelazia_dead = 1; S.hd.thelazia_dead = 1; S.world.events.thelazia_dead = 1094;
  try {
    recordInformationResponse(S, {factId:'thelazia_dead', response:'withhold-unverified-report'}, EV[0].id);
    return false;
  } catch (error) { return /本人が把握していない/.test(error.message); }
})()`, context);
assert.equal(invalidResponse, true, 'a response cannot be recorded against an event before its availability boundary');

const sameVersionResume = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  HL = 0; AU = 'r'; STAT.ev = {}; STAT.op = {}; STAT.choiceMonths = new Set();
  born({seed: 871099, by: 1057, region: 'リターニア'});
  S.age = 20; S.year = 1077; S.mo = 8;
  S.res = REG.find(row => row.n === 'リターニア');
  activateHistoricalWorldEvents(S);
  const before = JSON.stringify(S);
  const snapshot = makeResumeSnapshot();
  const prematureSnapshot = JSON.parse(JSON.stringify(snapshot));
  prematureSnapshot.S.world.events.leith_revolution = 1077;
  let prematureSnapshotRejected = false;
  try { normalizeResumeImport(prematureSnapshot); } catch { prematureSnapshotRejected = true; }
  const original = {rd, tab, play, restorePendingChoice};
  rd = () => {}; tab = () => {}; play = () => {}; restorePendingChoice = () => true;
  const loaded = cont(snapshot);
  const exactRestore = loaded && JSON.stringify(S) === before;
  const beforeBoundary = !Object.hasOwn(S.world.events, 'leith_revolution');
  S.mo = 9; activateHistoricalWorldEvents(S);
  const atBoundary = Object.hasOwn(S.world.events, 'leith_revolution');
  rd = original.rd; tab = original.tab; play = original.play; restorePendingChoice = original.restorePendingChoice;
  return {format: snapshot.format, version: snapshot.version, loaded, exactRestore, prematureSnapshotRejected, beforeBoundary, atBoundary, auditErrors: auditLifeState(S).length};
})()`, context)));
assert.equal(sameVersionResume.format, 'terra-resume-save');
assert.equal(sameVersionResume.version, 87);
assert(sameVersionResume.loaded && sameVersionResume.exactRestore, 'a current-format save restores the same life state without repair');
assert(sameVersionResume.prematureSnapshotRejected, 'a same-version save with an event flag before its month boundary is rejected');
assert(sameVersionResume.beforeBoundary && sameVersionResume.atBoundary, 'the restored life reaches the historical event only at its month boundary');
assert.equal(sameVersionResume.auditErrors, 0, 'the restored current life remains valid under state audit');

console.log(JSON.stringify({
  passed: true,
  scope: 'month-aware history, local crisis-route boundaries, Londinium vignette time and locality gates, partial-year city pressure, cause-aligned death month, same-version resume, and historical display-date precision',
  monthBoundaries: data.HIST.filter(row => Number.isInteger(row.availableFromMonth)).length,
  routeGates: 10,
  siestaTransferGate: true,
  chernobogPressureChecks: 17,
  chernobogAcuteRouteChecks: 26,
  londiniumPressureChecks: 12,
  londiniumRoadVariantChecks: Object.values(londiniumStreetMonths).length,
  londiniumVignetteChecks: Object.values(londiniumVignetteAvailability).flat().length,
  rhodesOrganizationGates: postReorganizationRhodesEvents.length,
  rhodesFollowupGate: rhodesFollowup.ge.year,
  personalDepartureScope: true,
  sameVersionResumeRoundTrip: true,
  sandSoldierGeography: true,
  sandSoldierYearApproximation: true,
  sandSoldierRegionalRumorScope: true,
  victoriaLeakYearApproximation: true,
  victoriaLeakRegionalRumorScope: true,
  victoriaLeakGameplayScopeAssumption: true
}, null, 2));
