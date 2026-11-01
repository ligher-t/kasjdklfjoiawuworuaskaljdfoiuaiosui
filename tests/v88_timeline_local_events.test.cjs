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

// 1. All 37 HIST entries have localText and valid properties
assert.equal(data.HIST.length, 37, 'HIST has exactly 37 events');
data.HIST.forEach(h => {
  assert(h.flag, `HIST entry has flag: ${h.y}`);
  assert(typeof h.localText === 'string' && h.localText.length > 10, `HIST flag ${h.flag} has localText`);
});

// 2. All 37 HIST flags are referenced in event definitions
const allEventFlags = new Set();
data.EV.forEach(e => {
  if (e.timelineFlag) allEventFlags.add(e.timelineFlag);
  if (typeof e.show === 'function') {
    const fnStr = e.show.toString();
    data.HIST.forEach(h => {
      if (fnStr.includes(h.flag)) allEventFlags.add(h.flag);
    });
  }
});
data.HIST.forEach(h => {
  assert(allEventFlags.has(h.flag), `Every HIST flag must be referenced by an event, missing: ${h.flag}`);
});

// 3. Local news routing: resident in Londinium in 1094 gets direct experience log
const localLondiniumNews = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({ seed: 109401, by: 1060, region: 'ヴィクトリア' });
  S.res = REG.find(r => r.n === 'ヴィクトリア');
  S.home = '固定都市の街区';
  S.local = { kind: '固定都市の街区', city: 'ロンディニウム' };
  S.year = 1094; S.mo = 9; S.age = 34;
  activateHistoricalWorldEvents(S);
  hist();
  const infoEntry = S.infoLog.find(row => row.id === 'thelazia_dead');
  return {
    known: !!S.known.thelazia_dead,
    route: infoEntry?.route,
    textBasis: infoEntry?.textBasis
  };
})()`, context)));

assert.equal(localLondiniumNews.known, true, 'Londinium resident registers thelazia_dead');
assert.equal(localLondiniumNews.route, '現地での直接の目撃・体験', 'Local resident receives eyewitness route');
assert.equal(localLondiniumNews.textBasis, '現地体験文面', 'Local resident receives local text basis');

// 4. Distant news routing: resident in Higashi gets distant news, not local route
const distantNews = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({ seed: 109402, by: 1060, region: '極東' });
  S.res = REG.find(r => r.n === '極東');
  S.year = 1094; S.mo = 9; S.age = 34;
  activateHistoricalWorldEvents(S);
  const h = HIST.find(row => row.flag === 'thelazia_dead');
  announceHistoricalNews(h, h.flag, '広域の知らせ', 'public');
  const infoEntry = S.infoLog.find(row => row.id === 'thelazia_dead');
  return {
    route: infoEntry?.route,
    textBasis: infoEntry?.textBasis
  };
})()`, context)));

assert.equal(distantNews.route, '広域の知らせ', 'Distant resident receives standard news route');
assert.notEqual(distantNews.textBasis, '現地体験文面', 'Distant resident receives public summary text basis');

// 5. Timeline choice priority: Londinium in 1098 selects vic_war
const londiniumPriority = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({ seed: 109807, by: 1060, region: 'ヴィクトリア' });
  S.res = REG.find(r => r.n === 'ヴィクトリア');
  S.home = '固定都市の街区';
  S.local = { kind: '固定都市の街区', city: 'ロンディニウム' };
  S.year = 1098; S.mo = 8; S.age = 38;
  activateHistoricalWorldEvents(S);
  let firedEvent = null;
  const originalFire = fire;
  fire = (e) => { firedEvent = e?.id; };
  slot(7.5 / 12);
  fire = originalFire;
  return { firedEvent };
})()`, context)));

assert.equal(londiniumPriority.firedEvent, 'vic_war', 'Londinium resident in 1098 priority-dispatches vic_war');

// 6. Timeline choice priority: Chernobog resident in 1096 selects Chernobog crisis
const chernobogPriority = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({ seed: 109611, by: 1070, region: 'ウルサス' });
  S.res = REG.find(r => r.n === 'ウルサス');
  S.home = '移動都市';
  S.local = { kind: '移動都市の居住区', city: 'チェルノボーグ' };
  S.year = 1096; S.mo = 12; S.age = 26;
  activateHistoricalWorldEvents(S);
  let firedEvent = null;
  const originalFire = fire;
  fire = (e) => { firedEvent = e?.id; };
  slot(11.5 / 12);
  fire = originalFire;
  return { firedEvent };
})()`, context)));

