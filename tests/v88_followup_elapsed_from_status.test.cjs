'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inspect=source=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+source+'})())',ctx));

setup(ctx,{id:'kazdel-pause-age',seed:190710,region:'クルビア',age:35});
const kazdel=inspect(`
 S.year=1100;S.age=35;S.sn.life_kazdel_displaced_start=1100;
 const event=EV.find(e=>e.id==='life_kazdel_displaced_paused_review');
 ap({lifeGoal:{id:'kazdel-displaced-life',title:'避難先で暮らしの足場を整える',action:'start'}});
 S.year=1110;S.age=45;
 ap({lifeGoal:{id:'kazdel-displaced-life',action:'pause'}});
 const paused=S.lifeRecord.goals.find(x=>x.id==='kazdel-displaced-life');
 const immediately=elig(event,S,tags(S));
 S.year=1112;S.age=47;
 const tooEarly=elig(event,S,tags(S));
 S.year=1113;S.age=48;
 const due=elig(event,S,tags(S));
 ap({lifeGoal:{id:'kazdel-displaced-life',action:'continue'}});
 const resumed=elig(event,S,tags(S));
 S.year=1115;S.age=50;
 ap({lifeGoal:{id:'kazdel-displaced-life',action:'pause'}});
 const pausedAgain=elig(event,S,tags(S));
 S.year=1118;S.age=53;
 const dueAgain=elig(event,S,tags(S));
 return {pausedYear:paused.history.find(x=>x.action==='pause')?.year,
   immediately,tooEarly,due,resumed,pausedAgain,dueAgain};
`);
assert.equal(kazdel.pausedYear,1110);
assert.deepEqual([kazdel.immediately,kazdel.tooEarly,kazdel.due,kazdel.resumed,
  kazdel.pausedAgain,kazdel.dueAgain],[false,false,true,false,false,true],
  'the Kazdel pause review must age from the actual latest pause, not original displacement');

setup(ctx,{id:'leithania-exit-age',seed:190711,region:'リターニア',age:30});
const leith=inspect(`
 S.year=1080;S.age=30;S.sn.life_leithanian_civic_activity=1080;
 const event=EV.find(e=>e.id==='life_leithanian_civic_after_exit');
 ap({lifeAffiliation:{id:'leithanian-district-petition',
  title:'リターニアの地区要望書づくり',kind:'community',action:'join'}});
 S.year=1110;S.age=60;
 ap({lifeAffiliation:{id:'leithanian-district-petition',action:'leave'}});
 const record=S.lifeRecord.affiliations.find(x=>x.id==='leithanian-district-petition');
 const newlyLeft=elig(event,S,tags(S));
 S.year=1119;S.age=69;
 const nineYears=elig(event,S,tags(S));
 S.year=1120;S.age=70;
 const tenYears=elig(event,S,tags(S));
 ap({lifeAffiliation:{id:'leithanian-district-petition',action:'return'}});
 const rejoined=elig(event,S,tags(S));
 S.year=1122;S.age=72;
 ap({lifeAffiliation:{id:'leithanian-district-petition',action:'leave'}});
 const recentlyLeftAgain=elig(event,S,tags(S));
 S.year=1132;S.age=82;
 const secondTenYears=elig(event,S,tags(S));
 return {lastExitYear:record.lastChangedYear,newlyLeft,nineYears,tenYears,
  rejoined,recentlyLeftAgain,secondTenYears};
`);
assert.deepEqual([leith.newlyLeft,leith.nineYears,leith.tenYears,leith.rejoined,
  leith.recentlyLeftAgain,leith.secondTenYears],[false,false,true,false,false,true],
  'the Leithanian past-activism memory must age from departure, reset on a later departure');
assert.equal(leith.lastExitYear,1122);
console.log('PASS real paused/left status years govern long-delayed historical followups');
