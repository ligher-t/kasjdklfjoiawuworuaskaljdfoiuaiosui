'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const run = code => vm.runInContext(code, ctx, { timeout: 20000 });
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx,
  { timeout: 20000 }));
setup(ctx, { id: 'delivery-infrastructure', seed: 905911, region: 'サルゴン', age: 28 });

const repair = read(`
  const s=S; initializeLifeSystems(s);
  s.cash=10000000;
  const area=s.community.key, clinicId=Object.values(s.community.facilities||{})
    .find(row=>row.kind==='clinic')?.id||'clinic-fixture';
  s.community.facilities ||= {};
  s.community.facilities[clinicId] ||= {id:clinicId,kind:'clinic',status:'open'};
  const workArea=occupationWorkAreaKey(s), work=s.world.occupationWorld;
  work.sites['fixture-repair-site']={siteId:'fixture-repair-site',employerId:'fixture-employer',
    areaId:workArea,status:'open',label:'地区設備の修理所'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-worker',personId:s.personId,
    employerId:'fixture-employer',siteId:'fixture-repair-site',jobId:17,kind:'wage-employment',
    status:'active',startYear:s.year,startMonth:1,areaId:workArea,history:[]}],
    activeEpisodeId:'fixture-worker',knowledge:[]};
  s.workContract={siteId:'fixture-repair-site',jobId:17,episodeId:'fixture-worker',status:'active'};
  const incident={id:'incident-fixture-water',areaKey:area,region:s.res.n,kind:'water',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'medical',metricDelta:0.035,
    impactApplied:true,recoveryApplied:false,repairShipmentId:null};
  s.infrastructureIncidents.items.push(incident);
  const metricBefore=s.community.metrics.medical;
  s.community.metrics.medical=metricBefore-incident.metricDelta;
  const request=applyInfrastructureIncidentAction(s,{action:'request-repair'}),
    duplicateRequest=applyInfrastructureIncidentAction(s,{action:'request-repair'}),
    shipment=findShipment(s,incident.repairShipmentId),
    earlyVerify=applyInfrastructureIncidentAction(s,{action:'verify-repair'}),
    claimReceived=applyLifeSystemAction(s,{domain:'information',action:'receive-situated',
      claimId:'local-infrastructure-bulletin'},'life_info_media_claim');
  const advanceOne=()=>{const p=s.year*12+s.mo+1;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;
    s.age++;advanceShipments(s);};
  advanceOne();
  const depotStatus=shipment.status,
    custody=applyShipmentAction(s,{action:'take-custody',targetId:shipment.id},'life_ship_custody'),
    delivered=applyShipmentAction(s,{action:'confirm-recipient',targetId:shipment.id},'life_ship_recipient_check'),
    deliveredStatus=shipment.status,
    repaired=applyInfrastructureIncidentAction(s,{action:'verify-repair'}),
    duplicateRepair=applyInfrastructureIncidentAction(s,{action:'verify-repair'}),
    afterRepair=s.community.metrics.medical,
    correction=applyLifeSystemAction(s,{domain:'information',action:'record-local-correction',
      claimId:'local-infrastructure-bulletin',targetId:incident.id},'life_info_claim_correction'),
    claim=s.informationClaims.find(row=>row.id==='local-infrastructure-bulletin');
  const warning={id:'warning-fixture',areaKey:area,expectedKind:'water',
    issuedAt:{year:s.year,month:s.mo},dueAt:{year:s.year+1,month:1},status:'issued',
    receivedAt:null,response:null,result:null,source:'local-game-model-forecast'};
  s.catastropheWarnings.items.push(warning);
  const responseWithoutReceipt=lifeSystemEventEligible(s,'life_infra_warning_response'),
    incidentsBeforeWarning=s.infrastructureIncidents.items.length,metricBeforeWarning=s.community.metrics.medical;
  advanceCatastropheWarnings(s);
  s.year++;s.age++;s.mo=1;advanceCatastropheWarnings(s);
  const warningExpired=warning.status==='expired',incidentsAfterWarning=s.infrastructureIncidents.items.length,
    metricAfterWarning=s.community.metrics.medical;
  const resultDuePeriod=s.year*12+s.mo+1,
    resolvedWarning={id:'warning-result-fixture',areaKey:area,region:s.res.n,expectedKind:'water',
      issuedAt:{year:s.year,month:s.mo},dueAt:{year:Math.floor((resultDuePeriod-1)/12),month:((resultDuePeriod-1)%12)+1},
      status:'issued',receivedAt:null,response:null,result:null,source:'local-game-model-forecast'};
  s.catastropheWarnings.items.push(resolvedWarning);
  const resultWarningReceived=applyCatastropheWarningAction(s,{action:'receive'}),
    resultWarningResponded=applyCatastropheWarningAction(s,{action:'respond',mode:'prepare'}),
    incidentsBeforeResolvedWarning=s.infrastructureIncidents.items.length;
  s.year=resolvedWarning.dueAt.year;s.mo=resolvedWarning.dueAt.month;
  advanceCatastropheWarnings(s);
  const warningResolved=resolvedWarning.status==='resolved',warningResult=resolvedWarning.result,
    warningResultEligible=lifeSystemEventEligible(s,'life_infra_warning_result'),
    warningResultEvent=EV.find(event=>event.id==='life_infra_warning_result'),
    warningResultReviewed=applyLifeSystemAction(s,warningResultEvent.c[0].o[0][2].lifeSystemAction,warningResultEvent.id),
    warningResultIneligibleAfterReview=!lifeSystemEventEligible(s,'life_infra_warning_result'),
    incidentsAfterResolvedWarning=s.infrastructureIncidents.items.length;
  const patientBefore={inf:s.inf,ob:s.ob,h:s.h},stockBefore=s.community.medicalSupplyInventory?.[clinicId]||0,
    medicine=createShipment(s,{kind:'medicine',originRef:'fixture-clinic-restock',
      originAreaKey:'supply-dispatch:'+s.res.n,destinationAreaKey:area,recipientId:clinicId,
      recipientType:'clinic',quantity:3,contentsRef:'clinic-stock',transitMonths:1});
  const earlyMedicineReceive=applyShipmentAction(s,{action:'receive-medicine',targetId:medicine.id},'life_ship_medicine_received');
  advanceOne();
  const medicineAtDepot=medicine.status,stockBeforeReceipt=s.community.medicalSupplyInventory?.[clinicId]||0,
    medicineReceived=applyShipmentAction(s,{action:'receive-medicine',targetId:medicine.id},'life_ship_medicine_received'),
    stockAfterReceipt=s.community.medicalSupplyInventory?.[clinicId]||0,
    patientAfter={inf:s.inf,ob:s.ob,h:s.h};
  const letter=createShipment(s,{kind:'letter',originRef:'fixture-wrong-recipient',originAreaKey:area,
    destinationAreaKey:area,recipientId:'person-no-longer-known',recipientType:'person',
    quantity:1,contentsRef:'family-notice',transitMonths:1});
  advanceOne();
  applyShipmentAction(s,{action:'take-custody',targetId:letter.id},'life_ship_custody');
  const wrongRecipientCheck=applyShipmentAction(s,{action:'confirm-recipient',targetId:letter.id},'life_ship_recipient_check');
  const wrongAreaShipment=createShipment(s,{kind:'letter',originRef:'fixture-other-area-recipient',originAreaKey:area,
    destinationAreaKey:'verified-different-area',recipientId:'remote-person-fixture',recipientType:'person',
    quantity:1,contentsRef:'family-notice',transitMonths:1});
  wrongAreaShipment.status='arrived-at-depot';
  const wrongAreaCustody=applyShipmentAction(s,{action:'take-custody',targetId:wrongAreaShipment.id},'life_ship_custody');
  const foreignIncident={id:'incident-foreign-area',areaKey:'different-area',region:s.res.n,kind:'power',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'jobs',metricDelta:0.035,
    impactApplied:false,recoveryApplied:false,repairShipmentId:null};
  s.infrastructureIncidents.items.push(foreignIncident);
  const routeIncident={id:'incident-city-route-fixture',areaKey:area,region:s.res.n,kind:'route',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'transport',metricDelta:0.035,
    impactApplied:false,recoveryApplied:false,repairShipmentId:null};
  s.infrastructureIncidents.items.push(routeIncident);
  s.home='移動都市';const routeFareBefore=travelLegFareQuote(s,s.res.n,s.res.n).amount,
    homeBefore=s.home,regionBefore=s.res.n,localityBefore=JSON.stringify(s.local),
    travelBefore=JSON.stringify(ensureTravelState(s)),routeEventEligible=lifeSystemEventEligible(s,'life_infra_route_block'),
    currentIncident=activeInfrastructureIncident(s)?.id,
    routeResponse=applyInfrastructureIncidentAction(s,{action:'respond',mode:'alternate'}),
    routeFareAfter=travelLegFareQuote(s,s.res.n,s.res.n).amount,
    homeAfter=s.home,regionAfter=s.res.n,localityAfter=JSON.stringify(s.local),travelAfter=JSON.stringify(s.travelState);
  routeIncident.status='closed';
  const clinic=s.community.facilities[clinicId];clinic.status='open';clinic.independentPower=true;
  const powerIncident={id:'incident-independent-clinic-power',areaKey:area,region:s.res.n,kind:'power',
    status:'active',startedAt:{year:s.year,month:s.mo},metricAxis:'jobs',metricDelta:0.035,
    impactApplied:false,recoveryApplied:false,repairShipmentId:null};
  s.infrastructureIncidents.items.push(powerIncident);
  const independentClinicStatus=facilityEffectiveStatus(s,'clinic',clinic);
  return {area,request,duplicateRequest,shipmentId:shipment.id,earlyVerify,depotStatus,custody,delivered,
    deliveredStatus,repaired,duplicateRepair,metricBefore,afterRepair,correction,
    claimReceived,claimStatus:claim.status,claimEvidence:claim.evidence.map(row=>row.type),
    claimScope:claim.evidence.at(-1)?.scope,warningExpired,incidentsBeforeWarning,incidentsAfterWarning,
    responseWithoutReceipt,metricBeforeWarning,metricAfterWarning,resultWarningReceived,resultWarningResponded,
    warningResolved,warningResult,warningResultEligible,warningResultReviewed,warningResultIneligibleAfterReview,
    incidentsBeforeResolvedWarning,incidentsAfterResolvedWarning,medicineAtDepot,earlyMedicineReceive,medicineReceived,stockBefore,stockBeforeReceipt,
    stockAfterReceipt,patientBefore,patientAfter,wrongRecipientCheck,wrongRecipientStatus:letter.status,
    recipientCheck:letter.recipientCheck?.basis,wrongAreaCustody,routeEventEligible,currentIncident,routeResponse,
    routeFareBefore,routeFareAfter,homeBefore,homeAfter,regionBefore,regionAfter,localityBefore,localityAfter,travelBefore,travelAfter,
    independentClinicStatus,systemsValid:isValidLifeSystemsState(s)};
`);

