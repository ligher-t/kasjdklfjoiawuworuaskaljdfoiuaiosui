'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { loadData } = require('../tools/data-values.cjs');

const { data } = loadData(path.resolve(__dirname, '..'));
const event = id => data.EV.find(row => row.id === id);
const textOf = value => {
  if (Array.isArray(value)) return value.map(textOf).join('\n');
  if (value && typeof value === 'object') return textOf(value.t);
  return typeof value === 'string' ? value : '';
};

const classroomBias = event('bias_peer_mockery');
assert(classroomBias, 'classroom bullying event remains in the data');
assert.deepEqual(Array.from(classroomBias.st), ['児童', '少年']);
assert(classroomBias.need?.includes('就学中'), 'classroom bullying requires school enrollment');
const teacher = event('people_school_life_conversation');
assert(teacher && typeof teacher.t === 'function', 'former-teacher contact distinguishes school from later encounters');

const fever = event('fever');
assert.equal(fever.who, 'parent');
assert(!textOf(fever.t).includes('仕事'), 'the childhood fever scene stays within the caregiver context');
assert(!JSON.stringify(fever).includes('朝から元気のなかった子'));

const school = event('sch');
assert(school.st.includes('児童'));
const householdHelp = school.c.find(choice => choice.l === '家の手伝いをする');
const householdHelpResult = textOf(householdHelp.o);
assert(householdHelpResult.includes('水汲みや片付け'), 'the child performs household tasks');
assert.equal(householdHelp.o[0][2].educationAction,'decline-primary','helping at home postpones enrollment');
assert(!householdHelpResult.includes('あなたは働きに出た'), 'the child is not described as taking adult employment');

const urgentReview = event('life_medical_urgent_review');
assert(urgentReview.st.includes('幼児'));
assert(!JSON.stringify(urgentReview).includes('仕事'), 'the all-ages medical scene does not assign work to a young child');

const siblingBirth = event('family_sibling_birth');
assert(textOf(siblingBirth.t).includes('赤ん坊が生まれる'));
assert(!textOf(siblingBirth.t).includes('赤ん坊が来る'));

const originFragment = event('ori_school_fragment');
assert(!textOf(originFragment.t).includes('燃料'));
assert(!textOf(originFragment.t).includes('本物の源石'));

const everydayContactMyth = event('ori_everyday_contact_myth');
assert(textOf(everydayContactMyth.t).length > 0, 'the uncertainty event still has contextual text');
assert(!textOf(everydayContactMyth.t).includes('噂の出どころを知る人はいなかった'));

const cultivation = event('life_bolivar_upland_crops');
assert(!textOf(cultivation.t).includes('架空の経路'));
assert(textOf(cultivation.t).length > 0, 'the upland agriculture event retains its lived context');

console.log('PASS age, point-of-view, known-person and non-meta text conditions');

const vm=require('node:vm'),{context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));setup(ctx,{id:'child-work-and-medical-prose',seed:908121,region:'ヴィクトリア',age:6});
const facts=vm.runInContext(`(()=>{
 const e=EV.find(e=>e.id==='sch'),effect=e.c.find(c=>c.l==='家の手伝いをする').o[0][2],
   job=S.job,cash=S.house.cash;
 ap(effect);
 const childStaysChild=S.job===job && S.house.cash===cash && !S.fl.sch;
 S.age=32;S.year=S.by+32;S.inf=1;S.fl.dg=1;S.infection={basis:'annual-risk-estimate',suspectedSetting:'年次モデルの推計',diagnosedYear:S.year};
 const health=lifeSummaryFacts(S).health,empty=mortalityStatusMarkup(S);
 return {childStaysChild,health,empty,schoolReason:educationBarrier(S,'primary').reason};
})()`,ctx);
assert(facts.childStaysChild,'household help neither assigns a job nor manufactures income');
assert.doesNotMatch(facts.health,/年次モデル|ゲーム上|推計/);assert.match(facts.health,/経路は未記録/);
assert.doesNotMatch(facts.empty,/起こらないという意味/);
assert.doesNotMatch(facts.schoolReason||'',/ゲームモデル/);
console.log('PASS actual childhood deferral, unchanged employment/cash and concise clinical records');
