'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const annual = require('./support/annual-cases.cjs');

const root = path.resolve(__dirname, '..');
const { ctx, storage, nodes } = annual.context(root);
annual.setup(ctx, { id: 'ending-peer', seed: 905033, region: 'カズデル', age: 124 });
const before = annual.observe(ctx);
// The shared simulation fixture initializes STAT.op, unlike a fresh browser.
// Reproduce the ordinary-play startup state instead of hiding that boundary.
const statisticsBefore = vm.runInContext('delete STAT.op; JSON.stringify(STAT)',ctx);
storage.set('terra2','original-autosave');
const ending = ctx.document.getElementById('rs');
const history = ctx.document.getElementById('lg');
const controls = ctx.document.getElementById('ctl');
ending.innerHTML = '<div class="peers">CURRENT PLAYER ENDING</div>';
ending.hidden = false;
history.innerHTML = '<li>the visible player journal</li>';
controls.hidden = true;

const thresholds = vm.runInContext(
  "EV.find(event => event.id === 'v77_written_application').c[1].o.map(outcome => outcome[0])",
  ctx
);
assert.deepEqual([...thresholds], [0.75, 1], 'weighted outcomes must cover every random roll');
const peer = vm.runInContext('simPeer(905033)', ctx, { timeout: 30000 });

assert.equal(storage.get('terra2'),'original-autosave','hidden peer deaths must not erase the active life autosave');
assert.equal(ending.innerHTML, '<div class="peers">CURRENT PLAYER ENDING</div>',
  'hidden births and deaths cannot replace or detach the real ending and peer container');
assert.equal(ending.hidden,false,'hidden peer birth must not dismiss the visible ending');
assert.equal(history.innerHTML,'<li>the visible player journal</li>',
  'hidden peer birth must not clear the player history');
assert.equal(controls.hidden,true,'hidden peer death must not toggle visible playback controls');
assert.ok(peer.nm && peer.nm !== '?', 'comparison must have a real person name');
assert.ok(Number.isInteger(peer.age) && peer.age > 0, 'comparison must have a simulated lifetime');
assert.ok(peer.res && peer.res !== '?', 'comparison must have a region');
assert.ok(peer.dc && peer.dc !== '?', 'comparison must have a recorded ending');
assert.deepEqual(annual.observe(ctx), before, 'peer calculation restores the active life, world, RNG and trace state');
assert.equal(vm.runInContext('JSON.stringify(STAT)',ctx),statisticsBefore,
  'comparison initializes its own opportunity counters and restores the exact caller statistics');


// Even when a peer simulation fails, other simulated lives must remain on
// screen, the busy indicator must clear, and a retry must be available.
const partial = vm.runInContext(`(() => {
  const previous = simPeer, wasDead = S.dead;
  let attempts = 0, busy = "";
  const node = {
    innerHTML: "",
    setAttribute(name,value) { if (name === "aria-busy") busy = value; },
    querySelector(selector) { return selector === ".ui-peer-retry" ? {addEventListener(){}} : null; }
  };
  try {
    S.dead = 1;
    simPeer = () => {
      attempts++;
      if (attempts === 2) throw new Error("test: one comparison failed");
      return {nm:"検証人物",res:"カズデル",local:"集落",r:"サルカズ",
        care:"親族",age:42,dc:"病死",job:"無職",edu:"未就学",moves:0};
    };
    renderEndingPeers(S,{querySelector:selector=>selector === ".peers" ? node : null});
    return {attempts, busy, html:node.innerHTML};
  } finally {
    simPeer = previous;
    S.dead = wasDead;
  }
})()`, ctx);
assert.equal(partial.attempts,3,'the configured three lives are attempted independently');
assert.equal(partial.busy,'false','comparison settles even with a failed peer');
assert.equal((partial.html.match(/class="peer"/g)||[]).length,2,
  'one failed life does not erase two valid lives');
assert.match(partial.html,/比較を再試行/,'failed comparisons expose a retry affordance');
assert.doesNotMatch(partial.html,/比較する人生を表示できませんでした/);

// A real postmortem invokes three independent hidden simulations while the
// original ending is still mounted. A previously hidden death replaced this
// very container, making all rendered results invisible to the player.
const integration = vm.runInContext(`(() => {
  const oldHL=HL,oldDead=S.dead;
  const box={html:"",innerHTML:"",setAttribute(){},
    querySelector(){return null;}};
  const root={querySelector:selector=>selector===".peers"?box:null};
  const previousHtml=document.getElementById("rs").innerHTML;
  const previousJournal=document.getElementById("lg").innerHTML;
  try {
    HL=0;
    S.dead=1;
    renderEndingPeers(S,root);
    return {
      results:(box.innerHTML.match(/class="peer"/g)||[]).length,
      html:box.innerHTML,
      endingIntact:document.getElementById("rs").innerHTML===previousHtml,
      journalIntact:document.getElementById("lg").innerHTML===previousJournal
    };
  } finally {HL=oldHL;S.dead=oldDead;}
})()`,ctx,{timeout:60000});
assert.ok(integration.results>=1,
  'real postmortem comparison must produce at least one valid life, not only mocked results');
assert.ok(integration.endingIntact && integration.journalIntact,
  'all hidden lives preserve the visible ending and the visible journal');

// The supported birth-year edges and different caller death ages must not
// let hidden peer births replace the active dead life, save, or random stream.
for (const [by,age] of [[1000,0],[1100,72]]) {
  ctx.boundary={by,age};
  vm.runInContext(`born({by:boundary.by,seed:905041});
    S.age=boundary.age;S.year=S.by+S.age;S.dead=1;delete STAT.op;`,ctx);
  const snapshot=annual.observe(ctx);
  const statistics=vm.runInContext('JSON.stringify(STAT)',ctx);
  const html=ending.innerHTML, journal=history.innerHTML;
  storage.set('terra2','boundary-autosave');
  const result=vm.runInContext('simPeer(905042)',ctx,{timeout:30000});
  assert.ok(result.nm && result.dc && Number.isInteger(result.age));
  assert.deepEqual(annual.observe(ctx),snapshot,'boundary comparison restores life/world/RNG');
  assert.equal(vm.runInContext('JSON.stringify(STAT)',ctx),statistics);
  assert.equal(storage.get('terra2'),'boundary-autosave');
  assert.equal(ending.innerHTML,html);
  assert.equal(history.innerHTML,journal);

  const originalConsole=ctx.console;
  ctx.console={...console,error(){}};
  try {
    assert.throws(()=>vm.runInContext(`(()=>{
      const previous=slot;
      try {slot=()=>{R();throw Error('boundary-peer-failure');};return simPeer(905043);}
      finally {slot=previous;}
    })()`,ctx,{timeout:30000}),/boundary-peer-failure/);
  } finally {ctx.console=originalConsole;}
  assert.deepEqual(annual.observe(ctx),snapshot,'failed comparison restores the same state');
  assert.equal(vm.runInContext('JSON.stringify(STAT)',ctx),statistics);
  assert.equal(storage.get('terra2'),'boundary-autosave');
  assert.equal(ending.innerHTML,html);
  assert.equal(history.innerHTML,journal);
}
console.log('ending-comparison: passed');
