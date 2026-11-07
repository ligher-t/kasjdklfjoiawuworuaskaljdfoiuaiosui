'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
const ids=[
 'family_daily_spouse_cooking','family_daily_spouse_worn_clothes',
 'family_daily_spouse_errand_together','family_daily_spouse_health_care',
 'family_daily_spouse_holiday_stroll','family_daily_spouse_shared_quiet',
 'family_daily_spouse_mutual_gift'
];
ctx.COHABIT_EVENTS=ids;
setup(ctx,{id:'spouse-separation-and-reunion-dailies',seed:196101,region:'龍門',age:41});
const life=read(`
 S.year=1110;S.age=41;S.residenceArrangement='spouse_shared';
 S.sp={id:'spouse-a',nm:'配偶者A',by:1081,marriedYear:1100,
   sharesHousehold:true,residenceRegion:S.res.n,
   residenceBaseId:S.residenceBase?.id,inf:0};
 const events=COHABIT_EVENTS.map(id=>EV.find(e=>e.id===id));
 const status=()=>events.map(event=>({
   id:event?.id||null,eligible:event?elig(event,S,tags(S)):null
 }));
 const current=status(),home=currentHouseholdMembers(S);
 S.sp.sharesHousehold=false;
 const separateSameCity=status(),separateRoster=currentHouseholdMembers(S);
 S.sp.sharesHousehold=true;S.sp.residenceRegion='ウルサス';
 const moved=status(),movedRoster=currentHouseholdMembers(S);
 S.sp.residenceRegion=S.res.n;S.sp.sharesHousehold=true;
 const reunited=status(),reunitedRoster=currentHouseholdMembers(S);
 S.sp.d=1111;
 const dead=status(),deadRoster=currentHouseholdMembers(S);
 S.sp.d=0;S.eventRelativeId=S.sp.id;
 ap({divorce:1});
 const divorced=status(),divorceRoster=currentHouseholdMembers(S),formerId=S.relationshipHistory.at(-1).id;
 S.year=1112;S.age=43;
 ap({sp:1});
 const newSpouseId=S.sp.id;
 S.sp.residenceBaseId=S.residenceBase?.id;
 const remarried=status(),remarriageRoster=currentHouseholdMembers(S);
 return {current,home,separateSameCity,separateRoster,moved,movedRoster,reunited,reunitedRoster,
   dead,deadRoster,divorced,divorceRoster,formerId,newSpouseId,remarried,remarriageRoster};
`);
assert.deepEqual(life.current.map(x=>x.id),ids,'all seven family spouse dailies are registered');
for(const [name,expected] of [['current',true],['separateSameCity',false],['moved',false],
 ['reunited',true],['dead',false],['divorced',false],['remarried',true]])
 assert(life[name].every(x=>x.eligible===expected),name+' must match current spouse residency');
assert(life.home.includes('配偶者A')&&life.reunitedRoster.includes('配偶者A'));
for(const key of ['separateRoster','movedRoster','deadRoster','divorceRoster','remarriageRoster'])
 assert(!life[key].includes('配偶者A'),key+' must omit the former or absent spouse');
assert.notEqual(life.formerId,life.newSpouseId,'divorced and remarried spouses have distinct IDs');

setup(ctx,{id:'family-household-roster-after-divorce',seed:196102,region:'ヴィクトリア',age:43});
const kin=read(`
 S.year=1110;S.age=43;S.residenceArrangement='independent_rental';
 S.fl.household_separated=1;S.sp=null;
 S.relationshipHistory=[{id:'former-one',ending:'離婚',endedYear:1108,lifeStatus:'alive'}];
 S.kids=[
   {id:'self-child',nm:'同居の子',by:1100,householdStatus:'supported',
     householdResidencePlan:'self',otherParentId:'former-one'},
   {id:'shared-child',nm:'共同で暮らす子',by:1102,householdStatus:'supported',
     householdResidencePlan:'shared',otherParentId:'former-one'},
   {id:'former-child',nm:'別世帯の子',by:1103,householdStatus:'supported',
     householdResidencePlan:'former',otherParentId:'former-one'},
   {id:'supported-former-child',nm:'扶養を送る子',by:1104,householdStatus:'supported',
     householdResidencePlan:'former_support',otherParentId:'former-one'},
   {id:'unresolved-child',nm:'居所未確定の子',by:1105,householdStatus:'supported',
     householdResidencePlan:'unresolved',otherParentId:'former-one'},
   {id:'unrecorded-child',nm:'生活先未記録の子',by:1106,householdStatus:'supported',
     otherParentId:'former-one'},
   {id:'independent-child',nm:'独立した子',by:1085,householdStatus:'independent'},
   {id:'dead-child',nm:'亡くなった子',by:1107,d:1109,householdStatus:'supported'},
   {id:'other-child',nm:'別の養育者がいない子',by:1107,householdStatus:'supported'}
 ];
 const before=currentHouseholdMembers(S);
 const every=[...S.kids.map(x=>[x.nm,childIsSupported(S,x)])];
 S.kids[3].householdResidencePlan='self';
 const afterResidenceDecision=currentHouseholdMembers(S);
 return {before,afterResidenceDecision,every};
`);
for(const name of ['同居の子','共同で暮らす子','別の養育者がいない子'])
 assert(kin.before.includes(name),'current resident is listed: '+name);
for(const name of ['別世帯の子','扶養を送る子','居所未確定の子','生活先未記録の子','独立した子','亡くなった子'])
 assert(!kin.before.includes(name),'absent family member is not listed: '+name);
assert(kin.afterResidenceDecision.includes('扶養を送る子'),
 'a later self-household residence decision updates the roster');

setup(ctx,{id:'spouse-parent-home-after-separation',seed:196103,region:'龍門',age:42});
const parents=read(`
 S.year=1110;S.age=42;S.residenceArrangement='spouse_parent_home';
 S.sp={id:'spouse',nm:'妻',by:1080,sharesHousehold:true,
   residenceRegion:S.res.n,residenceBaseId:S.residenceBase?.id};
 const living=currentHouseholdMembers(S);
 S.sp.sharesHousehold=false;
 const separated=currentHouseholdMembers(S);
 return {living,separated};
`);
assert(parents.living.includes('配偶者の親族'));
assert(parents.living.includes('妻'));
assert(!parents.separated.includes('配偶者の親族'));
assert(!parents.separated.includes('妻'));
console.log('PASS: seven spouse dailies, co-residence, divorce/remarriage and household member list');
