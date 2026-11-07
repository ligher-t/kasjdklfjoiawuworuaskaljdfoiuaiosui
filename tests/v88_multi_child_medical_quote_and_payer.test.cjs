'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=src=>JSON.parse(vm.runInContext('JSON.stringify((()=>{' + src + '})())',ctx));
const close=(actual,expected,meaning)=>assert(
  Math.abs(actual-expected)<Math.max(0.001,Math.abs(expected)*1e-10),
  meaning+': actual '+actual+', expected '+expected
);

setup(ctx,{id:'multi-child-different-medical-contributions',seed:194700,region:'ヴィクトリア',age:40});
const r=inspect(`
  S.year=1100;S.age=40;S.priceIndex=1.3;S.cash=20000000;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.relationshipHistory=[{id:'former-parent',ending:'離婚',endedYear:1090,
    residenceRegion:'龍門',knownResidenceRegion:'龍門'}];
  S.kids=[
    {id:'shared-child',nm:'二つの家を行き来する子',by:1090,inf:0,tx:0,
      careSupport:0,householdStatus:'supported',householdResidencePlan:'shared',
      otherParentId:'former-parent'},
    {id:'self-child',nm:'家で療養する子',by:1092,inf:1,tx:0,
      careSupport:1,householdStatus:'supported',householdResidencePlan:'self'},
    {id:'former-child',nm:'元配偶者側の子',by:1094,inf:1,tx:1,
      careSupport:1,householdStatus:'supported',householdResidencePlan:'former_support',
      otherParentId:'former-parent'}
  ];
  ensureLocalityState(S);S.community.metrics.food=0.04;S.community.metrics.housing=0.04;
  const locality=localityLivingMultiplier(S),costPm=S.res.pm*S.priceIndex*locality,
    shared=S.kids[0],self=S.kids[1],former=S.kids[2],
    share=childResidenceCostShare(S,shared),
    localPm=childResidenceEconomicIndex(S,shared,'pm'),
    expectedSharedTreatment=P('economy.childInfectionTreatmentAnnualCost')*
      infectionCareTravelCostScale(S)*share*(localPm/S.res.pm)*costPm,
    expectedSelfCare=P('economy.childInfectionCareAnnualCost')*
      infectionCareTravelCostScale(S)*costPm;
  S.eventRelativeId=shared.id;
  const initial=EV.find(e=>e.id==='fam_child_inf'),choice=initial.c[1],
    specialistFee=childInfectionSpecialistStartCost(S),
    quotedShared=childInfectionAnnualTreatmentCost(S),
    reserve=annualCashReserve(S);
  S.cash=specialistFee+reserve-1;
  const notEnough=ok(choice.en,S,tags(S));
  S.cash=specialistFee+reserve;
  const enough=ok(choice.en,S,tags(S)),before=S.cash;
  ap(choice.o[0][2]);
  const started={spent:before-S.cash,inf:shared.inf,tx:shared.tx,care:shared.careSupport,
    selfTx:self.tx,formerTx:former.tx};
  S.eventRelativeId=self.id;
  S.sn.fam_child_inf=1098;
  const follow=EV.find(e=>e.id==='fam_child_care'),restart=follow.c[1],
    quotedSelfTreatment=childInfectionAnnualTreatmentCost(S),
    quotedSelfCare=childInfectionAnnualCareCost(S),
    fee=childInfectionTreatmentRestartCost(S);
  S.cash=fee+reserve-1;
  const restartShort=ok(restart.en,S,tags(S));
  S.cash=fee+reserve;
  const restartEnough=ok(restart.en,S,tags(S)),restartCash=S.cash;
  ap(restart.o[0][2]);
  const resumed={spent:restartCash-S.cash,inf:self.inf,tx:self.tx,sharedTx:shared.tx,
    formerTx:former.tx};
  const charged=childHouseholdFinances(S,costPm,S.res.pm);
  const baseline=S.kids.map(k=>[k.tx,k.careSupport]);
  for(const child of S.kids){child.tx=0;child.careSupport=0;}
  const withoutMedical=childHouseholdFinances(S,costPm,S.res.pm);
  S.kids.forEach((child,i)=>{child.tx=baseline[i][0];child.careSupport=baseline[i][1];});
  const targetFormer=(()=>{
    S.eventRelativeId=former.id;
    return {treatment:childInfectionAnnualTreatmentCost(S),
      basic:childInfectionAnnualCareCost(S)};
  })();
  const treatmentThreshold=activeChildTreatmentAnnualCost(S);
  const totalCharged=charged.living-withoutMedical.living;
  return {locality,share,expectedSharedTreatment,expectedSelfCare,quotedShared,
    quotedSelfTreatment,quotedSelfCare,specialistFee,reserve,notEnough,enough,started,
    fee,restartShort,restartEnough,resumed,targetFormer,
    treatmentThreshold,totalCharged,careTravel:charged.careTravel,
    withoutMedicalTravel:withoutMedical.careTravel};
`);
assert(r.locality>1);
assert.equal(r.share,0.5);
assert(r.quotedShared>0&&r.quotedSelfCare>0);
close(r.quotedShared,r.expectedSharedTreatment,'shared-residence specialist quote includes locality and half share');
close(r.quotedSelfCare,r.expectedSelfCare,'self-resident basic care quote includes locality');
assert(r.quotedSelfTreatment>r.quotedSelfCare,'specialist treatment costs more than basic care');
assert.equal(r.notEnough,false);
assert.equal(r.enough,true);
assert.deepEqual(r.started,{spent:r.specialistFee,inf:1,tx:1,care:1,selfTx:0,formerTx:1});
assert.equal(r.restartShort,false);
assert.equal(r.restartEnough,true);
assert.deepEqual(r.resumed,{spent:r.fee,inf:1,tx:1,sharedTx:1,formerTx:1});
close(r.totalCharged,r.quotedShared+r.quotedSelfTreatment,
  'two supported children have the exact quoted annual care cost charged to the payer');
close(r.treatmentThreshold,r.totalCharged,
  'financial lapse threshold uses the same medical amount charged annually');
assert(r.careTravel>r.withoutMedicalTravel);
assert.deepEqual(r.targetFormer,{treatment:0,basic:0},
  'child residing entirely with former spouse is not charged as a present household dependent');
console.log('PASS child medical quotes, specialist start and restart, two dependent costs, and former-residence exclusion');
