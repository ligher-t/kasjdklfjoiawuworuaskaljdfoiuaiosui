'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context,setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
const inspect = body => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + body + '})())',ctx));

setup(ctx,{id:'two-sibling-future',seed:195610,region:'ヴィクトリア',age:46});
const siblings = inspect(`
 S.year=1110;S.age=46;S.cash=60000000;S.debt=0;
 S.residenceArrangement='independent_rental';S.fl.household_separated=1;
 S.kids=[
   {id:'older',nm:'年長の子',by:1091,householdStatus:'supported'},
   {id:'younger',nm:'年少の子',by:1093,householdStatus:'supported'}
 ];
 const e=EV.find(x=>x.id==='family_child_future');
 const first=childForEvent(S,e.id)?.id,eligibleFirst=elig(e,S,tags(S)),cd=e.cd;
 S.eventRelativeId=first;
 ap(e.c[4].o[0][2]);S.sn[e.id]=1110;
 S.year=1111;S.age=47;
 const second=childForEvent(S,e.id)?.id,eligibleSecond=elig(e,S,tags(S));
 S.eventRelativeId=second;
 ap(e.c[1].o[0][2]);S.sn[e.id]=1111;
 S.year=1112;S.age=48;
 const third=childForEvent(S,e.id)?.id,eligibleThird=elig(e,S,tags(S));
 const last=S.kids.map(child=>({id:child.id,year:child.futurePlanYear,kind:child.futurePlanSupportHistory?.at(-1)?.kind}));
 return {cd,first,eligibleFirst,second,eligibleSecond,third,eligibleThird,last};
`);
assert.deepEqual(siblings,{
 cd:1,first:'older',eligibleFirst:true,second:'younger',eligibleSecond:true,
 third:null,eligibleThird:false,
 last:[{id:'older',year:1110,kind:'revisit'},{id:'younger',year:1111,kind:'work-introduction'}]
},'each sibling can be consulted in a different consecutive year');

for(const [account,amount,choice,kind] of [
 ['personal',150000,0,'study-funds'],
 ['shared',80000,3,'move-funds']
]){
 setup(ctx,{id:'gift-'+kind,seed:195620+choice,region:'ヴィクトリア',age:46});
 ctx.GIFT_ACCOUNT=account;ctx.GIFT_CHOICE=choice;
 const outcome=inspect(`
   S.year=1110;S.age=46;S.priceIndex=1.72;S.cash=60000000;S.debt=0;
   S.residenceArrangement=GIFT_ACCOUNT==='shared'?'family_home_shared_budget':'independent_rental';
   S.fl.household_separated=GIFT_ACCOUNT==='shared'?0:1;
   S.house.cash=60000000;S.house.debt=0;
   S.kids=[{id:'recipient',nm:'子',by:1090,householdStatus:'supported'},
     {id:'unrelated',nm:'別の子',by:1093,householdStatus:'supported'}];
   S.eventRelativeId='recipient';
   const e=EV.find(x=>x.id==='family_child_future'),c=e.c[GIFT_CHOICE],
     cost=GIFT_CHOICE===0?150000:80000;
   const enabled=simulationChoiceStates(e,S,tags(S))[GIFT_CHOICE].enabled;
   const before=moveFunds(S),other=S.kids[1].futurePlanSupportHistory?.length||0,
     personalBefore=S.cash,houseBefore=S.house.cash;
   ap(c.o[0][2]);
   const child=S.kids[0],receipt=child.futurePlanSupportHistory.at(-1);
   return {enabled,cost,spent:before-moveFunds(S),
     receipt:receipt.amount,kind:receipt.kind,
     otherHistory:S.kids[1].futurePlanSupportHistory?.length||0,
     personalDelta:S.cash-personalBefore,houseDelta:S.house.cash-houseBefore,
     regionPm:S.res.pm,price:S.priceIndex};
 `);
 assert.equal(outcome.enabled,true,kind+' enabled');
 assert.equal(outcome.regionPm*outcome.price!==1,true,'nontrivial regional price multiplier');
 assert.equal(outcome.spent,amount,kind+' nominal gift is exact');
 assert.equal(outcome.receipt,amount,kind+' child receipt equals payer debit');
 assert.equal(outcome.kind,kind);
 assert.equal(outcome.otherHistory,0,'unselected sibling receives no transfer');
 assert.equal(account==='shared'?outcome.personalDelta:outcome.houseDelta,0,'unrelated wallet untouched');
 assert.equal(account==='shared'?outcome.houseDelta:outcome.personalDelta,-amount,'payer wallet charged exactly once');
}

