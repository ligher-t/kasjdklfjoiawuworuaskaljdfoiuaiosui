'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const annual=require('./support/annual-cases.cjs');
const root=path.resolve(__dirname,'..');
const {ctx,nodes,storage}=annual.context(root);

annual.setup(ctx,{id:'resume-at-birth',seed:907120,region:'ヴィクトリア',age:0});
vm.runInContext(`
  HL=0;AU='';sp=2;acc=0;
  $('s0').hidden=false;$('s1').hidden=true;$('rs').hidden=false;
  globalThis.resumeTestSpeed=null;
  play=speed=>{resumeTestSpeed=speed;};
  tab=()=>{};
  restorePendingChoice=()=>false;
  rd=()=>{};
`,ctx);
const snapshot=vm.runInContext('makeResumeSnapshot()',ctx);
ctx.birthSnapshot=snapshot;

assert.equal(snapshot.S.age,0);
assert.equal(snapshot.S.year,snapshot.S.by);
assert.equal(vm.runInContext('cont(birthSnapshot)',ctx),true,'the saved birth state resumes');
assert.equal(vm.runInContext('S.age',ctx),0,'resume preserves age zero');
assert.equal(vm.runInContext('S.year',ctx),snapshot.S.by,'resume preserves the birth year');
assert.equal(Boolean(nodes.get('s0').hidden),true,'resuming leaves the title screen');
assert.equal(Boolean(nodes.get('s1').hidden),false,'resuming reveals the life screen');
assert.equal(Boolean(nodes.get('rs').hidden),true,'resuming hides the ending');
assert.equal(vm.runInContext('resumeTestSpeed',ctx),snapshot.sp,'resume restores the saved pace');
assert.equal(vm.runInContext('RANDOM_SEED',ctx),snapshot.S.randomSeed,'resume restores the seed');
assert.equal(vm.runInContext('RANDOM_STATE',ctx),snapshot.S.rngState,'resume restores the current RNG state');

// Deleting a slot removes both copies without changing another saved life.
{
  vm.runInContext(`
    globalThis.slotA={savedAt:'a',snapshot:makeResumeSnapshot()};
    globalThis.slotB={savedAt:'b',snapshot:makeResumeSnapshot()};
    slotB.snapshot.S.nm='other saved life';
    writeResumeSlot(0,slotA);writeResumeSlot(1,slotB);
    clearResumeSlot(0);
  `,ctx);
  const primaryKey='terra2-resume-slots-v1',backupKey=primaryKey+'-backup';
  for(const key of [primaryKey,backupKey]){
    const store=JSON.parse(storage.get(key));
    assert.equal(store.slots[0],null,'deleted life is absent from '+key);
    assert.deepEqual(store.slots[1],JSON.parse(vm.runInContext('JSON.stringify(slotB)',ctx)),
      'another slot retains its full snapshot in '+key);
  }
  storage.set(primaryKey,'broken primary');
  assert.equal(vm.runInContext('readResumeSlots().recoveredFromBackup',ctx),true);
  assert.equal(vm.runInContext('readResumeSlots().slots[0]',ctx),null,
    'corrupt primary cannot resurrect the deleted life');
  vm.runInContext('clearResumeSlot(1)',ctx);
  for(const key of [primaryKey,backupKey])assert.equal(JSON.parse(storage.get(key)).slots[1],null,
    'deleting from recovered data clears both copies');

  // A storage failure leaves the primary intact and is reported to the user.
  vm.runInContext('writeResumeSlot(0,slotA)',ctx);
  const beforeFailure=storage.get(primaryKey);
  vm.runInContext(`
    globalThis.realStorageWrite=localStorage.setItem;
    localStorage.setItem=(key,value)=>{if(key===RESUME_BACKUP_KEY)throw Error('storage full');realStorageWrite(key,value);};
    clearResumeSlot(0);
    localStorage.setItem=realStorageWrite;
  `,ctx);
  assert.equal(storage.get(primaryKey),beforeFailure,'failed recovery write preserves the primary');
  assert.match(nodes.get('resume-status').textContent,/消去できませんでした/);
  vm.runInContext(`
    localStorage.setItem=(key,value)=>{if(key===RESUME_SLOTS_KEY)throw Error('primary unavailable');realStorageWrite(key,value);};
    clearResumeSlot(0);
    localStorage.setItem=realStorageWrite;
  `,ctx);
  assert.equal(storage.get(primaryKey),beforeFailure,'failed primary write preserves the saved life');
  assert.match(nodes.get('resume-status').textContent,/消去できませんでした/);
}

// The new birth editor stays in the same time range and never changes the RNG.
{
  const elements=new Map();
  const getElement=id=>{
    if(!elements.has(id))elements.set(id,{
      value:'',textContent:'',children:[],attributes:{},focusCalled:0,
      focus(){this.focusCalled++;},
      setAttribute(name,value){this.attributes[name]=value;},
      append(node){this.children.push(node);}
    });
    return elements.get(id);
  };
  const started=[];
  const scrolls=[];
  const yearCtx=vm.createContext({
    BIRTH_YEAR_MIN:1000,BIRTH_YEAR_MAX:1100,START:1077,FC:[],
    $:getElement,S:null,AU:'',
    born:options=>started.push(options),
    window:{scrollTo:(...coordinates)=>scrolls.push(coordinates)},
    document:{createElement:()=>({dataset:{},setAttribute(){}})}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/controls.js'),'utf8'),yearCtx);
  assert.equal(getElement('birth-year').value,'1077');
  assert.equal(getElement('birth-year-range').value,'1077');
  assert.equal(getElement('birth-start-year').textContent,'1077年');
  vm.runInContext('stepBirthYear(1)',yearCtx);
  assert.equal(getElement('birth-year').value,'1078');
  assert.equal(getElement('birth-year-range').value,'1078');
  vm.runInContext('setSelectedBirthYear(9999)',yearCtx);
  assert.equal(getElement('birth-year').value,'1100');
  getElement('birth-year-range').value='1032';
  getElement('birth-year-range').oninput();
  assert.equal(getElement('birth-year').value,'1032');
  getElement('birth-year').value='';
  getElement('birth-year').oninput();
  vm.runInContext('beginLifeAtSelectedYear()',yearCtx);
  assert.equal(started.length,0,'invalid year cannot initiate birth');
  assert.equal(scrolls.length,0,'invalid input leaves the title scroll position intact');
  assert.match(getElement('birth-year-error').textContent,/1000〜1100/);
  getElement('birth-year').value='1049';
  getElement('birth-year').oninput();
  vm.runInContext('beginLifeAtSelectedYear()',yearCtx);
  assert.equal(started.length,1);
  assert.equal(started[0].by,1049,'selected year is passed through to the existing birth engine');
  assert.deepEqual(scrolls,[[0,0]],'starting a life resets the scrolled title position');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/id="birth-year-range"/);
  assert.match(html,/class="ui-origin-mark" aria-hidden="true"/);
}

console.log('ui-title-resume: passed at birth age 0; composer and motif verified');
