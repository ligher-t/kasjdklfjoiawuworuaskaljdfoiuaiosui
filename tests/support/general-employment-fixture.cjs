'use strict';
const vm=require('node:vm');

// Story tests that need a currently employed protagonist must establish a real
// general vacancy and accept it through the production employment pipeline.
function installGeneralEmploymentFixture(ctx) {
  vm.runInContext(`globalThis.prepareGeneralEmploymentOpeningFixture=function(jobId,fixtureId='test'){
    const area=occupationAreaSnapshot(S),work=S.world.occupationWorld,
      employerId='fixture-general-employer:'+fixtureId,
      siteId='fixture-general-site:'+fixtureId,
      positionId='fixture-general-position:'+fixtureId,
      openingId='fixture-general-opening:'+fixtureId;
    work.employers[employerId]={employerId,organizationKey:null,kind:'anonymous-operator'};
    const sectorByJob={1:'AGR',2:'MFG',3:'MIN',4:'MIL',7:'SCI',14:'MIL',16:'LOG',
      17:'COM',18:'MFG',20:'MED',21:'CIV',22:'MFG',23:'AGR',27:'SCI'};
    area.sectorPresence||={};
    area.sectorPresence[sectorByJob[jobId]||'MFG']=true;
    work.sites[siteId]={siteId,employerId,areaId:area.areaId,status:'open',sector:sectorByJob[jobId]||'MFG',positionIds:[positionId]};
    work.positions[positionId]={positionId,siteId,jobId,capacity:1,aggregateOccupiedSlots:0,
      identifiedOccupiedSlots:0,reservedSlots:0,vacancyCount:1,openingIds:[openingId]};
    work.openings[openingId]={openingId,employerId,siteId,positionId,areaId:area.areaId,
      kind:'general-public',status:'open',slots:1,validFromYear:S.year};
    area.siteIds||=[];if(!area.siteIds.includes(siteId))area.siteIds.push(siteId);
    const opening=employmentOpeningForChoice(S,jobId,openingId);
    if(!opening)throw Error('general opening fixture rejected: no qualified opening');
    return opening;
  };
  globalThis.startGeneralEmploymentFixture=function(jobId,fixtureId='test'){
    const opening=prepareGeneralEmploymentOpeningFixture(jobId,fixtureId),
      prior=TRACE_RESOLUTION;
    TRACE_RESOLUTION={kind:'choice',id:'general-employment-fixture:'+fixtureId,label:'fixture'};
    try{ap({employmentAction:{action:'accept-local-opening',jobId,openingId:opening.openingId}});}
    finally{TRACE_RESOLUTION=prior;}
    return currentPlayerEmployment(S);
  }; true`,ctx);
}

module.exports={installGeneralEmploymentFixture};
