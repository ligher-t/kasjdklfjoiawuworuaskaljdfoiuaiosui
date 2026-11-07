'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context, setup } = require('./support/annual-cases.cjs');

const { ctx } = context(path.resolve(__dirname, '..'));
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx,
  { timeout: 20000 }));
setup(ctx, { id: 'community-research-culture', seed: 905933, region: 'サルゴン', age: 28 });

const result = read(`
  const s=S;initializeLifeSystems(s);s.cash=10000000;s.house.cash=10000000;
  const clinicId=Object.values(s.community.facilities||{}).find(row=>row.kind==='clinic')?.id||'clinic-research-fixture';
  s.community.facilities ||= {};s.community.facilities[clinicId] ||= {id:clinicId,kind:'clinic',status:'open'};
  const area=s.community.key,offer={id:'research:fixture:1',clinicId,areaKey:area,
    researcherId:'clinic-research-team:'+clinicId,participantId:s.personId,scope:'observation-only',
    status:'offered',offeredAt:{year:s.year,month:s.mo},consentAt:null,procedureAt:null,
    procedureDueAt:null,followupDueAt:null,interventionApplied:false,compensation:0,
    source:'local-clinic-game-model-study'};
  s.researchConsents.offers.push(offer);
  const briefing=applyResearchConsentAction(s,{action:'attend-briefing',targetId:offer.id},'life_research_briefing'),
    consentAtBriefing=offer.consentAt,
    earlyProcedure=applyResearchConsentAction(s,{action:'procedure',targetId:offer.id},'life_research_procedure'),
    consent=applyResearchConsentAction(s,{action:'consent',targetId:offer.id},'life_research_consent'),
    due={...offer.procedureDueAt},tooEarly=applyResearchConsentAction(s,{action:'procedure',targetId:offer.id},'life_research_procedure');
  const advanceOne=()=>{const p=s.year*12+s.mo+1,oldYear=s.year;s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;
    s.age+=s.year-oldYear;};
  const healthBefore={h:s.h,inf:s.inf,ob:s.ob,tx:s.fl.tx};
  advanceOne();
  const procedure=applyResearchConsentAction(s,{action:'procedure',targetId:offer.id},'life_research_procedure'),
    procedureAgain=applyResearchConsentAction(s,{action:'procedure',targetId:offer.id},'life_research_procedure'),
    healthAfter={h:s.h,inf:s.inf,ob:s.ob,tx:s.fl.tx};
  advanceOne();
  const followup=applyResearchConsentAction(s,{action:'followup',targetId:offer.id},'life_research_followup'),
    followed=offer.status,observation=offer.followupAt;
  const withdrawnOffer={...offer,id:'research:fixture:2',status:'offered',offeredAt:{year:s.year,month:s.mo},
    consentAt:null,procedureAt:null,procedureDueAt:null,followupDueAt:null,followupAt:null,
    interventionApplied:false,compensation:0};
  s.researchConsents.offers.push(withdrawnOffer);
  const withdrawBriefing=applyResearchConsentAction(s,{action:'attend-briefing',targetId:withdrawnOffer.id},'life_research_briefing'),
    withdrawConsent=applyResearchConsentAction(s,{action:'consent',targetId:withdrawnOffer.id},'life_research_consent'),
    withdrawal=applyResearchConsentAction(s,{action:'withdraw',targetId:withdrawnOffer.id},'life_research_withdraw'),
    withdrawnProcedure=applyResearchConsentAction(s,{action:'procedure',targetId:withdrawnOffer.id},'life_research_procedure');
  const research={briefing,consentAtBriefing,earlyProcedure,consent,due,tooEarly,procedure,procedureAgain,
    healthBefore,healthAfter,followup,followed,observation,withdrawBriefing,withdrawConsent,withdrawal,
    withdrawnProcedure,withdrawnStatus:withdrawnOffer.status,intervention:offer.interventionApplied,
    compensation:offer.compensation,procedureCount:s.researchConsents.procedures.length};

  s.home='固定集落';s.local.kind='小規模な定住地';s.community.metrics.medical=0.4;
  const projectMetricBefore=s.community.metrics.medical,shared=inSharedHousehold(s),wallet=()=>shared?s.house.cash:s.cash,
    fundsBefore=wallet(),donation=applyCommunityProjectAction(s,{action:'donate',amount:2500},'life_culture_rural_donation'),
    project=activeCommunityProject(s),
    donatedFunds=wallet(),premature=applyCommunityProjectAction(s,{action:'complete-work'},'life_culture_rural_repair'),
    noEarlyImpact=s.community.metrics.medical;
  if(!project)throw Error(JSON.stringify({home:s.home,kind:s.local.kind,medical:projectMetricBefore,
    area:s.community.key,active:activeCommunityProject(s),fundsBefore,shared,shipments:s.world.shipments.items.length}));
  const shipment=findShipment(s,project.shipmentId),advanceProject=()=>{const p=s.year*12+s.mo+1,oldYear=s.year;
    s.year=Math.floor((p-1)/12);s.mo=(p-1)%12+1;s.age+=s.year-oldYear;advanceShipments(s);};
  if(!shipment)throw Error(JSON.stringify({shipmentId:project.shipmentId,shipmentState:s.world.shipments}));
  advanceProject();advanceProject();
  const depot=shipment.status,custody=applyShipmentAction(s,{action:'take-custody',targetId:shipment.id},'life_ship_custody'),
    delivery=applyShipmentAction(s,{action:'confirm-recipient',targetId:shipment.id},'life_ship_recipient_check'),
    receipt=applyCommunityProjectAction(s,{action:'mark-parts-received',targetId:project.id},'life_culture_rural_repair'),
    helpers=applyCommunityProjectAction(s,{action:'record-helpers',helperCount:2,targetId:project.id},'life_culture_rural_repair'),
    beforeWork=s.community.metrics.medical,
    completed=applyCommunityProjectAction(s,{action:'complete-work',targetId:project.id},'life_culture_rural_repair'),
    afterWork=s.community.metrics.medical,
    duplicateWork=applyCommunityProjectAction(s,{action:'complete-work',targetId:project.id},'life_culture_rural_repair');

  const techniquesBefore=s.artsProfile.knownTechniques.length;s.fl.hobby_music=1;
  const performance=applyCulturalPracticeAction(s,{action:'record-music-performance'},'life_culture_music'),
    duplicatePerformance=applyCulturalPracticeAction(s,{action:'record-music-performance'},'life_culture_music'),
    traditionCountBefore=s.culturalPractice.traditions.length;
  s.neighborContact={id:'neighbor-culture-fixture'};s.culturalIdentity={homeLanguage:'sargon-local'};
  const literacyBeforeTradition=Number(s.socialLearning?.literacy||0),
    traditionCreated=applyCulturalPracticeAction(s,{action:'record-oral-tradition'},'life_culture_oral_tradition'),
    tradition=s.culturalPractice.traditions.at(-1),literacyAfterTradition=Number(s.socialLearning?.literacy||0);
  const traditionEventEligibleAwayFromSami=lifeSystemEventEligible(s,'life_arts_tradition_lesson');
  s.kids.push({id:'mentor-child-fixture',nm:'ミナ',by:s.year-14,d:0});
  s.artsProfile.techSkills['unit-maintenance']=1;
  const mentorEvent=EV.find(event=>event.id==='life_arts_mentor_later'),
    mentorEligible=lifeSystemEventEligible(s,'life_arts_mentor_later'),
    mentorRecorded=applyLifeSystemAction(s,mentorEvent.c[0].o[0][2].lifeSystemAction,mentorEvent.id),
    mentorRecord=s.culturalPractice.mentoring.at(-1);
  const festival={id:'festival-fixture',areaKey:area,status:'open',createdAt:{year:s.year,month:s.mo},
    workStartedAt:null,workCompletedAt:null,paidAt:null};
  s.culturalPractice.festivals.push(festival);
  const signedUp=applyCulturalPracticeAction(s,{action:'sign-up-festival'},'life_culture_festival_signup');
  advanceOne();advanceArtsCulture(s);
  const workComplete=festival.status,unpaidFestivalSettle=applyCulturalPracticeAction(s,{action:'settle-festival'},'life_culture_festival_payment');
  const adultAge=s.age,offersBeforeMinorGate=s.researchConsents.offers.length;
  s.age=17;advanceResearchConsents(s);
  const offersAfterMinorGate=s.researchConsents.offers.length;s.age=adultAge;
  return {research,donation,projectId:project.id,fundsBefore,donatedFunds,projectMetricBefore,premature,noEarlyImpact,
    depot,custody,delivery,receipt,helpers,beforeWork,completed,afterWork,duplicateWork,projectValid:isValidCommunityProjectState(s.communityProjects,s.year),
    performance,duplicatePerformance,techniquesBefore,techniquesAfter:s.artsProfile.knownTechniques.length,
    performanceRecord:s.culturalPractice.performances.at(-1),traditionCreated,
    traditionRecord:s.culturalPractice.traditions.at(-1),traditionCountBefore,literacyBeforeTradition,literacyAfterTradition,
    traditionEventEligibleAwayFromSami,mentorEligible,mentorRecorded,mentorRecord,
    signedUp,workComplete,unpaidFestivalSettle,offersBeforeMinorGate,offersAfterMinorGate,
    cultureValid:isValidCulturalPracticeState(s.culturalPractice,s.year),researchValid:isValidResearchConsentState(s.researchConsents,s.year),
    systemsValid:isValidLifeSystemsState(s)};
`);