setup(ctx,{id:'adult-child-memory-state',seed:195631,region:'クルビア',age:67});
const memories=inspect(`
 S.year=1111;S.age=67;
 S.kids=[{id:'only',nm:'成人した子',by:1073,householdStatus:'independent',contactState:'ended'}];
 S.eventRelativeId='only';
 const memory=EV.find(x=>x.id==='adult_child_memory');
 const wishes=EV.find(x=>x.id==='life_personal_wishes');
 const disconnected=memory.t(S),verbalDisconnected=!!wishes.c[1].show(S);
 S.kids[0].contactState='paused';
 const paused=memory.t(S),verbalPaused=!!wishes.c[1].show(S);
 S.kids[0].contactState='regular';
 const reconnected=memory.t(S),verbalConnected=!!wishes.c[1].show(S);
 S.kids[0].contactState=null;S.kids[0].householdStatus='supported';
 S.kids[0].householdResidencePlan='former';
 const formerHome=memory.t(S),verbalFormerHome=!!wishes.c[1].show(S);
 S.kids[0].householdResidencePlan='self';
 const ownHome=memory.t(S),verbalOwnHome=!!wishes.c[1].show(S);
 return {disconnected,verbalDisconnected,paused,verbalPaused,reconnected,
   verbalConnected,formerHome,verbalFormerHome,ownHome,verbalOwnHome};
`);
assert(memories.disconnected.includes('小さな持ち物'));
assert(memories.paused.includes('小さな持ち物'));
assert(memories.reconnected.includes('思い出話'));
assert(memories.formerHome.includes('小さな持ち物'));
assert(memories.ownHome.includes('思い出話'));
assert.deepEqual([memories.verbalDisconnected,memories.verbalPaused,memories.verbalConnected,
 memories.verbalFormerHome,memories.verbalOwnHome],[false,false,true,false,true]);

setup(ctx,{id:'child-bereavement-individual',seed:195641,region:'ウルサス',age:48});
const bereavement=inspect(`
 S.year=1110;S.age=48;
 S.kids=[{id:'child-a',nm:'第一子',by:1080,householdStatus:'independent',
   exposurePending:1,exposureReviewYear:1111,remittanceAnnual:10000,
   contactState:'regular',returnOfferYear:1109,returnRequestYear:1109},
   {id:'child-b',nm:'第二子',by:1082,householdStatus:'independent',
   remittanceAnnual:12000,contactState:'regular'}];
 const e=EV.find(x=>x.id==='family_child_bereavement');
 const initialEligible=elig(e,S,tags(S));
 S.eventRelativeId='child-a';S.eventRelativeDelayYears=2;
 ap(e.c[0].o[0][2]);
 const first=S.kids[0],second=S.kids[1],afterDeath=elig(e,S,tags(S));
 return {initialEligible,deathYear:first.d,knownYear:first.deathKnownYear,
   remittance:first.remittanceAnnual,exposurePending:first.exposurePending,
   request:first.returnRequestYear,offer:first.returnOfferYear,contact:first.contactState,
   secondDead:!!second.d,secondRemittance:second.remittanceAnnual,
   secondContact:second.contactState,afterDeath};
`);
assert.deepEqual(bereavement,{initialEligible:true,deathYear:1108,knownYear:1110,
 remittance:0,exposurePending:0,request:null,offer:null,contact:null,
 secondDead:false,secondRemittance:12000,secondContact:'regular',afterDeath:true});
console.log('PASS child-specific future planning, exact nominal gifts, separated memories and bereavement records');
