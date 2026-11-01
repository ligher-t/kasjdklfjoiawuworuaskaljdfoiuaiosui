'use strict';
const path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
const annual=require('./annual-cases.cjs');
const cases=[...annual.cases,{id:'information-pair',seed:906101,region:'ヴィクトリア',age:30,profile:'information'},{id:'optional-panels-absent',seed:906102,region:'龍門',age:20,profile:'absent'},{id:'escaped-content',seed:906103,region:'クルビア',age:22,profile:'escaped'}];
const normalize=value=>JSON.parse(JSON.stringify(value,(key,item)=>['sourceFingerprintAtBirth','currentSourceFingerprint'].includes(key)?undefined:item));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function context(root){
 const nodes=new Map(),storage=new Map(),writes=[],missing=new Set(),blobs=[],timers=[],clock={now:1700000000000};let serial=0;
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[clock.now]));}static now(){return clock.now;}}
 function node(id=''){
  if(nodes.has(id))return nodes.get(id);
  const values={innerHTML:'',textContent:'',hidden:false,checked:false,disabled:false,title:'',value:'',href:'',download:''},classes=new Set(),attributes={};
  const item={id,dataset:{},style:{},children:[],values,classes,attributes,
   classList:{toggle(name,on){if(on===undefined)on=!classes.has(name);if(on)classes.add(name);else classes.delete(name);writes.push([id,'class',name,!!on]);},add(name){classes.add(name);},remove(name){classes.delete(name);}},
   setAttribute(name,value){attributes[name]=String(value);writes.push([id,'attribute',name,String(value)]);},removeAttribute(name){delete attributes[name];},
   parentNode:null,
   append(...children){for(const child of children)this.insertBefore(child,null);},
   appendChild(child){this.append(child);return child;},
   insertBefore(child,before){
    if(before!==null&&!this.children.includes(before))throw Error('reference must be a child');
    if(child.parentNode){const siblings=child.parentNode.children;siblings.splice(siblings.indexOf(child),1);}
    const index=before===null?this.children.length:this.children.indexOf(before);
    this.children.splice(index,0,child);child.parentNode=this;return child;
   },
   replaceChildren(...children){for(const child of this.children)child.parentNode=null;this.children=[];this.innerHTML='';this.append(...children);},
   insertAdjacentHTML(position,text){this.innerHTML=position==='afterbegin'?text+this.innerHTML:this.innerHTML+text;},querySelectorAll(){return[];},querySelector(){return null;},addEventListener(){},focus(){},click(){writes.push([id,'click']);},remove(){writes.push([id,'remove']);}};
  for(const key of Object.keys(values))Object.defineProperty(item,key,{get:()=>values[key],set:value=>{values[key]=value;writes.push([id,key,value]);},enumerable:true});nodes.set(id,item);return item;
 }
 const document={currentScript:null,getElementById(id){
  if(missing.has(id))return null;
  const item=node(id);
  const parentId=id==='family-unrecorded'?'family-record-sections':id==='place-unrecorded'?'place-record-sections':null;
  if(parentId){const parent=node(parentId);if(item.parentNode!==parent)parent.append(item);}
  return item;
},querySelector(){return null;},querySelectorAll(selector){
  if(selector==='#lg li')return node('lg').children;
  if(selector==='#tabs button')return['tab-l','tab-c','tab-r'].map(id=>node(id));
  return[];
 },createElement:tag=>node('created-'+tag+'-'+serial++),createTextNode:text=>({textContent:text}),addEventListener(){},activeElement:{tagName:'BODY'},documentElement:{style:{setProperty(){}},removeAttribute(){},setAttribute(){}},head:{appendChild(){}},body:node('body')};
 const ctx=vm.createContext({window:annual.mockBrowserWindow(),document,console,Date:FixedDate,Blob:class{constructor(parts,options){this.parts=parts;this.options=options;}},URL:{createObjectURL(blob){blobs.push(blob);return'blob:presentation-fixture';},revokeObjectURL(){}},setTimeout(callback){timers.push(callback);},setInterval(){},alert(){},confirm(){return true;},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))}});
 const runtime=require(path.join(root,'tools/runtime.cjs'));vm.runInContext(runtime.readData(root),ctx,{timeout:30000});vm.runInContext(runtime.readEngine(root),ctx,{timeout:30000});
 vm.runInContext("HL=1;AU='r';STAT.ev={};STAT.op={};STAT.choiceMonths=new Set();",ctx);
 return{ctx,nodes,writes,missing,blobs,timers,clock,sourceFingerprint:vm.runInContext('SOURCE_FINGERPRINT',ctx)};
}
function setup(env,scenario){annual.setup(env.ctx,scenario);vm.runInContext(`(()=>{
 const c=SCENARIO;
 if(c.profile==='information'){
  S.known.londinium_war=1;S.world.events.londinium_war=1098;S.friendContact=ensureSocialContact(S,'friend');
  const first=EV.find(row=>row.id==='sr_londinium_distant_news');recordInformationClaimAction(S,first.c[0].o[0][2].informationClaimAction,first.id);
  S.year++;S.age++;const second=EV.find(row=>row.id==='sr_londinium_price_followup'),choice=second.c.find(choice=>choice.o?.[0]?.[2]?.informationClaimAction?.claimId==='londinium-grain-price-stability'&&choice.o[0][2].informationClaimAction.action==='receive');recordInformationClaimAction(S,choice.o[0][2].informationClaimAction,second.id);
 }
 if(c.profile==='escaped'){S.nm='<probe & "名前">';S.pet='雲獣<&>';S.fl.hobby_story=1;}
})()`,env.ctx);
 if(scenario.profile==='absent')for(const id of ['locality-meter','person-tie-summary','close-knowledge','social-learning-note','ori-history'])env.missing.add(id);
 env.writes.length=0;
}
function dom(env){return [...env.nodes].map(([id,node])=>({id,values:node.values,dataset:node.dataset,attributes:node.attributes,classes:[...node.classes],children:node.children.map(child=>child.id||child.textContent)}));}
function state(ctx){return normalize(vm.runInContext('({state:S,world:W,rng:RANDOM_STATE,seed:RANDOM_SEED,delta:DLT,pending:PENDING_DEATH_TRACE})',ctx));}
function visible(env,value){return JSON.parse(JSON.stringify(value,(_key,item)=>typeof item==='string'?item.replaceAll(env.sourceFingerprint,'<source-fingerprint>'):item));}
function observe(env){
 const trace=normalize(vm.runInContext('traceState(S)',env.ctx)),steps=[];
 for(const [index,advance]of [0,100,3100].entries()){
  env.clock.now+=advance;if(index===1)vm.runInContext('S.h-=3;S.cash+=400',env.ctx);env.writes.length=0;
  vm.runInContext('HL=0;rd()',env.ctx,{timeout:15000});
  steps.push({stateHash:hash(state(env.ctx)),domHash:hash(visible(env,dom(env))),writesHash:hash(visible(env,env.writes)),nodeHashes:Object.fromEntries(visible(env,dom(env)).map(node=>[node.id,hash(node)]))});
 }
 env.blobs.length=0;vm.runInContext('exportLife()',env.ctx,{timeout:15000});
 const payload=normalize(JSON.parse(env.blobs.at(-1).parts.join('')));
 return{traceHash:hash(trace),traceKeys:Object.keys(trace),steps,exportHash:hash(payload),exportKeys:Object.keys(payload),exportVersion:payload.traceVersion};
}
const auditCases=[
 {id:'clean-catalog',kind:'catalog',code:''},
 {id:'duplicate-id',kind:'catalog',code:'EV[1].id=EV[0].id;'},
 {id:'unknown-condition',kind:'catalog',code:"EV[0].need=['presentation_unknown_flag'];"},
 {id:'invalid-effect',kind:'catalog',code:"EV.find(event=>!event.c).fx={presentationUnknownEffect:1,h:'bad'};"},
 {id:'negative-weight',kind:'catalog',code:'EV[0].w=-1;'},
 {id:'missing-after',kind:'catalog',code:"EV[0].after={id:'presentation_missing_event'};"},
 {id:'parameter-range',kind:'catalog',code:"PARAM['economy.spouseSharedHouseholdIncomeShare']=2;"},
 {id:'parameter-metadata',kind:'catalog',code:"SIM_PARAMS[0].unit='';"},
 {id:'flag-metadata',kind:'catalog',code:"FLAG_REGISTRY[Object.keys(FLAG_REGISTRY)[0]].label='';"},
 {id:'migration',kind:'catalog',code:"MIGRATION_ROUTES[REG[0].n]=[{n:'presentation_unknown_region'}];"},
 {id:'clean-state',kind:'state',code:''},
 {id:'bad-clock',kind:'state',code:'S.age=NaN;'},
 {id:'bad-money-health',kind:'state',code:'S.cash=-1;S.debt=-5;S.h=NaN;'},
 {id:'bad-rng',kind:'state',code:"S.randomAlgorithm='unknown';S.rngState=0;S.randomSeed=-1;"},
 {id:'bad-community',kind:'state',code:'S.community.metrics.access=5;S.community.lastYear=S.year+1;'},
 {id:'duplicate-person',kind:'state',code:'S.par.mo.id=S.par.fa.id;'}
];
function diagnostics(env,scenario){vm.runInContext("HL=1;born({seed:906200,by:1077,region:'龍門'});",env.ctx);vm.runInContext(scenario.code,env.ctx);return Array.from(vm.runInContext(scenario.kind==='catalog'?'validate()':'auditLifeState(S)',env.ctx));}
module.exports={cases,context,setup,observe,normalize,hash,state,auditCases,diagnostics};
