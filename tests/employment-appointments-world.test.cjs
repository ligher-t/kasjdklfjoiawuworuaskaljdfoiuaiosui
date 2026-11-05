'use strict';
const assert=require('node:assert/strict');
const vm=require('node:vm');
const path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..'),{ctx}=context(root);
setup(ctx,{id:'appointment-world',seed:202611051,region:'クルビア',age:25});
const run=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:15000}));

const identity=run(`
  const before=occupationWorkAreaKey(S),world=S.world.occupationWorld;
  S.local.access=0.05;S.local.hazard=0.99;S.local.info=0.1;
  const after=occupationWorkAreaKey(S);
  const area=ensureOccupationWorkArea(S);
  const key=area.areaId,count=Object.keys(world.areas).length;
  ensureOccupationWorkArea(S);
  return {same:before===after,still:key===occupationWorkAreaKey(S),
    noNewArea:count===Object.keys(world.areas).length};
`);
assert.equal(identity.same,true,'economic metrics do not change physical employer identity');
assert.equal(identity.still,true);
assert.equal(identity.noNewArea,true);

const appointment=run(`
  S.local.city='トリマウンツ';ensureOccupationWorkArea(S);
  advanceOccupationWorkArea(S,S.year,{jobs:0.9});
  const input={jobId:38,affiliationId:'rhine-lab',sourceEventId:'sr_rhine_recruitment_exam'},
    valid=assessEmploymentAppointment(S,input),
    before=JSON.stringify(S.world.occupationWorld),rng=JSON.stringify(RANDOM_STATE);
  for(let n=0;n<4;n++)assessEmploymentAppointment(S,input);
  const unchanged=before===JSON.stringify(S.world.occupationWorld),rngSame=rng===JSON.stringify(RANDOM_STATE),
    forged=assessEmploymentAppointment(S,{...input,sourceEventId:'car'});
  S.local.city='別の都市';
  const wrongCity=assessEmploymentAppointment(S,input);
  S.local.city=null;
  const unknownCity=assessEmploymentAppointment(S,input);
  const bsw=assessEmploymentAppointment(S,{jobId:35,affiliationId:'bsw-contract',sourceEventId:'sr_bsw_recruitment_assessment'}),
    held=assessEmploymentAppointment(S,{jobId:48,affiliationId:'higashi-cyber-intelligence',sourceEventId:'car_hig_cyber_entry'});
  const oldResidence=JSON.stringify(S.local);
  recordEmploymentAppointmentEncounter(S, "sr_bsw_recruitment_assessment");
  const arrived=assessEmploymentAppointment(S,{jobId:35,affiliationId:"bsw-contract",sourceEventId:"sr_bsw_recruitment_assessment"});
  return {valid:valid.canStart,site:valid.site?.siteId,forged:forged.canStart,
    bswAfterArrival:arrived.canStart, residenceStayed:JSON.stringify(S.local)===oldResidence,
    unchanged,rngSame,wrongCity:wrongCity.reasonCode,unknownCity:unknownCity.reasonCode,
    bsw:bsw.reasonCode,held:held.canStart};
`);
assert.equal(appointment.valid,true,'verified campus, source and vacancy can support an appointment');
assert.equal(appointment.forged,false,'another event cannot authorize a Rhine appointment');
assert.equal(appointment.unchanged,true,'appointment queries are read-only');
assert.equal(appointment.rngSame,true);
assert.equal(appointment.wrongCity,'appointment-city-mismatch');
assert.equal(appointment.unknownCity,'appointment-city-mismatch','unknown city does not teleport to the campus');
assert.equal(appointment.bsw,'appointment-visit-required','residence alone does not establish arrival at the platform');
assert.equal(appointment.bswAfterArrival,true,'physical recruitment encounter authorizes the actual BSW site');
assert.equal(appointment.residenceStayed,true,'an interview never changes the candidate’s home');
assert.equal(appointment.held,false,'source-held names never acquire a formal worksite');

const policy=run(`
  const work=S.world.occupationWorld,id='forbidden-employer-fixture';
  work.employers[id]={employerId:id,organizationKey:'penguin-logistics'};
  const before=JSON.stringify(work),
    inferred=assessPlayerEmploymentAccess(S,{jobId:16,employerId:id}),
    disguised=assessPlayerEmploymentAccess(S,{jobId:16,employerId:id,organizationKey:'blacksteel-worldwide'});
  let heldBlocked=false,contactBlocked=false;
  try{assertPlayerEmploymentEffectAllowed({lifeAffiliation:{id:'higashi-cyber-intelligence',kind:'employer',action:'join'}});}
  catch(error){heldBlocked=true;}
  try{assertPlayerEmploymentEffectAllowed({lifeAffiliation:{id:'lungmen-black-market',kind:'employer',action:'join'}});}
  catch(error){contactBlocked=true;}
  return {inferred:inferred.canStart,reason:inferred.reasonCode,disguised:disguised.canStart,
    unchanged:before===JSON.stringify(work),heldBlocked,contactBlocked};
`);
assert.equal(policy.inferred,false);
assert.equal(policy.reason,'player-employment-prohibited','resolve the actual employer even for generic J16');
assert.equal(policy.disguised,false);
assert.equal(policy.unchanged,true);
assert.equal(policy.heldBlocked,true);
assert.equal(policy.contactBlocked,true);

const operations=run(`
  const site={siteId:'dated-factory',status:'open',operationFrom:{year:1090,month:1},
    operationTo:{year:1098,month:7},history:[]};
  const before=occupationSiteOperationalAt(site,1098,6);
  advanceOccupationSiteOperations(S,site,1098,7);
  const closed=site.status==='closed',history=site.history.length;
  advanceOccupationSiteOperations(S,site,1099,1);
  const noResurrection=site.status==='closed'&&site.history.length===history;
  const clone=JSON.parse(JSON.stringify(site));
  advanceOccupationSiteOperations(S,clone,1099,1);
  const restored=JSON.stringify(clone)===JSON.stringify(site);
  S.local.resources={mineral:false};
  const noOre=occupationSectorPresence(S,occupationWorkAreaKey(S),'MIN',3,1);
  return {before,closed,noResurrection,restored,noOre};
`);
assert.equal(operations.before,true);
assert.equal(operations.closed,true,'dated closure takes effect at the exact month');
assert.equal(operations.noResurrection,true);
assert.equal(operations.restored,true);
assert.equal(operations.noOre,false,'explicitly absent mineral resources reject a mine even at high regional tier');
console.log('employment appointment authority, physical identity and dated operations PASS');
