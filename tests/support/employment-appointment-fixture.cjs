'use strict';
const vm = require('node:vm');

// Seed one auditable appointment vacancy for story tests that exercise the
// post-acceptance lifecycle. Authorization still comes from the real event,
// job, affiliation and employer policy used by the runtime.
function employmentAppointmentFixture(ctx, {eventId, jobId, affiliationId}) {
  installEmploymentAppointmentFixture(ctx);
  return JSON.parse(vm.runInContext(`JSON.stringify(prepareEmploymentAppointmentFixture(${JSON.stringify(eventId)},${jobId},${JSON.stringify(affiliationId)}))`,ctx));
}

function installEmploymentAppointmentFixture(ctx) {
  vm.runInContext(`globalThis.prepareEmploymentAppointmentFixture=function(eventId,jobId,affiliationId){
    const event=EV.find(row=>row.id===eventId),
      spec=EMPLOYMENT_APPOINTMENT_SITES.find(row=>row.affiliationId===affiliationId&&row.jobs.includes(jobId));
    if(!event||!spec||!appointmentSourceAllowed(eventId,jobId,affiliationId))
      throw Error('No exact-source appointment fixture for '+eventId);
    if(spec.city){
      const urban=SIM_TABLES.locality.mobile[0];
      S.home='移動都市';S.local.kind=urban.n;S.local.city=spec.city;
      S.local.access=urban.access;S.local.hazard=urban.hazard;S.local.info=urban.info;
    }
    const sector=APPOINTMENT_JOB_SECTORS[jobId],
      area=ensureOccupationWorkArea(S),work=S.world.occupationWorld;
    if(spec.kind==='archetype'||spec.kind==='scenario') area.sectorPresence[sector]=true;
    ensureAppointmentWorld(S);
    const siteId=appointmentWorldSiteId(spec,S),
      positionId=appointmentPositionId(spec,jobId,S),
      openingId='acceptance-fixture:'+positionId+':'+S.year,
      site=work.sites[siteId],position=work.positions[positionId];
    if(!site||!position) throw Error('Appointment fixture did not create its named position');
    site.status='open';delete site.operationTo;
    position.capacity=1;position.aggregateOccupiedSlots=0;
    position.identifiedOccupiedSlots=0;position.reservedSlots=0;position.vacancyCount=1;
    position.openingYear=S.year;position.openingIds=[openingId];
    work.openings[openingId]={openingId,siteId,positionId,employerId:site.employerId,
      areaId:site.areaId,kind:'individual-appointment',affiliationId,
      validFromYear:S.year,status:'open',slots:1,visibleToPlayer:false,basis:'test-fixture'};
    if(hasEmploymentPhysicalInterview(eventId))recordEmploymentAppointmentEncounter(S,eventId);
    return {siteId,positionId,openingId};
  };
  globalThis.applyEmploymentAppointmentFixture=function(eventId,jobId,affiliationId,choiceIndex=0,outcomeIndex=0){
    prepareEmploymentAppointmentFixture(eventId,jobId,affiliationId);
    const event=EV.find(row=>row.id===eventId),choice=event.c[choiceIndex],outcome=choice.o[outcomeIndex],
      previous=TRACE_RESOLUTION;
    const assessment=employmentEffectAssessment(S,outcome[2],eventId);
    if(!assessment.canStart)throw Error('Appointment fixture cannot start '+eventId+' J'+jobId+': '+assessment.reasonCode);
    TRACE_RESOLUTION={kind:'choice',id:eventId,label:choice.l};
    try{ap(outcome[2]);}finally{TRACE_RESOLUTION=previous;}
    return outcome[1];
  };
  globalThis.applyEmploymentAppointmentFromSource=function(eventId,jobId,choiceIndex=0,outcomeIndex=0){
    const event=EV.find(row=>row.id===eventId),effect=event?.c?.[choiceIndex]?.o?.[outcomeIndex]?.[2],
      affiliation=[effect?.lifeAffiliation,...(effect?.lifeAffiliations||[])].find(row=>row&&
        ['join','return','assign','role','continue'].includes(row.action||'join'))?.id;
    if(!affiliation)throw Error('No employment affiliation on '+eventId+' J'+jobId);
    return applyEmploymentAppointmentFixture(eventId,jobId,affiliation,choiceIndex,outcomeIndex);
  };
  globalThis.applyEventOutcomeFixture=function(eventId,choiceIndex=0,outcomeIndex=0){
    const event=EV.find(row=>row.id===eventId),choice=event?.c?.[choiceIndex],outcome=choice?.o?.[outcomeIndex],
      previous=TRACE_RESOLUTION;
    if(!outcome)throw Error('Missing outcome for '+eventId);
    TRACE_RESOLUTION={kind:'choice',id:eventId,label:choice.l};
    try{ap(outcome[2]);}finally{TRACE_RESOLUTION=previous;}
    return outcome[1];
  }; true`,ctx);
}

module.exports={employmentAppointmentFixture,installEmploymentAppointmentFixture};