assert.equal(repair.request, true, 'a local incident can create a parts shipment');
assert.equal(repair.duplicateRequest, false, 'one incident cannot spawn duplicate repair requests');
assert.equal(repair.earlyVerify, false, 'the repair cannot be verified before its parts arrive');
assert.equal(repair.depotStatus, 'arrived-at-depot');
assert.equal(repair.custody, true);
assert.equal(repair.delivered, true);
assert.equal(repair.deliveredStatus, 'delivered-to-recipient');
assert.equal(repair.repaired, true);
assert.equal(repair.duplicateRepair, false, 'verified recovery applies once');
assert.equal(repair.afterRepair, repair.metricBefore, 'local service returns the affected metric to its prior value');
assert.equal(repair.claimStatus, 'unverified', 'a narrow correction never verifies the broadcast as a whole');
assert.equal(repair.claimReceived, true);
assert.equal(repair.correction, true);
assert.deepEqual(repair.claimEvidence, ['same-area-repair-observation']);
assert.match(repair.claimScope, /一地区・一設備/);
assert.equal(repair.warningExpired, true, 'an unreceived forecast expires on its own due date');
assert.equal(repair.responseWithoutReceipt, false, 'a warning cannot be answered before the person receives it');
assert.equal(repair.incidentsAfterWarning, repair.incidentsBeforeWarning,
  'an expired warning never creates an infrastructure incident');
