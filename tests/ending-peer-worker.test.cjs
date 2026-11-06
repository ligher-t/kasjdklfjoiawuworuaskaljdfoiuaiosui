'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const workerCode = fs.readFileSync(path.join(root, 'js/ui/ending-peer-worker.js'), 'utf8');
const messages = [];
const context = vm.createContext({
  console, URL, setTimeout,
  fetch: async () => ({ ok: true, text: async () => html })
});
context.self = context;
context.location = { href: 'https://example.invalid/js/ui/ending-peer-worker.js', search: '' };
context.postMessage = message => messages.push(message);
context.importScripts = (...urls) => {
  for (const url of urls) {
    const file = new URL(url).pathname.slice(1);
    assert.ok(/^(?:[\w-]+\/)*[\w-]+\.js$/.test(file), 'only local script paths are loaded');
    assert.notEqual(file,'js/ui/bootstrap.js','the visible UI is never bootstrapped');
    const code = fs.readFileSync(path.join(root,file),'utf8');
    vm.runInContext(code,context,{filename:file,timeout:30000});
  }
};
vm.runInContext(workerCode,context,{filename:'ending-peer-worker.js',timeout:30000});
(async () => {
  await vm.runInContext('ENDING_PEER_RUNTIME_READY',context);
  const revision = vm.runInContext('ENGINE_REVISION',context);
  assert.equal(vm.runInContext('typeof simPeer',context),'function');
  const source = String.raw`simPeer=(seed, birth) => ({
    nm:'検証人物',seed,by:birth.by,bd:birth.bd,
    age:42,dc:'病死',res:'カズデル',local:'集落',
    r:'サルカズ',care:'親族',job:'無職',edu:'未就学',moves:0
  });`;
  vm.runInContext(source,context);
  await context.onmessage({data:{
    type:'run', revision, seed:905033, by:1077, bd:7,
    count:3, retryAttempt:0
  }});
  assert.deepEqual(messages.map(message => message.type),['peer','peer','peer','done']);
  assert.deepEqual(messages.slice(0,3).map(message => message.index),[0,1,2]);
  assert.ok(messages.slice(0,3).every(message => message.person.by===1077 && message.person.bd===7));
  assert.equal(new Set(messages.slice(0,3).map(message => message.person.seed)).size,3);
  console.log('ending-peer-worker: runtime and independent comparison protocol passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
