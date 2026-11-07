'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),path=require('node:path');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const read=body=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+body+'})())',ctx));
const results=[];
for(const kind of ['exclusion','mutual']){
  for(const ending of ['handover','dissolve']){
    setup(ctx,{id:'org-exit-'+kind+'-'+ending,seed:191240+results.length,region:'龍門',age:35});
    ctx.FOUNDER_CHOICE=kind==='exclusion'?0:1;
    ctx.EXIT_CHOICE=ending==='handover'?1:2;
    ctx.SELECTED_ORG=kind==='exclusion'?'infected-exclusion':'infected-mutual-aid';
    ctx.SELECTED_GOAL=kind==='exclusion'?'order-through-exclusion':'infected-mutual-aid';
    const report=read(`
      S.year=1100;S.age=35;S.cash=1000000;S.house.cash=1000000;
      const founded=EV.find(e=>e.id==='life_infected_association_choice');
      const review=EV.find(e=>e.id==='life_infected_association_review');
      const later=EV.find(e=>e.id==='life_infected_organization_exit_legacy');
      ap(founded.c[FOUNDER_CHOICE].o[0][2]);
      const ident=SELECTED_ORG,targetGoal=SELECTED_GOAL;
      const before={goal:S.lifeRecord.goals.find(x=>x.id===targetGoal)?.status,
        affiliation:S.lifeRecord.affiliations.find(x=>x.id===ident)?.status};
      S.year=1110;S.age=45;
      ap(review.c[EXIT_CHOICE].o[0][2]);
      const org=S.lifeRecord.organizations.find(x=>x.id===ident);
      const aff=S.lifeRecord.affiliations.find(x=>x.id===ident);
      const goal=S.lifeRecord.goals.find(x=>x.id===targetGoal);
      const justLeft=elig(later,S,tags(S));
      S.year=1112;S.age=47;
      const tooSoon=elig(later,S,tags(S));
      S.year=1113;S.age=48;
      const due=elig(later,S,tags(S));
      S.year=1120;S.age=55;
      const evenLater=elig(later,S,tags(S));
      return {before,end:org.status,affiliation:aff.status,
        endedYear:aff.endedYear,goal:goal.status,
        justLeft,tooSoon,due,evenLater};
    `);
    assert.deepEqual(report.before,{goal:'active',affiliation:'active'});
    assert.equal(report.end,ending==='handover'?'handed-over':'dissolved');
    assert.equal(report.affiliation,'left');
    assert.equal(report.endedYear,1110);
    assert.equal(report.goal,'abandoned','organizer must not retain an active mission after closing their role');
    assert.equal(report.justLeft,false);
    assert.equal(report.tooSoon,false);
    assert.equal(report.due,ending==='handover','only an extant successor can write the quoted letter');
    assert.equal(report.evenLater,ending==='handover','a dissolved group cannot invent an active successor');
    results.push(report);
  }
}
setup(ctx,{id:'org-voluntary-exit',seed:191245,region:'龍門',age:36});
const individual=read(`
 S.year=1100;S.age=36;S.cash=1000000;S.house.cash=1000000;
 const founded=EV.find(e=>e.id==='life_infected_association_choice'),
   rotation=EV.find(e=>e.id==='life_infected_org_rotation'),
   reentry=EV.find(e=>e.id==='life_infected_org_reentry'),
   later=EV.find(e=>e.id==='life_infected_organization_exit_legacy');
 ap(founded.c[1].o[0][2]);
 ap(rotation.c[3].o[0][2]);
 S.year=1104;S.age=40;
 ap(reentry.c[2].o[0][2]);
 const aff=S.lifeRecord.affiliations.find(x=>x.id==='infected-mutual-aid'),
   goal=S.lifeRecord.goals.find(x=>x.id==='infected-mutual-aid'),
   org=S.lifeRecord.organizations.find(x=>x.id==='infected-mutual-aid');
 const justLeft=elig(later,S,tags(S));
 S.year=1107;S.age=43;
 const due=elig(later,S,tags(S));
 return {aff:aff.status,endedYear:aff.endedYear,goal:goal.status,org:org.status,justLeft,due};
`);
assert.deepEqual(individual,{aff:'left',endedYear:1104,goal:'abandoned',org:'active',
  justLeft:false,due:true},'a person may leave an organization that continues without them');
console.log('PASS organization founder handover/dissolve, personal resignation, goal closure and departure-aged successor letters');
