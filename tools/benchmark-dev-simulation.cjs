"use strict";
// Explicit benchmark only. No report/state files are written.
const vm=require('node:vm'),cp=require('node:child_process'),assert=require('node:assert/strict'),{createHash}=require('node:crypto'),runtime=require('./runtime.cjs'),annual=require('../tests/support/annual-cases.cjs');
const [baselineRef,countArg,yearsArg,backend="vm"]=process.argv.slice(2);
if(!baselineRef || !countArg || !yearsArg) throw Error('Usage: node tools/benchmark-dev-simulation.cjs BASELINE_REF COUNT MAX_YEARS');
if(!["vm","native"].includes(backend))throw Error("Backend must be vm or native");
const count=Number(countArg),maxYears=Number(yearsArg);
if(!Number.isInteger(count)||count<1||count>1000||!Number.isInteger(maxYears)||maxYears<1||maxYears>400)throw Error('Invalid bounded cohort');
const baselineConditions=cp.execFileSync('git',['show',baselineRef+':js/events/conditions.js'],{encoding:'utf8'});
const fs=require('node:fs'),path=require('node:path'),root=path.resolve(__dirname,'..'),currentConditions=fs.readFileSync(path.join(root,'js/events/conditions.js'),'utf8');
function setup(baseline){if(backend==='native')return require('../tests/support/native-runtime.cjs').nativeRuntime(root,source=>{if(baseline&&!source.includes(currentConditions))throw Error('Baseline substitution failed');return baseline?source.replace(currentConditions,baselineConditions):source;});const read=runtime.readEngine;runtime.readEngine=root=>{const source=read(root);if(baseline&&!source.includes(currentConditions))throw Error('Baseline substitution failed');return baseline?source.replace(currentConditions,baselineConditions):source;};try{const {ctx}=annual.context(root);ctx.setTimeout=setTimeout;return ctx;}finally{runtime.readEngine=read;}}
function digest(value){return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
async function run(baseline){const ctx=setup(baseline),states=[],label=baseline?'before':'after';ctx.capture=p=>{if(p.phase==='life-finished'){states.push(digest(backend==='native'?ctx.snapshot():vm.runInContext('({life:S,world:W,seed:RANDOM_SEED,rng:RANDOM_STATE})',ctx)));if(p.attempted%100===0)console.log(JSON.stringify({phase:label,attempted:p.attempted,elapsedMs:p.elapsedMs}));}};
 const options={count,maxYears,masterSeed:20261026,birthYearMin:1077,birthYearMax:1077};
 ctx.benchOptions=options;const report=await (backend==='native'?ctx.run(options,{onProgress:ctx.capture}):vm.runInContext('runDevSimulation(benchOptions,{onProgress:capture})',ctx));
 const elapsedMs=report.elapsedMs;delete report.elapsedMs;delete report.generatedAt;delete report.run;delete report.fingerprints.source;
 return{elapsedMs,report:JSON.parse(JSON.stringify(report)),states};}
(async()=>{const before=await run(true),after=await run(false);assert.deepEqual(after.states,before.states,'full life/world/RNG snapshots differ');assert.deepEqual(after.report,before.report,'diagnostic report differs');console.log(JSON.stringify({backend,count,maxYears,beforeMs:before.elapsedMs,afterMs:after.elapsedMs,speedup:before.elapsedMs/after.elapsedMs,identicalLives:before.states.length,identicalReport:true,failures:after.report.summary.failureCount,processedYears:after.report.summary.processedYears,failureGroups:after.report.failures.map(row=>({type:row.type,eventId:row.eventId,error:row.error,count:row.count,seed:row.example.seed}))}));})().catch(e=>{console.error(e);process.exitCode=1;});
