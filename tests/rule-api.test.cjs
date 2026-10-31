'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
function fresh(){const ctx=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(path.join(root,'rules.js'),'utf8'),ctx);return ctx.window.TERRA_RULES;}
const api=fresh(),calls=[];
assert(Object.isFrozen(api)&&Object.isFrozen(api.services));
let runtimeProviders;
const providerContext=vm.createContext({window:{TERRA_RULES:{bind(input){runtimeProviders=input;}}}});
vm.runInContext(fs.readFileSync(path.join(root,'js/rules/providers.js'),'utf8'),providerContext);
for(const [domain,methods] of Object.entries(api.contract))
  assert.deepEqual(Object.keys(runtimeProviders[domain]||{}).sort(),Object.keys(methods).sort(),domain+' provider/contract mismatch');
assert.deepEqual(Object.keys(runtimeProviders).sort(),Object.keys(api.contract).sort(),'rule provider domains differ from contract');
assert.throws(()=>api.services.economy.availableFunds({}),/not been bound/);
assert.throws(()=>api.bind({}),/Missing rule service/);
const providers={};
for(const [domain,methods]of Object.entries(api.contract)){
  providers[domain]={};assert(Object.isFrozen(api.services[domain]));
  for(const [method,original]of Object.entries(methods))providers[domain][method]=function(...args){calls.push({domain,method,original,args,receiver:this});return args[0];};
}
assert.throws(()=>api.bind({...providers,unknown:{}}),/Unknown rule domain/);
assert.deepEqual(calls,[],'Binding validates functions without executing game rules');
api.bind(providers);
const marker={id:'same-reference'};
for(const [domain,methods]of Object.entries(api.contract))for(const method of Object.keys(methods)){
  assert.equal(api.services[domain][method](marker,17),marker);
  const call=calls.at(-1);assert.equal(call.args[0],marker);assert.equal(call.args[1],17);assert.equal(call.receiver,undefined);
}
assert.throws(()=>api.bind(providers),/already bound/);
const replacement=fresh();let current=()=>1;
const dynamic={};for(const [domain,methods]of Object.entries(replacement.contract)){dynamic[domain]={};for(const method of Object.keys(methods))Object.defineProperty(dynamic[domain],method,{enumerable:true,get:()=>current});}
replacement.bind(dynamic);assert.equal(replacement.services.economy.availableFunds(),1);current=()=>2;assert.equal(replacement.services.economy.availableFunds(),2,'Provider getters preserve existing debug/test function overrides');
console.log(`PASS ${calls.length} explicit rule services, atomic binding, immutable facade and live providers`);
