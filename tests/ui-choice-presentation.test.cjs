'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
// A small interactive DOM for behaviors not exercised by the headless life tests.
function uiDOM() {
  const nodes = new Map();
  let document;
  function node(id, tag = 'DIV') {
    if (nodes.has(id)) return nodes.get(id);
    const attrs = {}, classes = new Set();
    const n = { id, tagName: tag, hidden: false, inert: false, disabled: false, tabIndex: 0,
      isConnected: true, children: [], dataset: {}, value: '', title: '', style: {}, textContent: '',
      classList: { toggle(k,on) { if(on) classes.add(k); else classes.delete(k); } },
      setAttribute(k,v) { attrs[k]=String(v); }, getAttribute(k) { return attrs[k] ?? null; }, removeAttribute(k) { delete attrs[k]; },
      append(child) { child.parent=this; this.children.push(child); },
      replaceChildren() { this.children=[]; },
      contains(other) { return other===this || this.children.some(c=>c.contains?.(other)); },
      closest(selector) {
        if (selector.includes('input') && ['INPUT','SELECT','TEXTAREA'].includes(this.tagName)) return this;
        if (selector.includes('[hidden]') && this.hidden || selector.includes('[inert]') && this.inert) return this;
        return this.parent?.closest(selector) || null;
      },
      getClientRects() { return this.closest('[hidden], [inert]') ? [] : [{}]; },
      querySelectorAll(selector) {
        const all=this.children.flatMap(c=>[c,...c.querySelectorAll(selector)]);
        return all.filter(c=>c.tagName==='BUTTON' && (!selector.includes(':not') || c.getAttribute('aria-disabled')!=='true'));
      },
      querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
      focus() { document.activeElement=this; },
      click() { if (!this.disabled && !this.closest('[inert]')) this.onclick?.({target:this}); },
      addEventListener() {}, insertAdjacentHTML() {}
    };
    Object.defineProperty(n,'textContent',{
      get(){return this.children.length ? this.children.map(c=>c.textContent).join('') : (this._text || '');},
      set(value){this.children=[];this._text=String(value);}
    });
    Object.defineProperty(n,'innerHTML',{get(){return '';},set(){this.children=[];}});
    nodes.set(id,n); return n;
  }
  for (const id of ['main','tb','cols','ft','tabs','stt','s0','s1','lg','fc','lf','ctl','au','tx','mt','choice-date','resumeChoice','resume-close','policy-toggle']) node(id);
  for (const id of ['md','resume-manager','ui-settings']) node(id).hidden=true;
  node('mt').tabIndex=-1;
  node('md').append(node('mt'));
  node('md').append(node('mc'));
  node('md').append(node('choiceSave','BUTTON'));
  node('md').append(node('hideChoice','BUTTON'));
  node('resume-manager').append(node('resume-close'));
  node('ui-settings').append(node('ui-theme','SELECT'));
  node('resumeChoice').hidden=true;
  for(let i=0;i<6;i++) node('ctl').append(node('speed-'+i,'BUTTON'));
  document={documentElement:node('html'),body:node('body'),activeElement:node('outside','BUTTON'),
    getElementById:node,createElement:tag=>node('created-'+nodes.size,tag.toUpperCase()),
    querySelector:selector=>selector==='main'?node('main'):null,
    querySelectorAll(selector) {
      if(selector.includes('#ctl button')) return node('ctl').children;
      if(selector==='#fc button') return node('fc').children;
      return [];
    }};
  return {document,node};
}
{
  const {document}=uiDOM(),storage=new Map([['terra-theme','dark'],['terra2','untouched']]);
  const ctx=vm.createContext({document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},tab(){}});
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/preferences.js'),'utf8'),ctx);
  vm.runInContext('initializeUIPreferences()',ctx);
  assert.equal(vm.runInContext('UI_PREFERENCES.theme',ctx),'dark');
  assert.equal(vm.runInContext('UI_PREFERENCES.pauseInLedger',ctx),true,'older preference files default to pausing in records');
  assert.equal(vm.runInContext('UI_PREFERENCES.motion',ctx),'auto');
  vm.runInContext("setUIPreference('motion','full')",ctx);
  assert.equal(document.documentElement.getAttribute('data-ui-motion'),'full');
  vm.runInContext("setUIPreference('motion','reduced')",ctx);
  assert.equal(document.documentElement.getAttribute('data-ui-motion'),'reduced');
  assert.equal(vm.runInContext('readUIPreferences().motion',ctx),'reduced','motion preference survives reload outside the life save');
  vm.runInContext("setUIPreference('motion','invalid')",ctx);
  assert.equal(vm.runInContext('UI_PREFERENCES.motion',ctx),'reduced');
  vm.runInContext("setUIPreference('spacing','standard');setUIPreference('density','compact');setUIPreference('theme','invalid')",ctx);
  assert.equal(storage.get('terra2'),'untouched');
  assert.equal(vm.runInContext('UI_PREFERENCES.spacing',ctx),'standard');
  assert.equal(vm.runInContext('UI_PREFERENCES.density',ctx),undefined,'removed visibility setting cannot hide primary facts');
  vm.runInContext("setUIPreference('pauseInLedger',false)",ctx);
  assert.equal(vm.runInContext('UI_PREFERENCES.pauseInLedger',ctx),false);
  assert.equal(JSON.parse(storage.get('terra-ui-preferences-v1')).pauseInLedger,false);
  storage.set('terra-ui-preferences-v1','{broken');
  assert.equal(vm.runInContext('readUIPreferences().spacing',ctx),'compact');
  ctx.localStorage.getItem=()=>{throw Error('blocked storage');};
  ctx.localStorage.setItem=()=>{throw Error('blocked storage');};
  assert.doesNotThrow(()=>vm.runInContext("initializeUIPreferences();setUIPreference('theme','light')",ctx));
}
{
  const {ctx}=require('./support/annual-cases.cjs').context(root);
  vm.runInContext("born({seed:91234});S.age=20;S.year=S.by+20;",ctx);
  const beforeMotion=vm.runInContext('JSON.stringify({S,RANDOM_STATE})',ctx);
  vm.runInContext("setUIPreference('motion','full');setUIPreference('motion','reduced');setUIPreference('motion','auto')",ctx);
  assert.equal(vm.runInContext('JSON.stringify({S,RANDOM_STATE})',ctx),beforeMotion,'motion settings never alter the life or consume RNG');
  const longChoiceText='文'.repeat(500);
  ctx.longChoiceText=longChoiceText;
  const css=fs.readFileSync(path.join(root,'css/ui-redesign.css'),'utf8');
  assert.match(css,/#md \.card[\s\S]*?max-height: calc\(100dvh/,'choice sheet stays scrollable within a short viewport');
  assert.match(css,/#mt[\s\S]*?overflow-wrap: anywhere/,'long choice text can wrap');
  assert.match(css,/#mc button[\s\S]*?white-space: normal; overflow-wrap: anywhere/,'long choice labels can wrap');
  const {document,node}=uiDOM();ctx.document=document;
  vm.runInContext("HL=0;AU='';rd=()=>{};L=()=>{};",ctx);
  vm.runInContext('(()=>{'+fs.readFileSync(path.join(root,'js/ui/controls.js'),'utf8')+'})()',ctx);
  vm.runInContext(`const choices=Array.from({length:9},(_,index)=>index===1
    ? {l:'不可',en:()=>false,why:'確認用の不可理由',o:[[1,'不可',{cash:1000}]]}
    : {l:'選択肢'+(index+1),o:[[1,'結果'+(index+1),index===0||index===8?{h:-1}:{cash:index+1}]]});
    const probe={id:'ui-choice-probe',who:'self',w:1,t:longChoiceText,c:choices};
    EV.push(probe);play(4);ask(probe,tags(S),longChoiceText,traceState(S));`,ctx);
  node('s1').hidden=false;
  assert.equal(node('md').getAttribute('aria-modal'),'true','the choice is the active modal dialog');
  assert.equal(document.activeElement,node('mt'),'focus starts at the event text');
  assert.equal(node('main').inert,true,'the background is inert while a choice is open');
  assert.equal(node('s0').inert,true,'the title cannot be reached behind a save or choice modal');
  assert.equal(node('mt').textContent.length,500,'all 500 body characters reach the choice sheet');
  assert.equal(node('mc').children.length,9,'all nine choices remain available');
  assert.match(node('mc').children[8].textContent,/^9\.\s*選択肢9$/);
  assert.equal(node('mc').children[1].getAttribute('aria-disabled'),'true');
  const unavailable=node('mc').children[1];
  assert.equal(unavailable.getAttribute('aria-label'),'2. 不可（選択できません）');
  assert.equal(unavailable.getAttribute('aria-describedby'),'choice-reason-2');
  assert.equal(unavailable.children[2].textContent,'選択できない理由: 確認用の不可理由');
  assert.equal(unavailable.title,'確認用の不可理由');
  const current=()=>vm.runInContext('JSON.stringify({S,rng:RANDOM_STATE,acc})',ctx);
  vm.runInContext('collapseChoiceSheet()',ctx);
  const frozen=current();
  vm.runInContext('showChoiceSheet();collapseChoiceSheet();play(5)',ctx);
  assert.equal(current(),frozen,'reopening and repeated collapse must preserve the life and RNG');
  assert.equal(vm.runInContext('S.choiceReturnSpeed',ctx),4,'return speed is preserved across repeated collapse');
  assert.equal(vm.runInContext('sp',ctx),0);
  assert.equal(node('policy-toggle').disabled,true,'policy edit is locked for an unresolved choice');
  const policy=vm.runInContext('S.f',ctx);node('fc').children[2].onclick();
  assert.equal(vm.runInContext('S.f',ctx),policy,'pending policy cannot be changed even by a stale callback');
  node('tx').onchange({target:{checked:true}});
  node('au').onchange({target:{value:'r'}});
  assert.equal(current(),frozen);
  const key=k=>{ctx.keyEvent={key:k,code:k===' '?'Space':k,preventDefault(){}};vm.runInContext('handleUIDialogKey(keyEvent)',ctx);};
  key('1');assert.equal(current(),frozen,'collapsed options cannot resolve through number keys');
  vm.runInContext('showChoiceSheet()',ctx);
  key('2');assert.equal(current(),frozen,'disabled number does not consume random or apply effects');
  vm.runInContext("openUIDialog('resume-manager',$('resume-close'))",ctx);
  assert.equal(node('resume-manager').getAttribute('aria-modal'),'true','the topmost nested dialog is modal');
  assert.equal(node('md').inert,true,'the pending choice is inert behind save slots');
  assert.equal(document.activeElement,node('resume-close'),'nested dialog receives its initial focus');
  key('1');assert.equal(current(),frozen,'save dialog shields the underlying choice');
  key('Escape');assert.equal(node('resume-manager').hidden,true);assert.equal(node('md').hidden,false);
  assert.equal(document.activeElement,node('mt'),'closing a nested dialog restores choice focus');
  assert.equal(node('md').getAttribute('aria-modal'),'true');
  // A native select can need Escape to collapse its OS popup first. Another
  // Escape on the same focused select must still close its dialog.
  vm.runInContext("openUIDialog('ui-settings',$('ui-theme'))",ctx);
  key('Escape');assert.equal(node('ui-settings').hidden,false,
    'first Escape preserves the open dialog while a native select handles it');
  key('Escape');assert.equal(node('ui-settings').hidden,true,
    'a second Escape dismisses the dialog from the select itself');
  assert.equal(document.activeElement,node('mt'),
    'nested settings returns focus to the original pending event');
  key('Tab');assert(node('md').contains(document.activeElement),'Tab remains in the foremost dialog');
  key('Escape');assert.equal(node('md').hidden,true);assert.equal(document.activeElement,node('resumeChoice'));
  assert.equal(node('main').inert,false,'the background becomes available after closing the choice');
  assert.equal(node('s0').inert,false,'the title becomes reachable again after closing all dialogs');
  vm.runInContext('showChoiceSheet()',ctx);
  const health=vm.runInContext('S.h',ctx),button=node('mc').children[0];
  key('1');assert.equal(vm.runInContext('S.h',ctx),health-1);assert.equal(vm.runInContext('sp',ctx),4);
  button.click();assert.equal(vm.runInContext('S.h',ctx),health-1,'stale option cannot apply twice');
  // Global transport shortcuts must not interfere with links and disclosures.
  const link=node('test-link','A'),oldClosest=link.closest;
  link.closest=selector=>selector.includes('a[href]')?link:oldClosest.call(link,selector);
  document.activeElement=link;
  const speedBeforeSpace=vm.runInContext('sp',ctx);
  key(' ');
  assert.equal(vm.runInContext('sp',ctx),speedBeforeSpace,
    'Space on a focused link does not pause the game');
  link.closest=oldClosest;
  const healthBeforeNine=vm.runInContext('S.h',ctx);
  vm.runInContext(`const nextProbe={id:'ui-choice-nine-probe',who:'self',w:1,t:longChoiceText,c:choices};
    EV.push(nextProbe);ask(nextProbe,tags(S),longChoiceText,traceState(S));`,ctx);
  vm.runInContext('showChoiceSheet()',ctx);
  const ninth=node('mc').children[8];key('9');
  assert.equal(vm.runInContext('S.h',ctx),healthBeforeNine-1,'number key 9 resolves the ninth choice');
  ninth.click();assert.equal(vm.runInContext('S.h',ctx),healthBeforeNine-1,'ninth choice is also applied once');
}

// Medium-width status drawers must never steal Escape from an active choice
// or restore focus into an off-screen/inert summary panel.
{
  let modalActive=true,drawerOpen=true,escapeHandler=null;
  const host={classList:{contains:()=>drawerOpen,remove:()=>{drawerOpen=false;}}};
  const trigger={attrs:{},setAttribute(k,v){this.attrs[k]=v;},focus(){this.focused=true;}};
  const journalButton={focus(){this.focused=true;}};
  const hiddenSummary={focus(){this.focused=true;},closest(){return null;}};
  const view={hidden:false,dataset:{ledgerKind:'health',ledgerLevel:'0'}};
  const journal={scrollTop:0};
  const metrics={dataset:{factSignature:'previous'},replaceChildren(){}};
  const center={dataset:{terminalView:'detail'}};
  const nodes={
    s1:host,'terminal-status-toggle':trigger,'terminal-ledger-view':view,
    'terminal-ledger-body':{replaceChildren(){}},
    'terminal-ledger-metrics':metrics,cc:center,lg:journal,cr:{inert:false}
  };
  const doc={
    readyState:'loading',
    addEventListener(type,fn){if(type==='keydown')escapeHandler=fn;},
    getElementById:id=>nodes[id]||null,
    querySelectorAll:()=>[],
    querySelector:selector=>selector==='#lf button'?journalButton:
      selector.startsWith('#situation-overview')?hiddenSummary:null
  };
  const browser={
    matchMedia:query=>({matches:query.includes('max-width:1279px')}),
    addEventListener(){}
  };
  const context=vm.createContext({
    document:doc,window:browser,topUIDialog:()=>modalActive?{}:null
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/terminal-navigation.js'),'utf8'),context);
  escapeHandler({key:'Escape',defaultPrevented:false});
  assert.equal(drawerOpen,true,'an active modal handles Escape before the drawer');
  modalActive=false;
  escapeHandler({key:'Escape',defaultPrevented:false});
  assert.equal(drawerOpen,false);
  assert.equal(trigger.focused,true,'standalone drawer Escape restores its trigger');
  context.returnState={kind:'health',moved:[],scrollTop:91};
  vm.runInContext('TERMINAL_LEDGER=returnState;closeLifeLedger(true)',context);
  assert.equal(journalButton.focused,true,'medium-width return focuses a visible journal control');
  assert.equal(hiddenSummary.focused,undefined,'never focus the closed summary drawer');
  assert.equal(journal.scrollTop,91,'opening the ledger does not discard log position');
}


// A central record must use the large reading workspace without changing
// life state, and both independent scroll locations must survive exit.
{
  const nodes=new Map();
  let seq=0;
  function node(id,tagName='DIV'){
    const classes=new Set();
    const el={
      id,tagName,children:[],parentNode:null,dataset:{},style:{},
      scrollTop:0,textContent:'',open:false,hidden:false,isConnected:true,
      focus(){this.focused=true;},
      setAttribute(){},
      classList:{
        add(name){classes.add(name);},remove(name){classes.delete(name);},
        contains(name){return classes.has(name);},
        toggle(name,force){if(force)classes.add(name);else classes.delete(name);}
      },
      append(child){
        if(child.parentNode)child.parentNode.children=child.parentNode.children.filter(x=>x!==child);
        this.children.push(child);child.parentNode=this;
      },
      insertBefore(child,next){
        if(child.parentNode)child.parentNode.children=child.parentNode.children.filter(x=>x!==child);
        const index=this.children.indexOf(next);
        this.children.splice(index<0?this.children.length:index,0,child);child.parentNode=this;
      },
      replaceWith(child){
        const container=this.parentNode;
        if(!container)return;
        if(child.parentNode)child.parentNode.children=child.parentNode.children.filter(x=>x!==child);
        const index=container.children.indexOf(this);
        container.children[index]=child;child.parentNode=container;this.parentNode=null;
        this.isConnected=false;
      },
      replaceChildren(){this.children.forEach(child=>child.parentNode=null);this.children=[];}
    };
    nodes.set(id,el);
    return el;
  }
  for(const id of ['s1','cl','lg','cc','cr','cols','terminal-ledger-view','terminal-ledger-body',
    'terminal-ledger-title','terminal-ledger-headline','terminal-ledger-context',
    'terminal-ledger-metrics','terminal-ledger-back','terminal-ledger-exit','terminal-ledger-choice'])node(id);
  nodes.get('terminal-ledger-exit').hidden=true;
  nodes.get('terminal-ledger-choice').hidden=true;
  nodes.get('terminal-ledger-view').scrollIntoView=function(){this.scrolledIntoView=true;};
  const pageMoves=[];
  node('tb').getBoundingClientRect=()=>({height:72});
  node('terminal-ledger-nav').getBoundingClientRect=()=>({top:190});
  nodes.get('terminal-ledger-view').getBoundingClientRect=()=>({top:430-ctx.window.scrollY});
  for(const id of ['detail-health','detail-work','detail-family','detail-finance','detail-place']){
    node(id,'DETAILS').open=false;
    nodes.get('cr').append(nodes.get(id));
  }
  nodes.get('cl').scrollTop=214;
  nodes.get('lg').scrollTop=321;
  const buttons=['health','work','family','place'].map(ledgerTo=>({
    dataset:{ledgerTo},classList:{toggle(){}},setAttribute(){}
  }));
  let onEscape=null;
  const doc={
    getElementById:id=>nodes.get(id)||null,
    querySelectorAll:selector=>selector.includes('terminal-ledger-switcher')?buttons:[],
    querySelector(){return null;},
    createComment:()=>node('mark-'+(++seq),'#comment'),
    createElement:tag=>node('new-'+(++seq),tag.toUpperCase()),
    addEventListener(type,callback){if(type==='keydown')onEscape=callback;}
  };
  const state={dead:false,age:7,h:80,fl:{dg:0},house:{cash:500,debt:0}};
  const before=JSON.stringify(state);
  const summary=()=>({
    cards:[{id:'family',headline:'養育世帯',detail:'家族と暮らす',level:0},
      {id:'health',headline:'体調',detail:'記録あり',level:0}],
    person:{place:'炎国',birthplace:'炎国',occupation:'無職',education:'未就学'}
  });
  let pendingChoiceShown=false;
  const ctx=vm.createContext({
    document:doc,window:{scrollY:240,scrollTo:(x,y)=>pageMoves.push([x,y]),
      addEventListener(){},matchMedia:()=>({matches:false})},
    S:state,UI_PREFERENCES:{pauseInLedger:true},
    playerInformationSummary:summary,closeTerminalStatusDrawer(){},tab(){},
    showChoiceSheet(){pendingChoiceShown=true;}
  });
  vm.runInContext('let sp=4; function play(n){sp=n;}',ctx);
  vm.runInContext(fs.readFileSync(path.join(root,'js/ui/terminal-navigation.js'),'utf8'),ctx);
  vm.runInContext("openLifeLedger('family')",ctx);
  assert.equal(vm.runInContext('sp',ctx),0,'opening a record pauses the former playback speed');
  assert.equal(nodes.get('terminal-ledger-exit').hidden,false,
    'a fixed toolbar exit appears for deeply scrolled records');
  assert.equal(nodes.get('terminal-ledger-choice').hidden,true,
    'pending-choice action stays hidden during ordinary record viewing');
  assert.equal(nodes.get('terminal-ledger-exit').focused,true,'initial category opening focuses the shared return control');
  nodes.get('terminal-ledger-exit').focused=false;
  assert.equal(nodes.get('s1').classList.contains('terminal-ledger-active'),true);
  assert.equal(nodes.get('cl').scrollTop,0,'record room shows the top of the character file');
  assert.equal(nodes.get('terminal-ledger-body').children.length,2,
    'both family and finance records are moved, not duplicated');
  nodes.get('terminal-ledger-body').scrollTop=137;
  ctx.window.scrollY=2200;
  nodes.get('terminal-ledger-nav').getBoundingClientRect=()=>({top:80});
  vm.runInContext("openLifeLedger('health')",ctx);
  assert.equal(nodes.get('terminal-ledger-body').children.length,1);
  assert.equal(nodes.get('terminal-ledger-exit').hidden,false,
    'switching categories cannot hide the fixed toolbar return');
  assert.equal(nodes.get('terminal-ledger-body').scrollTop,137,
    'category switching must not manipulate the obsolete inner scrollbar');
  assert.deepEqual(pageMoves.at(-1),[0,350],
    'switching from a deep record uses its document origin, not the pinned sticky bounds');
  assert.equal(nodes.get('terminal-ledger-exit').focused,false,'switching a ledger must not steal category focus');
  assert.equal(nodes.get('terminal-ledger-view').scrolledIntoView,undefined,'category switching must not jump the full page');
  assert.equal(vm.runInContext('sp',ctx),0,'category switching keeps playback paused');
  vm.runInContext('closeLifeLedger(false)',ctx);
  assert.deepEqual(pageMoves.at(-1),[0,240],
    'closing after category switches restores the original document position');
  assert.equal(vm.runInContext('sp',ctx),4,'leaving records restores playback once');
  assert.equal(nodes.get('s1').classList.contains('terminal-ledger-active'),false);
  assert.equal(nodes.get('terminal-ledger-exit').hidden,true,
    'toolbar return hides after leaving records');
  assert.equal(nodes.get('cl').scrollTop,214,'prior profile position survives record switching');
  assert.equal(nodes.get('lg').scrollTop,321,'journal position survives record switching');
  assert.equal(nodes.get('cr').children.length,5,'detail nodes return to the right rail');
  assert.equal(nodes.get('terminal-ledger-body').children.length,0);
  assert.equal(JSON.stringify(state),before,'navigation never changes the simulated life');
  // Escape closes the record in the absence of an active choice dialog.
  vm.runInContext("openLifeLedger('work')",ctx);
  let prevented=false;
  onEscape({key:'Escape',defaultPrevented:false,preventDefault(){prevented=true;}});
  assert.equal(prevented,true);
  assert.equal(nodes.get('s1').classList.contains('terminal-ledger-active'),false);
  assert.equal(vm.runInContext('sp',ctx),4,'Escape from records restores prior playback');
  vm.runInContext("openLifeLedger('health'); UI_PREFERENCES.pauseInLedger=false;syncLedgerAutoPause()",ctx);
  assert.equal(vm.runInContext('sp',ctx),4,'turning off pause while viewing resumes at once');
  vm.runInContext('closeLifeLedger(false)',ctx);
  // The actual mobile tab dispatcher closes a record before changing panels.
  const realTab=fs.readFileSync(path.join(root,'js/ui/render.js'),'utf8');
  const tabImplementation=realTab.slice(realTab.indexOf('function tab(t) {'),
    realTab.indexOf('function petHouseholdMarkup',realTab.indexOf('function tab(t) {')));
  ctx.$=id=>nodes.get(id);
  ctx.setUIPreference=()=>{};
  doc.querySelectorAll=selector=>selector==='#tabs button'?[]:[];
  vm.runInContext(tabImplementation,ctx);
  vm.runInContext("openLifeLedger('family');tab('r')",ctx);
  assert.equal(nodes.get('cols').dataset.t,'r');
  assert.equal(nodes.get('s1').classList.contains('terminal-ledger-active'),false);
  assert.equal(nodes.get('cr').children.length,5,'mobile tab returns detailed records to their home');
  // A collapsed decision must remain pending while a user reads a long
  // ledger page, and closing the ledger must not restart the simulation.
  state.ev={id:'pending-choice-unchanged'};
  // A real pending choice has already stopped playback. Earlier tests toggle
  // the auto-pause preference, so restore the default for this separate case.
  vm.runInContext("UI_PREFERENCES.pauseInLedger=true;play(0);openLifeLedger('place')",ctx);
  assert.equal(nodes.get('terminal-ledger-exit').hidden,false,
    'the fixed toolbar exit is available during a pending decision');
  assert.equal(nodes.get('terminal-ledger-choice').hidden,false,
    'a direct return to pending choice is available from the fixed toolbar');
  assert.equal(vm.runInContext('sp',ctx),0,
    'the ledger is paused while the pending decision remains outstanding');
  vm.runInContext('resumePendingChoiceFromLedger()',ctx);
  assert.equal(pendingChoiceShown,true,'fixed pending-choice control reopens the choice sheet');
  assert.equal(nodes.get('terminal-ledger-exit').hidden,true,
    'the fixed exit vanishes after leaving the record with a pending decision');
  assert.equal(nodes.get('terminal-ledger-choice').hidden,true,
    'direct pending-choice control also disappears after exit');
  assert.deepEqual(state.ev,{id:'pending-choice-unchanged'},
    'reading a ledger cannot consume, change or dismiss the pending choice');
  assert.equal(vm.runInContext('sp',ctx),0,
    'leaving a ledger must not restart playback while a choice is pending');
  state.ev=null;
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/id="terminal-ledger-exit"[^>]*onclick="closeLifeLedger\(\)"/,
    'fixed toolbar includes a working close action');
  assert.match(html,/id="terminal-ledger-choice"[^>]*onclick="resumePendingChoiceFromLedger\(\)"/,
    'fixed toolbar includes a direct deferred-choice action');
  const toolbarCss=fs.readFileSync(path.join(root,'css/terra-identity.css'),'utf8');
  assert.match(toolbarCss,/#tb #terminal-ledger-exit:not\(\[hidden\]\)/,
    'toolbar exit has accessible contrast and remains visible when the ledger nav is out of view');
  for(const id of ['detail-health','detail-work','detail-family','detail-place']) {
    assert.match(html,new RegExp('id="'+id+'"[^>]*><summary>[^<]*</summary>\\s*<div class="ui-ledger-contents"[^>]*>'),
      'each detailed record has a real grid container instead of relying on details layout');
  }
  // Actual rail visibility, single-page scrolling and sticky navigation are
  // accepted in the browser. CSS source formatting does not prove these behaviors.
}


// Playback controls share engine speed indices but must not unlock 50x for an
// ordinary session. The bar interpolates existing timer samples only.
{
  const {ctx}=require('./support/annual-cases.cjs').context(root);
  const speeds=Array.from(vm.runInContext('SPD',ctx));
  assert.deepEqual(speeds,[0,1,2,5,10,20,50],'normal 20x and debug 50x indices');
  const render=fs.readFileSync(path.join(root,'js/ui/render.js'),'utf8');
  const playCode=render.slice(render.indexOf('function play(n,'),render.indexOf('$("hideChoice").onclick'));
  const bootstrap=fs.readFileSync(path.join(root,'js/ui/bootstrap.js'),'utf8');
  const buttonCode=bootstrap.slice(bootstrap.indexOf('document.querySelectorAll(".sg").forEach('),
    bootstrap.indexOf('if (DEBUG_PLAYBACK) {',bootstrap.indexOf('document.querySelectorAll(".sg").forEach(')));
  assert(buttonCode.includes('×20'),'all ordinary speed controls have 20x');
  for(const debug of [false,true]){
    const ctl={id:'ctl',children:[],append(button){this.children.push(button);}};
    const fakeDocument={
      querySelectorAll(selector){
        if(selector==='.sg')return[ctl];
        if(selector.includes('#ctl button'))return ctl.children;
        return[];
      },
      createElement:()=>({dataset:{},classList:{toggle(){}}})
    };
    const display={textContent:''};
    const playContext=vm.createContext({
      document:fakeDocument,SPD:speeds,DEBUG_PLAYBACK:debug,S:null,sp:1,
      sts(){},$(){return display;}
    });
    vm.runInContext(playCode+buttonCode,playContext);
    assert.deepEqual(ctl.children.map(b=>b.textContent),
      debug?['停止','×1','×2','×5','×10','×20','×50']
        :['停止','×1','×2','×5','×10','×20']);
    ctl.children.at(-1).onclick();
    assert.equal(vm.runInContext('sp',playContext),debug?6:5);
    vm.runInContext('play(6)',playContext);
    assert.equal(vm.runInContext('sp',playContext),debug?6:5,
      'even programmatic 50x requests obey the debug gate');
  }
  const pbg=fs.readFileSync(path.join(root,'js/ui/bootstrap.js'),'utf8');
  const visualCode=pbg.slice(pbg.indexOf('let lastProgress = 0;'),
    pbg.indexOf('setInterval(() => {',pbg.indexOf('let lastProgress = 0;')));
  let reflows=0;
  const bar={style:{},get offsetWidth(){reflows++;return 48;}};
  const attributes={};
  const track={setAttribute(name,value){attributes[name]=value;}};
  const progressCtx=vm.createContext({$:id=>id==='pb'?bar:track});
  vm.runInContext(visualCode,progressCtx);
  vm.runInContext('paintYearProgress(0.2);paintYearProgress(0.3)',progressCtx);
  assert.equal(bar.style.transform,'scaleX(0.3)');
  assert.equal(reflows,0,'ordinary progress samples never force layout');
  vm.runInContext('paintYearProgress(0.05)',progressCtx);
  assert.equal(bar.style.transform,'scaleX(0.05)');
  assert.equal(reflows,1,'only year rollover skips the backwards sweep');
  assert.equal(attributes['aria-valuenow'],'5');
  const css=fs.readFileSync(path.join(root,'css/style.css'),'utf8');
  assert.match(css,/#pb\s*\{[\s\S]*?transform:\s*scaleX\(0\);[\s\S]*?transition:\s*transform 100ms linear;/);
  assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{\s*#pb\s*\{\s*transition:\s*none;/);
}

// Debug actions must keep normal progression, forced state, and in-memory restoration distinct.
{
  const {ctx:debugCtx,storage:debugStorage}=require('./support/annual-cases.cjs').context(root);
  const getDebugElement=debugCtx.document.getElementById;
  debugCtx.document.getElementById=id=>id==='s2'?null:getDebugElement(id); // Production has only s0/s1.
  const boot=fs.readFileSync(path.join(root,'js/ui/bootstrap.js'),'utf8');
  const apiCode=boot.slice(boot.indexOf('if (DEBUG_PLAYBACK) {'),boot.indexOf('  const debugScript =')).replace('if (DEBUG_PLAYBACK)', 'if (true)')+'}';
  vm.runInContext(apiCode,debugCtx);
  const result=vm.runInContext(`(()=>{
    const api=window.TERRA_DEBUG_API;
    rd=()=>{};syncUIDialogs=()=>{};syncChoiceControls=()=>{};
    api.newLife({seed:9001,by:1077,region:'ヴィクトリア'});play(0);
    let invalidYear=false;try{api.newLife({by:999});}catch{invalidYear=true;}
    const originalName=S.nm;
    const beforeBusy=JSON.stringify(S),beforeBusyRng=RANDOM_STATE;
    DEV_SIMULATION_ACTIVE=true;let busyRejected=0;
    try {
      for(const action of [()=>api.newLife(),()=>api.setState({cash:1}),()=>api.restoreCheckpoint(),()=>api.seed(22),()=>api.summary()])try{action();}catch{busyRejected++;}
    } finally {DEV_SIMULATION_ACTIVE=false;}
    const busySafe=busyRejected===5&&JSON.stringify(S)===beforeBusy&&RANDOM_STATE===beforeBusyRng;

    let rejected=false;try{api.setState({cash:12,typo:1});}catch{rejected=true;}
    const partialPatchDidNotApply=S.cash!==12;
    const patch=api.setState({age:30});
    const patchReports=patch.changes.some(row=>row.key==='age')&&Array.isArray(patch.audit)&&S.year===S.by+30;
    const beforeInspection=JSON.stringify(S),rng=RANDOM_STATE;
    const blocked=EV.find(event=>event.c&&event.st&&!event.st.includes(STG[stg(S)]));
    const status=api.eventStatus(blocked.id);
    const inspectPure=JSON.stringify(S)===beforeInspection&&RANDOM_STATE===rng;
    let blockedRun=false;try{api.forceEvent(blocked.id,true);}catch{blockedRun=true;}
    const noEventScan=api.inspect().events===undefined;
    const oldSlot=slot,oldTick=tick;let slots=0,years=0;
    slot=()=>{slots++;};tick=()=>{years++;S.year++;S.q=[];};S.q=[.1,.3];
    api.advanceSlot();const oneSlot=slots===1&&S.q.length===1&&acc===.1;
    api.advanceToYearEnd();const fullYear=slots===2&&years===1;
    slot=oldSlot;tick=oldTick;
    S.q=[];api.checkpoint();const statisticsKeys=Object.keys(STAT);STAT.extraDiagnosticKey=1;const checkpoint=JSON.stringify({S,W,RANDOM_STATE,acc,sp,AU});
    api.setState({cash:999});api.seed(22);api.restoreCheckpoint();
    const exactStatistics=JSON.stringify(Object.keys(STAT))===JSON.stringify(statisticsKeys);
    const restored=JSON.stringify({S,W,RANDOM_STATE,acc,sp,AU})===checkpoint;
    const pendingEvent=EV.find(row=>row.c);tags(S);S.ev=pendingEvent;S.evBefore={kept:true};
    $("md").hidden=false;api.checkpoint();const pendingBefore=JSON.stringify(S),pendingRng=RANDOM_STATE;
    S.ev=null;S.evBefore=null;S.cash=1;
    const oldAsk=ask;let resumed=false;
    ask=(event,T,text,before,isResumed)=>{resumed=isResumed&&before.kept&&event===pendingEvent;S.ev=event;};
    api.restoreCheckpoint();ask=oldAsk;
    const pendingRestored=resumed&&JSON.stringify(S)===pendingBefore&&RANDOM_STATE===pendingRng;
    if(!pendingRestored)throw Error(JSON.stringify({resumed,rng:RANDOM_STATE===pendingRng,keys:Object.keys(S).filter(key=>JSON.stringify(S[key])!==JSON.stringify(JSON.parse(pendingBefore)[key]))}));
    return{busySafe,exactStatistics,pendingRestored,invalidYear,rejected,partialPatchDidNotApply,patchReports,blocked:!status.eligible&&!!status.firstBlockingGate,blockedRun,inspectPure,noEventScan,oneSlot,fullYear,restored,nameKept:S.nm===originalName};
  })()`,debugCtx);
  for(const [name,passed] of Object.entries(result)) assert.equal(passed,true,'debug API: '+name);
  assert.equal(debugStorage.size,0,'debug checkpoint does not write normal save slots');
}

console.log('PASS UI preference isolation, pending choice guards, nested modal focus, 500-character text, nine choices, exactly-once resolution and speed/progress guards');