assert.equal(result.research.briefing, true);
assert.equal(result.research.consentAtBriefing, null, 'a briefing explains research but does not create consent');
assert.equal(result.research.earlyProcedure, false);
assert.equal(result.research.consent, true);
assert.equal(result.research.tooEarly, false, 'the procedure waits until its recorded due month');
assert.equal(result.research.procedure, true);
assert.equal(result.research.procedureAgain, false, 'one consent produces one procedure record');
assert.deepEqual(result.research.healthAfter, result.research.healthBefore,
  'non-invasive observation does not treat or change health');
assert.equal(result.research.followup, true);
assert.equal(result.research.followed, 'followed-up');
assert.equal(result.research.observation.healthObserved, result.research.healthBefore.h);
assert.equal(result.research.observation.infectionLoadObserved, result.research.healthBefore.ob);
assert.equal(result.research.withdrawBriefing, true);
assert.equal(result.research.withdrawConsent, true);
assert.equal(result.research.withdrawal, true);
assert.equal(result.research.withdrawnProcedure, false, 'withdrawal before the visit prevents the procedure');
assert.equal(result.research.withdrawnStatus, 'withdrawn');
assert.equal(result.research.intervention, false);
assert.equal(result.research.compensation, 0);
assert.equal(result.research.procedureCount, 1);

