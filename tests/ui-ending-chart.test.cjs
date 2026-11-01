'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../js/ui/chart.js'),'utf8');
const ctx=vm.createContext({});
vm.runInContext(source,ctx);
ctx.samples=[[0,74,63,100000],[5,50,30,-200000],[10,67,55,400000],[15,43,80,-600000]];
const html=vm.runInContext('chart(samples)',ctx);
assert.match(html,/指数 0–100/);
assert.match(html,/純資産 \/ 龍門幣/);
assert.match(html,/0歳/);
assert.match(html,/15歳/);
assert.match(html,/-600,000/);
assert.match(html,/ui-life-chart-data/);
assert.equal((html.match(/<th scope="row">/g)||[]).length,4,'short histories keep every time point in the table');
assert.match(html,/全4時点/,'the disclosure states the number of displayed records');
assert.match(html,/100,000/);
assert.match(html,/期間内の純資産：最小 -600,000龍門幣、最大 400,000龍門幣/);
assert.doesNotMatch(html,/\\+max|−max|（別目盛）/);
assert.doesNotMatch(html,/NaN|undefined|Infinity/,'financial axes never show malformed values');
assert.match(vm.runInContext('chart([[0,50,50,0]])',ctx),/時系列の記録がまだありません/);
// The previous margin/zero/end labels overlapped at zero for one-sided
// histories. Decimal intervals must enclose all data without a duplicate zero.
for(const amounts of [[-300000,-200000,-600000],[100000,400000,200000],[-200000,400000,-600000],[-180000000,900000000,-600000000],[0,0],[42,42]]) {
  ctx.amounts=amounts;
  const scale=vm.runInContext('endingMoneyScale(amounts)',ctx);
  assert(scale.floor<=Math.min(0,...amounts)&&scale.ceil>=Math.max(0,...amounts));
  assert(scale.ceil>scale.floor,'flat records still have a nonzero range');
  assert.equal(scale.ticks.filter(v=>v===0).length,1,'zero has exactly one tick');
  assert(scale.ticks.length>=2&&scale.ticks.length<=5,'currency labels have enough vertical space');
  const step=scale.ticks[1]-scale.ticks[0];
  assert(step>=1,'currency intervals use whole Dragonmen currency units');
  scale.ticks.forEach((v,i)=>assert.equal(v,scale.ticks[0]+step*i,'currency ticks are evenly spaced'));
  const magnitude=10**Math.floor(Math.log10(step));
  assert([1,2,5,10].some(n=>Math.abs(step/magnitude-n)<1e-8),'ticks use readable decimal steps');
  ctx.rows=amounts.map((money,i)=>[i*10,50,60,money]);
  assert.doesNotMatch(vm.runInContext('chart(rows)',ctx),/NaN|undefined|Infinity/);
}
console.log('PASS ending chart separates statistical and currency scales, provides table and handles short lives');
