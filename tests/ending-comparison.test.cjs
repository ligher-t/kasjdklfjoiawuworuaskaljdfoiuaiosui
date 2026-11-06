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


// Worker messages must be incremental, allow independent failure, and leave
// the original life, journal and autosave untouched.
const workers = [];
ctx.Worker = class {
  constructor(url) { this.url = url; this.terminated = false; workers.push(this); }
  postMessage(request) { this.request = request; }
  terminate() { this.terminated = true; }
};
const testBox = {
  innerHTML: '', busy: '', retry: null,
  setAttribute(name, value) { if (name === 'aria-busy') this.busy = value; },
  querySelector(selector) {
    return selector === '.ui-peer-retry'
      ? { addEventListener: (_type, callback) => { this.retry = callback; } }
      : null;
  }
};
ctx.testPeerRoot = {
  hidden: false, isConnected: true,
  querySelector: selector => selector === '.peers' ? testBox : null
};
const person = {nm:'検証人物',res:'カズデル',local:'集落',r:'サルカズ',
  care:'親族',age:42,dc:'病死',job:'無職',edu:'未就学',moves:0};
const originalDead = vm.runInContext('S.dead',ctx);
vm.runInContext('S.dead=1; HL=0;',ctx);
const beforeWorker = annual.observe(ctx);
const journalBefore = history.innerHTML, endingBefore = ending.innerHTML;
storage.set('terra2','original-autosave');
vm.runInContext('renderEndingPeers(S,testPeerRoot)',ctx);
assert.equal(workers.length,1,'one worker is created for the whole comparison');
assert.match(workers[0].url,/ending-peer-worker\.js$/);
assert.equal(workers[0].request.count,3);
assert.equal(testBox.busy,'true');
assert.match(testBox.innerHTML,/0\/3人/);
workers[0].onmessage({data:{type:'peer',index:0,person}});
assert.match(testBox.innerHTML,/1\/3人/,'the first life is visible before the next completes');
workers[0].onmessage({data:{type:'peer',index:1,error:'test: one comparison failed'}});
workers[0].onmessage({data:{type:'peer',index:2,person}});
workers[0].onmessage({data:{type:'done'}});
assert.equal(workers[0].terminated,true,'completed workers release their resources');
assert.equal(testBox.busy,'false','comparison settles after an independent failure');
assert.equal((testBox.innerHTML.match(/class="peer"/g)||[]).length,2);
assert.match(testBox.innerHTML,/比較を再試行/,'failed comparisons allow a retry');
assert.equal(typeof testBox.retry,'function');
assert.deepEqual(annual.observe(ctx),beforeWorker,'worker messages never mutate active life or RNG');
assert.equal(storage.get('terra2'),'original-autosave');
assert.equal(history.innerHTML,journalBefore);
assert.equal(ending.innerHTML,endingBefore);

// A replacement lifetime cancels a worker before it can publish stale results.
vm.runInContext('renderEndingPeers(S,testPeerRoot,1)',ctx);
const stale = workers[1];
assert.equal(stale.request.retryAttempt,1);
vm.runInContext('born({by:1077,seed:905044})',ctx);
assert.equal(stale.terminated,true,'a new birth terminates the old comparison');
stale.onmessage({data:{type:'done'}});
assert.equal(testBox.busy,'true','stale results cannot replace the new screen');

// Successful results are cached for the current engine and seed only.
vm.runInContext('S.dead=1;renderEndingPeers(S,testPeerRoot,0)',ctx);
const full = workers[2];
for(let i=0;i<3;i++)full.onmessage({data:{type:'peer',index:i,person}});
full.onmessage({data:{type:'done'}});
vm.runInContext('renderEndingPeers(S,testPeerRoot,0)',ctx);
assert.equal(workers.length,3,'a fully successful comparison reuses its session cache');
assert.equal(testBox.busy,'false');
vm.runInContext('cancelEndingPeerComparison()',ctx);
delete ctx.Worker;
vm.runInContext('S.dead='+Number(originalDead)+';HL=1;',ctx);

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
