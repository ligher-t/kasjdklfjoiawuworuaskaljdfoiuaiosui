'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {spawnSync}=require('node:child_process'),{createHash}=require('node:crypto');
const runtime=require('./runtime.cjs'),root=path.resolve(__dirname,'..');
const approved=Object.freeze([
  "p20-education-completion.test.cjs",
  "p15-education-regional-paths.test.cjs",
  "p0-career-credential-lifecycle.test.cjs",
  "p0-education-nonstandard.test.cjs",
  "p0-school-progression.test.cjs",
  "p0-school-regional-access.test.cjs",
  "p18-education-world-determinism.test.cjs",
  "p19-education-observation.test.cjs",
  "p19-education-dependent-observation.test.cjs",
  "p19-education-nine-stage.test.cjs",
  "p19-education-local-transitions.test.cjs",
  "p15-education-regional-representatives.test.cjs",
  "p15-education-causal-boundaries.test.cjs",
  "p15-education-annual-lifecourse.test.cjs",
  "p15-education-transfer-and-dependents.test.cjs",
  "p15-education-infection-and-history.test.cjs",
  "p18-education-operations-mobility.test.cjs",
  "p18-education-case-fsm.test.cjs",
  "p18-education-finance-ledger.test.cjs",
  "p18-education-attendance-credit.test.cjs",
  "p18-education-access-family-nonformal.test.cjs",
  "p18-education-event-migration.test.cjs",
  "p0-education-service-context.test.cjs",
  "regional-event-context.test.cjs",
  "terra-death-causes-diversity.test.cjs",
  "v87_rhodes_landship_reforms.test.cjs",
  "v87_sim_audit_fixes_and_metrics.test.cjs",
  "v88_simulation_audit_reforms.test.cjs",
  "v88_event_coherence_and_repetition_reforms.test.cjs",
  "v88_audit_fixes_xss_and_causes.test.cjs",
  "v88_system_audit_fixes.test.cjs",
  "v88_language_system.test.cjs",
  "v88_timeline_local_events.test.cjs",
  "v88_history_scope_and_pending.test.cjs",
  "v88_historical_roaming_contract.test.cjs",
  "v88_roaming_school_absence.test.cjs",
  "v88_roaming_work_family_boundaries.test.cjs",
  "v88_roaming_ui_roundtrip.test.cjs",
  "v88_regional_career_outcomes.test.cjs",
  "v88_regional_promotion_history.test.cjs",
  "v88_yan_court_spring_eligibility.test.cjs",
  "v88_regional_choice_seasonal_calendar.test.cjs",
  "v88_regional_daily_seasonal_calendar.test.cjs",
  "v88_death_job_and_year_basis.test.cjs",
  "v88_language_school_scopes.test.cjs",
  "v88_effect_subject_finance_and_infection.test.cjs",
  "v88_outcome_followup_lineage.test.cjs",
  "v88_relationship_flag_lifecycle.test.cjs",
  "v88_cohabitation_residence_accounting.test.cjs",
  "v88_family_spouse_co_residence_events_and_roster.test.cjs",
  "v88_historical_catalog_schema_and_sources.test.cjs",
  "v88_crisis_event_priority.test.cjs",
  "v88_regional_crisis_leisure_scope.test.cjs",
  "v88_expiring_followup_priority.test.cjs",
  "v88_age_cutoff_competing_followups.test.cjs",
  "v88_annual_deadline_capacity.test.cjs",
  "v88_deadline_coverage_metrics.test.cjs",
  "v88_long_life_state_reproductions.test.cjs",
  "v88_ursus_katorga_custody_lifecycle.test.cjs",
  "v88_followup_elapsed_from_status.test.cjs",
  "v88_infected_organization_exit_consistency.test.cjs",
  "v88_infected_org_reentry_suspension_age.test.cjs",
  "v88_kazdel_child_family_memory_context.test.cjs",
  "v88_adult_child_contact_target_and_funds.test.cjs",
  "v88_family_child_future_and_memories.test.cjs",
  "v88_affiliation_goal_closure.test.cjs",
  "v88_affiliation_goal_outcome_branches.test.cjs",
  "v88_workplace_goal_departure_contracts.test.cjs",
  "v88_rejected_career_and_short_contract_goals.test.cjs",
  "v88_rhine_and_rhodes_departure_lifecycle.test.cjs",
  "v88_higashi_and_siracusa_retirement_goals.test.cjs",
  "v88_zelgrad_post_settlement_lifecycle.test.cjs",
  "v88_zelgrad_second_job_loss_and_mobility.test.cjs",
  "v88_affiliation_legacy_event_boundaries.test.cjs",
  "v88_reunion_goal_transition.test.cjs",
  "v88_cross_faction_affiliation_transitions.test.cjs",
  "v88_student_familia_status_debt.test.cjs",
  "v88_currency_display.test.cjs",
  "v88_multi_child_diagnosis_target.test.cjs",
  "v88_sibling_exposure_individual_targets.test.cjs",
  "v88_spouse_sibling_medical_funds.test.cjs",
  "v88_separate_spouse_sibling_annual_reconciliation.test.cjs",
  "v88_spouse_oneoff_and_annual_receipt_idempotency.test.cjs",
  "v88_multi_child_annual_family_budget_reconciliation.test.cjs",
  "v88_divorce_child_support_recipient_receipts.test.cjs",
  "v88_multi_child_medical_quote_and_payer.test.cjs",
  "v88_romance_lifecycle_coherence.test.cjs",
  "ui-summary-focus.test.cjs",
  "ui-log-years.test.cjs",
  "ui-choice-presentation.test.cjs",
  "ui-log-archive.test.cjs",
  "ui-ending-chart.test.cjs",
  "ui-record-evidence.test.cjs",
  "ending-comparison.test.cjs",
  "ui-summary-display-boundaries.test.cjs",
  "ui-title-resume.test.cjs",
  "annual-phases.test.cjs",
  "audit-diagnostics.test.cjs",
  "data-fragments.test.cjs",
  "data-modules.test.cjs",
  "eligibility-rules.test.cjs",
  "log-modes.test.cjs",
  "rule-api.test.cjs",
  "state-ownership.test.cjs",
  "v86_person_ties.js",
  "v87_affiliation_career_paths.js",
  "v87_affiliation_career_ursus_mine.js",
  "v87_birth_year_locality.js",
  "v87_bolivar_upland_lifecourse.js",
  "v87_catastrophe_lifecourse.js",
  "v87_class_locality_history.js",
  "v87_close_knowledge.js",
  "v87_close_reactions.js",
  "v87_columbia_workplace_safety_lifecycle.js",
  "v87_dev_simulation_diagnostics.js",
  "v87_discrimination_family_residence.js",
  "v87_discrimination_incident_provenance.js",
  "v87_discrimination_laterano_border_lifepath.js",
  "v87_discrimination_lifecycles.js",
  "v87_discrimination_resume_roundtrip.js",
  "v87_education_path.js",
  "v87_exclusion_organizer_infected.js",
  "v87_exposure_lifecycle.js",
  "v87_facility_access.js",
  "v87_facility_people_history.js",
  "v87_family_loss_aftercare.js",
  "v87_hardline_sarkaz_employer_lifecycle.js",
  "v87_historical_availability.js",
  "v87_household_accounting.js",
  "v87_iberia_recovery_lifecourse.js",
  "v87_illness_work_transition.js",
  "v87_infected_organization_operations.js",
  "v87_infection_workplace_lifecycle.js",
  "v87_information_claim_resume_roundtrip.js",
  "v87_information_conflict_pair.js",
  "v87_information_infection_awareness.js",
  "v87_information_organization_conflict_pair.js",
  "v87_information_organization_transmission.js",
  "v87_kazdel_displaced_lifecycle.js",
  "v87_kazdel_displacement.js",
  "v87_kazimierz_information_route.js",
  "v87_kazimierz_knight_life.js",
  "v87_lei_noble_lifepath.js",
  "v87_leithanian_civic_noble_lifecycle.js",
  "v87_life_text_context.js",
  "v87_locality_pressure_history.js",
  "v87_medical_access_aftermath.js",
  "v87_mutual_aid_lifecycles.js",
  "v87_public_text_repairs.js",
  "v87_reunion_lifecycle.js",
  "v87_rhodes_lifecycle.js",
  "v87_rhodes_medical_referral_lifecycle.js",
  "v87_sargon_contract_lifecourse.js",
  "v87_sargon_water_lifecourse.js",
  "v87_siracusa_family_lifecourse.js",
  "v87_siracusa_market_trade_route.js",
  "v87_spouse_infection_care_chain.js",
  "v87_urban_housing_life.js",
  "v87_ursus_student_reentry.js",
  "v87_ursus_zelgrad_displaced_work.js",
  "v87_ursus_zelgrad_evacuation.js",
  "v87_ursus_zelgrad_recruitment.js",
  "v87_war_mortality_scope.js",
  "v87_work_contract_history.js"
]);
const cachePath=path.join(root,'.test-cache.json'),cacheLimit=64*1024;
const extraInputs={'audit-diagnostics.test.cjs':['tests/fixtures/audit-diagnostics-v87.json']};
const help='Usage: node tools/check-efficient.cjs [list | syntax | run TEST.js ...] [--dry-run] [--rerun-reason REASON]\nNo arguments: help only. Only high-rated tests are registered.\nNo core/all/bounded/legacy command, source copies, archives, or output directories.\nUnchanged selected tests are skipped; cache is one overwritten file, at most 64 KiB.\n';
function parse(args){
 if(!args.length||(args.length===1&&['--help','-h','help'].includes(args[0])))return null;
 const command=args[0],files=[];let dry=false,reason=null;
 if(!['list','syntax','run'].includes(command))throw Error('Unknown command: '+command);
 for(let i=1;i<args.length;i++){
  const value=args[i];
  if(value==='--dry-run'){if(dry)throw Error('Duplicate --dry-run');dry=true;}
 else if(value==='--rerun-reason'){if(reason!==null)throw Error('Duplicate reason');reason=args[++i]?.trim();if(!reason||reason.startsWith('--')||reason.length>200)throw Error('A specific rerun reason is required');}
  else if(value.startsWith('--'))throw Error('Unknown option: '+value);
  else if(command==='run'){
   const file=value.replaceAll('\\','/').replace(/^tests\//,'');
   if(!approved.includes(file))throw Error('Not a registered high-rated test: '+value);
   if(files.includes(file))throw Error('Duplicate test: '+file);
   files.push(file);
  }else throw Error('Unexpected argument: '+value);
 }
 if(command==='run'&&!files.length)throw Error('Select at least one test; use list to see approved files');
 if(command==='list'&&(dry||reason))throw Error('list does not accept execution options');
 return{command,files,dry,reason};
}
function readCache(){
 try{
  const stat=fs.lstatSync(cachePath);
  if(stat.isSymbolicLink())throw Error('Cache path must not be a link');
  if(stat.size>cacheLimit)return{};
  const value=JSON.parse(fs.readFileSync(cachePath,'utf8')),out={};
  for(const key of ['@syntax',...approved])if(value[key]&&/^[a-f0-9]{64}$/.test(value[key].key)&&Number.isFinite(value[key].ms))out[key]={key:value[key].key,ms:value[key].ms};
  return out;
 }catch(error){if(error.message==='Cache path must not be a link')throw error;return{};}
}
function saveCache(cache){
 const output=JSON.stringify(cache)+'\n';
 if(Buffer.byteLength(output)>cacheLimit)throw Error('Cache size limit exceeded');
 if(fs.existsSync(cachePath)&&fs.lstatSync(cachePath).isSymbolicLink())throw Error('Cache path must not be a link');
 fs.writeFileSync(cachePath,output);
}
function digest(files,prefix=''){
 const hash=createHash('sha256').update(process.version).update(prefix);
 for(const file of [...new Set(files)].sort()){hash.update('\0'+file+'\0');hash.update(fs.readFileSync(path.join(root,file)));}
 return hash.digest('hex');
}
function dependencies(file,seen=new Set()){
 if(seen.has(file))return seen;seen.add(file);
 if(!/\.(?:js|cjs)$/.test(file))return seen;
 const source=fs.readFileSync(path.join(root,file),'utf8');
 for(const match of source.matchAll(/require\(['"](\.[^'"]+)['"]\)/g)){
  const target=path.resolve(root,path.dirname(file),match[1]);
  if(!target.startsWith(root+path.sep))throw Error('Test dependency outside project: '+file);
  const found=[target,target+'.js',target+'.cjs'].find(p=>fs.existsSync(p)&&fs.statSync(p).isFile());
  if(!found)throw Error('Missing test dependency: '+file+' -> '+match[1]);
  dependencies(path.relative(root,found).replaceAll('\\','/'),seen);
 }
 return seen;
}
function main(args){
 let request;try{request=parse(args);}catch(error){console.error(error.message+'\n'+help);return 2;}
 if(!request){console.error(help);return 1;}
 if(request.command==='list'){console.log(approved.join('\n'));return 0;}
 if(request.dry){console.log(JSON.stringify({command:request.command,tests:request.files,rerunReason:request.reason,writes:false}));return 0;}
 const cache=readCache(),publicFiles=runtime.publicFiles(root);
 const common=digest([...publicFiles,'tools/runtime.cjs','tools/check-efficient.cjs']);
 if(request.reason)console.log('Explicit rerun: '+request.reason);
 if(request.command==='syntax'){
  const expectedRevision=require('./update-version.cjs').revision(root);
  if(!fs.readFileSync(path.join(root,'js/version.js'),'utf8').includes('const ENGINE_REVISION = '+JSON.stringify(expectedRevision)+';')) {
    console.error('Stale engine revision: expected '+expectedRevision+'; run node tools/update-version.cjs');return 1;
  }
  if(!request.reason&&cache['@syntax']?.key===common){console.log('REUSED syntax: unchanged runtime');return 0;}
  const start=Date.now();
  try{for(const file of publicFiles.filter(f=>f.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});}
  catch(error){delete cache['@syntax'];saveCache(cache);console.error(error.stack);return 1;}
  cache['@syntax']={key:common,ms:Date.now()-start};saveCache(cache);
  console.log('PASSED syntax: '+cache['@syntax'].ms+' ms');return 0;
 }
 for(const file of request.files){
  const inputs=[...dependencies('tests/'+file),...(extraInputs[file]||[])],key=digest(inputs,common);
  if(!request.reason&&cache[file]?.key===key){console.log('REUSED '+file+': unchanged inputs');continue;}
  const start=Date.now(),result=spawnSync(process.execPath,['tests/'+file],{cwd:root,encoding:'utf8',timeout:file==='v87_dev_simulation_diagnostics.js'?120000:30000,maxBuffer:256*1024});
  if(result.status!==0){delete cache[file];saveCache(cache);console.error('FAILED '+file+'\n'+(result.stderr||result.stdout||result.error?.message||'No diagnostic output').slice(-16000));return 1;}
  cache[file]={key,ms:Date.now()-start};console.log('PASSED '+file+': '+cache[file].ms+' ms');
 }
 saveCache(cache);return 0;
}
if(require.main===module){try{process.exitCode=main(process.argv.slice(2));}catch(error){console.error(error.stack);process.exitCode=1;}}
module.exports={parse,approved};