assert.equal(chernobogPriority.firedEvent, 'timeline_chernobog_incident_local', 'Chernobog resident in 1096 priority-dispatches Chernobog crisis');

// 7. Crisis suppression: Londinium under siege in 1098 suppresses peaceful leisure events
const crisisPeacefulSuppression = JSON.parse(JSON.stringify(vm.runInNewContext(`(() => {
  born({ seed: 109808, by: 1060, region: 'ヴィクトリア' });
  S.res = REG.find(r => r.n === 'ヴィクトリア');
  S.local = { kind: '固定都市の街区', city: 'ロンディニウム' };
  S.year = 1098; S.mo = 8; S.age = 38;
  activateHistoricalWorldEvents(S);
  const inCrisis = isLocationInCrisis(S);
  
  // Test peaceful daily event recognition
  const roseGarden = { t: "公園の手入れされたバラ園を散歩した。色とりどりの大輪のバラと洗練された噴水の水音に、都会の喧騒を忘れて優雅なひとときを過ごした。" };
  const salon = { t: "名門サロンの夜会に招かれ、銀器の触れ合う音の中で貴族や実業家たちと優雅に歓談した。" };
  const drawbridge = { t: "運河沿いの遊歩道を歩き、夕暮れに染まる巨大な跳ね橋のシルエットを眺めた。" };
  const wartimeDaily = { t: "諸侯軍の攻城砲の地鳴りが一日中響き、路地に立ち込める硝煙の向こうで自救軍の若者たちが救援物資を運び込んでいた。" };
  
  return {
    inCrisis,
    roseGardenBlocked: isPeacefulLeisureEvent(roseGarden),
    salonBlocked: isPeacefulLeisureEvent(salon),
    drawbridgeBlocked: isPeacefulLeisureEvent(drawbridge),
    wartimeDailyAllowed: !isPeacefulLeisureEvent(wartimeDaily)
  };
})()`, context)));

assert.equal(crisisPeacefulSuppression.inCrisis, true, 'Londinium in 1098 is in crisis');
assert.equal(crisisPeacefulSuppression.roseGardenBlocked, true, 'Rose garden stroll is recognized as peaceful leisure and blocked');
assert.equal(crisisPeacefulSuppression.salonBlocked, true, 'Salon party is recognized as peaceful leisure and blocked');
assert.equal(crisisPeacefulSuppression.drawbridgeBlocked, true, 'Drawbridge stroll is recognized as peaceful leisure and blocked');
assert.equal(crisisPeacefulSuppression.wartimeDailyAllowed, true, 'Wartime siege daily is allowed during crisis');

// 8. Historical death cause codes validation
const requiredDeathCauses = [
  "市街戦被災（ロンディニウム攻城砲・軍事委員会掃討）",
  "事変被災（チェルノボーグ・レユニオン蜂起戦乱）",
  "天災被災（シエスタ火山活動・火砕流）",
  "天災被災（チェルノボーグ天災直撃・源石嵐）",
  "粛清被災（チェルノボーグ石棺研究所急襲）",
  "粛清被災（クルビア・テキサス家壊滅抗争）",
  "怪異被災（大いなる静謐・黒い海の侵蝕）",
  "戦死・戦争被害（四皇会戦・ガリア侵攻）",
  "戦死・戦争被害（血峰の戦い）",
  "戦火被災（カズデル内戦・焦土戦）",
  "刑の執行（カトルガ流刑・政治犯処刑）"
];

const causeCodeMap = vm.runInContext('CAUSE_CODE_MAP', context);
requiredDeathCauses.forEach(cause => {
  assert(causeCodeMap[cause], `Death cause code must be registered in CAUSE_CODE_MAP: ${cause}`);
});

console.log('All v88 timeline local events and crisis priority tests passed successfully!');
