'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const file=fs.readFileSync(path.join(__dirname,'../js/log/messages.js'),'utf8');
const makeRow=(year,tone='')=>({
 dataset:{},isConnected:true,classes:new Set(),
 classList:{toggle(name,on){if(on)this.owner.classes.add(name);else this.owner.classes.delete(name);},remove(name){this.owner.classes.delete(name);}},
 querySelector(selector){
   if(selector==='b')return{textContent:'テラ暦'+year+'年 · 3歳'};
   if(selector==='.gd')return tone==='good'?{}:null;
   if(selector==='.bad')return tone==='bad'?{}:null;
   if(selector==='.gd,.bad')return tone?{}:null;
   return null;
 },
});
const rows=[makeRow(1094,'bad'),makeRow(1094,'good'),makeRow(1089,'bad'),makeRow(1074,'good')];
rows.forEach(row=>row.classList.owner=row);
const list={className:'',querySelectorAll:()=>rows};
const document={getElementById:id=>id==='lg'?list:null};
const context=vm.createContext({document});
vm.runInContext(file,context);
vm.runInContext('decorateLifeLogYears()',context);
assert.equal(rows[0].dataset.lifeYear,'1094');
assert.equal(rows[0].dataset.lifeYearLabel,'テラ暦1094年');
assert(rows[0].classes.has('ui-year-start'));
assert(!rows[1].classes.has('ui-year-start'),'same visible year has one heading');

list.className='f-gd';
vm.runInContext('decorateLifeLogYears()',context);
assert.equal(rows[0].dataset.lifeYear,'1094','filters retain chronology');
assert(!rows[0].classes.has('ui-year-start'),'hidden bad record cannot own a good-filter heading');
assert(rows[1].classes.has('ui-year-start'),'first visible good record owns its year heading');
const next=makeRow(1094,'good');next.classList.owner=next;next.nextElementSibling=rows[0];rows.unshift(next);context.newRow=next;
vm.runInContext('markNewLifeLogYear(newRow)',context);
assert(next.classes.has('ui-year-start'));
assert(!rows[2].classes.has('ui-year-start'),'incremental insertion transfers the year heading');
list.className='f-n';vm.runInContext('decorateLifeLogYears()',context);
assert(rows.every(row=>!row.classes.has('ui-year-start')),'an empty filter invents no year heading');
console.log('PASS log years: grouped, filtered and incremental visible headings');