assert.equal(repair.metricAfterWarning, repair.metricBeforeWarning);
assert.equal(repair.resultWarningReceived, true);
assert.equal(repair.resultWarningResponded, true);
assert.equal(repair.warningResolved, true, 'a received warning resolves into an observed result, not a catastrophe');
assert.ok(['observed', 'no-disruption'].includes(repair.warningResult));
assert.equal(repair.warningResultEligible, true, 'the reviewed-result event opens only after a received forecast resolves');
assert.equal(repair.warningResultReviewed, true);
assert.equal(repair.warningResultIneligibleAfterReview, true, 'the same forecast result cannot be reviewed repeatedly');
assert.equal(repair.incidentsAfterResolvedWarning, repair.incidentsBeforeResolvedWarning,
  'resolving a forecast never creates a local incident by itself');
assert.equal(repair.medicineAtDepot, 'arrived-at-depot', 'arrival at the depot is not clinic receipt');
assert.equal(repair.earlyMedicineReceive, false, 'medicine still in transit cannot enter clinic stock');
assert.equal(repair.stockBefore, repair.stockBeforeReceipt);
assert.equal(repair.medicineReceived, true);
assert.equal(repair.stockAfterReceipt, repair.stockBefore + 3);
assert.deepEqual(repair.patientAfter, repair.patientBefore, 'clinic stock does not silently treat a patient');
assert.equal(repair.wrongRecipientCheck, true);
assert.equal(repair.wrongRecipientStatus, 'held-for-delivery');
assert.equal(repair.recipientCheck, 'recipient-and-current-address-not-yet-matched');
assert.equal(repair.wrongAreaCustody, false, 'a parcel for another locality cannot be received here');
assert.equal(repair.routeEventEligible, true);
assert.equal(repair.currentIncident, 'incident-city-route-fixture', 'a different district incident is not treated as local');
assert.equal(repair.routeResponse, true);
assert.ok(repair.routeFareAfter < repair.routeFareBefore,
  'the local detour response updates the route cost while preserving the residence and travel record');
assert.equal(repair.homeAfter, repair.homeBefore);
assert.equal(repair.regionAfter, repair.regionBefore);
assert.equal(repair.localityAfter, repair.localityBefore, 'a closed city passage is not modeled as foreign migration');
assert.equal(repair.travelAfter, repair.travelBefore, 'a local detour report is not a travel record');
assert.equal(repair.independentClinicStatus, 'open', 'a clinic with independent power remains available during a local outage');
assert.equal(repair.systemsValid, true);

console.log('PASS local warning, incident, shipment custody, scoped correction, and clinic stock boundaries');
