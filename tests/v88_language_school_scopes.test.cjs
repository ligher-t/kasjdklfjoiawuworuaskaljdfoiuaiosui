'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),vm=require('node:vm');
const {context,setup}=require('./support/annual-cases.cjs');
const {ctx}=context(path.resolve(__dirname,'..'));
const run=code=>JSON.parse(vm.runInContext('JSON.stringify((()=>{'+code+'})())',ctx));
setup(ctx,{id:'language-school-scopes',seed:218094,region:'ヴィクトリア',age:22});
const access=run(`
  S.year=1099;S.age=22;
  const lang='victorian',lang2='ursus_civic';
  S.languageState.skills[lang]={listen:20,speak:20,read:20,write:10,formalRegister:15};
  S.languageState.scripts.victorian_script=0;
  S.languageState.accessArrangements=[];
  const before=assessCommunication(S,'victoria-office-application').understood;
  const readBefore=canReadLanguageDocument(S,lang,40,'victorian_script').readable;
  applyLanguageAction(S,{type:'support',languageId:lang,arrangement:{
    kind:'helper',mode:'read',purpose:'victoria-office-application',languageId:lang
  }});
  const booked=S.languageState.accessArrangements.at(-1);
  const now=assessCommunication(S,'victoria-office-application');
  const otherLanguage=assessCommunication(S,{primaryLanguageId:lang2,mode:'read',difficulty:30,purpose:'victoria-office-application'}).mediated;
  const otherUse=assessCommunication(S,{primaryLanguageId:lang,mode:'listen',difficulty:30,purpose:'victoria-office-application'}).mediated;
  const otherDocument=canReadLanguageDocument(S,lang,40,'victorian_script').mediated;
  const otherPurpose=assessCommunication(S,{primaryLanguageId:lang,mode:'read',difficulty:30,purpose:'different-proceeding'}).mediated;
  const otherSite=(S.community={...S.community,key:'different-district'},
    assessCommunication(S,'victoria-office-application').mediated);
  S.community={...S.community,key:booked.areaKey};
  const previousRegion=S.res;S.res=REG.find(x=>x.n==='クルビア');
  const relocated=assessCommunication(S,'victoria-office-application').mediated;
  S.res=previousRegion;S.year++;
  const expired=assessCommunication(S,'victoria-office-application').mediated;
  return {before,readBefore,now:now.understood,mediated:now.mediated,
    booked,otherLanguage,otherUse,otherDocument,otherPurpose,otherSite,relocated,expired};
`);
assert.equal(access.before,false);
assert.equal(access.readBefore,false);
assert.equal(access.now,true);
assert.equal(access.mediated,true);
assert.equal(access.booked.expiresYear,access.booked.year,'default support lasts only the recorded year');
for(const k of ['otherLanguage','otherUse','otherDocument','otherPurpose','otherSite','relocated','expired'])
  assert.equal(access[k],false,k+' must not inherit unrelated interpreter support');

setup(ctx,{id:'institution-scope',seed:218095,region:'クルビア',age:20});
const school=run(`
  S.year=1100;S.age=20;S.inf=1;S.fl.dg=1;S.fl.hid=1;
  educationStart(S,'university',1,'test-enrolment');
  const first=educationInstitutionRef(S);
  const before=educationSchoolKnowsInfection(S,'university');
  recordInfectionAwarenessAction(S,{
    subject:'self',audience:'school-contact',certainty:'confirmed',
    source:'self-disclosure',consent:'voluntary',recipientRef:'current-teacher'
  });
  const teacherOnly=educationSchoolKnowsInfection(S,'university');
  recordInfectionAwarenessAction(S,{
    subject:'self',audience:'school',certainty:'suspected',
    source:'direct-question',consent:'unclear',recipientRef:'current-school'
  });
  const suspected=educationSchoolKnowsInfection(S,'university');
  recordInfectionAwarenessAction(S,{
    subject:'self',audience:'school',certainty:'confirmed',
    source:'self-disclosure',consent:'voluntary',recipientRef:'current-school'
  });
  const confirmed=educationSchoolKnowsInfection(S,'university');
  const campusRow=infectionAwarenessEntries(S).find(x=>x.audience==='school'&&x.certainty==='confirmed');
  const otherKind=educationSchoolKnowsInfection(S,'vocational');
  educationStart(S,'vocational',2,'test-transferred-course');
  const next=educationInstitutionRef(S);
  const transferred=educationSchoolKnowsInfection(S,'vocational');
  return {first,before,teacherOnly,suspected,confirmed,recipient:campusRow?.recipientRef,
    otherKind,next,transferred,rows:infectionAwarenessEntries(S).length};
`);
assert.ok(school.first?.startsWith('course:'));
assert.equal(school.before,false);
assert.equal(school.teacherOnly,false);
assert.equal(school.suspected,false);
assert.equal(school.confirmed,true);
assert.equal(school.recipient,school.first);
assert.equal(school.otherKind,false);
assert.notEqual(school.next,school.first,'a different enrollment must be a different institution reference');
assert.equal(school.transferred,false,'former university disclosure cannot notify a new vocational college');
assert.equal(school.rows,3);
console.log('PASS interpreter language/purpose/mode/site/expiry, university recognition and transfer isolation');
