'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),{dataFiles}=require('../tools/runtime.cjs');
function fresh(){const context=vm.createContext({window:{}});for(const file of ['rules.js','events.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);return context;}
const context=fresh();vm.runInContext(`(()=>{
 const api=window.TERRA_DATA_BUILD;let runs=0;
 api.fragment('model/guide','probe-values')(function(data,define,rules,parts){'use strict';if(this!==undefined)throw Error('Fragment receiver changed');runs++;define('probeConst',[],false);return {value:7};});
 api.fragment('model/guide','probe-use')(function(data,define,rules,parts){'use strict';const value=parts('probe-values');if(value.value!==7)throw Error('Fragment result changed');data.probeConst.push(1);let denied=false;try{data.probeConst=[];}catch(error){denied=error.name==='TypeError';}if(!denied)throw Error('Const replacement allowed');});
 if(runs)throw Error('Fragment executed at registration');
 let saved;
 api.run('model/guide',(data,define,rules,parts)=>{saved=parts;parts('probe-use');let repeated=false;try{parts('probe-values');}catch(error){repeated=/Missing or already consumed/.test(error.message);}if(!repeated||runs!==1||data.probeConst.length!==1)throw Error('Exactly-once construction failed');});
 let late=false;try{saved('probe-use');}catch(error){late=/only available during construction/.test(error.message);}if(!late)throw Error('Reader leaked after phase completion');
})()`,context);
const duplicate=fresh();vm.runInContext("window.TERRA_DATA_BUILD.fragment('model/guide','same')(()=>1)",duplicate);assert.throws(()=>vm.runInContext("window.TERRA_DATA_BUILD.fragment('model/guide','same')(()=>2)",duplicate),/Duplicate data fragment/);
const wrong=fresh();assert.throws(()=>vm.runInContext("window.TERRA_DATA_BUILD.fragment('model/sources','wrong')(()=>1)",wrong),/Data phase order/);
const unused=fresh();vm.runInContext("window.TERRA_DATA_BUILD.fragment('model/guide','unused')(()=>1)",unused);assert.throws(()=>vm.runInContext("window.TERRA_DATA_BUILD.run('model/guide',()=>{})",unused),/Unused data fragments/);assert.equal(unused.window.GAME_DATA,undefined);
const missing=fresh(),files=dataFiles(root).filter(file=>file!=='rules.js'&&file!=='events.js'),omitted=files.find(file=>file.startsWith('data/parts/'));
assert.throws(()=>{for(const file of files)if(file!==omitted)vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),missing,{filename:file,timeout:15000});},/Missing or already consumed data fragment/);assert.equal(missing.window.GAME_DATA,undefined,'Missing factory cannot publish partial game data');
console.log('PASS deferred registration, exact-once values, receiver/const contracts, missing/duplicate/unused/wrong-phase rejection and reader lifetime');
