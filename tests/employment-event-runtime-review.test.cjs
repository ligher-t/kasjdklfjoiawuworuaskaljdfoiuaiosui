'use strict';
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const review=JSON.parse(fs.readFileSync(path.join(root,
  'docs/employment/W01_A175_OUTCOME_703_SEMANTIC_DECISIONS_20261104.json'),'utf8'));
const {ctx}=context(root);
setup(ctx,{id:'employment-a175-runtime-review',seed:202611051,region:'クルビア',age:30});
ctx.A175_REVIEW=JSON.stringify(review);

// Reviewed current-source changes since the 2026-11-04 W01 snapshot. Each
// digest binds its changed label, condition, result and effect to this review.
const reviewedBranches={
  'vic_war:1':'b76100928f6037685832c3d086f97e862c8a135fe11e613d2556fa08bc918ca6',
  'kaz_exile:0':'085be54d2eb029e547880e13611a86d89c337769eec83cb6949c8110ca3ccb71',
  'kaz_exile:1':'32a1edfc59f011b517a844a15522511a1b7d6a0816f8a5911fa0c06e872d611e',
  'bol_war:0':'ffc7674459916201d5191976e8f1f447418493736bd1312e84c3449c9e9d3ba5',
  'bol_war:1':'01ed9de9b472a9a24e5beaa3af64186954047b80d1bfa00d639b7e981a93d87d',
  'bol_war:2':'867fb1fcc357c25cf225118163b9e8a4aeb08a0584ff413f6ee825f4ec7e8e5b',
  'life_rhodes_role_review:1':'3372da9a1a060ba2ca8640aff097c07a7ac286e65cb38f9ca0757b29888a326d',
  'life_rhodes_role_review:2':'3efb11b9e01e191ee60a23b92496719dede5216f88df75183837967b21fecfe0',
  'life_rhodes_role_review:3':'2a3609e463d4dbe8f4eb59f82b810830cf180aed642d8bbead9df2ea1261aba2'
};
const expectedShapeDeltas=[
  {eventId:'vic_war',choiceIndex:1,baseline:2,current:1},
  {eventId:'kaz_exile',choiceIndex:0,baseline:2,current:1},
  {eventId:'kaz_exile',choiceIndex:1,baseline:2,current:1},
  {eventId:'bol_war',choiceIndex:0,baseline:2,current:1},
  {eventId:'bol_war',choiceIndex:1,baseline:2,current:1},
  {eventId:'bol_war',choiceIndex:2,baseline:2,current:1},
  {eventId:'life_rhodes_role_review',field:'choice-count',baseline:3,current:4}
];
const report=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const rows=JSON.parse(A175_REVIEW).events,
    s=S,work=s.world.occupationWorld,result={events:0,choices:0,outcomes:0,
      source:[],jobStartsRejectedWithoutEvidence:0,communityLivelihoodsRetained:0};
  s.job=0;s.workContract=null;
  s.employmentState.episodes=[];s.employmentState.activeEpisodeId=null;
  for(const opening of Object.values(work.openings)){opening.status='closed';opening.slots=0;}
  for(const position of Object.values(work.positions))position.vacancyCount=0;
  for(const expected of rows){
    const event=EV.find(row=>row.id===expected.eventId);
    if(!event)throw Error('W01 source event is missing: '+expected.eventId);
    result.source.push({eventId:event.id,
      body:typeof event.t==='function'?String(event.t):event.t,
      choices:event.c.map(choice=>({
        label:typeof choice.l==='function'?String(choice.l):choice.l||'',
        show:typeof choice.show==='function'?String(choice.show):choice.show||null,
        why:typeof choice.why==='function'?String(choice.why):choice.why||null,
        outcomes:choice.o.map(outcome=>({weight:outcome[0],text:outcome[1],effect:outcome[2]}))
      }))});
    result.events++;
    result.choices+=event.c.length;
    for(let choiceIndex=0;choiceIndex<event.c.length;choiceIndex++){
      const choice=event.c[choiceIndex];
      for(let outcomeIndex=0;outcomeIndex<choice.o.length;outcomeIndex++){
        const effect=choice.o[outcomeIndex][2],before=JSON.stringify({job:s.job,
          episodes:s.employmentState.episodes,finance:s.employmentState.finance,
          contract:s.workContract,siteCount:Object.keys(work.sites).length,
          openingCount:Object.keys(work.openings).length,rng:s.rngState}),
          assessment=employmentEffectAssessment(s,effect,event.id),
          after=JSON.stringify({job:s.job,episodes:s.employmentState.episodes,
            finance:s.employmentState.finance,contract:s.workContract,
            siteCount:Object.keys(work.sites).length,openingCount:Object.keys(work.openings).length,
            rng:s.rngState});
        if(before!==after)throw Error(event.id+' outcome '+choiceIndex+'/'+outcomeIndex+
          ' mutated state during employment assessment');
        if(Number.isInteger(effect?.job)&&effect.job>0){
          if(assessment.canStart){
            if(assessment.kind!=='livelihood'||!assessment.resource)
              throw Error(event.id+' outcome '+choiceIndex+'/'+outcomeIndex+
                ' starts without a verified opening or livelihood');
            result.communityLivelihoodsRetained++;
          }else result.jobStartsRejectedWithoutEvidence++;
        }
        result.outcomes++;
      }
    }
  }
  return result;
})())`,ctx,{timeout:30000}));

const reviewedBranchKeys=new Set(Object.keys(reviewedBranches));
const observedShapeDeltas=[];
const observedReviewedBranches=[];
for(const expected of review.events){
  const current=report.source.find(event=>event.eventId===expected.eventId);
  assert(current,`W01 source event is missing: ${expected.eventId}`);
  if(current.choices.length!==expected.choices.length)
    observedShapeDeltas.push({eventId:expected.eventId,field:'choice-count',
      baseline:expected.choices.length,current:current.choices.length});
  for(let choiceIndex=0;choiceIndex<current.choices.length;choiceIndex++){
    const actual=current.choices[choiceIndex],key=expected.eventId+':'+choiceIndex,
      baseline=expected.choices[choiceIndex];
    if(baseline&&actual.outcomes.length!==baseline.outcomeDecisions.length)
      observedShapeDeltas.push({eventId:expected.eventId,choiceIndex,
        baseline:baseline.outcomeDecisions.length,current:actual.outcomes.length});
    assert(baseline||reviewedBranchKeys.has(key),'unreviewed new A175 choice: '+key);
    if(reviewedBranchKeys.has(key)){
      const digest=crypto.createHash('sha256').update(JSON.stringify(actual)).digest('hex');
      assert.equal(digest,reviewedBranches[key],key+' current branch prose, condition and effect must match its review digest');
      observedReviewedBranches.push(key);
    }
  }
}
assert.deepEqual(observedShapeDeltas,expectedShapeDeltas,'only the seven reviewed W01 source-shape deltas are allowed');
assert.deepEqual(observedReviewedBranches.sort(),[...reviewedBranchKeys].sort());
assert.equal(report.events,175,'W01 A175 event set is complete');
assert.equal(report.choices,489,'all current A175 choices reach runtime employment review');
assert.equal(report.outcomes,698,'all current A175 result branches reach runtime employment admission');
assert.equal(reviewedBranchKeys.size,9);
assert.equal(report.jobStartsRejectedWithoutEvidence+report.communityLivelihoodsRetained>0,true);
console.log(`PASS W01 current runtime review: ${report.events} events, ${report.choices} choices, ${report.outcomes} outcomes; 7 reviewed source-shape deltas; 9 content-bound branches; unsupported starts rejected ${report.jobStartsRejectedWithoutEvidence}, evidence-backed livelihoods retained ${report.communityLivelihoodsRetained}`);
