'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
setup(ctx,{id:'P19-small-cohort',seed:20261103,region:'龍門',age:20});
const run=fn=>JSON.parse(vm.runInContext(
  'JSON.stringify(('+fn.toString()+')())',ctx,{timeout:12000}));

const grid=run(function(){
 const regions=Object.keys(EDUCATION_REGIONAL_PRESENCE),
   kinds=Object.keys(EDUCATION_LOCALITY_PRESENCE_DELTA),
   designations=Object.keys(EDUCATION_SPECIAL_PRESENCE);
 let cells=0,limits=true,monotone=true,specialCells=0,unchanged=true,
   zero=0,hundred=0;
 for(const region of regions)for(const kind of kinds){
   const original=educationPresenceRates(region,kind);
   if(original.primary<original.lower||original.lower<original.upper)
     monotone=false;
   for(const stage of EDUCATION_SITE_STAGES){
     cells++;
     if(original[stage]===0)zero++;
     if(original[stage]===100)hundred++;
     if(original[stage]<0||original[stage]>100)limits=false;
   }
 }
 for(const key of designations){
   const region=EDUCATION_SPECIAL_PRESENCE[key].region;
   const kind='固定都市の街区',before=educationPresenceRates(region,kind),
     override=educationPresenceRates(region,kind,key),
     after=educationPresenceRates(region,kind);
   specialCells+=Object.keys(override).length;
   if(JSON.stringify(before)!==JSON.stringify(after))unchanged=false;
 }
 return {regions:regions.length,kinds:kinds.length,cells,monotone,
   limits,specialCells,unchanged,zero,hundred};
});
assert.deepEqual(grid,{regions:19,kinds:7,cells:798,
  monotone:true,limits:true,specialCells:24,unchanged:true,
  zero:126,hundred:11});
const observational=run(function(){
 const s=S;s.mo=4;s.cash=5000000;
 ensureResidenceIdentity(s);
 const area=ensureEducationWorldForResidence(s),w=s.world.educationWorld,
   institution=educationRegisterInstitution(w,area,
     'p19-verified-university','university',['university'],s.year),
   offering=w.offerings[institution.offeringIds[0]];
 offering.admissionTier=1;
 const item=educationCaseBegin(s,'higher-path','university',1);
 item.phase='planning';
 const frame=Object.values(w.generationDecisions).flatMap(x=>
   Object.keys(x.present).map(stage=>({scopeId:x.scopeId,stage}))),
   openFrame=Object.values(w.offerings).map(x=>({offeringId:x.id}));
 const projection=()=>educationObservationRows(s,{
   year:s.year,month:s.mo,siteFrame:frame,openFrame,caseIds:[item.id],
   applicationIds:[],enrollmentIds:[]
 });
 const hiddenBeforeSearch=educationCasePresentation(s);
 const firstBridge=educationObservationCaseBridgeRows(s,{
   year:s.year,month:s.mo,caseIds:[item.id]})[0];
 const first=projection(),unknown=educationObservationRows(s,{
   year:s.year,month:s.mo,
   siteFrame:[{scopeId:'unobserved-region',stage:'arts'}],
   openFrame:[{offeringId:'unobserved-offering'}],
   caseIds:[],applicationIds:[],enrollmentIds:[]});
 const before=first.p_discovered,unsearched=first.p_reachable;
 const discovered=educationCaseDiscover(s,'local');
 const secondBridge=educationObservationCaseBridgeRows(s,{
   year:s.year,month:s.mo,caseIds:[item.id]})[0];
 const second=projection(),stateBefore=JSON.stringify(s),
   rngBefore=s.rngState,
   third=projection(),
   stateAfter=JSON.stringify(s);
 return {frameTotal:frame.length,
   firstExists:first.p_exists.denominator,firstOpen:first.p_open.denominator,
   unsearched:{den:before.denominator,num:before.numerator,
     count:before.notSearched},
   reachableEmpty:unsearched.denominator===0&&unsearched.rate===null,
   discovered:discovered.length,
   secondDiscovery:second.p_discovered.numerator,
   secondDenominator:second.p_discovered.denominator,
   missingSite:unknown.p_exists.excludedUnknown,
   missingRate:unknown.p_exists.rate,
   unknownOpen:unknown.p_open.excludedUnknown,
   unchanged:stateBefore===stateAfter&&rngBefore===s.rngState,
   repeated:JSON.stringify(second)===JSON.stringify(third),
   bridgeBefore:{known:firstBridge.N_known,open:firstBridge.N_any_open,
     applied:firstBridge.N_applied,route:firstBridge.N_route},
   bridgeAfter:{known:secondBridge.N_known,open:secondBridge.N_any_open,
     applied:secondBridge.N_applied,
     reachable:secondBridge.N_route},
   hiddenBeforeSearch:hiddenBeforeSearch.includes("まだ調べていない") &&
     !hiddenBeforeSearch.includes(institution.id) &&
     !hiddenBeforeSearch.includes(offering.id),
   units:Object.keys(second).map(x=>[x,second[x].unit]),
   openCount:second.p_open.numerator};
});
assert(observational.frameTotal>0);
assert.equal(observational.firstExists,observational.frameTotal);
assert(observational.firstOpen>0);
assert.deepEqual(observational.unsearched,{den:1,num:0,count:1});
assert.equal(observational.reachableEmpty,true);
assert(observational.discovered>0);
assert.equal(observational.secondDiscovery,1);
assert.equal(observational.secondDenominator,1);
assert.equal(observational.missingSite,1);
assert.equal(observational.missingRate,null);
assert.equal(observational.unknownOpen,1);
assert.equal(observational.unchanged,true);
assert.equal(observational.repeated,true);
assert.equal(observational.hiddenBeforeSearch,true);
assert.deepEqual(observational.bridgeBefore,{
  known:false,open:true,applied:false,route:null});
