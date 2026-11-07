'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const read = code => JSON.parse(vm.runInContext(
  'JSON.stringify((()=>{return (' + code + ');})())', ctx, { timeout: 15000 }
));
const run = code => vm.runInContext(code, ctx, { timeout: 15000 });

let firstRaceProfile = null;
for (const race of ['サルカズ', 'エーギル', 'フェリーン']) {
  run(`born({seed:905777,by:1077,region:'リターニア',race:${JSON.stringify(race)}})`);
  const profile = read('({ar:S.ar,band:S.artsProfile.innateBand,wealth:S.w.i})');
  if (race === 'サルカズ') firstRaceProfile = profile;
  else assert.deepEqual(profile, firstRaceProfile,
    'same seed and economic context must not assign a race-specific arts band');
}
setup(ctx, { id: 'arts-evidence', seed: 905055, region: 'リターニア', age: 17 });
const initial = read('({ar:S.ar,band:S.artsProfile.innateBand,course:S.educationPath})');
setup(ctx, { id: 'arts-evidence', seed: 905055, region: 'リターニア', age: 17 });
assert.deepEqual(read('({ar:S.ar,band:S.artsProfile.innateBand,course:S.educationPath})'), initial,
  'a fixed seed must reproduce the same profile without additional random draws');

const untrained = read(`(()=>{S.local.hazard=0;S.ar=40;S.artsProfile.innateBand='exceptional';return {
  unspecified:artsAssessUse(S,{purpose:'personal-practice',siteRef:S.community.key,disciplineId:'kinetic'}),
  unlearned:artsAssessUse(S,{purpose:'personal-practice',siteRef:S.community.key,disciplineId:'kinetic',
    techniqueId:'kinetic-specialized-control'})
}})()`);
assert.equal(untrained.unspecified.eligible, false, 'aptitude alone must not authorize an unspecified technique');
assert.ok(untrained.unspecified.reasonCodes.includes('technique-not-specified'));
assert.equal(untrained.unlearned.eligible, false, 'high aptitude without a learned technique cannot perform specialized work');
assert.ok(untrained.unlearned.reasonCodes.includes('technique-not-learned'));

const course = read(`(()=>{
  S.ar=0;S.artsProfile.innateBand='lower';
  const infectionBefore={inf:S.inf,ob:S.ob,tx:S.fl.tx},
    world=S.world.educationWorld,area=S.local.educationAreaId,
    school=educationRegisterInstitution(world,area,'arts-fixture','scenario-school',['arts'],S.year),
    offering=world.offerings[school.offeringIds[0]];
  S.mo=0;
  educationStart(S,offering.stage,1,'signed:arts-fixture');
  Object.assign(S.educationPath,{institutionId:offering.institutionId,campusId:offering.campusId,offeringId:offering.id});
  const enrollmentId=S.educationRecord.enrollments.at(-1).id;
  educationBindFormalEnrollment(S,enrollmentId);
  S.mo=2;
  S.educationAttendance.enrollments[enrollmentId]||={};
  S.educationAttendance.enrollments[enrollmentId][S.year]||={};
  const absentMonthAccepted=artsHasAttendedCurrentCourse(S);
  educationRecordAttendance(S,{enrollmentId,placementId:S.educationPlacements.currentPlacementId,
    year:S.year,month:S.mo,personalAccess:1,evidenceRef:'arts-fixture-attendance'});
  const attended=artsHasAttendedCurrentCourse(S),
    recorded=artsRecordPractice(S,{action:'record-practice',disciplineId:'kinetic',
      techniqueId:'kinetic-small-object',outcome:'guided-success'},'life_arts_training_first_lesson');
  S.educationPath.yearsCompleted=S.educationPath.duration;
  const assessmentEvent=EV.find(row=>row.id==='life_arts_practical_assessment'),
    assessmentWithoutRecognizedCredits=lifeSystemEventEligible(S,'life_arts_practical_assessment'),
    assessmentCanReturn=assessmentEvent.once!==true;
  return {enrollmentId,absentMonthAccepted,attended,recorded,aptitudeBand:S.artsProfile.innateBand,
    assessmentWithoutRecognizedCredits,assessmentCanReturn,
    technique:S.artsProfile.knownTechniques[0],licensed:S.artsProfile.licenseRefs.length>0,
    infectionBefore,infectionAfter:{inf:S.inf,ob:S.ob,tx:S.fl.tx},
    proficiency:artsAssessUse(S,{purpose:'personal-practice',techniqueId:'kinetic-small-object',
      siteRef:S.community.key,disciplineId:'kinetic'}).eligible};
})()`);
assert.equal(course.absentMonthAccepted, false, 'an enrollment with no current-month attendance is not practice evidence');
assert.equal(course.attended, true);
assert.equal(course.recorded, true);
assert.equal(course.assessmentWithoutRecognizedCredits, false,
  'a practical exam is not offered before the actual academic-year credits are recognized');
