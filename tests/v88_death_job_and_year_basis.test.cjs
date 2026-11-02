'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
function start(region,job,extra='') {
  setup(ctx,{id:'death-boundaries',seed:804082,region,age:30});
  ctx.WORK_JOB=job;
  vm.runInContext(`S.job=WORK_JOB;S.h=75;S.p=35;S.inf=0;S.ob=0;
    S.fl.workplace_hazard=0;S.f=0;S.local.city=null;S.ar=0;
    S.lifeRecord.skills=[];`+extra,ctx);
}
const risk=name=>read('return D(S).filter(x=>x.c==='+JSON.stringify(name)+').length');
const mine='事故死（落盤・坑道崩落生き埋め）',
  arena='闘技場での致命傷（競技・地下闘技）',
  arts='アーツ暴走による自壊',
  demon='極北の虚無・悪魔（未知の侵食による消失）';
start('レム・ビリトン',2);assert.equal(risk(mine),0,'factory worker is not a miner');
start('レム・ビリトン',3);assert.equal(risk(mine),1,'miner risks a collapse');
start('レム・ビリトン',80);assert.equal(risk(mine),1,'mining platform engineer has mine exposure');
start('ウルサス',1,'S.f=8;');assert.equal(risk(mine),0,'generic risky work cannot invent a mine');
start('カジミエーシュ',4);assert.equal(risk(arena),0,'mercenary is not an arena knight');
start('カジミエーシュ',10);assert.equal(risk(arena),1,'knight can participate in an arena');
start('カジミエーシュ',63);assert.equal(risk(arena),1,'competition knight has arena exposure');
start('サーミ',6);assert.equal(risk(demon),0,'official job does not imply a northern patrol');
start('サーミ',71);assert.equal(risk(demon),1,'northern border guard faces the specific hazard');
start('イベリア',1, "S.r={...S.r,n:'エーギル'};");
assert.equal(risk('海の怪異（恐魚の捕食・同化・海への喪失）'),0,'Aegir ancestry is not an exposure record');
start('レム・ビリトン',16);assert.equal(risk('獣害（狂暴化源石獣の襲撃）'),1,'canonical region spelling activates regional hazards');
start('クルビア',3,'S.inf=1;S.ob=80;S.p=15;');
assert.equal(risk(arts),0,'miners with oripathy are not automatically Arts-capable');
vm.runInContext('S.ar=42;',ctx);assert.equal(risk(arts),1,'Arts ability supports Arts-specific death');
start('クルビア',11,'S.inf=1;S.ob=80;S.p=15;');
assert.equal(risk(arts),1,'Arts engineer is an Arts job');

start('龍門',1,'S.mo=0;S.flow={year:S.year,income:{wages:1000},expense:{living:400},net:600};S.inc=1000;S.exp=400;');
const unknown=read(`HL=1;AU='r';die('老衰','年次死因の検査');
  return {month:S.mo,process:S.deathProcess,errors:auditLifeState(S)};`);
assert.equal(unknown.month,0);
assert.equal(unknown.process.monthBasis,'annual-month-unknown');
assert.equal(unknown.process.accountingPeriod.kind,'full-year-model');
assert.equal(unknown.process.accountingPeriod.proratedToDeath,false);
assert(unknown.process.modelNote.includes('実収入・実支出を示さない'));
assert.deepEqual(unknown.errors,[],'undated annual mortality remains audit-valid');

start('龍門',1,'S.mo=5;S.flow={year:S.year-1,income:{wages:1000},expense:{living:400},net:600};');
const dated=read(`HL=1;AU='r';die('事故死','月が記録された出来事');
  return {month:S.mo,process:S.deathProcess,errors:auditLifeState(S)};`);
assert.equal(dated.month,5);
assert.equal(dated.process.monthBasis,'current-calendar-month');
assert.equal(dated.process.accountingPeriod.kind,'last-completed-year');
assert.deepEqual(dated.errors,[]);
console.log('PASS canonical career IDs, death exposures, unknown month, yearly finance provenance and death record audit');
