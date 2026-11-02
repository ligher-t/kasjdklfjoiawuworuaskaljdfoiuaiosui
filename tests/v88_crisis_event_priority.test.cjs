'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const {context} = require('./support/annual-cases.cjs');
const {ctx} = context(path.resolve(__dirname, '..'));
const evalJSON = code => JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx,{timeout:30000}));

const classification = evalJSON(`
 const ids=['daily_victoria_01','daily_victoria_03','daily_victoria_06',
   'daily_victoria_49','daily_victoria_50','daily_victoria_51','daily_victoria_52'];
 const classified=ids.map(id=>({id,blocked:isPeacefulLeisureEvent(EV.find(e=>e.id===id))}));
 return {classified,meal:isPeacefulLeisureEvent(EV.find(e=>e.id==='daily_victoria_02')),
   protest:isPeacefulLeisureEvent({t:'観光開発による森林の買収に反対した。'}),
   unidentified:isPeacefulLeisureEvent({t:['遊歩道を歩いた。','夜会の知らせ。']}),
   diagnostics:validate()};
`);
assert(classification.classified.every(row=>row.blocked),'named Victoria leisure scenes are explicitly classified');
assert.equal(classification.meal,false,'essential meals stay possible during conflict');
assert.equal(classification.protest,false,'tourism-related protests are not luxury leisure');
assert.equal(classification.unidentified,false,'array prose is not classified by incidental vocabulary');
assert.deepEqual(classification.diagnostics,[],'catalog accepts only well-typed daily metadata');
const invalid=evalJSON(`
 const event=EV.find(e=>e.id==='daily_victoria_03'),old=event.crisisPolicy;
 event.crisisPolicy='unknown';
 const rejected=validate().some(msg=>msg.includes(event.id)&&msg.includes('crisisPolicy'));
 event.crisisPolicy=old;
 return {rejected};
`);
assert(invalid.rejected,'unregistered crisis semantics fail catalog validation');

const dispatch=evalJSON(`
 born({seed:150011,by:1060,region:'ヴィクトリア'});
 S.year=1098;S.age=38;S.mo=8;
 S.res=REG.find(g=>g.n==='ヴィクトリア');
 S.home='固定都市の街区';S.local={kind:'固定都市の街区',city:'ロンディニウム'};
 S.educationDecision=null;S.majorEventMonth=null;
 S.world={events:{londinium_war:1098}};
 S.infectionWorkplace={reviewDueYear:1098};
 const source=EV.slice();
 const choice=()=>[{l:'期限付きの選択を行う',ethics:{intent:'procedure',reviewed:true,policyVersion:87},o:[[1,'結果',{}]]}];
 const historic={id:'priority_test_historical',timelineFlag:'londinium_war',st:['壮年'],c:choice(),w:1};
 const review={id:'infection_workplace_review',st:['壮年'],c:choice(),w:1};
 const fireOriginal=fire,selected=[];
 try {
   EV.splice(0,EV.length,review,historic);
   const eligibleBefore={review:elig(review,S,tags(S)),historic:elig(historic,S,tags(S))};
   fire=(e)=>selected.push(e.id);
   slot(7.5/12);
   S.infectionWorkplace.reviewDueYear=1099;
   slot(7.5/12);
   EV.splice(0,EV.length,
      source.find(e=>e.id==='daily_victoria_03'),
      source.find(e=>e.id==='daily_victoria_02'));
   S.infectionWorkplace=null;
   slot(7.5/12);
   return {selected,eligibleBefore,crisis:isLocationInCrisis(S)};
 } finally {fire=fireOriginal;EV.splice(0,EV.length,...source);}
`);
assert.deepEqual(dispatch.eligibleBefore,{review:true,historic:true},
 'both competing event paths must be genuinely eligible');
assert.equal(dispatch.crisis,true,'the real history establishes a local crisis');
assert.deepEqual(dispatch.selected,['infection_workplace_review','priority_test_historical','daily_victoria_02'],
 'real slot prefers due health review, then history after review is no longer due, and essential daily life in crisis');
console.log('PASS due infection followup priority, scene metadata, and live crisis dispatch');
