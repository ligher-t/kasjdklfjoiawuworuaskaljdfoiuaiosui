'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/ui/life-summary.js'),'utf8');
const events=[
 {id:'entry',conf:'S',references:['game']},
 {id:'followup',conf:'B',references:['game','story'],after:{id:'entry',min:1}},
 {id:'unrelated',conf:'?',references:[]}
];
const references={game:{title:'個別人生モデル',kind:'ゲーム上の仮定'},story:{title:'作中人物の証言',kind:'二次掲載',url:'https://example.org/evidence'}};
const ctx=vm.createContext({
 EV:events,SETTING_SOURCES:references,
 esc:v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')
});
vm.runInContext(source,ctx);
const life={trace:[
 {id:'entry',kind:'choice',year:1081,age:5,details:{text:'学び始めた。',choice:'通う',result:'通った'}},
 {id:'unrelated',kind:'daily',year:1082,age:6,details:{text:'家の話を聞いた。'}},
 {id:'followup',kind:'choice',year:1083,age:7,details:{text:'その後の課程を考えた。',choice:'続ける',result:'続けた'}}
]};
ctx.life=life;
const items=vm.runInContext('lifeEvidenceEntries(life)',ctx);
assert.equal(items.length,2,'unrelated undocumented daily life is not fabricated as evidence');
assert.equal(items[1].prerequisite.id,'entry','only declared chronological prerequisites are linked');
const html=vm.runInContext('lifeEvidenceMarkup(life)',ctx);
assert.match(html,/作中人物の証言/,'source titles are named');
assert.match(html,/二次掲載/,'evidence type is preserved');
assert.match(html,/発生条件が参照する先行記録/,'dependency type is precisely labeled');
assert.match(html,/ゲーム上の仮定/,'confidence does not masquerade as canon');
assert.doesNotMatch(html,/id="followup"/,'internal event IDs are not printed');
assert.deepEqual(life.trace.map(x=>x.year),[1081,1082,1083],'viewer cannot mutate the life record');
const empty=vm.runInContext('lifeEvidenceMarkup({trace:[]})',ctx);
assert.match(empty,/記録がないことは出来事がなかった証拠ではありません/);
ctx.legacy={trace:[{kind:'choice',id:'removed-event-from-old-save',year:1068,age:10,details:{text:'古い記録',choice:'記録した'}}]};
const legacyHtml=vm.runInContext('lifeEvidenceMarkup(legacy)',ctx);
assert.match(legacyHtml,/現在のイベント台帳に対応する定義がありません/,'old records must show missing provenance, not silently disappear');

// A failed jump must answer beside the clicked entry; a successful jump
// must move keyboard focus as well as scrolling, with CSS controlling motion.
{
  const buttons=[1083,1099].map(year=>({dataset:{lifeYear:String(year)},
    addEventListener(name,handler){this[name]=handler;},after(notice){this.notice=notice;}}));
  const logRow={dataset:{lifeYear:'1083'},focus(options){this.focusOptions=options;},
    scrollIntoView(options){this.scrollOptions=options;}};
  const list={className:'',querySelectorAll:()=>[logRow]};
  const target={innerHTML:'',querySelectorAll:()=>buttons};
  ctx.document={getElementById:id=>({'life-evidence':{open:true},'life-evidence-body':target,lg:list}[id]),
    createElement:()=>({textContent:'',setAttribute(k,v){this[k]=v;}})};
  ctx.S=life;ctx.lifeLogMatchesFilter=()=>true;
  vm.runInContext('renderLifeEvidencePanel()',ctx);
  buttons[1].click();
  assert.match(buttons[1].notice.textContent,/この年がありません/);
  assert.equal(buttons[0].notice.textContent,'','feedback belongs to the clicked entry');
  assert.equal(logRow.focusOptions,undefined,'missing years never move focus to unrelated rows');
  buttons[0].click();
  assert.equal(logRow.tabIndex,-1);
  assert.equal(logRow.focusOptions.preventScroll,true);
  assert.equal(logRow.scrollOptions.block,'center');
  assert.equal(logRow.scrollOptions.behavior,undefined,'does not force smooth motion over CSS preferences');
  assert.match(buttons[0].notice.textContent,/1083年の記録へ移動/);
}

console.log('PASS P2 real trace evidence, source labels, declared prerequisites and missing records');
