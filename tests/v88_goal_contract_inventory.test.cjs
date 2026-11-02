'use strict';
const path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const inventory=JSON.parse(vm.runInContext(`JSON.stringify((()=>{
  const issues=[],missingGoalTitle=[];
  let exits=0,pauses=0,goalChanges=0;
  for(const event of EV){
    const effects=[...(event.fx?[event.fx]:[]),...(event.c||[]).flatMap(c=>(c.o||[]).map(o=>o[2]))];
    effects.forEach((effect,index)=>{
      if(!effect || typeof effect!=='object')return;
      const affs=[...(effect.lifeAffiliation?[effect.lifeAffiliation]:[]),...(effect.lifeAffiliations||[])];
      const goals=[...(effect.lifeGoal?[effect.lifeGoal]:[]),...(effect.lifeGoals||[])];
      goalChanges+=goals.length;
      for(const goal of goals){
        if(goal.id!=='current'&&!goal.title&&goal.action!=='start'&&!goal.onlyIfActive&&!goal.onlyIfUnresolved)
          missingGoalTitle.push({event:event.id,index,id:goal.id,action:goal.action,after:event.after||null});
      }
      for(const aff of affs){
        if(aff.action!=='leave'&&aff.action!=='suspend')continue;
        if(aff.action==='leave')exits++; else pauses++;
        const goal=AFFILIATION_RULES[aff.id]?.goal;
        if(!goal)continue;
        const matching=goals.filter(g=>g.id===goal||g.id==='current');
        const expected=aff.action==='leave'?['abandon','complete']:['pause','abandon','complete'];
        if(!matching.some(g=>expected.includes(g.action)))
          issues.push({event:event.id,index,aff:aff.id,action:aff.action,goal,
            presentGoals:goals.map(g=>({id:g.id,action:g.action,onlyIfUnresolved:g.onlyIfUnresolved||false})),
            condition:event.need||null,after:event.after||null});
      }
    });
  }
  return {events:EV.length,exits,pauses,goalChanges,missingGoalTitleCount:missingGoalTitle.length,
    missingGoalTitle:missingGoalTitle.slice(0,90),issuesCount:issues.length,issues:issues.slice(0,120)};
})())`,ctx,{timeout:30000}));
console.log(JSON.stringify(inventory,null,2));
