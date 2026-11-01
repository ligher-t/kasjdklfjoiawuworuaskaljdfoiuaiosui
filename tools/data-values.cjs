'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
function loadData(root){const context=vm.createContext({window:{}});vm.runInContext(require('./runtime.cjs').readData(root),context,{timeout:30000});return{context,data:context.window.GAME_DATA};}
function graph(value,seen=new Map()){
 if(value===null)return null;const type=typeof value;
 if(type==='undefined')return{$type:'undefined'};
 if(type==='number'&&(!Number.isFinite(value)||Object.is(value,-0)))return{$number:Object.is(value,-0)?'-0':String(value)};
 if(type!=='object'&&type!=='function')return value;
 if(seen.has(value))return{$ref:seen.get(value)};const id=seen.size;seen.set(value,id);
 if(type==='function')return{$id:id,$function:{name:value.name,length:value.length,source:String(value)}};
 const tag=Object.prototype.toString.call(value);
 if(tag==='[object Map]')return{$id:id,$map:[...value].map(([k,v])=>[graph(k,seen),graph(v,seen)])};
 if(tag==='[object Set]')return{$id:id,$set:[...value].map(v=>graph(v,seen))};
 return{$id:id,$type:tag,properties:Reflect.ownKeys(value).map(key=>{const descriptor=Object.getOwnPropertyDescriptor(value,key);if(!('value'in descriptor))throw Error('Expected data-only property: '+String(key));return[String(key),{enumerable:descriptor.enumerable,configurable:descriptor.configurable,writable:descriptor.writable},graph(descriptor.value,seen)];})};
}
function signature(data){return createHash('sha256').update(JSON.stringify(graph(data))).digest('hex');}
function fingerprint(root,context){for(const file of ['js/version.js','js/core/config.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{timeout:15000});return vm.runInContext('DATA_FINGERPRINT',context);}
module.exports={loadData,graph,signature,fingerprint};
