'use strict';
// Small, deterministic UI projection checks. No engine simulation or DOM snapshot.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root,'js/ui/summary-view.js'),'utf8');
const ctx = vm.createContext({
  occupationLabel: s => s.jobLabel || '無職',
  eduLv: s => s.edu || 0,
  educationStandingLabel: s => s.fl?.sch ? '初等課程に在籍中（修了前）' : '初等教育の修了記録なし',
  EL: ['未就学', '初等', '中等'],
  MORBID_LABELS: { respiratory:'呼吸器の不調', oripathy:'鉱石病に伴う不調' }
});
vm.runInContext(source,ctx);
const base = {
  nm:'検査人物',age:7,h:25,p:30,jobLabel:'無職',g:{n:'ヴィクトリア'},
  res:{n:'ヴィクトリア'},local:{city:'工業区'},r:{n:'アダクリス'},fl:{},
  house:{cash:0,debt:70000,inc:100,exp:400},
  mortality:{episodes:[
    {kind:'respiratory',status:'active',severity:3},
    {kind:'oripathy',status:'active',severity:4}
  ]}
};
ctx.caseState = JSON.parse(JSON.stringify(base));
const before = JSON.stringify(ctx.caseState);
const summary = vm.runInContext('playerInformationSummary(caseState)',ctx);
assert.match(summary.cards[0].headline,/呼吸器の不調/);
assert.doesNotMatch(JSON.stringify(summary),/鉱石病/,'unknown diagnosis must not appear');
assert.equal(summary.cards[2].level,3,'critical caregiver household funds must be visible');
assert.match(summary.person.diagnosis,/診断記録なし/);
assert.doesNotMatch(summary.person.diagnosis,/非感染|感染していない/,'no diagnosis does not establish a negative diagnosis');
assert.equal(summary.alerts[0].id,'health','most consequential lived condition leads');
assert.equal(JSON.stringify(ctx.caseState),before,'display projection must not alter life state');
// A separate safety threat must not downgrade an already severe illness.
ctx.caseState.mortality.threat={status:'active'};
const concurrent=vm.runInContext('playerInformationSummary(caseState)',ctx);
assert.equal(concurrent.cards[0].level,3);
assert.equal(concurrent.cards[0].tone,'danger',
  'a concurrent threat preserves the visible severity of a serious illness');
delete ctx.caseState.mortality.threat;
ctx.caseState.fl.dg=1;
const diagnosed=vm.runInContext('playerInformationSummary(caseState)',ctx);
assert.match(JSON.stringify(diagnosed.knownStatuses),/鉱石病/);
assert.equal(diagnosed.person.diagnosis,'診断記録あり','a confirmed diagnosis appears in the player summary');
// Updating a visible value must not strand keyboard focus when the four
// summary destinations refresh. A simultaneous crisis remains plainly named.
{
  let active=null;
  const makeNode=(tag='DIV')=>{
    const n={tagName:tag.toUpperCase(),dataset:{},style:{},children:[],parentNode:null,
      textContent:'',className:'',hidden:false,attributes:{},
      append(...items){for(const item of items){item.parentNode=this;this.children.push(item);}},
      replaceChildren(...items){this.children=[];this.append(...items);},
      setAttribute(k,v){this.attributes[k]=String(v);},
      addEventListener(name,callback){(this.handlers||(this.handlers={}))[name]=callback;},
      contains(other){return this===other||this.children.some(child=>child.contains(other));},
      closest(selector){if(selector==='[data-summary]'&&this.dataset.summary)return this;
        return this.parentNode?.closest(selector)||null;},
      querySelector(selector){
        if(selector.startsWith('[data-summary="')){
          const category=selector.split('"')[1];
          const card=this.children.find(child=>child.dataset.summary===category);
          return card?.children.find(child=>child.className==='ui-open-ledger')||null;
        }
        return this.children.find(child=>child.className==='ui-open-ledger')||null;
      },
      focus(){active=this;}
    };
    return n;
  };
  const profile=makeNode(),facts=makeNode(),overview=makeNode();
  const doc={documentElement:{getAttribute:()=> 'standard'},
    get activeElement(){return active;},
    getElementById(id){return {'person-summary':profile,'situation-overview':overview,'person-summary-facts':facts}[id]||null;},
    createElement:makeNode};
  const env=vm.createContext({document:doc,
    occupationLabel:s=>s.jobLabel,eduLv:()=>0,EL:['未就学'],
    educationStandingLabel:s=>s.fl?.sch?'初等課程に在籍中（修了前）':'初等教育の修了記録なし',
    MORBID_LABELS:{respiratory:'呼吸器の不調'},openLifeLedger(){},refreshLifeLedgerContext(){}});
  vm.runInContext(source,env);
  const individual={age:8,nm:'検証者',jobLabel:'無職',h:48,fl:{},
    g:{n:'ウルサス'},res:{n:'ウルサス'},r:{n:'ヴァルポ'},
    house:{cash:0,debt:800,inc:50,exp:1000},
    mortality:{episodes:[{kind:'respiratory',status:'active',severity:3}]}};
  env.individual=individual;
  vm.runInContext('renderPlayerSummary(individual)',env);
  const identity=profile.children[1],basicFacts=facts.children[0];
  const cards=overview.children;
  assert.equal(cards.length,4);
  const link=cards[0].children.find(child=>child.className==='ui-open-ledger');
  link.focus();
  individual.h=40;
  vm.runInContext('renderPlayerSummary(individual)',env);
  assert.notEqual(active,link,'value change rebuilt the card');
  assert.equal(active.closest('[data-summary]').dataset.summary,'health',
    'the updated card restores the previously focused destination');
  assert.equal(overview.children.length,4,'all ledger destinations remain visible');
  assert.equal(profile.children[1],identity,'changing health does not rebuild stable identity');
  assert.equal(facts.children[0],basicFacts,'changing health does not replace basic facts');
  assert.equal(basicFacts.children.length,10,'all five basic fact pairs are rendered');
  individual.mortality.episodes=[];individual.h=71;
  vm.runInContext('renderPlayerSummary(individual)',env);
  assert(!overview.children[0].children.some(c=>c.className==='ui-summary-detail'),
    'generic vitality explanation is omitted only from the overview');
  individual.h=20;
  vm.runInContext('renderPlayerSummary(individual)',env);
  assert.match(overview.children[0].children.find(c=>c.className==='ui-summary-detail').textContent,/身体の負担/,
    'low vitality warning detail must not be suppressed with generic flavor');
  individual.h=71;individual.fl.dg=1;individual.fl.tx=1;
  vm.runInContext('renderPlayerSummary(individual)',env);
  assert.equal(overview.children[0].children.find(c=>c.className==='ui-summary-detail').textContent,'療養を継続中',
    'diagnosis and treatment detail remain visible');


}

console.log('PASS summary projection, diagnosis boundary and focused overview updates');