assert.equal(result.donation, true);
assert.equal(result.donatedFunds, result.fundsBefore - 2500);
assert.equal(result.projectMetricBefore, 0.4);
assert.equal(result.premature, false, 'a donation or proposal does not repair a well');
assert.equal(result.noEarlyImpact, result.projectMetricBefore);
assert.equal(result.depot, 'arrived-at-depot');
assert.equal(result.custody, true);
assert.equal(result.delivery, true);
assert.equal(result.receipt, true);
assert.equal(result.helpers, true);
assert.equal(result.completed, true);
assert.equal(result.afterWork, result.beforeWork + 0.035);
assert.equal(result.duplicateWork, false);
assert.equal(result.projectValid, true);
assert.equal(result.performance, true);
assert.equal(result.duplicatePerformance, false);
assert.equal(result.performanceRecord.artsTechniqueLearned, false);
assert.equal(result.techniquesAfter, result.techniquesBefore, 'a performance does not award an arts technique');
assert.equal(result.traditionCreated, true);
assert.equal(result.traditionRecord.literacyGranted, false);
assert.equal(result.traditionEventEligibleAwayFromSami, false,
  'the valley-weather oral tradition is limited to its referenced Sami setting');
assert.equal(result.literacyAfterTradition, result.literacyBeforeTradition,
  'hearing an oral tradition does not alter reading or writing ability');
assert.equal(result.mentorEligible, true);
assert.equal(result.mentorRecorded, true);
assert.equal(result.mentorRecord.menteeId, 'mentor-child-fixture');
assert.equal(result.mentorRecord.qualificationGranted, false);
assert.equal(result.signedUp, true);
assert.equal(result.workComplete, 'work-complete');
assert.equal(result.unpaidFestivalSettle, false, 'festival participation is not paid employment');
assert.equal(result.offersAfterMinorGate, result.offersBeforeMinorGate,
  'research invitations are not generated for minors without a consent pathway');
assert.equal(result.cultureValid, true);
assert.equal(result.researchValid, true);
assert.equal(result.systemsValid, true);

setup(ctx, { id: 'arts-sami-oral-tradition', seed: 905932, region: 'サーミ', age: 30 });
const samiTradition = read(`
  const s=S;s.neighborContact={id:'sami-neighbor-fixture'};s.culturalIdentity={homeLanguage:'sami-local'};
  const event=EV.find(row=>row.id==='life_arts_tradition_lesson'),
    eligible=lifeSystemEventEligible(s,event.id),
    recorded=applyLifeSystemAction(s,event.c[0].o[0][2].lifeSystemAction,event.id),
    record=s.culturalPractice.traditions.find(row=>row.sourceEventId===event.id);
  return {eligible,recorded,record,valid:isValidCulturalPracticeState(s.culturalPractice,s.year)};
`);
assert.equal(samiTradition.eligible, true);
assert.equal(samiTradition.recorded, true);
assert.equal(samiTradition.record.literacyGranted, false);
assert.equal(samiTradition.record.languageId, 'sami-local');
assert.equal(samiTradition.valid, true);

setup(ctx, { id: 'arts-mentoring-child-scope', seed: 905933, region: 'リターニア', age: 28 });
const mentoring = read(`
  const s=S;s.kids.push({id:'mentor-child-fixture',nm:'ミナ',by:s.year-14,d:0});
  s.kids.push({id:'younger-mentor-child-fixture',nm:'ユウ',by:s.year-16,d:0});
  s.artsProfile.techSkills['unit-maintenance']=1;
  const event=EV.find(row=>row.id==='life_arts_mentor_later'),
    eligible=lifeSystemEventEligible(s,event.id),
    recorded=applyLifeSystemAction(s,event.c[0].o[0][2].lifeSystemAction,event.id),
    record=s.culturalPractice.mentoring.at(-1);
  return {eligible,recorded,record,valid:isValidCulturalPracticeState(s.culturalPractice,s.year)};
`);
assert.equal(mentoring.eligible, true);
assert.equal(mentoring.recorded, true);
assert.equal(mentoring.record.menteeId, 'younger-mentor-child-fixture',
  'the most senior eligible minor is identified from the actual household roster');
assert.equal(mentoring.record.qualificationGranted, false);
assert.equal(mentoring.valid, true);

console.log('PASS research consent, rural project delivery, cultural record and qualification boundaries');
