'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx,
  { timeout: 20000 }));
setup(ctx, { id: 'arts-history-retention', seed: 905944, region: 'リターニア', age: 17 });

const retained = read(`
  const s=S;s.local.hazard=0;
  const world=s.world.educationWorld,area=s.local.educationAreaId,
    school=educationRegisterInstitution(world,area,'arts-history-fixture','history-school',['arts'],s.year),
    offering=world.offerings[school.offeringIds[0]];
  s.mo=0;educationStart(s,offering.stage,1,'arts-history-enrollment');
  Object.assign(s.educationPath,{institutionId:offering.institutionId,campusId:offering.campusId,offeringId:offering.id});
  const enrollment=s.educationRecord.enrollments.at(-1);educationBindFormalEnrollment(s,enrollment.id);s.mo=1;
  educationRecordAttendance(s,{enrollmentId:enrollment.id,placementId:s.educationPlacements.currentPlacementId,
    year:s.year,month:s.mo,personalAccess:1,evidenceRef:'arts-history-attendance'});
  const learned=artsRecordPractice(s,{action:'record-practice',disciplineId:'kinetic',
    techniqueId:'kinetic-small-object',outcome:'guided-success'},'arts-history-learning');
  const borrowed=artsApplyEquipmentAction(s,{action:'borrow-equipment'},'life_arts_unit_borrow',null),
    equipment=s.artsEquipment.items[0];
  let practiceSuccess=0,useSuccess=0,inspectionSuccess=0;
  for(let index=0;index<30;index++){
    practiceSuccess+=Number(artsRecordPractice(s,{action:'record-practice',disciplineId:'kinetic',
      techniqueId:'kinetic-small-object',outcome:'guided-success'},'practice-history-'+index));
    useSuccess+=Number(applyArtsAdvancedAction(s,{action:'record-use',techniqueId:'kinetic-small-object',
      disciplineId:'kinetic',purpose:'personal-practice',siteRef:s.community.key,result:'performed'},
      'use-history-'+index,null));
    inspectionSuccess+=Number(artsApplyEquipmentAction(s,{action:'inspect-equipment',equipmentId:equipment.id,
      result:'serviceable'},'inspection-history-'+index,null));
  }
  const restored=normalizeResumeImport(makeResumeSnapshot()).S,
    saveRoundtrip=JSON.stringify({profile:s.artsProfile,equipment:s.artsEquipment,
      systems:s.infrastructureIncidents,contracts:s.contingencyContracts,projects:s.communityProjects,
      culture:s.culturalPractice,research:s.researchConsents,warnings:s.catastropheWarnings,
      shipments:s.world.shipments})===JSON.stringify({profile:restored.artsProfile,equipment:restored.artsEquipment,
      systems:restored.infrastructureIncidents,contracts:restored.contingencyContracts,projects:restored.communityProjects,
      culture:restored.culturalPractice,research:restored.researchConsents,warnings:restored.catastropheWarnings,
      shipments:restored.world.shipments});
  return {learned,borrowed,practiceSuccess,useSuccess,inspectionSuccess,
    practiceRetained:s.artsProfile.practiceHistory.length,practiceArchive:s.artsProfile.practiceArchive,
    usesRetained:s.artsProfile.useHistory.length,useArchive:s.artsProfile.useArchive,
    inspectionsRetained:s.artsEquipment.maintenanceRecords.filter(row=>row.equipmentId===equipment.id&&row.action==='inspection').length,
    maintenanceArchive:s.artsEquipment.maintenanceArchive.filter(row=>row.equipmentId===equipment.id&&row.action==='inspection'),
    lastPractice:s.artsProfile.practiceHistory.at(-1)?.sourceEventId,
    lastUse:s.artsProfile.useHistory.at(-1)?.sourceEventId,
    lastInspection:s.artsEquipment.maintenanceRecords.filter(row=>row.action==='inspection').at(-1)?.sourceEventId,
    profileValid:isValidArtsProfileState(s.artsProfile,s.year),equipmentValid:isValidArtsEquipmentState(s.artsEquipment,s.year),
    roundtripValid:isValidLifeSystemsState(restored),saveRoundtrip};
`);

assert.equal(retained.learned, true);
assert.equal(retained.borrowed, true);
assert.equal(retained.practiceSuccess, 30);
assert.equal(retained.useSuccess, 30);
assert.equal(retained.inspectionSuccess, 30);
assert.equal(retained.practiceRetained, 24);
assert.equal(retained.practiceArchive.reduce((sum,row)=>sum+row.count,0), 7,
  'the initial practice plus 30 later entries are represented across retained and archived history');
assert.equal(retained.usesRetained, 24);
assert.equal(retained.useArchive.reduce((sum,row)=>sum+row.count,0), 6);
assert.equal(retained.inspectionsRetained, 12, 'the newest twelve inspections remain directly readable');
assert.equal(retained.maintenanceArchive.reduce((sum,row)=>sum+row.count,0), 18);
assert.equal(retained.lastPractice, 'practice-history-29');
assert.equal(retained.lastUse, 'use-history-29');
assert.equal(retained.lastInspection, 'inspection-history-29');
assert.equal(retained.profileValid, true);
assert.equal(retained.equipmentValid, true);
assert.equal(retained.roundtripValid, true);
assert.equal(retained.saveRoundtrip, true, 'new bounded histories and life-system ledgers survive a SAVE_VERSION 88 round trip');

console.log('PASS arts practice, use and equipment histories remain bounded with preserved summaries');
