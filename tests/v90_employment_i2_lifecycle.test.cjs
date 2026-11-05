'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const {ctx}=context(root);
setup(ctx,{id:'employment-i2',seed:20261105,region:'クルビア',age:18});
const evaluate=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx,{timeout:25000}));
const result=evaluate(`
  S.job=0;S.mo=2;
  const area=occupationAreaSnapshot(S),w=S.world.occupationWorld;
  let opening=occupationOpeningFor(S,2);
  if(!opening){
    // A deterministic test fixture for a valid one-slot anonymous factory.
    const sector='MFG',siteId='fixture-factory',positionId='fixture-position',
      employerId='fixture-operator',openingId='fixture-open-1';
    w.employers[employerId]={employerId,organizationKey:null,kind:'anonymous-operator',areaId:area.areaId};
    w.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',positionIds:[positionId]};
    w.positions[positionId]={positionId,siteId,sector,jobId:2,capacity:5,
      aggregateOccupiedSlots:4,identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,
      openingIds:[openingId]};
    w.openings[openingId]={openingId,positionId,employerId,siteId,areaId:area.areaId,
      status:'open',slots:1,validFromYear:S.year,basis:'test-fixture'};
    opening=occupationOpeningFor(S,2);
  }
  const pos=w.positions[opening.positionId],openBefore=opening.slots,
    beforeAvailable=!!employmentOpeningForChoice(S,2),
    factory=EV.find(row=>row.id==='car').c.find(row=>row.l==='工場労働者として働く');
  const shown=typeof factory.show==='function'?factory.show(S):null;
  const beforeJob=S.job,initialSlot=pos.identifiedOccupiedSlots;
  ap(factory.o[0][2]);
  const episode=currentPlayerEmployment(S),postHire={
    job:S.job,contract:S.workContract,active:!!episode,
    id:episode?.episodeId,sourceCaseId:episode?.sourceCaseId,
    caseHistory:S.employmentState?.cases?.at(-1)?.history.map(row=>row.status),
    slots:opening.slots,occupied:pos.identifiedOccupiedSlots,
    vacancy:pos.vacancyCount,
    wage:employmentAnnualWageBase(S,S.year),
    expectedWage:J[2].pay*11/12,
    oldFacilityMade:Object.values(S.community?.facilities||{}).some(row=>
      row.kind==='workplace'&&row.extra==='2'),
    careerChange:S.lifeRecord?.careerChanges?.at(-1),
    worldReadOnlyBefore:JSON.stringify(S.world.occupationWorld)
  };
  const originalCaseCount=S.employmentState.cases.length,
    originalEpisodeCount=S.employmentState.episodes.length;
  let duplicateRejected=false;
  try{ap(factory.o[0][2]);}catch(e){duplicateRejected=/募集と本人/.test(e.message);}
  const noDuplicate=originalCaseCount===S.employmentState.cases.length &&
    originalEpisodeCount===S.employmentState.episodes.length;
  ensureLocalityState(S);
  const validAudit=!auditLifeState(S).includes('勤務契約と現在の在籍が不一致');
  const savedEpisodeId=S.workContract.episodeId;
  S.workContract.episodeId='invalid-episode-reference';
  const corruptAudit=auditLifeState(S).includes('勤務契約と現在の在籍が不一致');
  S.workContract.episodeId=savedEpisodeId;
  const contractSurvivesLocality=S.workContract?.siteId===episode.siteId;
  applyWorkContractAction(S,{action:'review',result:'approved'});
  const reviewWorks=S.workContract?.knownConditions==='reviewed';
  S.mo=10;
  applyPlayerEmploymentAction(S,{action:'leave',reason:'voluntary-leave'});
  const afterEnd={
    job:S.job,active:currentPlayerEmployment(S),
    status:episode.status,reason:episode.leaveReason,
    endYear:episode.endYear,endMonth:episode.endMonth,
    occupied:pos.identifiedOccupiedSlots,vacancy:pos.vacancyCount,
    wages:employmentAnnualWageBase(S,S.year),
    careerChange:S.lifeRecord?.careerChanges?.at(-1),
    contract:S.workContract
  };
  const saved=JSON.parse(JSON.stringify(S));
  const cloned=JSON.parse(JSON.stringify(saved));
  const stable=JSON.stringify(saved)===JSON.stringify(cloned);
  S.year++;
  const followingYearPay=employmentAnnualWageBase(S,S.year);
  const noStarterCandidate=employmentOpeningForChoice(S,0)===null;
  return {beforeAvailable,shown,beforeJob,initialSlot,openBefore,
    postHire,duplicateRejected,noDuplicate,validAudit,corruptAudit,contractSurvivesLocality,reviewWorks,
    afterEnd,stable,followingYearPay,noStarterCandidate};
`);
assert.equal(result.beforeAvailable,true);
assert.equal(result.shown,true);
assert.equal(result.beforeJob,0);
assert.equal(result.postHire.job,2);
assert.equal(result.postHire.active,true);
assert.equal(result.postHire.contract.basis,'occupation-episode');
assert.equal(result.postHire.contract.siteId!=null,true);
assert.equal(result.postHire.contract.episodeId,result.postHire.id);
assert.deepEqual(result.postHire.caseHistory,
  ['discovered','verified','applied','screening','offered','accepted','contracted','active']);
