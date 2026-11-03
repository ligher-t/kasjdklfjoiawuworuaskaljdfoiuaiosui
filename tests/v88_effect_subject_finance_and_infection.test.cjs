'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const result=JSON.parse(vm.runInContext("JSON.stringify((()=>{born({seed:711051,by:1066,region:'クルビア'});\nS.year=1099;S.age=33;S.job=5;S.residenceArrangement='independent_rental';S.fl.household_separated=1;\nfor(const key of S.care?.parentKeys || ['fa','mo']) if(S.par?.[key])S.par[key].d=0;\nbeginSeparatedParentLedger(S);\nS.house.cash=900000;S.house.debt=0;S.cash=15000000;S.inc=2000000;\nconst event=EV.find(e=>e.id==='family_allowance_support');\nconst choice=event.c[2],beforeHouse=S.house.cash,beforePersonal=S.cash;\nconst choices=simulationChoiceStates(event,S,tags(S));\nconst accessible=choices[2].shown&&choices[2].enabled;\nconst previous=TRACE_RESOLUTION;\nTRACE_RESOLUTION={kind:'choice',id:event.id,label:choice.l};\ntry{ap(choice.o[0][2])}finally{TRACE_RESOLUTION=previous}\nconst transfer=S.house.parentLedger.parentGiftHistory.at(-1);\nconst send={accessible,amount:transfer?.amount||0,spent:beforePersonal-S.cash,\n credited:S.house.cash-beforeHouse,ledgerStatus:S.house.parentLedger.status,\n history:transfer?.source,kind:S.moneyLog.at(-1)?.kind};\nS.cash=5;\nconst insufficient=simulationChoiceStates(event,S,tags(S))[2].enabled,beforeLow=S.house.cash;\nlet thrown=false;try{ap({parentHouseholdGift:150000})}catch(err){thrown=String(err).includes('用意できません')}\nconst noPartial={insufficient,thrown,noCredit:S.house.cash===beforeLow};\nborn({seed:711052,by:1066,region:'ウルサス'});\nS.year=1099;S.age=33;S.job=0;S.inf=0;S.fl.dg=0;\nconst guardEntry=EV.find(e=>e.id==='car_urs_guard_entry');\nap(guardEntry.c[0].o[0][2]);\nconst riot=EV.find(e=>e.id==='car_urs_guard_choice_riot');\nconst riotResult=riot.c[0].o[1],beforeHealth=S.h;\nTRACE_RESOLUTION={kind:'choice',id:riot.id,label:riot.c[0].l};\ntry{ap(riotResult[2])}finally{TRACE_RESOLUTION=previous}\nconst wound={inf:S.inf,diagnosed:S.fl.dg,route:S.infectionOnset?.route,\n cause:S.infection?.cause,year:S.infection?.diagnosedYear,healthLoss:beforeHealth-S.h};\nborn({seed:711053,by:1066,region:'ウルサス'});\nS.year=1099;S.age=33;S.inf=0;S.fl.dg=0;S.job=0;\nap(guardEntry.c[0].o[0][2]);\nap(riot.c[1].o[0][2]);\nconst withdrawal={inf:S.inf,diagnosed:S.fl.dg};\nreturn {send,noPartial,wound,withdrawal};})())",ctx));
assert.equal(result.send.accessible,true,'remittance choice is accessible when tracked parents and funds are present');
assert(result.send.amount>0);
assert.equal(result.send.spent,result.send.amount,'one debit from personal funds');
assert.equal(result.send.credited,result.send.amount,'one credit to parent household');
assert.equal(result.send.ledgerStatus,'tracked');
assert.equal(result.send.history,'主人公');
assert.equal(result.send.kind,'親世帯への送金');
assert.deepEqual(result.noPartial,{insufficient:false,thrown:true,noCredit:true},
 'insufficient funds block the choice and never create a partial remittance');
assert.equal(result.wound.inf,1);
assert.equal(result.wound.diagnosed,1);
assert.equal(result.wound.route,'wound');
assert(result.wound.cause.includes('源石の破片'));
assert.equal(result.wound.year,1099);
assert(result.wound.healthLoss>0);
assert.deepEqual(result.withdrawal,{inf:0,diagnosed:0},
 'a non-exposed retreat cannot generate an Oripathy diagnosis');
console.log('PASS recipient ledger, single debit, insufficient funds, protagonist infection, and control branch');
