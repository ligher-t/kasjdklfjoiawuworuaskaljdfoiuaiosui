'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function element(tag){
  const node={tagName:String(tag).toUpperCase(),className:'',children:[],_text:'',
    append(child){this.children.push(child);},
    replaceChildren(){this.children=[];},
    querySelector(selector){
      if(selector==='b')return this.children.find(child=>child.tagName==='B')||null;
      if(selector==='.gd,.bad')return this.children.find(child=>String(child.className).split(/\s+/).some(name=>name==='gd'||name==='bad'))||null;
      return null;
    },
    get textContent(){return this.children.length?this.children.map(child=>child.textContent).join(''):this._text;},
    set textContent(value){this._text=String(value??'');this.children=[];}
  };
  return node;
}

const list=element('ul');
const rows=Array.from({length:100},(_,index)=>{
  const li=element('li'),date=element('b'),text=element('#text');
  date.className='ui-log-date';
  date.textContent=`テラ暦${1200-index}年 · ${index}歳 · ${index%12+1}月`;
  text.textContent=`event-${index}`;
  li.append(date);li.append(text);
  return li;
});
list.className='f-bad';
list.children=rows;
const document={
  body:element('body'),
  querySelectorAll(selector){return selector==='#lg li'?rows:[];},
  getElementById(id){return id==='lg'?list:null;},
  createElement:element,
  createTextNode(text){const node=element('#text');node.textContent=text;return node;}
};
const inserted=[];
const ctx=vm.createContext({document,$:id=>document.getElementById(id),LOG_SERVICES:{HL:0,S:{year:1077,age:0},$:()=>({insertAdjacentHTML(_where,html){inserted.unshift(html);}})}});
vm.runInContext(fs.readFileSync(path.join(root,'js/log/messages.js'),'utf8'),ctx);
vm.runInContext(fs.readFileSync(path.join(root,'js/save/slots.js'),'utf8'),ctx);

vm.runInContext("L('出生月の記録を確認')",ctx);
assert.match(inserted[0],/月未記録/,'logs with an unknown month state that the month was not recorded');

const saved=vm.runInContext('resumeLogEntries()',ctx);
assert.equal(saved.length,100,'all log rows remain in the save source even with a filter class on the list');
assert.equal(saved[0].text,'event-0');
assert.equal(saved[99].text,'event-99','the oldest event remains available to the serializer');
assert.match(saved[99].age,/1101年 · 99歳/);

vm.runInContext('restoreResumeLog(resumeLogEntries())',ctx);
assert.equal(list.children.length,100,'restoring the saved log recreates every row');
assert.match(list.children[99].textContent,/event-99/,'the oldest event survives restore');
assert.match(list.children[99].textContent,/1101年 · 99歳 · 4月/,'the visible date prefix survives restore');

// Filtered year headings must belong to the newest visible entry, not a hidden row.
{
  const rowsForTimeline = [
    {year:'1091',tone:'gd'}, {year:'1091',tone:'bad'},
    {year:'1090',tone:'gd'}, {year:'1090',tone:''}
  ].map(({year,tone}) => {
    const classes=new Set();
    return {
      dataset:{},
      classList:{toggle(name,flag){flag?classes.add(name):classes.delete(name);},
        remove(name){classes.delete(name);},contains(name){return classes.has(name);}},
      querySelector(selector){
        if(selector==='b')return{textContent:'テラ暦'+year+'年 · 13歳 · 9月'};
        if(selector==='.gd')return tone==='gd'?{}:null;
        if(selector==='.bad')return tone==='bad'?{}:null;
        if(selector==='.gd,.bad')return tone?{}:null;
        return null;
      }
    };
  });
  const timeline={className:'',querySelectorAll:()=>rowsForTimeline};
  const timelineCtx=vm.createContext({
    document:{getElementById:id=>id==='lg'?timeline:null}
  });
  vm.runInContext(fs.readFileSync(path.join(root,'js/log/messages.js'),'utf8'),timelineCtx);
  const headingFlags=()=>rowsForTimeline.map(row=>row.classList.contains('ui-year-start'));
  vm.runInContext('decorateLifeLogYears()',timelineCtx);
  assert.deepEqual(headingFlags(),[true,false,true,false]);
  timeline.className='f-bad';
  vm.runInContext('decorateLifeLogYears()',timelineCtx);
  assert.deepEqual(headingFlags(),[false,true,false,false]);
  timeline.className='f-n';
  vm.runInContext('decorateLifeLogYears()',timelineCtx);
  assert.deepEqual(headingFlags(),[false,false,false,true]);

  // A long filtered life must not rescan its entire log on every new event.
  timeline.className='f-gd';
  let scans=0;
  timeline.querySelectorAll=()=>{ scans++; return rowsForTimeline; };
  vm.runInContext('decorateLifeLogYears()',timelineCtx);
  const previousFirst=rowsForTimeline[0];
  for (let index=0; index<48; index++) {
    const good=index%4===0, classNames=new Set();
    const row={
      dataset:{},isConnected:true,
      classList:{
        toggle(name,on){on?classNames.add(name):classNames.delete(name);},
        remove(name){classNames.delete(name);},
        contains(name){return classNames.has(name);}
      },
      querySelector(selector){
        if(selector==='b')return {textContent:'テラ暦1091年 · 14歳 · 1月'};
        if(selector==='.gd'||selector==='.gd,.bad')return good?{}:null;
        return null;
      },
      nextElementSibling: rowsForTimeline[0]
    };
    rowsForTimeline.unshift(row);
    timelineCtx.newest=row;
    vm.runInContext('markNewLifeLogYear(newest)',timelineCtx);
  }
  assert.equal(scans,1,'filtered new records update year boundaries without full rescans');
  assert.equal(previousFirst.classList.contains('ui-year-start'),false,
    'a newer visible same-year record takes the old year header');
  const newestVisible=rowsForTimeline.find(row=>!!row.querySelector('.gd'));
  assert.equal(newestVisible.classList.contains('ui-year-start'),true);
  timeline.className='f-bad';
  vm.runInContext('decorateLifeLogYears()',timelineCtx);
  assert.equal(scans,2,'changing the visible filter recomputes its year headings once');
}

console.log('PASS 100 filtered log rows survive save/restore; unknown log month is explicit');