assert.equal(result.postHire.slots,result.openBefore-1);
assert.equal(result.postHire.occupied,result.initialSlot+1);
assert(Math.abs(result.postHire.wage-result.postHire.expectedWage)<0.001,
  'employment wage is prorated from the actual starting month');
assert.equal(result.postHire.oldFacilityMade,false,'new employment does not backfill synthetic workplace');
assert.equal(result.postHire.careerChange.toJobId,2);
assert.equal(result.duplicateRejected,true);
assert.equal(result.noDuplicate,true);
assert.equal(result.validAudit,true,'real worksite contract is valid without a synthetic workplace');
assert.equal(result.corruptAudit,true,'incorrect episode reference remains auditable');
assert.equal(result.contractSurvivesLocality,true);
assert.equal(result.reviewWorks,true);
assert.equal(result.afterEnd.job,0);
assert.equal(result.afterEnd.active,null);
assert.equal(result.afterEnd.status,'terminated');
assert.equal(result.afterEnd.reason,'voluntary-leave');
assert.equal(result.afterEnd.occupied,result.initialSlot);
assert.equal(result.afterEnd.vacancy,result.postHire.vacancy+1);
assert(Math.abs(result.afterEnd.wages-result.postHire.expectedWage*8/11)<0.001,
  'work that ended in October must not receive October through December wages');
assert.equal(result.afterEnd.careerChange.toJobId,0);
assert.equal(result.afterEnd.contract,null);
assert.equal(result.stable,true);
assert.equal(result.followingYearPay,0);
assert.equal(result.noStarterCandidate,true);
const clinical=evaluate(`
  const applicant={...S,job:0,fl:{...S.fl,uni:1},k:75,
    socialLearning:{...(S.socialLearning||{}),literacy:72},
    lifeRecord:{...(S.lifeRecord||{}),skills:[{id:'medical-clinical-practice',level:20}]}};
  const snapshot=JSON.stringify(applicant),rng=S.rngState;
  const earned=careerOpeningAssessment(applicant,{role:'clinical'});
  applicant.lifeRecord.skills=[];
  const unsupported=careerOpeningAssessment(applicant,{role:'clinical'});
  return {earned:earned.canApply,unsupported:unsupported.canApply,
    rngSame:rng===S.rngState,originalAward:applicant.fl.uni===1};
`);
assert.equal(clinical.earned,true,'earned clinical evidence and degree permit individual assessment');
assert.equal(clinical.unsupported,false,'degree without supervised clinical training is insufficient');
assert.equal(clinical.rngSame,true);
console.log('PASS employment I-2: real vacancy consumed, career episode, contract, ended wages, no duplicate hire');