assert.equal(course.assessmentCanReturn, true, 'a reassessment can be offered again after another study period');
assert.equal(course.aptitudeBand, 'lower', 'low innate aptitude does not block supported beginner training');
assert.equal(course.technique.certified, false, 'one guided practice is not a license');
assert.equal(course.licensed, false);
assert.deepEqual(course.infectionAfter, course.infectionBefore,
  'safe classroom practice does not add infection exposure or increase infection load');
assert.equal(course.proficiency, true, 'attended guided practice may support its recorded introductory technique');

const equipment = read(`(()=>{
  S.ar=0;S.artsProfile.innateBand='lower';
  const beforeCash=S.cash,
    borrowed=artsApplyEquipmentAction(S,{action:'borrow-equipment'},'life_arts_unit_borrow',null),
    item=S.artsEquipment.items[0],schoolOwned=item?.ownerType==='school'&&item.ownerId===S.educationPath.institutionId,
    inspected=artsApplyEquipmentAction(S,{action:'inspect-equipment',equipmentId:item.id,result:'repair-required'},'life_arts_unit_inspection',null),
    unsafeUse=artsEquipmentAvailable(S,item.id,'supervised-practice',item.siteRef).allowed,
    requested=artsApplyEquipmentAction(S,{action:'request-equipment-repair',equipmentId:item.id},'life_arts_unit_repair',null),
    earlyRepair=artsApplyEquipmentAction(S,{action:'complete-equipment-repair',equipmentId:item.id},'life_arts_unit_repair_complete',null);
  S.mo=3;
  const parts=artsApplyEquipmentAction(S,{action:'record-repair-parts',equipmentId:item.id},'life_arts_unit_repair_parts',null);
  S.mo=4;
  const repaired=artsApplyEquipmentAction(S,{action:'complete-equipment-repair',equipmentId:item.id},'life_arts_unit_repair_complete',null),
    returned=artsApplyEquipmentAction(S,{action:'return-equipment',equipmentId:item.id},'life_arts_unit_return',null);
  return {beforeCash,afterCash:S.cash,borrowed,schoolOwned,inspected,unsafeUse,requested,earlyRepair,parts,repaired,returned,
    lowAptitude:S.artsProfile.innateBand,
    afterReturn:artsEquipmentAvailable(S,item.id,'supervised-practice',item.siteRef).reason};
})()`);
assert.equal(equipment.borrowed, true);
assert.equal(equipment.schoolOwned, true, 'a loan stays a school asset');
assert.equal(equipment.beforeCash, equipment.afterCash, 'borrowing does not create personal property or a cash transfer');
assert.equal(equipment.inspected, true);
assert.equal(equipment.unsafeUse, false, 'unsafe equipment cannot be used');
assert.equal(equipment.requested, true);
assert.equal(equipment.earlyRepair, false, 'repair cannot complete before parts arrive');
assert.equal(equipment.parts, true);
assert.equal(equipment.repaired, true);
assert.equal(equipment.lowAptitude, 'lower', 'non-Arts repair records do not require high Arts aptitude');
assert.equal(equipment.returned, true);
assert.equal(equipment.afterReturn, 'not-in-custody');

