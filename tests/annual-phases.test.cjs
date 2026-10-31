'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const entry=fs.readFileSync(path.join(__dirname,'../js/life/annual.js'),'utf8');
const phases=['advanceAnnualCalendar','advanceAnnualRelationsAndAccess','advanceAnnualWellbeing','advanceAnnualInfection','settleAnnualHouseholdBudget','applyAnnualPersonalBudget','recordAnnualWealthAndHistory'];
for(const deathAt of [null,'advanceAnnualInfection','hist','fin']){
 const calls=[],trait={original:true},state={age:16,year:1090,mo:12,f:7,t:trait,dead:false},ctx={};
 for(const name of phases)ctx[name]=(...args)=>{
  calls.push(name);assert.equal(args[0],state);
  if(name==='advanceAnnualCalendar'){state.year++;state.mo=0;state.f=4;state.t={replacement:true};}
  if(name==='advanceAnnualWellbeing'){assert.deepEqual(args.slice(2),[17,trait,7,1]);}
  if(name==='applyAnnualPersonalBudget'){assert.deepEqual(args.slice(2),[17,trait,7]);return true;}
  if(name==='recordAnnualWealthAndHistory')assert.deepEqual(args.slice(2),[17,true]);
  if(name===deathAt)state.dead=true;
 };
 const services={P:key=>({'life.policyStartAge':15,'life.careEffectEndAge':18})[key],restricted:()=>false};
 for(const name of ['hist','fin','rd','sched','SV'])services[name]=()=>{calls.push(name);if(name===deathAt)state.dead=true;};
 ctx.currentLifeState=()=>state;ctx.ANNUAL_SERVICES=services;vm.createContext(ctx);vm.runInContext(entry,ctx);vm.runInContext('tick()',ctx);
 const tail=deathAt==='advanceAnnualInfection'||deathAt==='hist'?['hist']:deathAt==='fin'?['hist','fin']:['hist','fin','rd','sched','SV'];
 assert.deepEqual(calls,[...phases,...tail],String(deathAt)+' preserves annual processing and death gates');
 assert.equal(state.age,17);assert.equal(state.year,1091);assert.equal(state.mo,0);
}
// Live ports forward to the same engine helpers, without extra random draws.
const {context,setup}=require('./support/annual-cases.cjs'),{ctx}=context(path.resolve(__dirname,'..'));
vm.runInContext(`(()=>{
 HL=1;born({seed:905100,region:'龍門'});const input={sentinel:true};let seen;
 const original=advanceSocialLearning;advanceSocialLearning=function(...args){seen={args,receiver:this};return input;};
 if(ANNUAL_SERVICES.advanceSocialLearning(S,input)!==input||seen.args[0]!==S||seen.args[1]!==input)throw Error('Port forwarding changed');
 advanceSocialLearning=original;
 HL=0;if(ANNUAL_SERVICES.HL!==0)throw Error('Captured stale headless flag');HL=1;
 const saved=RANDOM_STATE,one=ANNUAL_SERVICES.R();RANDOM_STATE=saved;const expected=R();
 if(one!==expected||S.rngState!==RANDOM_STATE)throw Error('Annual random port consumed a different draw');
 if(!Object.isFrozen(ANNUAL_SERVICES))throw Error('Annual ports must be frozen');
})()`,ctx);
const employmentContext=context(path.resolve(__dirname,'..'));
setup(employmentContext.ctx,{id:'employment-entry',seed:905101,region:'ヴィクトリア',age:15});
vm.runInContext(`(()=>{
 const s=S;s.age=15;s.year=s.by+15;s.mo=12;s.job=0;s.lifeRecord.careerChanges=[];
 prepareAnnualPersonalBudget(s,ANNUAL_SERVICES,15,s.t,s.f);
 if(s.job===0||s.lifeRecord.careerChanges.length!==1)throw Error('initial starter employment must be assigned and recorded once');
 const initialJob=s.job;
 s.job=0;recordCareerChange(s,initialJob,0,null);
 prepareAnnualPersonalBudget(s,ANNUAL_SERVICES,16,s.t,s.f);
 if(s.job!==0)throw Error('an unemployed person with prior employment history must stay unemployed until a job event');
 if(s.lifeRecord.careerChanges.length!==2)throw Error('the unemployment transition must remain in career history');
})()`,employmentContext.ctx);
console.log('PASS annual phase order, captured policy/traits, death gates, live ports, RNG forwarding and employment continuity');
