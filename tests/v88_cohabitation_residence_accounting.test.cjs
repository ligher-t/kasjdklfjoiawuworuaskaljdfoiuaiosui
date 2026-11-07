'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const snapshot=body=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+body+'})())',ctx));
const regular=snapshot(`
  born({seed:150201,by:1069,region:'龍門'});S.year=1100;S.age=31;
  S.cash=1500000;S.house.cash=800000;S.house.debt=0;
  S.residenceArrangement='family_home_shared_budget';S.fl.household_separated=0;
  const begin={cash:S.cash,house:S.house.cash,region:S.res.n,
    city:S.local?.city||null,moves:S.moves?.length||0};
  ap({romanceStart:1});
  const partnerId=S.romance?.id,partnerName=S.romance?.name;
  ap({romanceStage:'cohabiting'});
  const cohab={
    arrangement:S.residenceArrangement,members:currentHouseholdMembers(S),
    label:fam(S),
    partnerId,partnerName,
    householdSeparated:S.fl.household_separated,
    ledgerStatus:S.house.parentLedger?.status,
    cash:S.cash,house:S.house.cash,shared:inSharedHousehold(S),
    region:S.res.n,city:S.local?.city||null,moves:S.moves?.length||0,
    lastResidence:S.residenceHistory?.at(-1)
  };
  ap({romanceEnd:1,fl:{romance_ended:1}});
  const ended={
    arrangement:S.residenceArrangement,members:currentHouseholdMembers(S),
    label:fam(S),
    romance:S.romance,cash:S.cash,house:S.house.cash,
    region:S.res.n,city:S.local?.city||null,moves:S.moves?.length||0,
    lastResidence:S.residenceHistory?.at(-1),
    history:S.relationshipHistory.at(-1)?.id,
    shared:inSharedHousehold(S)
  };
  ap({romanceStart:1});
  const newPartner={arrangement:S.residenceArrangement,
    formerNameInHouse:currentHouseholdMembers(S).includes(partnerName),
    partnerId:S.romance.id};
  return {begin,cohab,ended,newPartner};
`);
assert.equal(regular.cohab.arrangement,'partner_shared');
assert(regular.cohab.label.includes('婚姻前の恋人と同居'));
assert(regular.cohab.members.includes(regular.cohab.partnerName));
assert.equal(regular.cohab.householdSeparated,1);
assert.equal(regular.cohab.ledgerStatus,'tracked');
assert.equal(regular.cohab.shared,false,'parent family budget is separate from adult personal cash');
assert.deepEqual([regular.cohab.cash,regular.cohab.house],[regular.begin.cash,regular.begin.house],
  'starting cohabitation creates no hidden transfer');
assert.equal(regular.ended.arrangement,'post_cohabitation_housing_unconfirmed');
assert(regular.ended.label.includes('転居の記録なし'));
assert(!regular.ended.members.includes(regular.cohab.partnerName));
assert.equal(regular.ended.romance,null);
assert.equal(regular.ended.history,regular.cohab.partnerId);
assert.equal(regular.ended.lastResidence.moveRecorded,false);
assert.equal(regular.ended.shared,false);
assert.deepEqual([regular.ended.cash,regular.ended.house],[regular.begin.cash,regular.begin.house],
  'breaking up never reallocates personal or parent money');
for(const stage of [regular.cohab,regular.ended]){
 assert.equal(stage.region,regular.begin.region);
 assert.equal(stage.city,regular.begin.city);
 assert.equal(stage.moves,regular.begin.moves,'no fake geographical relocation');
}
assert.equal(regular.newPartner.arrangement,'post_cohabitation_housing_unconfirmed');
assert.equal(regular.newPartner.formerNameInHouse,false);
assert.notEqual(regular.newPartner.partnerId,regular.cohab.partnerId);

const marriage=snapshot(`
  born({seed:150202,by:1069,region:'龍門'});S.year=1100;S.age=31;
  S.cash=400000;S.house.cash=600000;S.fl.household_separated=0;
  ap({romanceStart:1});ap({romanceStage:'cohabiting'});
  const partnerId=S.romance.id;
  ap({sp:1});
  const married={arrangement:S.residenceArrangement,spouseId:S.sp?.id,
    shares:S.sp?.sharesHousehold,members:currentHouseholdMembers(S)};
  S.fl.marriage_strained=1;
  ap({divorce:1});
  return {partnerId,married,divorced:{
    arrangement:S.residenceArrangement,spouse:S.sp,
    label:fam(S),
    strained:S.fl.marriage_strained,members:currentHouseholdMembers(S),
    moves:S.moves?.length||0
  }};
`);
assert.equal(marriage.married.arrangement,'spouse_shared');
assert.equal(marriage.married.spouseId,marriage.partnerId);
assert.equal(marriage.married.shares,true);
assert.equal(marriage.divorced.spouse,null);
assert.equal(marriage.divorced.arrangement,'post_cohabitation_housing_unconfirmed');
assert.equal(marriage.divorced.strained,0);
assert.equal(marriage.divorced.moves,0);
assert(!marriage.divorced.label.includes('配偶者と同居'));

const expired=snapshot(`
  born({seed:150203,by:1069,region:'龍門'});S.year=1100;S.age=70;
  ap({romanceStart:1});ap({romanceStage:'cohabiting'});
  S.romance.metYear=1088;S.romance.stageSinceYear=1090;
  const before=S.residenceArrangement;
  advanceRomanceLife(S);
  return {before,after:S.residenceArrangement,partner:S.romance,
    flags:S.fl.romance_cohabiting,history:S.relationshipHistory.at(-1)?.ending};
`);
assert.deepEqual(expired,{
 before:'partner_shared',after:'post_cohabitation_housing_unconfirmed',
 partner:null,flags:0,history:'別離'
},'natural relationship expiry also ends the shared-room label');
const bereavement=snapshot(`
  born({seed:150204,by:1069,region:'龍門'});S.year=1100;S.age=31;
  ap({romanceStart:1});ap({romanceStage:'cohabiting'});ap({sp:1});
  const id=S.sp.id;
  S.sp.d=S.year;S.sp.deathYear=S.year;
  S.sp.deathNoticePending=true;S.sp.deathNoticeAvailableYear=S.year;
  S.eventRelativeId=id;
  ap({spouseDeath:1});
  return {spouse:S.sp,arrangement:S.residenceArrangement,
    end:S.relationshipHistory.at(-1)?.ending,relativeId:S.relationshipHistory.at(-1)?.id,
    moves:S.moves?.length||0};
`);
assert.equal(bereavement.spouse,null);
assert.equal(bereavement.arrangement,'post_cohabitation_housing_unconfirmed');
assert.equal(bereavement.end,'死別');
assert.equal(bereavement.moves,0,'bereavement does not invent a change of address');
const datingAgain=snapshot(`
  born({seed:150205,by:1069,region:'龍門'});S.year=1100;S.age=31;
  ap({romanceStart:1});ap({romanceStage:'cohabiting'});
  ap({romanceStage:'dating'});
  return {arrangement:S.residenceArrangement,
    partnerStillKnown:!!S.romance,
    members:currentHouseholdMembers(S),moves:S.moves?.length||0};
`);
assert.equal(datingAgain.arrangement,'post_cohabitation_housing_unconfirmed');
assert.equal(datingAgain.partnerStillKnown,true);
assert.equal(datingAgain.moves,0,'downgrading from cohabitation does not fabricate a move');
assert(!datingAgain.members.includes('同居する恋人'));
console.log('PASS unmarried partner housing, separate parent cash, breakup, marriage, divorce annual expiry, bereavement and a later non-cohabiting relationship');
