'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context, setup} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname,'..'));
const read = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx));
const close = (a,b,why) => assert(Math.abs(a-b) < Math.max(0.001,Math.abs(b)*1e-10),why + ': actual='+a+' expected='+b);

setup(ctx,{id:'adult-child-identity-and-aid',seed:195350,region:'ヴィクトリア',age:42});
const money=read(`
  S.year=1110;S.age=42;S.priceIndex=1.38;S.cash=30000000;S.debt=0;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.kids=[
    {id:'child-a',nm:'第一子',by:1081,householdStatus:'independent',
     region:S.res.n,knownRegion:S.res.n,jobId:4,contactState:'regular',
     budgetHistory:[{year:1110,net:-80000,support:0}]},
    {id:'child-b',nm:'第二子',by:1084,householdStatus:'independent',
     region:S.res.n,knownRegion:S.res.n,jobId:4,contactState:'regular',
     budgetHistory:[{year:1110,net:8000,support:0}]}
  ];
  const event=EV.find(x=>x.id==='adult_child_contact');
  const IDs=Array.from({length:25},()=>childForEvent(S,event.id)?.id);
  const chosen=childForEvent(S,event.id);
  S.eventRelativeId=chosen.id;
  const selected=simulationChoiceStates(event,S,tags(S));
  const aidChoice=event.c[3],amount=adultChildEmergencyAidCost(S);
  const before=S.cash,otherBefore=S.kids[1].budgetHistory[0].net;
  ap(aidChoice.o[0][2]);
  const receiver=S.kids[0];
  const transfer=receiver.aidTransfers?.at(-1);
  receiver.householdStatus='supported';
  const staleIndependentBudgetAccepted=adultChildEmergencyAidAffordable(S,receiver);
  receiver.householdStatus='independent';
  S.year=1111;S.age=43;
  const nextYear=childForEvent(S,event.id)?.id;
  return {ids:IDs,chosen:chosen.id,nextYear,enabled:selected[3].enabled,shown:selected[3].shown,
    cost:amount,paid:before-S.cash,received:transfer?.amount,
    receiptNet:receiver.budgetHistory[0].net,otherNet:S.kids[1].budgetHistory[0].net,
    otherBefore,staleIndependentBudgetAccepted,transferCount:receiver.aidTransfers?.length};
`);
assert.equal(money.ids.length,25);
assert(money.ids.every(id=>id==='child-a'),'all render and eligibility calls must select the same child');
assert.equal(money.chosen,'child-a');
assert.equal(money.nextYear,'child-b','different years can fairly reach another adult child');
assert.equal(money.shown,true);
assert.equal(money.enabled,true);
close(money.paid,money.cost,'payer debit equals published scaled aid');
close(money.received,money.cost,'independent child receives full amount');
close(money.receiptNet,-80000+money.cost,'recipient budget credits the aid');
assert.equal(money.otherNet,money.otherBefore,'unrelated child budget untouched');
assert.equal(money.staleIndependentBudgetAccepted,false,'co-resident adult child cannot reuse a stale independent household deficit');
assert.equal(money.transferCount,1,'one transfer recorded for selected adult child');

setup(ctx,{id:'adult-child-prepared-room',seed:195351,region:'ヴィクトリア',age:43});
const room=read(`
  S.year=1110;S.age=43;S.priceIndex=1.46;S.cash=30000000;S.debt=0;
  S.residenceArrangement='independent_rental';S.fl.household_separated=1;
  S.kids=[{id:'child-a',nm:'第一子',by:1080,householdStatus:'independent',
    region:S.res.n,knownRegion:S.res.n,contactState:'regular',
    returnRequestYear:1110,contactReviewYear:1110}];
  S.eventRelativeId='child-a';
  const event=EV.find(x=>x.id==='adult_child_contact');
  const setup=adultChildReturnRoomSetupCost(S),before=S.cash;
  const affordable=adultChildReturnRoomSetupAffordable(S,S.kids[0]);
  ap(event.c[4].o[0][2]);
  const paid=before-S.cash,firstYear=S.kids[0].returnRoomSetupYear;
  S.cash=100;S.debt=0;
  const alreadyPrepared=adultChildReturnRoomSetupAffordable(S,S.kids[0]);
  ap(event.c[5].o[0][2]);
  const afterReminder=S.cash;
  const afterReminderYear=S.kids[0].returnRoomSetupYear;
  S.eventRelativeId='child-a';
  const returnReady=adultChildReturnRoomSetupAffordable(S,S.kids[0]);
  ap(event.c[6].o[0][2]);
  const back=S.kids[0];
  return {setup,paid,affordable,alreadyPrepared,afterReminder,
    firstYear,afterReminderYear,returnReady,status:back.householdStatus,
    returnedHomeYear:back.returnedHomeYear,endingCash:S.cash,
    pending:back.returnRequestYear,remittanceAnnual:back.remittanceAnnual||0};
`);
assert.equal(room.affordable,true);
close(room.paid,room.setup,'room setup charged once');
assert.equal(room.firstYear,1110);
assert.equal(room.afterReminderYear,1110);
assert.equal(room.alreadyPrepared,true);
assert.equal(room.returnReady,true);
assert.equal(room.afterReminder,100);
assert.equal(room.endingCash,100,'prepared room must not be charged again when adult child actually returns');
assert.equal(room.status,'supported');
assert.equal(room.returnedHomeYear,1110);
assert.equal(room.pending,null);
assert.equal(room.remittanceAnnual,0);

setup(ctx,{id:'adult-child-shared-wallet-aid',seed:195352,region:'レム・ビリトン',age:42});
const shared=read(`
  S.year=1110;S.age=42;S.priceIndex=1.3;
  S.residenceArrangement='family_home_shared_budget';S.fl.household_separated=0;
  S.cash=10;S.house.cash=30000000;S.house.debt=0;
  S.kids=[{id:'child-a',nm:'離れた子',by:1080,householdStatus:'independent',
    region:S.res.n,knownRegion:S.res.n,contactState:'regular',
    budgetHistory:[{year:1110,net:-50000,support:0}]}];
  S.eventRelativeId='child-a';
  const c=EV.find(x=>x.id==='adult_child_contact').c[3];
  const before=S.house.cash,own=S.cash,cost=adultChildEmergencyAidCost(S);
  ap(c.o[0][2]);
  return {cost,spent:before-S.house.cash,personalChanged:S.cash-own,
    received:S.kids[0].aidTransfers.at(-1).amount};
`);
close(shared.spent,shared.cost,'shared family wallet pays the quoted aid');
close(shared.received,shared.cost,'recipient gets identical amount in shared budget case');
assert.equal(shared.personalChanged,0,'shared budget payment must not drain the personal wallet');
console.log('PASS: adult-child stable identity, scaled aid, joint payer and prepared-room reuse');