assert.equal(observational.bridgeAfter.known,true);
assert.equal(observational.bridgeAfter.open,true);
assert.equal(observational.bridgeAfter.applied,false);
assert.equal(typeof observational.bridgeAfter.reachable,"boolean");
assert.equal(new Set(observational.units.map(x=>x[0])).size,7);
assert(observational.openCount>0);

const outcomes=run(function(){
 const s=S,w=s.world.educationWorld,
   item=educationActiveCase(s),
   offer=educationCaseCandidates(s).find(x=>
     w.campuses[x.campusId].educationAreaId===s.local.educationAreaId);
 if(!offer)return {missingOffer:true};
 const applicationId=item.id+':application:1';
 item.applicationId=applicationId;item.offeringId=offer.offeringId;
 item.targetInstitutionId=offer.institutionId;
 item.phase='contract';
 const noticed={applicationId,caseId:item.id,
   offeringId:offer.offeringId,informedAt:{year:s.year,month:s.mo},
   result:'accepted',reasonDisclosed:false};
 educationAccessState(s).notices[applicationId]=noticed;
 const read=()=>educationObservationRows(s,{year:s.year,month:s.mo,
   siteFrame:[],openFrame:[],caseIds:[],applicationIds:[applicationId],
   enrollmentIds:[]});
 const before=read();
 const invoice=educationEnsureInvoice(s,{id:'p19-known-fee',
   kind:'tuition',caseId:item.id,applicationId,
   offeringId:offer.offeringId,institutionId:offer.institutionId,
   amount:1000,serviceYear:s.year});
 educationSettleInvoice(s,invoice);
 item.status='resolved';item.phase='resolved';
 const after=read(),
   originalReceiptIds=[...invoice.receiptIds];
 invoice.receiptIds=[];
 const missingReceipt=read().p_funded;
 invoice.receiptIds=originalReceiptIds;
 const bridge=educationObservationCaseBridgeRows(s,{
   year:s.year,month:s.mo,caseIds:[item.id]})[0];
 return {missingOffer:false,accepted:after.p_accepted.numerator,
   applied:bridge.N_applied,bridgeAccepted:bridge.N_accepted,
   bridgeFunded:bridge.N_funded,bridgeEnrolled:bridge.N_enrolled,
   independentNonformal:bridge.N_nonformal_gain,
   fundedPending:before.p_funded.pending,funded:after.p_funded.numerator,
   fundedDenominator:after.p_funded.denominator,
   receiptRequired:missingReceipt.excludedUnknown===1 &&
     missingReceipt.numerator===0,
   noAutomaticEnrollment:(s.educationRecord?.enrollments||[]).length===0};
});
assert.deepEqual(outcomes,{missingOffer:false,accepted:1,
  applied:true,bridgeAccepted:true,bridgeFunded:true,bridgeEnrolled:false,
  independentNonformal:false,
  fundedPending:1,funded:1,fundedDenominator:1,receiptRequired:true,
  noAutomaticEnrollment:true});
