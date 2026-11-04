'use strict';
const assert=require('node:assert/strict');
const path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const r=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  born({seed:109418,by:1076,region:"龍門"});
  const s=S;s.year=1094;s.age=18;s.mo=12;s.cash=80000000;
  s.res=REG.find(x=>x.n==="龍門");s.home="移動都市";
  s.local={kind:"移動都市の居住区",city:"龍門",placeId:"city:龍門:龍門",
    districtId:"district:edu-journey",access:0.8,hazard:0};
  ensureResidenceIdentity(s);
  const area=ensureEducationWorldForResidence(s);
  const world=s.world.educationWorld;
  const inst=educationRegisterInstitution(world,area,"journey-university",
    "university",["university"],s.year);
  const offer=world.offerings[inst.offeringIds[0]];
  offer.admissionTier=1;
  s.mo=0;educationStart(s,"university",1,"journey-test-enrollment");
  s.educationPath.institutionId=inst.id;
  s.educationPath.campusId=offer.campusId;
  s.educationPath.offeringId=offer.id;
  const enrollment=s.educationRecord.enrollments.at(-1);
  educationBindFormalEnrollment(s,enrollment.id);
  const invoice=educationEnsureTuitionInvoice(s,s.educationPath,s.year);
  educationSettleInvoice(s,invoice);
  educationFinanceProjectInvoice(s,invoice);
  s.mo=6;
  const destination=(MIGRATION_ROUTES[s.res.n]||[])
    .find(x=>(MIGRATION_ROUTES[x.n]||[]).some(y=>y.n===s.res.n)).n;
  travelStart(s,{purpose:"study",destinationRegion:destination});
  travelDepart(s);
  s.mo=7;advanceJourneyThrough(s,s.year,7);
  travelBeginReturn(s);
  s.mo=8;advanceJourneyThrough(s,s.year,8);
  travelEnd(s,"returned-home");
  const awayMonths=[5,6,7,8,9].map(month=>travelAwayDuringMonth(s,1094,month));
  s.mo=12;
  educationSimulateAttendanceThrough(s,s.year,12);
  const rows=s.educationAttendance.enrollments[enrollment.id][s.year];
  return {awayMonths,
    absence:[6,7,8].map(month=>{
      const r=rows[month];return {
        month,personalAccess:r.segments[s.educationPlacements.currentPlacementId].personalAccess,
        sourceKind:r.segments[s.educationPlacements.currentPlacementId].sourceKind,
        equivalent:r.equivalent
      };
    }),
    beforeTravel:rows[5]?.segments?.[s.educationPlacements.currentPlacementId]?.sourceKind,
    audit:auditTravelState(s),
    moves:(s.moves||[]).length,
    active:s.travelState.activeJourneyId
  };
})())`,ctx,{timeout:30000}));
assert.deepEqual(r.awayMonths,[false,true,true,true,false]);
for(const month of r.absence){
  assert.equal(month.personalAccess,0);
  assert.equal(month.equivalent,0);
  assert.equal(month.sourceKind,"confirmed-journey-absence");
}
assert.notEqual(r.beforeTravel,"confirmed-journey-absence");
assert.deepEqual(r.audit,[]);
assert.equal(r.moves,0);
assert.equal(r.active,null);
console.log("PASS: absent school months are tracked across outward and return journeys");
