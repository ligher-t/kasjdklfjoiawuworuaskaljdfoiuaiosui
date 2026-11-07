'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context}=require('./support/annual-cases.cjs'),root=path.resolve(__dirname,'..'),{ctx}=context(root);
const tones=JSON.parse(JSON.stringify(vm.runInContext(`(()=>{
 const event=id=>EV.find(row=>row.id===id),outcome=(id,choice,result)=>{
  const row=event(id).c[choice].o[result];
  return {tone:tone(row[2],row[3]),explicit:row[3]||null};
 };
 return {
  unavailablePrimary:outcome('edu_neighbor_school_notice',1,0),
  noCommute:outcome('edu_primary_commute_guardian',1,0),
  noFormalSchoolRoute:outcome('edu_no_path_year_close',1,0),
  confirmedAdmission:outcome('education_case_review',8,0),
  resumedSchool:outcome('education_funding_review',1,0),
  deniedAid:outcome('education_funding_review',4,1),
  harmfulExclusion:outcome('life_infected_exclusion_consequence',0,0),
  rejectedApplication:outcome('car',10,1),
  ordinaryInquiry:outcome('edu_neighbor_school_notice',0,0),
  deferredByChoice:outcome('education_upper_path',1,0),
  positiveDaily:tone(event('daily_kazimierz_01').fx,event('daily_kazimierz_01').displayTone),
  parentBereavement:tone(event('parent_oripathy_death_1').fx,event('parent_oripathy_death_1').displayTone),
  failedChoice:evt(event('edu_neighbor_school_notice').c[1]),
  successfulChoice:evt(event('education_case_review').c[8]),
  unchangedScore:SC(event('life_infected_exclusion_consequence').c[0].o[0][2])
 };
})()`,ctx)));
assert.deepEqual(tones,{
 unavailablePrimary:{tone:'bad',explicit:'bad'},
 noCommute:{tone:'bad',explicit:'bad'},
 noFormalSchoolRoute:{tone:'bad',explicit:'bad'},
 confirmedAdmission:{tone:'gd',explicit:'good'},
 resumedSchool:{tone:'gd',explicit:'good'},
 deniedAid:{tone:'bad',explicit:'bad'},
 harmfulExclusion:{tone:'bad',explicit:'bad'},
 rejectedApplication:{tone:'bad',explicit:'bad'},
 ordinaryInquiry:{tone:'',explicit:null},
 deferredByChoice:{tone:'',explicit:null},
 positiveDaily:'gd',
 parentBereavement:'bad',
 failedChoice:'bad',
 successfulChoice:'gd',
 unchangedScore:3
},'explicit prose polarity controls presentation while unmarked and mixed choices keep score-based neutral coloring');
const invalidTone=vm.runInContext(`(()=>{
 const row=EV.find(e=>e.id==='edu_neighbor_school_notice').c[1].o[0],old=row[3];
 try{row[3]='neutral';return validate().some(issue=>issue.includes('displayTone'));}
 finally{row[3]=old;}
})()`,ctx);
assert.equal(invalidTone,true,'catalog validation rejects unknown explicit result tones');
console.log('PASS explicit good/bad result tones for reviewed event outcomes');
