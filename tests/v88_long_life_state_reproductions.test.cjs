'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const inspect = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())', ctx, {timeout:30000}));

const goals = inspect(`
 const event=EV.find(e=>e.id==='life_reunion_reorg_review');
 const output=[];
 for(let i=0;i<event.c.length;i++) {
   born({seed:1430292801+i,by:1063,region:'ウルサス'});
   S.year=1098;S.age=35;
   ap({lifeAffiliation:{id:'reunion-reorg',title:'再編後レユニオンに連なる互助連絡網',
     kind:'local-relief-network',action:'join',role:'臨時連絡先'}});
   const before=S.lifeRecord.goals.find(g=>g.id==='reunion-relief')||null;
   ap(event.c[i].o[0][2]);
   const goal=S.lifeRecord.goals.find(g=>g.id==='reunion-relief');
   output.push({before,goal:{title:goal?.title,status:goal?.status,
     action:goal?.history.at(-1)?.action},audit:auditLifeState(S)});
 }
 return output;
`);
assert.equal(goals.length,3);
for(const [i,row] of goals.entries()) {
 assert.equal(row.before,null);
 assert.equal(row.goal.title,'身近な感染者へ薬と食料を届ける');
 assert.equal(row.goal.action,['continue','compromise','abandon'][i]);
 assert.equal(row.goal.status,['active','compromised','abandoned'][i]);
 assert.deepEqual(row.audit,[]);
}
const housing=inspect(`
 born({seed:2391045535,by:1069,region:'龍門'});
 S.year=1100;S.age=31;
 ap({romanceStart:1});ap({romanceStage:'cohabiting'});
 const partner={code:S.residenceArrangement,errors:auditLifeState(S)};
 ap({sp:1});
 const event=EV.find(e=>e.id==='family_spouse_oripathy_disclosure');
 ap(event.c[2].o[0][2]);
 return {partner,sp:S.sp,code:S.residenceArrangement,
   history:S.residenceHistory.at(-1),errors:auditLifeState(S),
   moves:S.moves.length};
`);
assert.equal(housing.partner.code,'partner_shared');
assert.deepEqual(housing.partner.errors,[]);
assert.equal(housing.sp,null);
assert.equal(housing.code,'post_cohabitation_housing_unconfirmed');
assert.equal(housing.history.moveRecorded,false);
assert.deepEqual(housing.errors,[]);
assert.equal(housing.moves,0);
console.log('PASS Reunion goal first-use and spouse disclosure separation residence audit');
