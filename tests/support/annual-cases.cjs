'use strict';
const path=require('node:path'),vm=require('node:vm'),{createHash}=require('node:crypto');
const cases=[
 {id:'infant',seed:905001,region:'ウルサス',age:0},
 {id:'school',seed:905002,region:'リターニア',age:8},
 {id:'work-boundary',seed:905003,region:'クルビア',age:14},
 {id:'household-boundary',seed:905004,region:'龍門',age:17,profile:'household'},
 {id:'starter',seed:905005,region:'ヴィクトリア',age:22},
 {id:'insured-paid',seed:905006,region:'クルビア',age:28,profile:'insured'},
 {id:'insured-lapsed',seed:905007,region:'クルビア',age:34,profile:'lapsed'},
 {id:'insurance-abroad',seed:905008,region:'ヴィクトリア',age:31,profile:'insured'},
 {id:'infection-treatment',seed:905009,region:'カズデル',age:42,profile:'infection'},
 {id:'terminal-infection',seed:905010,region:'クルビア',age:44,profile:'terminal'},
 {id:'old-age',seed:905011,region:'リターニア',age:250,profile:'elder'},
 {id:'workshop-investment',seed:905012,region:'レム・ビリトン',age:26,profile:'investment'},
 {id:'household-debt',seed:905013,region:'サルゴン',age:10,profile:'house-debt'},
 {id:'parent-care-end',seed:905014,region:'極東',age:45,profile:'care'},
 {id:'detained-study',seed:905015,region:'ウルサス',age:19,profile:'detained'},
 {id:'personal-debt',seed:905016,region:'ボリバル',age:29,profile:'debt'}
];
// Both test environments load real runtime scripts but have no browser.
function mockBrowserWindow() {
 return {
   location:{search:''},
   scrollY:0,
   scrollTo(){},
   addEventListener(){},
   removeEventListener(){},
   matchMedia:query=>({
     media:query,matches:false,
     addEventListener(){},removeEventListener(){},
     addListener(){},removeListener(){}
   })
 };
}
function context(root){
 const nodes=new Map(),storage=new Map();
 function node(id=''){if(!nodes.has(id))nodes.set(id,{id,hidden:false,value:'',textContent:'',innerHTML:'',dataset:{},style:{},children:[],classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){},focus(){},append(){},appendChild(){},insertAdjacentHTML(_position,text){this.innerHTML+=text;},replaceChildren(){this.children=[];this.innerHTML='';},querySelector(){return null;},querySelectorAll(){return[];},addEventListener(){},click(){}});return nodes.get(id);}
 const document={currentScript:null,getElementById:node,querySelector(){return null;},querySelectorAll(){return[];},createElement:tag=>node('created-'+tag),createTextNode:text=>({textContent:text}),addEventListener(){},activeElement:{tagName:'BODY'},body:{classList:{toggle(){}}},documentElement:{style:{setProperty(){}},removeAttribute(){},setAttribute(){}},head:{appendChild(){}}};
 // Browser event registration must never schedule real callbacks in Node.
 const window=mockBrowserWindow();
 const ctx=vm.createContext({window,document,console,Date,setTimeout(){},setInterval(){},alert(){},confirm(){return true;},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,String(value))}});
 const runtime=require(path.join(root,'tools/runtime.cjs'));
 vm.runInContext(runtime.readData(root),ctx,{timeout:30000});vm.runInContext(runtime.readEngine(root),ctx,{timeout:30000});
 vm.runInContext("HL=1;AU='r';STAT.ev={};STAT.op={};STAT.choiceMonths=new Set();",ctx);
 return{ctx,nodes,storage};
}
function setup(ctx,scenario){ctx.SCENARIO=scenario;vm.runInContext(`(()=>{
 const c=SCENARIO;CAPTURE_TRACE=true;born({seed:c.seed,by:1077,region:c.region});
 S.age=c.age;S.year=S.by+S.age;S.mo=12;
 if(c.id==='school'){S.fl.sch=1;S.f=1;}
 if(c.profile==='household'){S.age=householdEndAge(S)-1;S.year=S.by+S.age;}
 if(c.profile==='insured'){S.fl.insured=1;S.insurancePaidYear=S.year;S.cash=30000000;S.job=7;}
 if(c.profile==='lapsed'){S.fl.insured=1;S.insurancePaidYear=S.year;S.cash=0;S.debt=100000000;S.job=0;S.fl.retired=1;}
 if(c.profile==='infection'||c.profile==='terminal'){
  S.inf=1;S.fl.dg=1;S.fl.tx=c.profile==='terminal'?0:1;S.ob=c.profile==='terminal'?P('infection.terminalThreshold'):35;
  S.infection={year:S.year-2,cause:'test setup',basis:'event-unclassified',diagnosedYear:S.year-1};
 }
 if(c.profile==='elder'){S.fl.retired=1;S.job=0;}
 if(c.profile==='investment'){S.investment=1000000;S.cash=10000000;S.job=7;}
 if(c.profile==='house-debt'){S.house.cash=0;S.house.debt=20000000;}
 if(c.profile==='care'){S.par.fa.d=0;S.par.fa.inf=1;S.par.fa.tx=1;S.par.fa.health=90;S.familyCare={target:'fa',plan:'shared',yearsRemaining:1,treatmentSupport:true,treatmentPaidTotal:0};S.cash=10000000;}
 if(c.profile==='detained'){S.fl.detained=1;S.study={kind:'uni',suspended:false,nextDue:S.year+1};}
 if(c.profile==='debt'){S.cash=0;S.debt=10000000;S.fl.debt_yakuza=1;}
 })()`,ctx,{timeout:15000});}
const normalize=value=>JSON.parse(JSON.stringify(value,(key,v)=>['sourceFingerprintAtBirth','dataFingerprintAtBirth'].includes(key)?undefined:v));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function observe(ctx){return normalize(vm.runInContext('({state:S,world:W,rng:RANDOM_STATE,seed:RANDOM_SEED,traceResolution:TRACE_RESOLUTION,pendingDeath:PENDING_DEATH_TRACE})',ctx));}
module.exports={cases,context,setup,observe,hash,normalize,mockBrowserWindow};
