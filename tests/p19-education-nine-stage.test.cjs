'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm');
const path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'p19-nine-stage',seed:20261104,region:'クルビア',age:23});
const result=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
 const s=S;s.mo=4;s.cash=100000000;
 ensureResidenceIdentity(s);
 const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
   school=educationRegisterInstitution(w,area,'p19-nine-short-stage',
     'university',['university'],s.year),
   offering=w.offerings[school.offeringIds[0]];
 offering.admissionTier=1;
 const item=educationCaseBegin(s,'higher-path','university',1);
 item.phase='planning';
 const rows=[],snap=(name)=>{
   const current=educationObservationCaseBridgeRows(s,{
     year:s.year,month:s.mo,caseIds:[item.id]})[0],
     stats=educationObservationRows(s,{year:s.year,month:s.mo,
       siteFrame:[],openFrame:[],caseIds:[item.id],
       applicationIds:item.applicationId?[item.applicationId]:[],
       enrollmentIds:[]});
   rows.push({name,caseId:current.caseId,
     hasSchool:current.N_any_present,known:current.N_known,
     applied:current.N_applied,accepted:current.N_accepted,
     funded:current.N_funded,enrolled:current.N_enrolled,
     applicationDenominator:stats.p_accepted.denominator,
     fundedDenominator:stats.p_funded.denominator,
     fundingPending:stats.p_funded.pending,
     fundingUnknown:stats.p_funded.excludedUnknown});
 };
 snap('01-unsearched');
 const found=educationCaseDiscover(s,'local');
 snap('02-discovered');
 // The third snapshot repeats a read without claiming an offer or
 // consuming a choice. It must be observationally idempotent.
 snap('03-eligibility-inquiry-only');
 item.applicationId='p19-nine-application';
 item.offeringId=offering.id;item.campusId=offering.campusId;
 item.targetInstitutionId=school.id;
 item.phase='application';
 snap('04-applied');
 educationAccessState(s).notices[item.applicationId]={
   applicationId:item.applicationId,caseId:item.id,
   offeringId:offering.id,stage:'university',
   informedAt:{year:s.year,month:s.mo},result:'accepted'
 };
 item.phase='contract';
 snap('05-accepted');
 const quote=educationAccessState(s).knownOfferings[offering.id],
   invoice=educationEnsureInvoice(s,{
     id:'p19-nine:tuition',kind:'tuition',caseId:item.id,
     applicationId:item.applicationId,offeringId:offering.id,
     institutionId:school.id,amount:quote.tuitionEstimate,
     serviceYear:s.year}),
   cash=s.cash;
 snap('06-invoice-issued');
 const settled=educationSettleInvoice(s,invoice);
 snap('07-paid-but-decision-pending');
 educationCaseFinish(s,item,'accepted-not-enrolled');
 snap('08-funding-due-no-enrollment');
 const beforeRepeat=JSON.stringify(s),rng=s.rngState;
 snap('09-reopened-report-idempotent');
 return {rows,found:found.some(x=>x.offeringId===offering.id),
   settled:!!settled,charged:cash-s.cash===invoice.net,
   stateUntouched:beforeRepeat===JSON.stringify(s)&&rng===s.rngState,
   oneInvoice:Object.keys(s.educationFinance.invoices).filter(id=>
     id==='p19-nine:tuition').length===1,
   oneApplication:Object.keys(s.educationAccess.notices).filter(id=>
     id===item.applicationId).length===1,
   noEnrollment:s.educationRecord.enrollments.length===0,
   noCredential:s.educationRecord.awards.length===0};
})())`,ctx,{timeout:15000}));
assert.equal(result.rows.length,9);
assert.equal(new Set(result.rows.map(x=>x.caseId)).size,1);
assert.equal(result.rows[0].hasSchool,true);
assert.equal(result.rows[0].known,false);
assert.equal(result.rows[1].known,true);
assert.equal(result.rows[2].known,true);
assert.equal(result.rows[2].applied,false);
assert.equal(result.rows[3].applied,true);
assert.equal(result.rows[3].accepted,null);
assert.equal(result.rows[4].accepted,true);
assert.equal(result.rows[4].funded,null);
assert.equal(result.rows[5].fundingPending,1);
assert.equal(result.rows[6].fundingPending,1);
assert.equal(result.rows[7].funded,true);
assert.equal(result.rows[7].fundedDenominator,1);
assert.equal(result.rows[7].enrolled,false);
assert.deepEqual(result.rows[8],{
  ...result.rows[7],name:'09-reopened-report-idempotent'
});
assert.equal(result.found,true);
assert.equal(result.settled,true);
assert.equal(result.charged,true);
assert.equal(result.stateUntouched,true);
assert.equal(result.oneInvoice,true);
assert.equal(result.oneApplication,true);
assert.equal(result.noEnrollment,true);
assert.equal(result.noCredential,true);
console.log('PASS P19 S05: nine-step application/offer/invoice/paid-without-enrollment and repeat-safe observation');
