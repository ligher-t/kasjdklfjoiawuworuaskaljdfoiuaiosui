// Simulation settings belong to the life; browser values seed a new life only.
const PLAY_SETTINGS_DEFAULTS=Object.freeze({version:1,compulsoryEducation:true,higherEducation:false,eventFrequency:2,choiceRatio:2});
const PLAY_SETTINGS_KEY='terra-play-defaults-v1';
const PLAY_LEVELS=['極少','少','中','多','極多'];
function normalizePlaySettings(value={}){
  return {version:1,compulsoryEducation:typeof value?.compulsoryEducation==='boolean'?value.compulsoryEducation:true,
    higherEducation:typeof value?.higherEducation==='boolean'?value.higherEducation:false,
    eventFrequency:Number.isInteger(value?.eventFrequency)&&value.eventFrequency>=0&&value.eventFrequency<5?value.eventFrequency:2,
    choiceRatio:Number.isInteger(value?.choiceRatio)&&value.choiceRatio>=0&&value.choiceRatio<5?value.choiceRatio:2};
}
function newLifePlaySettings(){
  if(HL)return {...PLAY_SETTINGS_DEFAULTS};
  try{return normalizePlaySettings(JSON.parse(localStorage.getItem(PLAY_SETTINGS_KEY)||'{}'));}catch{return {...PLAY_SETTINGS_DEFAULTS};}
}
function lifePlaySettings(s){return normalizePlaySettings(s?.playSettings);}
function validPlaySettings(value){
  const normalized=normalizePlaySettings(value);return !!value&&!Array.isArray(value)&&Object.keys(value).length===Object.keys(normalized).length&&Object.keys(normalized).every(key=>value[key]===normalized[key]);
}
function playFrequencyCount(n,level){
  if(level===2)return n;
  const value=Math.min(12,n*[1/3,2/3,1,1.5,2][level]),whole=Math.floor(value),fraction=value-whole;
  return whole+(fraction>0&&R()<fraction?1:0);
}
function playChoiceChance(s){
  const level=s?.eventSchedule?.year===s.year?s.eventSchedule.choiceRatio:lifePlaySettings(s).choiceRatio;
  return Math.min(1,MAJ_PER_SLOT*[0.25,0.5,1,2,4][level]);
}
function educationAutoStage(s,stage){
  const settings=lifePlaySettings(s);
  return ['primary','lower'].includes(stage)?settings.compulsoryEducation:
    ['upper','university','vocational','arts'].includes(stage)?settings.higherEducation:false;
}
function importantLifeNotification(s,kind){
  if(!s||s!==S||HL||typeof UI_PREFERENCES==='undefined'||!UI_PREFERENCES.pauseImportant)return;
  if(!['parent-death','family-death','diagnosis','school-interruption'].includes(kind))return;
  s.importantNotificationPause={year:s.year,month:s.mo||null,kind};
  if(typeof TERMINAL_LEDGER!=='undefined'&&TERMINAL_LEDGER)TERMINAL_LEDGER.resumeSpeed=null;
  play(0);
}
function auditPlaySettings(s){
  const problems=[];
  if(s.playSettings!=null&&!validPlaySettings(s.playSettings))problems.push('高度な進行設定が不正');
  const schedule=s.eventSchedule;
  if(schedule!=null&&(!Number.isInteger(schedule.year)||schedule.year>s.year||
    !Number.isInteger(schedule.choiceRatio)||schedule.choiceRatio<0||schedule.choiceRatio>4||
    !Number.isInteger(schedule.eventFrequency)||schedule.eventFrequency<0||schedule.eventFrequency>4||
    !Array.isArray(schedule.servicePositions)||schedule.servicePositions.some(x=>!Number.isFinite(x)||x<0||x>=1)))problems.push('イベント設定の適用年度・月次枠が不正');
  return problems;
}
