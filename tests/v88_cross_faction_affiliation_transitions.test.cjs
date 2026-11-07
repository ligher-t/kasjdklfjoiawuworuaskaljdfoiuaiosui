'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');
const {installEmploymentAppointmentFixture}=require('./support/employment-appointment-fixture.cjs');

const {ctx} = context(path.resolve(__dirname, '..'));
installEmploymentAppointmentFixture(ctx);
const inspect = source => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + source + '})())',ctx));
let seed = 192901;
const unitCases = [
  {unit:'reunion-1096',goal:'protect-neighbours',pause:false},
  {unit:'reunion-reorg',goal:'reunion-relief',pause:false},
  {unit:'reunion-1096',goal:'protect-neighbours',pause:true},
  {unit:'reunion-reorg',goal:'reunion-relief',pause:true},
  {unit:'reunion-1096',goal:'protect-neighbours',noGoal:true}
];
for(const scenario of unitCases) {
  setup(ctx,{id:'faction-sanctuary-'+seed,seed:seed++,region:'ウルサス',age:36});
  ctx.SCENARIO = scenario;
  const r = inspect(`
    S.year=1102;S.age=36;S.inf=1;S.ob=55;S.fl.reunion=1;
    const {unit,goal,pause,noGoal}=SCENARIO;
    ap({lifeAffiliation:{id:unit,title:'レユニオンの一隊',kind:'network',
      action:'join',role:'事変後の小隊・見張りと避難者護衛'}});
    if(!noGoal){
      ap({lifeGoal:{id:goal,title:'感染者を支える',action:'start'}});
      if(pause)ap({lifeGoal:{id:goal,action:'pause'}});
    }
    const shelter=EV.find(e=>e.id==='sr_reunion_to_rhodes_sanctuary'),
          rehabilitation=EV.find(e=>e.id==='sr_reunion_turncoat_rehabilitation');
    const eligible=elig(shelter,S,tags(S));
    ap(shelter.c[0].o[0][2]);
    const old=S.lifeRecord.affiliations.find(a=>a.id===unit),
          g=S.lifeRecord.goals.find(a=>a.id===goal),
          care=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-care');
    const after={
      oldStatus:old.status,oldEnd:old.endedYear,
      oldHistoryAction:old.history.at(-1).action,
      goal:g?.status||null,goalAction:g?.history.at(-1).action||null,
      care:care?.status,oldFlag:S.fl.reunion,
      rehabVisible:rehabilitation.show(S),
      originalGuard:shelter.show(S)
    };
    applyEmploymentAppointmentFixture(rehabilitation.id,28,'rhodes-staff',0,0);
    const staff=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
          employment=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-employment');
    return {eligible,after,staff:staff?.status,job:S.job,
      employment:employment?.status||null,
      duplicateRehab:rehabilitation.show(S),
      oldHistoryPreserved:old.history.some(h=>h.action==='join')};
  `);
  assert.equal(r.eligible,true,'both historically recorded Reunion units may seek medical shelter');
  assert.deepEqual(r.after,{
    oldStatus:'left',oldEnd:1102,oldHistoryAction:'leave',
    goal:scenario.noGoal?null:'abandoned',
    goalAction:scenario.noGoal?null:'abandon',
    care:'active',oldFlag:0,rehabVisible:true,originalGuard:false
  },'shelter must leave only actual active units, close existing goals and retain a care link');
  assert.equal(r.staff,'active','rehabilitation must hire a current care recipient');
  assert.equal(r.job,28,'former member enters recorded noncombatant Rhodes role');
  assert.equal(r.employment,null,'shelter patients must not invent an application history');
  assert.equal(r.duplicateRehab,false,'new Rhodes staff must not be offered the same first job again');
  assert.equal(r.oldHistoryPreserved,true);
}

setup(ctx,{id:'former-care-does-not-reapply',seed:seed++,region:'ウルサス',age:36});
const formerCare=inspect(`
  S.year=1102;S.age=36;S.inf=1;S.ob=55;
  ap({lifeAffiliation:{id:'reunion-reorg',title:'再編互助網',action:'join'}});
  const rescue=EV.find(e=>e.id==='sr_reunion_to_rhodes_sanctuary'),
        rehire=EV.find(e=>e.id==='sr_reunion_turncoat_rehabilitation');
  ap(rescue.c[0].o[0][2]);
  const active=rehire.show(S);
  ap({lifeAffiliation:{id:'rhodes-care',action:'leave'}});
  return {active,left:rehire.show(S)};
`);
assert.deepEqual(formerCare,{active:true,left:false},
  'the former patient is not still undergoing the recruitment offered during current care');

