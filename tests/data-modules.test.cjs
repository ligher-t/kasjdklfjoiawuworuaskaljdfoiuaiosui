'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {dataFiles, readData} = require('../tools/runtime.cjs');
const root = path.resolve(__dirname, '..');
const files = dataFiles(root).filter(file=>file!=='rules.js');
const run = (file, context) => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename:file, timeout:15000});
const fresh = () => {
  const context=vm.createContext({window:{}});
  run('rules.js',context);
  return context;
};
assert.equal(files[0], 'events.js');
assert.equal(files.at(-1), 'data/finalize.js');
assert.equal(files.length, new Set(files).size);
// Missing, repeated and reordered files fail before publishing a partial game.
for (const wrong of [files[2], files.at(-1)]) {
  const context = fresh(); run(files[0], context);
  assert.throws(() => run(wrong, context), /Data phase order/);
  assert.equal(context.window.GAME_DATA, undefined);
}
const duplicate = fresh();run(files[0], duplicate);run(files[1], duplicate);
assert.throws(() => run(files[1], duplicate), /Data phase order/);
// The new shared construction record retains strict const writes, mutable lets,
// and rejection of reads before a binding has been initialized.
const contracts = fresh();run(files[0], contracts);
vm.runInContext(`window.TERRA_DATA_BUILD.run('model/guide', function(data, define) {
  'use strict';
  define('probeConst', [1], false); data.probeConst.push(2);
  let immutable=false;try { data.probeConst=[]; } catch(error) { immutable=error.name==='TypeError'; }
  if(!immutable || data.probeConst.length!==2) throw Error('const contract lost');
  define('probeLet', 1, true); data.probeLet++;
  if(data.probeLet!==2) throw Error('let contract lost');
  let tdz=false;try { void data.notInitialized; } catch(error) { tdz=error.name==='ReferenceError'; }
  if(!tdz) throw Error('read-before-initialization contract lost');
  let earlyWrite=false;try { data.notInitialized=1; } catch(error) { earlyWrite=error.name==='ReferenceError'; }
  if(!earlyWrite) throw Error('write-before-initialization contract lost');
});`, contracts);
const context=fresh();
for(const file of files) run(file,context);
const data=context.window.GAME_DATA;
assert(data && Array.isArray(data.EV));
assert.equal(context.window.TERRA_DATA_BUILD, undefined, 'Private builder is removed after finalization');
assert.deepEqual(Object.keys(context.window), ['TERRA_RULES','GAME_DATA']);
assert.equal(new Set(data.EV.map(event=>event.id)).size,data.EV.length);
// Public data helpers must retain their private state after the builder is gone.
assert.doesNotThrow(()=>data.eventFlagRefs(data.EV[0]));
const combined=vm.createContext({window:{}});vm.runInContext(readData(root),combined,{timeout:30000});
assert.equal(combined.window.GAME_DATA.EV.length,data.EV.length);
assert.equal(combined.window.TERRA_DATA_BUILD,undefined);
console.log(`PASS ${files.length-1} ordered data modules, private bindings, constant/mutable contracts and finalization`);