const exposure = read(`(()=>{
  S.mo=2;S.local.hazard=0;S.f=5;S.inf=0;S.ob=0;
  const beforeDiagnosis={inf:S.inf,ob:S.ob},
    used=applyArtsAdvancedAction(S,{action:'record-use',techniqueId:'kinetic-small-object',
      disciplineId:'kinetic',purpose:'personal-practice',siteRef:S.community.key,result:'performed'},
      'life_arts_small_use',null);
  const nonInfected={used,inf:S.inf,ob:S.ob,exposures:S.artsProfile.exposureHistory.length};
  S.inf=1;S.fl.dg=1;S.ob=20;S.h=100;
  const highLoad=applyArtsAdvancedAction(S,{action:'record-use',techniqueId:'kinetic-small-object',
      disciplineId:'kinetic',purpose:'high-load-internal',siteRef:S.community.key,result:'performed'},
      'life_arts_overexertion',null);
  return {beforeDiagnosis,nonInfected,highLoad,inf:S.inf,diagnosed:S.fl.dg,ob:S.ob,
    exposures:S.artsProfile.exposureHistory.map(row=>row.sourceEventId)};
})()`);
assert.equal(exposure.nonInfected.used, true);
assert.equal(exposure.nonInfected.inf, 0, 'using an arts unit cannot diagnose a non-infected person');
assert.equal(exposure.nonInfected.exposures, 0, 'safe use does not create internal-originium exposure');
assert.equal(exposure.highLoad, true);
assert.equal(exposure.inf, 1);
assert.equal(exposure.diagnosed, 1);
assert.equal(exposure.ob, 20, 'the recorded act does not apply a population-wide infection multiplier');
assert.deepEqual(exposure.exposures, ['life_arts_overexertion']);

const wrongSite = read(`(()=>{S.local.hazard=0;return artsAssessUse(S,{purpose:'personal-practice',
  techniqueId:'kinetic-small-object',disciplineId:'kinetic',siteRef:'unverified-remote-worksite'}).eligible})()`);
assert.equal(wrongSite, false, 'a learned technique cannot be used at an unrelated, unverified site');