const credentials=run(function(){
 const s=S,offer=Object.values(s.world.educationWorld.offerings)
   .find(x=>x.stage==='university');
 s.educationRecord.enrollments.push(
   {id:'p19-completed',program:'university',offeringId:offer.id,
    startedYear:s.year-3,endedYear:s.year,status:'completed',stage:'university'},
   {id:'p19-interrupted',program:'university',offeringId:offer.id,
    startedYear:s.year-2,endedYear:s.year,status:'interrupted',stage:'university'},
   {id:'p19-enrolled',program:'university',offeringId:offer.id,
    startedYear:s.year,status:'enrolled',stage:'university'},
   {id:'p19-unverified',program:'university',offeringId:offer.id,
    startedYear:s.year-2,endedYear:s.year,status:'completed',stage:'university'});
 s.educationRecord.awards.push({id:'p19-issued-award',
   enrollmentId:'p19-completed',program:'university',offeringId:offer.id,
   awardedYear:s.year,sourceCreditIds:['credit-p19']});
 const frame=['p19-completed','p19-interrupted','p19-enrolled','p19-unverified'];
 const current=educationObservationRows(s,{year:s.year,month:s.mo,
   siteFrame:[],openFrame:[],caseIds:[],applicationIds:[],enrollmentIds:frame});
 const first=JSON.stringify(s),rng=s.rngState;
 const repeat=educationObservationRows(s,{year:s.year,month:s.mo,
   siteFrame:[],openFrame:[],caseIds:[],applicationIds:[],enrollmentIds:frame});
 return {completed:current.p_completed.numerator,endpoint:current.p_completed.denominator,
   censored:current.p_completed.censored,unknown:current.p_completed.excludedUnknown,
   unchanged:first===JSON.stringify(s)&&rng===s.rngState,
   repeat:JSON.stringify(current)===JSON.stringify(repeat)};
});
assert.deepEqual(credentials,{completed:1,endpoint:2,censored:1,unknown:1,
  unchanged:true,repeat:true});
const placementSample=run(function(){
 const regions=Object.keys(EDUCATION_REGIONAL_PRESENCE),
   kinds=Object.keys(EDUCATION_LOCALITY_PRESENCE_DELTA);
 let checked=0,changed=0,duplicates=0,absent=0;
 for(let i=0;i<152;i++){
   const state={randomSeed:20261104+i,year:1095,
     res:{n:regions[i%regions.length]},
     local:{kind:kinds[i%kinds.length],city:null,
       placeId:'p19-small-world-'+i},
     world:{events:{}}};
   const area=ensureEducationWorldForResidence(state);
   if(!area){absent++;continue;}
   const w=state.world.educationWorld,
     first=JSON.stringify({worldSeed:w.worldSeed,
       generationDecisions:w.generationDecisions,
       institutions:w.institutions,offerings:w.offerings,
       hubs:w.hubs,areas:w.areas}),
     firstCount=Object.keys(w.generationDecisions).length;
   ensureEducationWorldForResidence(state);
   const second=JSON.stringify({worldSeed:w.worldSeed,
     generationDecisions:w.generationDecisions,
     institutions:w.institutions,offerings:w.offerings,
     hubs:w.hubs,areas:w.areas});
   if(first!==second ||
      firstCount!==Object.keys(w.generationDecisions).length)changed++;
   const hubs=Object.keys(w.hubs);
   if(new Set(hubs).size!==hubs.length)duplicates++;
   checked++;
 }
 return {checked,changed,duplicates,absent};
});
assert.deepEqual(placementSample,{
  checked:152,changed:0,duplicates:0,absent:0});
console.log('PASS P19 798 base cells, 24 overrides, 152 fixed world placements, seven isolated denominators, unknown/pending/censored, pure ledger projection');