for (const withGoal of [false,true]) {
  setup(ctx,{id:'rhodes-to-reunion-'+seed,seed:seed++,region:'クルビア',age:32});
  ctx.WITH_GOAL = withGoal;
  const r=inspect(`
    S.year=1099;S.age=32;S.job=31;S.biasInfected=0;
    ap({lifeAffiliation:{id:'rhodes-staff',title:'ロドス・アイランド',
      kind:'employer',action:'join',role:'地域支部・外勤'}});
    if(WITH_GOAL)ap({lifeGoal:{id:'rhodes-work',title:'ロドス勤務',action:'start'}});
    const turning=EV.find(e=>e.id==='sr_rhodes_to_reunion_turning_point');
    const available=turning.show(S);
    ap(turning.c[0].o[0][2]);
    const rhodes=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
          reunion=S.lifeRecord.affiliations.find(a=>a.id==='reunion-reorg'),
          oldGoal=S.lifeRecord.goals.find(g=>g.id==='rhodes-work'),
          newGoal=S.lifeRecord.goals.find(g=>g.id==='reunion-relief');
    return {available,rhodes:rhodes.status,reunion:reunion.status,
      oldGoal:oldGoal?.status||null,newGoal:newGoal.status,
      job:S.job,flag:S.fl.reunion,again:turning.show(S)};
  `);
  assert.deepEqual(r,{available:true,rhodes:'left',reunion:'active',
    oldGoal:withGoal?'abandoned':null,newGoal:'active',job:0,flag:1,again:false},
    'a cross-faction transfer closes Rhodes work without fabricating missing goals');
}

