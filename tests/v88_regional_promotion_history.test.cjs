'use strict';
// Validate promotions against the live regional recruitment and affiliation engine.
// No lifespan or population simulation is required.
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const snapshot=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));

const promotions=[
  ['極東','car_hig_samurai_choice_duel','higashi-samurai-household','旗本頭'],
  ['極東','car_hig_cyber_choice_offensive','higashi-cyber-intelligence','電脳首席執行官'],
  ['ウルサス','car_urs_officer_choice_purge','ursus-imperial-officer','近衛少佐'],
  ['ウルサス','car_urs_guard_choice_riot','ursus-border-mine-guard','憲兵軍曹'],
  ['ヴィクトリア','car_vic_infantry_choice_skirmish','victoria-regular-infantry','連隊先任軍曹'],
  ['リターニア','car_lei_golden_choice_witch_remnant','leithania-golden-law','首席法衛'],
  ['シラクーザ','car_sir_soldier_choice_turf_war','siracusa-mafia-soldier','カポ'],
  ['イェラグ','car_kje_karlan_choice_ambush','kjerag-karlan-commercial','特務護衛班長'],
  ['カズデル','car_kazdel_mil_choice_major_battle','kazdel-military-commission','百人隊長'],
  ['イベリア','car_ibe_inq_choice_seaborn_attack','iberia-inquisition-officer','上級審問官'],
  ['イベリア','car_ibe_tuner_choice_fog','iberia-lantern-tuner','技師長'],
  ['ボリバル','car_bol_soldier_choice_counterattack','bolivar-coalition-soldier','軍曹'],
  ['ボリバル','car_bol_dossoles_choice_syndicate','bolivar-dossoles-police','警部補'],
  ['レム・ビリトン','car_rim_eng_choice_gas_leak','rim-mining-lead-engineer','最高顧問技師']
];
assert.equal(promotions.length,14,'14 explicitly named promotions');
for(const [region,incidentId,affiliationId,rank] of promotions){
  setup(ctx,{id:'regional-promotion',seed:740019,region,age:24});
  ctx.PROMOTION_CASE={incidentId,affiliationId,rank};
  const actual=snapshot(`
    const c=PROMOTION_CASE;
    S.age=24;S.year=1098;S.mo=6;
    S.k=100;S.p=100;S.cr=100;S.cash=15000000;S.house.cash=15000000;
    S.fl.retired=0;
    if(c.incidentId==='car_hig_cyber_choice_offensive') S.fl.cyber_trace=1;
    const entryId=c.incidentId.split('_choice_')[0]+'_entry';
    const entry=EV.find(x=>x.id===entryId);
    const incident=EV.find(x=>x.id===c.incidentId);
    if(!entry||!incident)throw Error('Promotion route not found: '+c.incidentId);
    const hiring=entry.c.flatMap(choice=>choice.o)
      .find(x=>x[2]?.lifeAffiliation?.id===c.affiliationId && x[2]?.job>=41)?.[2];
    if(!hiring)throw Error('Recruitment effect missing '+entryId);
    const success=incident.c[0].o[0][2];
    const other=incident.c[0].o[1][2];
    ap(hiring);
    const member=S.lifeRecord.affiliations.find(a=>a.id===c.affiliationId);
    const original=member.role;
    const oldJob=S.job;
    const available=incident.show(S)&&elig(incident,S,tags(S));
    const onSuccess=success.lifeAffiliation;
    const otherRole=other.lifeAffiliation?.action==='role';
    ap(success);
    const promoted={role:member.role,job:S.job,status:member.status,
      changes:member.history.filter(row=>row.action==='role'&&row.role===c.rank).length,
      roleRecord:member.history.find(row=>row.action==='role'&&row.role===c.rank),
      episodes:member.episodes.length};
    applyLifeAffiliation(onSuccess);
    const duplicateCount=member.history.filter(row=>row.action==='role'&&row.role===c.rank).length;
    ap({job:0});
    const departed={job:S.job,status:member.status,role:member.role,
      pastRank:member.history.some(row=>row.action==='role'&&row.role===c.rank),
      duty:incident.show(S)};
    ap({lifeAffiliation:onSuccess});
    const detached=member.history.filter(row=>row.action==='role'&&row.role===c.rank).length;
    S.year+=3;S.age+=3;S.mo=entry.months?.[0]||4;
    const rehireEligible=elig(entry,S,tags(S));
    ap(hiring);
    const reused={role:member.role,status:member.status,
      returning:member.episodes.at(-1)?.returning,
      episodes:member.episodes.length,
      initialRoleAtReturn:member.episodes.at(-1)?.roleAtStart,
      priorRank:member.history.some(row=>row.action==='role'&&row.role===c.rank)};
    ap(success);
    return {original,available,otherRole,onSuccess,oldJob,promoted,duplicateCount,
      departed,detached,rehireEligible,reused,final:{
        role:member.role,job:S.job,rankHistory:member.history.filter(row=>row.action==='role'&&row.role===c.rank).length,
        membershipCount:S.lifeRecord.affiliations.filter(row=>row.id===c.affiliationId).length,
        issues:auditLifeState(S)}};
  `);
  const message=incidentId+': ';
  assert.equal(actual.available,true,message+'on-duty incident is eligible');
  assert.notEqual(actual.original,rank,message+'initial rank differs from the promotion');
  assert.equal(actual.otherRole,false,message+'injury/failure branch awards no rank');
  assert.deepEqual(
    {id:actual.onSuccess?.id,action:actual.onSuccess?.action,role:actual.onSuccess?.role,
      required:actual.onSuccess?.onlyIfActiveOrCrisis,noRepeat:actual.onSuccess?.onlyIfRoleChanged},
    {id:affiliationId,action:'role',role:rank,required:true,noRepeat:true},
    message+'only the proven success assigns the documented rank');
  assert.equal(actual.promoted.role,rank,message+'rank is updated');
  assert.equal(actual.promoted.job,actual.oldJob,message+'promotion preserves employment');
  assert.equal(actual.promoted.status,'active',message+'posting remains active');
  assert.equal(actual.promoted.changes,1,message+'one promotion is recorded');
  assert.equal(actual.promoted.episodes,1,message+'promotion stays in the first posting');
  assert.equal(actual.promoted.roleRecord?.year,1098,message+'promotion has the actual year');
  assert.equal(actual.duplicateCount,1,message+'repeated rank award does not duplicate history');
  assert.deepEqual(actual.departed,
    {job:0,status:'left',role:rank,pastRank:true,duty:false},
    message+'leaving preserves the recorded former rank and blocks duty');
  assert.equal(actual.detached,1,message+'no rank awarded after leaving');
  assert.equal(actual.rehireEligible,true,message+'ordinary three-year reapplication remains available');
  assert.deepEqual(actual.reused,
    {role:actual.original,status:'active',returning:true,episodes:2,
      initialRoleAtReturn:actual.original,priorRank:true},
    message+'new posting starts with its actual appointment rank, old record remains');
  assert.deepEqual(actual.final,
    {role:rank,job:actual.oldJob,rankHistory:2,membershipCount:1,issues:[]},
    message+'promotion can occur in the new posting with no duplicate employer');
}
console.log('PASS 14 documented rank promotions, non-success branches, one-time rank history, departure and rehire');