setup(ctx, { id: 'arts-nonformal-workshop', seed: 905056, region: 'リターニア', age: 28 });
const nonformal = read(`(()=>{
  const s=S;initializeLifeSystems(s);s.job=18;s.mo=4;s.local.hazard=0;
  const workArea=occupationWorkAreaKey(s),educationArea=s.local.educationAreaId,
    siteId='fixture-arts-workshop',employerId='fixture-arts-employer',world=s.world.occupationWorld;
  world.sites[siteId]={siteId,employerId,areaId:workArea,status:'open',label:'地区工房'};
  s.employmentState={version:1,cases:[],episodes:[{episodeId:'fixture-arts-worker',personId:s.personId,
    employerId,siteId,jobId:18,kind:'wage-employment',status:'active',startYear:s.year,startMonth:s.mo,
    areaId:workArea,history:[]}],activeEpisodeId:'fixture-arts-worker',knowledge:[]};
  s.workContract={siteId,jobId:18,episodeId:'fixture-arts-worker',status:'active'};
  const provider=educationRegisterInformalProvider(s,{providerId:employerId,organizationId:employerId,
    kind:'workshop-mentor',areaId:educationArea,activeFrom:{year:s.year,month:s.mo},
    subjectIds:['arts-workshop','technical','craft'],evidenceRef:'fixture:mentor-and-workshop'});
  let wrongPlaceRejected=false;
  try{educationOpenLearningPath(s,{modeId:'arts-workshop',providerId:employerId,
    siteRef:{region:s.res.n,areaId:'unverified-remote-area'},subjectIds:['arts-workshop'],
    sourceEventId:'fixture:wrong-place'});}catch{wrongPlaceRejected=true;}
  const opened=applyLifeArtsAction(s,{action:'open-path',mode:'arts-workshop',
      providerId:'$current-arts-provider'},'life_arts_workshop_invitation'),
    path=s.learningPaths.at(-1),firstSkillBefore=s.artsProfile.techSkills['unit-maintenance']||0,
    firstSkillEventEligible=lifeSystemEventEligible(s,'life_arts_non_caster_craft'),
    attendance=educationRecordLearningParticipation(s,{personId:'protagonist',pathId:path.pathId,
      year:s.year,month:s.mo,attendedSessions:1,totalSessions:1,evidenceRef:'fixture:workshop-attendance'}),
    skillRecorded=applyArtsAdvancedAction(s,{action:'record-tech-skill',learningPathId:path.pathId,
      skillId:'unit-maintenance',result:'guided-success'},'life_arts_non_caster_craft'),
    firstSkillAfter=s.artsProfile.techSkills['unit-maintenance']||0,
    nextMonth=s.mo===12?1:s.mo+1;
  provider.activeTo={year:s.year,month:s.mo};
  if(nextMonth===1){s.year++;s.mo=1;s.age++;}else s.mo=nextMonth;
  const expiredTeacherEventEligible=lifeSystemEventEligible(s,'life_arts_non_caster_craft'),
    expiredTeacherSkill=applyArtsAdvancedAction(s,{action:'record-tech-skill',learningPathId:path.pathId,
      skillId:'unit-maintenance',result:'guided-success'},'life_arts_non_caster_craft');
  return {wrongPlaceRejected,opened,pathId:path.pathId,providerId:provider.providerId,attendance:!!attendance,
    firstSkillBefore,firstSkillEventEligible,skillRecorded,firstSkillAfter,expiredTeacherEventEligible,
    expiredTeacherSkill,valid:isValidLifeSystemsState(s)};
})()`);
assert.equal(nonformal.wrongPlaceRejected, true, 'a remote instructor cannot start a situated workshop path');
assert.equal(nonformal.opened, true);
assert.equal(nonformal.providerId, 'fixture-arts-employer');
assert.equal(nonformal.attendance, true);
assert.equal(nonformal.firstSkillBefore, 0);
assert.equal(nonformal.firstSkillEventEligible, true, 'the first practical skill lesson must have an entry point');
assert.equal(nonformal.skillRecorded, true);
assert.equal(nonformal.firstSkillAfter, 1);
assert.equal(nonformal.expiredTeacherEventEligible, false, 'an inactive instructor cannot continue the workshop');
assert.equal(nonformal.expiredTeacherSkill, false);
assert.equal(nonformal.valid, true);

setup(ctx, { id: 'arts-evidence-legacy', seed: 905055, region: 'リターニア', age: 17 });
const legacy = JSON.parse(vm.runInContext('JSON.stringify(makeResumeSnapshot())', ctx));
for (const key of ['artsProfile', 'artsEquipment', 'catastropheWarnings', 'infrastructureIncidents',
  'contingencyContracts', 'researchConsents', 'communityProjects', 'culturalPractice']) delete legacy.S[key];
delete legacy.S.world.shipments;
ctx.LEGACY_SNAPSHOT = legacy;
const migrated = read(`(()=>{
  const first=normalizeResumeImport(LEGACY_SNAPSHOT),second=normalizeResumeImport(first);
  return {ar:first.S.ar,innate:first.S.artsProfile.innateBand,
    techniques:first.S.artsProfile.knownTechniques.length,licenses:first.S.artsProfile.licenseRefs.length,
    education:JSON.stringify(first.S.educationRecord)===JSON.stringify(LEGACY_SNAPSHOT.S.educationRecord),
    sameAfterSecond:JSON.stringify(first.S)===JSON.stringify(second.S),
    systems:isValidLifeSystemsState(first.S),equipment:isValidArtsEquipmentState(first.S.artsEquipment,first.S.year)};
})()`);
assert.equal(migrated.ar, legacy.S.ar, 'legacy aptitude stays intact');
assert.equal(migrated.techniques, 0, 'migration must not invent past techniques');
assert.equal(migrated.licenses, 0, 'migration must not invent past licenses');
assert.equal(migrated.education, true, 'older education records remain untouched');
assert.equal(migrated.sameAfterSecond, true, 'legacy-state backfill is idempotent');
assert.equal(migrated.systems, true);
assert.equal(migrated.equipment, true);

console.log('PASS arts aptitude, attendance evidence, equipment custody/repair, exposure and legacy-save boundaries');