// Blacksteel's real secondment leaves two active organizations but only one
// employment job. The ship's address is tied to the verified Rhodes posting.
for(const infectionRoute of [false,true]){
  setup(ctx,{id:'blacksteel-rhodes-secondment-'+seed,seed:seed++,region:'クルビア',age:29});
  ctx.BSW_INFECTION_ROUTE=infectionRoute;
  const status=inspect(`
    S.year=1098;S.age=29;S.mo=6;S.job=0;
    const medical=!!BSW_INFECTION_ROUTE;
    S.inf=medical?1:0;
    const hire=EV.find(e=>e.id==='sr_bsw_recruitment_assessment');
    applyEmploymentAppointmentFromSource(hire.id,35,0,0);
    if(!medical) {
      const promotion=EV.find(e=>e.id==='sr_bsw_promotion_tactical');
      applyEmploymentAppointmentFixture(promotion.id,36,'bsw-contract',0,0);
    }
    const offer=EV.find(e=>e.id==='sr_bsw_rhodes_secondment'),
      infected=EV.find(e=>e.id==='sr_bsw_infected_squad_policy'),
      review=EV.find(e=>e.id==='sr_bsw_secondment_posting_review'),
      vip=EV.find(e=>e.id==='sr_bsw_vip_escort_ambush'),
      convoy=EV.find(e=>e.id==='sr_bsw_convoy_protection');
    if(!offer||!infected||!review||!vip||!convoy)
      throw new Error('Blacksteel secondment path is absent');
    const recruitment={
      job:S.job,bsw:S.lifeRecord.affiliations.find(a=>a.id==='bsw-contract')?.status,
      offer:offer.show(S),infected:infected.show(S)
    };
    ap(medical?infected.c[2].o[0][2]:offer.c[0].o[0][2]);
    const bsw=S.lifeRecord.affiliations.find(a=>a.id==='bsw-contract'),
      rhodes=S.lifeRecord.affiliations.find(a=>a.id==='rhodes-staff'),
      goal=S.lifeRecord.goals.find(g=>g.id==='bsw-work');
    const onboard={
      job:S.job,bsw:bsw?.status,rhodes:rhodes?.status,
      rhodesRole:rhodes?.role,
      base:S.residenceBase?.id||null,
      flag:S.fl.rhodes_landship,
      trulyOnShip:isRhodesLandshipResident(S),
      homeCountry:S.res.n,
      bswGoal:goal?.status,
      newBswOffer:offer.show(S),
      vip:vip.show(S),convoy:convoy.show(S),
      eligibleReview:elig(review,S,tags(S)),
      issues:auditLifeState(S)
    };
    ap({k:1});
    const incidental={
      bsw:bsw.status,rhodes:rhodes.status,job:S.job,
      onShip:isRhodesLandshipResident(S),
      bswVip:vip.show(S)
    };
    S.year+=1;S.age+=1;
    const first={
      visible:review.show(S),eligible:elig(review,S,tags(S))
    };
    ap(review.c[0].o[0][2]);
    S.sn[review.id]=S.year;
    const continuing={
      bsw:bsw.status,rhodes:rhodes.status,job:S.job,
      onShip:isRhodesLandshipResident(S),
      revisit:elig(review,S,tags(S))
    };
    S.year+=3;S.age+=3;
    const next=elig(review,S,tags(S));
    ap(review.c[1].o[0][2]);
    const back={
      job:S.job,bsw:bsw.status,rhodes:rhodes.status,
      endYear:rhodes.episodes.at(-1)?.endedYear,
      base:S.residenceBase?.id||null,
      onShip:isRhodesLandshipResident(S),
      flag:S.fl.rhodes_landship,
      bswGoal:goal.status,
      vip:vip.show(S),convoy:convoy.show(S),
      returnReview:review.show(S),
      issues:auditLifeState(S)
    };
    let secondEpisode=null;
    if(!medical){
      S.year+=4;S.age+=4;
      const reoffer=offer.show(S);
      ap(offer.c[0].o[0][2]);
      secondEpisode={
        reoffer,episodes:rhodes.episodes.length,
        priorEnded:rhodes.episodes[0]?.endedYear,
        started:rhodes.episodes.at(-1)?.startedYear,
        immediateReview:elig(review,S,tags(S)),
        onboard:isRhodesLandshipResident(S),bsw:bsw.status
      };
      S.year+=1;S.age+=1;
      secondEpisode.afterOneYear=elig(review,S,tags(S));
    }
    return {recruitment,onboard,incidental,first,continuing,next,back,secondEpisode};
  `);
  assert.deepEqual(status.recruitment,{
    job:infectionRoute?35:36,bsw:'active',
    offer:!infectionRoute,infected:infectionRoute
  },'actual Blacksteel staff may be assigned, while infected staff may seek treatment');
  assert.equal(status.onboard.job,infectionRoute?35:36);
  assert.equal(status.onboard.bsw,'active','BSW employment remains in force during a secondment');
  assert.equal(status.onboard.rhodes,'active','the host organization has an actual posting');
  assert(status.onboard.rhodesRole.startsWith('本艦・BSW出向'));
  assert.equal(status.onboard.base,'rhodes-landship','secondment must actually board the ship');
  assert.equal(status.onboard.flag,1);
  assert.equal(status.onboard.trulyOnShip,true);
  assert.equal(status.onboard.homeCountry,'クルビア','unknown ship coordinates do not invent a country move');
  assert.equal(status.onboard.bswGoal,'active');
  assert.equal(status.onboard.newBswOffer,false,'staff already on secondment cannot receive another first offer');
  assert.equal(status.onboard.vip,false,'domestic BSW VIP work cannot happen aboard the Rhodes ship');
  assert.equal(status.onboard.convoy,false,'domestic BSW convoy cannot happen aboard the Rhodes ship');
  assert.equal(status.onboard.eligibleReview,false,'no immediate renewal on arrival');
  assert.deepEqual(status.onboard.issues,[]);
  assert.deepEqual(status.incidental,{
    bsw:'active',rhodes:'active',job:infectionRoute?35:36,
    onShip:true,bswVip:false
  },'other effects do not silently terminate the host or parent job');
  assert.deepEqual(status.first,{visible:true,eligible:true},
    'after a full year the seconded worker may reconsider the assignment');
  assert.deepEqual(status.continuing,{
    bsw:'active',rhodes:'active',job:infectionRoute?35:36,
    onShip:true,revisit:false
  },'continuation respects the review cooldown without changing employment');
  assert.equal(status.next,true);
  assert.deepEqual(status.back,{
    job:infectionRoute?35:36,bsw:'active',rhodes:'left',
    endYear:1102,base:null,onShip:false,flag:0,
    bswGoal:'active',vip:!infectionRoute,convoy:infectionRoute,
    returnReview:false,issues:[]
  },'leaving the host ship returns to the parent contract without creating a new job');
  assert.deepEqual(status.secondEpisode,infectionRoute?null:{
    reoffer:true,episodes:2,priorEnded:1102,started:1106,
    immediateReview:false,onboard:true,bsw:'active',
    afterOneYear:true
  },'a new secondment episode has its own one-year waiting period even after a previous tour');
}
setup(ctx,{id:'blacksteel-phantom-worker',seed:seed++,region:'クルビア',age:29});
const phantom=inspect(`
  S.year=1099;S.age=29;S.job=36;
  const offer=EV.find(e=>e.id==='sr_bsw_rhodes_secondment'),
    vip=EV.find(e=>e.id==='sr_bsw_vip_escort_ambush'),
    review=EV.find(e=>e.id==='sr_bsw_secondment_posting_review');
  return {offer:offer.show(S),vip:vip.show(S),
    review:review.show(S)};
`);
assert.deepEqual(phantom,{offer:false,vip:false,review:false},
  'occupation number alone is not proof of a BSW or Rhodes posting');

console.log('PASS actual cross-faction exits, paused goal closure, care-only hiring and no duplicate recruitment and real Blacksteel secondments');
