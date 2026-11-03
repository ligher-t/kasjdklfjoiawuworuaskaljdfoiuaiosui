'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx,{timeout:30000}));

for(let i=0;i<2;i++){
  ctx.BRANCH=i;
  const result=inspect(`
    born({seed:20261131+BRANCH,by:1064,region:'クルビア'});
    S.year=1098;S.age=34;S.job=39;
    ap({lifeAffiliation:{id:'rhine-lab',title:'ライン生命医科学研究所',
        kind:'employer',action:'join',role:'専任研究員'},
        lifeGoal:{id:'rhine-research',
          title:'ライン生命で最先端科学の真理を開拓する',action:'start'}});
    S.fl.rhine_whistleblower=1;
    const event=EV.find(e=>e.id==='sr_rhine_rhodes_asylum'),
      ethics=EV.find(e=>e.id==='sr_rhine_diabolic_ethical_crossroad');
    const before=elig(event,S,tags(S));
    ap(event.c[BRANCH].o[0][2]);
    const aff=S.lifeRecord.affiliations.find(a=>a.id==='rhine-lab'),
      goal=S.lifeRecord.goals.find(g=>g.id==='rhine-research'),
      staff=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff');
    const after=elig(event,S,tags(S)),
      staffStatus=staff?.status||null,
      stateIssues=auditLifeState(S);
    S.sn[event.id]=S.year;
    S.job=39;
    ap({lifeAffiliation:{id:'rhine-lab',action:'return'}});
    const secondTry=elig(event,S,tags(S));
    return {before,after,secondTry,asylumOnce:event.once,ethicsOnce:ethics.once,
      aff:aff.status,goal:goal.status,goalAction:goal.history.at(-1).action,
      goalTitle:goal.title,staff:staffStatus,
      whistleblower:S.fl.rhine_whistleblower,issues:stateIssues};
  `);
  assert.equal(result.before,true,'current whistleblower has an asylum option');
  assert.equal(result.after,false,'the prior employer must not receive another asylum event');
  assert.equal(result.secondTry,false,'once prevents repetition even after a return');
  assert.equal(result.asylumOnce,true);
  assert.equal(result.ethicsOnce,true);
  assert.equal(result.goal,'abandoned');
  assert.equal(result.goalAction,'abandon');
  assert.equal(result.goalTitle,'ライン生命で最先端科学の真理を開拓する');
  assert.equal(result.staff,i===0?'active':null);
  assert.equal(result.whistleblower,1,'the historical whistleblower flag survives');
  assert.deepEqual(result.issues,[]);
}
const research=inspect(`
 born({seed:20261141,by:1064,region:'クルビア'});
 S.year=1102;S.age=38;S.job=29;
 ap({lifeAffiliation:{id:'rhodes-staff',title:'ロドス・アイランド',
     kind:'employer',action:'join',role:'医療補助'},
     lifeGoal:{id:'rhodes-work',title:'ロドスで担当する仕事を無理なく続ける',action:'start'}});
 ap({lifeAffiliation:{id:'rhodes-research',title:'ロドスの鉱石病経過研究',
     kind:'project',action:'join'},
     lifeGoal:{id:'oripathy-research',title:'病状を記録する研究を続ける',action:'start'}});
 ap({lifeAffiliation:{id:'rhodes-staff',action:'suspend'},
     lifeGoal:{id:'rhodes-work',action:'pause'}});
 const event=EV.find(e=>e.id==='life_rhodes_research_stall');
 ap(event.c[3].o[0][2]);
 const status=id=>S.lifeRecord.affiliations.find(a=>a.id===id)?.status,
   goal=id=>S.lifeRecord.goals.find(g=>g.id===id);
 return {research:status('rhodes-research'),staff:status('rhodes-staff'),
   medicalGoal:goal('oripathy-research').status,staffGoal:goal('rhodes-work').status,
   staffAction:goal('rhodes-work').history.at(-1).action,
   job:S.job,issues:auditLifeState(S)};
`);
assert.deepEqual([research.research,research.staff],['left','left']);
assert.deepEqual([research.medicalGoal,research.staffGoal],['abandoned','abandoned']);
assert.equal(research.staffAction,'abandon');
assert.equal(research.job,0);
assert.deepEqual(research.issues,[]);
const arena=inspect(`
 born({seed:20261142,by:1063,region:'カジミエーシュ'});
 S.year=1101;S.age=38;S.job=32;
 ap({lifeAffiliation:{id:'kazimierz-arena-staff',title:'競技会場の運営職',kind:'employer',
     action:'join',role:'施設運営・整備'},
     lifeGoal:{id:'kazimierz-arena-work',title:'会場の仕事で生活を立てる',action:'start'}});
 const e=EV.find(x=>x.id==='sr_kazimierz_arena_shift');
 const eligibleBefore=elig(e,S,tags(S));
 ap(e.c[2].o[0][2]);
 const goal=S.lifeRecord.goals.find(g=>g.id==='kazimierz-arena-work');
 return {eligibleBefore,eligibleAfter:elig(e,S,tags(S)),
   affiliation:S.lifeRecord.affiliations.find(a=>a.id==='kazimierz-arena-staff').status,
   goal:goal.status,goalAction:goal.history.at(-1).action,job:S.job,
   issues:auditLifeState(S)};
`);
assert.equal(arena.eligibleBefore,true);
assert.equal(arena.eligibleAfter,false);
assert.equal(arena.affiliation,'left');
assert.equal(arena.goal,'abandoned');
assert.equal(arena.goalAction,'abandon');
assert.equal(arena.job,0);
assert.deepEqual(arena.issues,[]);
console.log('PASS: Rhine asylum one-time boundary, Rhodes parallel exit, arena retirement');
