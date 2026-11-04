function renderAdvancedSettings(){
  const target=document.getElementById('advanced-settings-controls');if(!target)return;
  const live=!!S&&!S.dead,settings=live?lifePlaySettings(S):newLifePlaySettings();
  const toggle=(key,label)=>'<label class="ui-settings-toggle"><input type="checkbox" data-play-setting="'+key+'"'+(settings[key]?' checked':'')+'> '+label+'</label>';
  const levels=(key,label)=>'<label for="advanced-'+key+'">'+label+'</label><select id="advanced-'+key+'" data-play-setting="'+key+'">'+
    PLAY_LEVELS.map((name,i)=>'<option value="'+i+'"'+(settings[key]===i?' selected':'')+'>'+name+'</option>').join('')+'</select>';
  const options=(key,label,entries)=>'<label for="advanced-'+key+'">'+label+'</label><select id="advanced-'+key+'" data-advanced-ui="'+key+'">'+
    entries.map(([value,text])=>'<option value="'+value+'"'+(UI_PREFERENCES[key]===value?' selected':'')+'>'+text+'</option>').join('')+'</select>';
  target.innerHTML='<p class="nt">'+(live?'この人生の設定。変更は次の人生の初期値にも反映します。':'新しい人生の初期設定。')+'</p>'+
    toggle('compulsoryEducation','義務教育自動化')+toggle('higherEducation','高等教育自動化')+
    '<p class="nt">小学校・中学校／高校・大学などで、最初の希望だけを選び、その後の手続と卒業までの判定を自動で進めます。通える範囲を優先し、借入・転居は行いません。入学や卒業を保証する設定ではありません。</p>'+
    levels('eventFrequency','通常イベントの頻度')+levels('choiceRatio','ランダム選択イベントの比率')+
    '<p class="nt">頻度と比率は翌年から反映します。強制・優先イベントは減らしません。'+
    (live&&S.eventSchedule?.year===S.year?'今年の設定：頻度 '+PLAY_LEVELS[S.eventSchedule.eventFrequency]+'／比率 '+PLAY_LEVELS[S.eventSchedule.choiceRatio]+'。':'')+'</p>'+
    options('choiceResume','選択確定後の進行',[['legacy','従来どおり'],['resume','選択前の速度へ戻す'],['pause','停止する']])+
    '<label class="ui-settings-toggle"><input type="checkbox" data-advanced-ui="pauseImportant"'+(UI_PREFERENCES.pauseImportant?' checked':'')+'> 重要な通知で一時停止する</label>'+
    '<p class="nt">家族の死亡、新しい診断、学校の継続不能などを知らせたときに停止します。</p>'+
    options('educationNotices','自動進学の通知',[['compact','簡潔'],['detailed','詳細']])+
    '<p class="nt">簡潔では入学・中断などの節目を表示します。途中の手続や会計は記録に残ります。</p>'+
    '<button type="button" id="advanced-reset">高度な設定だけを初期値へ戻す</button><p id="advanced-settings-status" role="status"></p>';
  target.querySelectorAll('[data-play-setting]').forEach(input=>input.addEventListener('change',()=>{
    setPlaySetting(input.dataset.playSetting,input.type==='checkbox'?input.checked:Number(input.value));
  }));
  target.querySelectorAll('[data-advanced-ui]').forEach(input=>input.addEventListener('change',()=>{
    setUIPreference(input.dataset.advancedUi,input.type==='checkbox'?input.checked:input.value);
  }));
  document.getElementById('advanced-reset')?.addEventListener('click',resetAdvancedSettings);
}
function setPlaySetting(key,value){
  if(!Object.hasOwn(PLAY_SETTINGS_DEFAULTS,key)||key==='version')return false;
  const proposed={...PLAY_SETTINGS_DEFAULTS,[key]:value};if(!validPlaySettings(proposed))return false;
  const live=S&&!S.dead,settings=live?lifePlaySettings(S):newLifePlaySettings(),next={...settings,[key]:value};
  if(live){S.playSettings=next;SV();rd();}
  try{localStorage.setItem(PLAY_SETTINGS_KEY,JSON.stringify(next));}catch{}
  const status=document.getElementById('advanced-settings-status');
  if(status)status.textContent=['eventFrequency','choiceRatio'].includes(key)?'設定を保存しました。イベント頻度と比率は翌年から反映します。':'設定を保存しました。表示中の選択は自動確定しません。';
  return true;
}
function resetAdvancedSettings(){
  if(S&&!S.dead){S.playSettings={...PLAY_SETTINGS_DEFAULTS};SV();}
  try{localStorage.setItem(PLAY_SETTINGS_KEY,JSON.stringify(PLAY_SETTINGS_DEFAULTS));}catch{}
  for(const [key,value] of Object.entries({choiceResume:'legacy',pauseImportant:false,educationNotices:'compact'}))setUIPreference(key,value);
  renderAdvancedSettings();
  const status=document.getElementById('advanced-settings-status');if(status)status.textContent='高度な設定を初期値へ戻しました。頻度と比率は翌年から反映します。';
}
function initializeAdvancedSettings(){renderAdvancedSettings();}
