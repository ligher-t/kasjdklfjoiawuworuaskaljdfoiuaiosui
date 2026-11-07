'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{' + code + '})())',ctx,{timeout:30000}));
const result=read(`
 born({seed:159741,by:1060,region:'ヴィクトリア'});
 S.year=1098;S.age=38;S.mo=8;
 S.res=REG.find(x=>x.n==='ヴィクトリア');
 S.local={kind:'固定都市の街区',city:'ロンディニウム'};
 S.home='固定都市の街区';
 S.world={events:{londinium_war:1098}};
 S.educationDecision=null;S.majorEventMonth=null;
 S.romance={id:'romance-a',name:'相手A',stage:'known',metYear:1091,stageSinceYear:1091};
 S.sn.lov=1092;
 S.eventOutcomes={lov:{year:1092,choiceIndex:0,outcomeIndex:0,romanceId:'romance-a'}};
 const romance=EV.find(e=>e.id==='romance_followup');
 const choice=()=>[{l:'期限付きの手続きを選ぶ',o:[[1,'確認を行った',{}]]}];
 const history={id:'test_local_history',st:['壮年'],timelineFlag:'londinium_war',historicalScene:EV.find(e=>e.id==='vic_war').historicalScene,c:choice(),w:1};
 const school={id:'education_upper_path',st:['壮年'],c:choice(),w:1};
 const medical={id:'infection_workplace_review',st:['壮年'],c:choice(),w:1};
 const original=EV.slice(),oldFire=fire,selected=[],eligible={};
 const tick=(events)=>{EV.splice(0,EV.length,...events);slot(7.5/12);};
 try {
   eligible.lastYear=elig(romance,S,tags(S));
   eligible.history=elig(history,S,tags(S));
   eligible.deadline=nextExpiringFollowup([romance],S)?.id||null;
   fire=e=>selected.push(e.id);
   tick([history,romance]);
   S.sn.lov=1093;S.eventOutcomes.lov.year=1093;
   eligible.earlyYear=elig(romance,S,tags(S));
   tick([history,romance]);
   S.sn.lov=1092;S.eventOutcomes.lov.year=1092;
   S.educationDecision={kind:'upper-path'};
   tick([history,romance,school]);
   S.educationDecision=null;
   S.infectionWorkplace={reviewDueYear:1098};
   tick([history,romance,medical]);
   S.infectionWorkplace=null;
   S.sn.lov=1091;S.eventOutcomes.lov.year=1091;
   eligible.expired=elig(romance,S,tags(S));
   tick([history,romance]);
   const first={id:'z-review',c:choice(),after:{id:'old',min:1,max:4}};
   const second={id:'a-review',c:choice(),after:{id:'new',min:2,max:2}};
   S.sn.old=1094;S.sn.new=1096;
   const tie=nextExpiringFollowup([second,first],S)?.id;
   S.sn.new=1095;
   const otherYear=nextExpiringFollowup([second,first],S)?.id;
   return {selected,eligible,tie,otherYear};
 }finally {fire=oldFire;EV.splice(0,EV.length,...original);}
`);
assert.equal(result.eligible.lastYear,true,'actual romance followup is eligible on its last year');
assert.equal(result.eligible.earlyYear,true,'actual romance followup is also eligible before its last year');
assert.equal(result.eligible.history,true,'the competing historical choice is eligible');
assert.equal(result.eligible.expired,false,'an expired romance outcome cannot be forced to appear');
assert.equal(result.eligible.deadline,'romance_followup','actual after.max deadline is detected');
assert.deepEqual(result.selected,[
 'romance_followup','test_local_history','education_upper_path',
 'infection_workplace_review','test_local_history'
],'actual dispatch protects final-year followup, history, required school and due medical in that order');
assert.equal(result.tie,'z-review','earlier due year wins when multiple followups expire together');
assert.equal(result.otherYear,'z-review','a different-year dependency must not be prioritized as expiring');
console.log('PASS: expiring romance followup, actual history, mandatory education and medical priority');
