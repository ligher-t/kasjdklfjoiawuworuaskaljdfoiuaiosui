'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const vm = require('node:vm');
const { context } = require('./support/annual-cases.cjs');

const root = path.resolve(__dirname, '..');
const { ctx } = context(root);
const run = code => JSON.parse(vm.runInContext('JSON.stringify((() => {' + code + '})())', ctx));
const runIn = (target, code) => JSON.parse(vm.runInContext('JSON.stringify((() => {' + code + '})())', target));

const result = run(`
  born({seed: 1110701, by: 1064, region: 'クルビア'});
  S.age = 34;
  S.year = 1098;
  S.mo = 4;
  S.cash = 1000000;
  S.biasInfected = 100;
  if (!S.t || typeof S.t.n !== 'string') throw Error('出生時の実気質が初期状態にない');
  const witnessChild = {id:'test-witness-child-1',nm:'ナナ',d:0,by:1082,
    householdStatus:'dependent',contactState:'regular',lifeStatus:'alive'};
  S.kids = [witnessChild];
  S.siblings = [];
  S.par.fa ||= {jobHistory: [], knownJobId: 0, knownJobChangeCount: 0,
    jobKnownYear: S.year, workReviewYear: S.year, workShare: 1, healthUpdatedYear: S.year,
    treatmentPriority: 0.5, treatmentHistory: []};
  Object.assign(S.par.fa, {id: 'test-victim-father', nm: 'オルハ', d: 0, by: 1035, health: 62, inf: 1,
    treatmentPriority: 0.5, residenceRegion: 'クルビア', lifeStatus: 'alive'});
  S.par.fa.healthUpdatedYear ??= S.year;
  S.par.fa.workShare ??= 1;
  S.par.fa.jobHistory ||= [];
  S.par.fa.knownJobId ??= 0;
  S.par.fa.knownJobChangeCount ??= 0;
  S.par.fa.jobKnownYear ??= S.year;
  S.par.fa.workReviewYear ??= S.year;
  S.par.mo = null;
  S.sp = {
    id: 'test-spouse-1', nm: 'ミラ', d: 0, j: 0,
    residenceRegion: 'クルビア', residenceBaseId: S.residenceBase?.id,
    marriedYear: S.year - 1, sharesHousehold: true, householdArrangement: 'shared'
  };
  S.romance = {id:'test-romance-record-1',personId:'test-spouse-1',name:'ミラ',stage:'cohabiting',
    metYear:S.year-4,stageSinceYear:S.year-2};
  S.friendContact = {id: 'test-friend-1', nm: 'レン', status: 'present', kind: 'friend', by: 1070,
    r: S.r, lifeStatus: 'alive', knownLifeStatus: 'alive', pendingMissingNotices: [],
    pendingFoundNotices: [], pendingRecontactNotices: [], recontactIntent: 'none',
    knownRecontactStatus: 'none', recontactAttemptCount: 0, lifeHistory: [], knownLifeHistory: []};
  S.nextRelativeId = 1000;

  if (S.violenceState.counters.directDeaths !== 0 ||
      violenceCivilianHomicideEligible(S, 'infected'))
    throw Error('出生時の気質・偏見だけで致死行為が解放された');
  const militaryOnlyEvidence = ['active-military-duty', 'present-at-theater', 'confirmed-combatant-target', 'death-confirmed'];
  const unauthorizedMilitaryAssessment = violenceActionAssessment(S, {action:'resolve-scene', scenarioId:'membership-only-combat',
    kind:'combat-lethal', context:'military', decision:'fired', outcome:'confirmed-death',
    victimRef:{kind:'anonymous-person',localOrdinal:1}, witnesses:[], deathEvidence:'observed',
    deathEvidenceId:'death-confirmed', evidenceIds:militaryOnlyEvidence},
    {kind:'choice',id:'membership-only-combat',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo}, 'membership-only-combat');
  if (unauthorizedMilitaryAssessment.ok || unauthorizedMilitaryAssessment.reason !== 'active-military-posting-required' ||
      S.violenceState.counters.directDeaths !== 0)
    throw Error('軍務経験や戦闘現場への出張なしに、軍人の殺害記録を付与できる');
  const beforeRead = JSON.stringify(S.violenceState), rngBeforeRead = RANDOM_STATE;
  violenceEventEligible(EV.find(event => event.id === 'family_daily_small_care'), S);
  if (JSON.stringify(S.violenceState) !== beforeRead || RANDOM_STATE !== rngBeforeRead)
    throw Error('暴力関係イベントの適格性判定が状態または乱数を変更した');

  const applyAction = (id, action, choiceIndex = 0, outcomeIndex = 0) => {
    TRACE_RESOLUTION = {kind: 'choice', id, choiceIndex, outcomeIndex, year: S.year, month: S.mo};
    ap({violenceAction: action});
  };
  applyAction('formation-one', {
    action: 'record-belief', targetGroup: 'infected', behavior: 'endorse', delta: 30,
    evidenceId: 'first-public-endorsement', basis: '排斥集会で本人が賛同した', audience: 'public'
  });
  applyAction('formation-two', {
    action: 'record-belief', targetGroup: 'infected', behavior: 'endorse', delta: 30,
    evidenceId: 'second-public-endorsement', basis: '別の集会でも本人が賛同した', audience: 'public'
  });
  if (violenceCivilianHomicideEligible(S, 'infected'))
    throw Error('具体的な標的への暴行前に殺害機会が解放された');

  const assault = {
    action: 'resolve-scene', scenarioId: 'test-specific-assault', kind: 'assault', context: 'civilian',
    decision: 'struck-target', outcome: 'injured', targetGroup: 'infected',
    victimRef: {kind: 'family-person', id: 'test-victim-father'},
    witnesses: [{kind: 'family-role', role: 'spouse'}],
    evidenceIds: ['visible-oripathy-signs', 'victim-present-at-scene', 'direct-assault', 'scene-observed-injury'],
    followupAfterMonths: 1
  };
  const unknownTargetAssessment = violenceActionAssessment(S, {
    ...assault, evidenceIds: ['victim-present-at-scene', 'direct-assault', 'scene-observed-injury']
  }, TRACE_RESOLUTION, 'test_assault_event');
  if (unknownTargetAssessment.ok || unknownTargetAssessment.reason !== 'target-group-not-known-to-actor')
    throw Error('感染を知る根拠のない標的化を許した');
  applyAction('test_assault_event', assault);
  if (S.violenceState.counters.directDeaths !== 0 ||
      S.violenceState.counters.nonlethalAssaults !== 1 ||
      !violenceCivilianHomicideEligible(S, 'infected'))
    throw Error('非致死暴行が死亡として数えられるか、記録されなかった');
  const homicide = {
    action: 'resolve-scene', scenarioId: 'test-witnessed-civilian-homicide',
    kind: 'intentional-killing', context: 'civilian', decision: 'struck-to-kill',
    outcome: 'confirmed-death', targetGroup: 'infected',
    victimRef: {kind: 'incident-victim', sourceEventId: 'test_assault_event', localOrdinal: 1},
    witnesses: [{kind: 'family-role', role: 'spouse'}, {kind: 'family-person', id: 'test-witness-child-1'}],
    deathEvidence: 'confirmed', deathEvidenceId: 'medical-death-confirmation',
    authorityAction: 'detain-and-investigate', witnessNorm: 'ordinary-civilian-taboo',
    evidenceIds: ['direct-lethal-act', 'medical-death-confirmation', 'authority-witness']
  };
  const homicideTrace = {...TRACE_RESOLUTION, id: 'test_homicide_event'},
    earlyFollowup = violenceActionAssessment(S, homicide, homicideTrace, 'test_homicide_event');
  if (earlyFollowup.ok || earlyFollowup.reason !== 'incident-followup-not-open')
    throw Error('予定月より前に同じ被害者への後続事件を開ける');
  const originalRegion = S.res.n;
  S.res.n = 'ヴィクトリア';
  const unsupportedLaw = violenceActionAssessment(S, homicide, homicideTrace, 'test_homicide_event');
  S.res.n = originalRegion;
  if (unsupportedLaw.ok || unsupportedLaw.reason !== 'local-legal-profile-not-configured')
    throw Error('地域法制度のない地域でクルビアの刑罰モデルを適用できる');
  S.mo = 5;
  const fatherStatus = {d: S.par.fa.d, deathYear: S.par.fa.deathYear, lifeStatus: S.par.fa.lifeStatus};
  S.par.fa.d = 1097; S.par.fa.deathYear = 1097; S.par.fa.lifeStatus = 'dead';
  const staleVictim = violenceActionAssessment(S, homicide, homicideTrace, 'test_homicide_event');
  Object.assign(S.par.fa, fatherStatus);
  if (staleVictim.ok || staleVictim.reason !== 'incident-victim-not-alive')
    throw Error('後から別の原因で死亡した被害者に殺害結果を重ねた');
  const cashBefore = S.cash;
  applyAction('test_homicide_event', homicide);
  const stateAfterHomicide = JSON.stringify(S.violenceState),
    duplicate = applyViolenceAction(S, homicide, TRACE_RESOLUTION, 'test_homicide_event');
  if (!duplicate.duplicate || JSON.stringify(S.violenceState) !== stateAfterHomicide)
    throw Error('同一の殺害結果を再適用できる');
  const changedReplay = violenceActionAssessment(S, {...homicide, decision: 'different-action'}, TRACE_RESOLUTION, 'test_homicide_event');
  if (changedReplay.ok || changedReplay.reason !== 'receipt-payload-mismatch')
    throw Error('同一receiptへ別の殺害内容をすり替えられる');
  const victimId = S.violenceState.incidents.at(-1).victims[0].victimId,
    tie = S.personTies.links['test-spouse-1'],
    childContactRandomBefore = RANDOM_STATE,
    childFutureContactAllowed = violenceEventEligible(EV.find(event => event.id === 'family_child_future'), S);
  if (S.violenceState.victims[victimId].actualCondition !== 'confirmed-dead' ||
      S.violenceState.counters.directDeaths !== 1 || S.cash !== cashBefore ||
      S.par.fa.d !== S.year || S.par.fa.deathCause !== '暴力事件による死亡' ||
      S.par.fa.deathKnownYear !== S.year || S.par.fa.deathNoticePending !== false)
    throw Error('確定死亡の人物記録または一回性が不正');
  if (!S.violenceState.familyContactBlocks.some(row => row.personId === 'test-spouse-1' && row.status === 'active') ||
      !S.violenceState.familyContactBlocks.some(row => row.personId === 'test-witness-child-1' && row.status === 'active') ||
      childFutureContactAllowed || RANDOM_STATE !== childContactRandomBefore ||
      S.sp.violenceContactBoundary !== 'no-routine-contact' || tie?.standing !== 0)
    throw Error('その場で見た配偶者への関係・接触結果がない');
  const blockedParent = {id:'blocked-parent-contact',nm:'証人の親',d:0,health:35,inf:1},
    parentBoundaryState = {...S,par:{fa:null,mo:blockedParent},violenceState:{...S.violenceState,
      familyContactBlocks:[...S.violenceState.familyContactBlocks,
        {personId:blockedParent.id,incidentId:S.violenceState.incidents.at(-1).id,openedAt:{year:S.year,month:S.mo},status:'active'}]}};
  if (violenceParentForEvent(parentBoundaryState,'fam_care') ||
      violenceEventEligible(EV.find(event=>event.id==='fam_care'),parentBoundaryState))
    throw Error('事件を直接見た親を、介護や通常連絡イベントの対象として選ぶ');
  const blockedColleague = {id:'blocked-rhodes-colleague',kind:'rhodes',nm:'目撃した同僚',actualStatus:'working'},
    colleagueBoundaryState = {...S,
      personTies:{...(S.personTies||{}),rhodesColleague:blockedColleague,rhodesColleagues:[blockedColleague]},
      violenceState:{...S.violenceState,familyContactBlocks:[...S.violenceState.familyContactBlocks,
        {personId:blockedColleague.id,incidentId:S.violenceState.incidents.at(-1).id,
          openedAt:{year:S.year,month:S.mo},status:'active'}]},
      lifeRecord:{...S.lifeRecord,affiliations:[...(S.lifeRecord.affiliations||{}),
        {id:'rhodes-staff',status:'active',episodes:[{startedYear:S.year,endedYear:null}]}]}};
  const colleagueFollowupAllowed = violenceEventEligible(EV.find(event=>event.id==='sr_rhodes_colleague_followup'),colleagueBoundaryState);
  if (colleagueFollowupAllowed || !violencePersonContactBlocked(colleagueBoundaryState,blockedColleague))
    throw Error('目撃したロドス同僚との日常作業が通常イベント候補から除かれない');
  recordPersonTieAction(colleagueBoundaryState,{kind:'rhodes',action:'introduced'});
  if (colleagueBoundaryState.personTies.rhodesColleague?.id === blockedColleague.id ||
      !violenceEventEligible(EV.find(event=>event.id==='sr_rhodes_colleague_followup'),colleagueBoundaryState))
    throw Error('目撃した同僚との接触を遮断した後、新たな同僚関係を記録できない');
  if (S.violenceState.familyContactBlocks.some(row => row.personId === 'test-friend-1') ||
      S.personTies.links['test-friend-1'] ||
      S.violenceState.awareness.some(row => row.personId === 'test-friend-1'))
    throw Error('現場にいなかった友人へ知識や関係変化が伝播した');
  if (!S.fl.detained || S.violenceState.proceedings[0]?.status !== 'investigation-open')
    throw Error('直接目撃と確認記録を伴う殺人の捜査が開かれなかった');
  if (violenceEventEligible(EV.find(event => event.id === 'family_daily_spouse_cooking'), S) ||
      violenceEventEligible(EV.find(event => event.id === 'family_spouse_migration_choice'), S) ||
      violenceEventEligible(EV.find(event => event.id === 'romance_followup'), S) ||
      !violenceEventEligible(EV.find(event => event.id === 'family_spouse_independent_move_notice'), S) ||
      !violenceEventEligible(EV.find(event => event.id === 'family_spouse_death'), S))
    throw Error('殺害を直接見た配偶者に通常の親密イベントが出る');
  S.romance.personId = null;
  S.romance.name = 'レン';
  if (!violenceEventEligible(EV.find(event => event.id === 'romance_followup'), S))
    throw Error('目撃していない交際相手まで関係境界に巻き込まれた');

  S.siblings = [{id: 'test-sibling-1', nm: 'ユウ', d: 0, contactState: 'regular', knownRegion: 'クルビア'}];
  if (!violenceEventEligible(EV.find(event => event.id === 'family_daily_small_care'), S) ||
      violenceFamilyDailyTarget(S)?.person?.id !== 'test-sibling-1')
    throw Error('非目撃の家族との日常まで遮断されたか、証人が対象に選ばれた');
  const auditProblems = [];
  auditViolenceState(S, auditProblems);
  if (auditProblems.length) throw Error('暴力事件台帳の監査に失敗: ' + auditProblems.join('; '));

  const proceeding = S.violenceState.proceedings[0];
  S.year = proceeding.reviewAt.year;
  S.mo = proceeding.reviewAt.month;
  applyAction('violence_civilian_homicide_adjudication', {
    action: 'adjudicate-case', incidentId: '$due-violence-case', caseType: 'civilian-homicide'
  });
  if (proceeding.status !== 'convicted' || proceeding.sentence?.years !== 3 ||
      proceeding.sentence?.fine !== 80000 || S.fl.detained !== 1 || S.job !== 0)
    throw Error('捜査後の判決・収容・離職が事件に結び付かない');
  S.year = proceeding.releaseAt.year;
  S.mo = proceeding.releaseAt.month;
  applyAction('violence_civilian_homicide_release', {
    action: 'complete-sentence', incidentId: '$due-violence-release', caseType: 'civilian-homicide'
  });
  if (S.fl.detained || proceeding.status !== 'sentence-served' ||
      !S.violenceState.familyContactBlocks.some(row => row.personId === 'test-spouse-1' && row.status === 'active'))
    throw Error('刑期終了時の解放または目撃した配偶者への継続影響が不正');
  TRACE_RESOLUTION = {kind: 'choice', id: 'homicide-victim-ref-reuse', choiceIndex: 0, outcomeIndex: 0, year: S.year, month: S.mo};
  const reusedVictim = violenceActionAssessment(S, {...homicide, scenarioId: 'new-incident'}, TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  if (reusedVictim.ok || reusedVictim.reason !== 'incident-followup-already-used')
    throw Error('解決済み後日談の被害者参照を別事件で再利用できる');
  const assaultCountBeforeGroup = S.violenceState.counters.nonlethalAssaults;
  applyAction('multi-victim-assault', {action: 'resolve-scene', scenarioId: 'two-person-assault', kind: 'assault',
    context: 'civilian', decision: 'struck-two-people', outcome: 'injured',
    victims: [{kind: 'anonymous-person', localOrdinal: 1}, {kind: 'anonymous-person', localOrdinal: 2}],
    witnesses: [], evidenceIds: ['direct-assault', 'scene-observed-injury']});
  const multiVictimIncident = S.violenceState.incidents.at(-1);
  if (multiVictimIncident.victims.length !== 2 ||
      multiVictimIncident.victims[0].victimId === multiVictimIncident.victims[1].victimId ||
      multiVictimIncident.victims.some(link => S.violenceState.victims[link.victimId].actualCondition !== 'injured') ||
      S.violenceState.counters.nonlethalAssaults - assaultCountBeforeGroup !== 2)
    throw Error('同一事件の被害人数・人物Ref・負傷状態・集計数が一致しない');
  const deathCountBeforeGroup = S.violenceState.counters.directDeaths,
    blockCountBeforeGroup = S.violenceState.familyContactBlocks.length;
  applyAction('multi-victim-defensive-fatality', {action: 'resolve-scene', scenarioId: 'defense-with-two-raiders',
    kind: 'defensive-lethal', context: 'civilian-defense', decision: 'stopped-armed-attack', outcome: 'confirmed-death',
    victims: [{kind: 'anonymous-person', localOrdinal: 1}, {kind: 'anonymous-person', localOrdinal: 2}],
    witnesses: [], deathEvidence: 'observed', deathEvidenceId: 'both-deaths-observed',
    evidenceIds: ['ongoing-attack', 'direct-defensive-action', 'both-deaths-observed']});
  if (S.violenceState.counters.directDeaths - deathCountBeforeGroup !== 2 ||
      S.violenceState.incidents.at(-1).victims.some(link => S.violenceState.victims[link.victimId].actualCondition !== 'confirmed-dead') ||
      S.violenceState.familyContactBlocks.length !== blockCountBeforeGroup)
    throw Error('複数死亡の数値を被害者ごとに同期し、正当防衛を殺人タブーへ誤分類する');
  const schoolSite = activeFacility(S, 'school');
  if (!schoolSite) throw Error('施設関係者の死亡同期を確認する学び舎がない');
  const facilityVictimId = 'violence-test-school-person';
  S.community.people ||= {};
  S.community.people[facilityVictimId] = {id: facilityVictimId, kind: 'school', facilityId: schoolSite.id,
    nm: 'ミナ', by: 1070, metYear: S.year, lastUpdatedYear: S.year, actualStatus: 'working',
    lastRecordedStatus: 'working', knownStatus: 'working', knownFacilityId: schoolSite.id,
    lastKnownYear: S.year, history: [], contacts: []};
  applyAction('facility-person-fatality', {action: 'resolve-scene', scenarioId: 'school-person-fatality',
    kind: 'negligent-fatality', context: 'civilian', decision: 'fatal-workplace-incident', outcome: 'confirmed-death',
    victimRef: {kind: 'facility-person', areaKey: S.community.key, personId: facilityVictimId},
    witnesses: [], deathEvidence: 'confirmed', deathEvidenceId: 'facility-death-confirmed',
    evidenceIds: ['victim-present-at-facility', 'fatal-consequence-confirmed', 'facility-death-confirmed']});
  const facilityVictim = S.community.people[facilityVictimId];
  if (facilityVictim.actualStatus !== 'dead' || facilityVictim.lastRecordedStatus !== 'dead' ||
      facilityVictim.knownStatus !== 'dead' || facilityVictim.deathYear !== S.year ||
      facilityVictim.history.at(-1)?.to !== 'dead' || facilityPersonFor(S, 'school', facilityVictimId) ||
      facilityPersonFor(S, 'school', facilityVictimId, true)?.actualStatus !== 'dead')
    throw Error('施設関係者の確定死亡を離職扱いにせず、実状態・記録・既知状態へ同期しない');
  const childA = {id: 'violence-child-a', nm: 'アニ', d: 0, by: 1082, residenceRegion: 'ヴィクトリア', lifeStatus: 'alive'},
    childB = {id: 'violence-child-b', nm: 'ベン', d: 0, by: 1085, residenceRegion: 'ロドス', lifeStatus: 'alive'};
  S.kids = [childA, childB];
  applyAction('separated-child-fatality', {action: 'resolve-scene', scenarioId: 'specific-child-fatality',
    kind: 'negligent-fatality', context: 'civilian', decision: 'fatal-incident', outcome: 'confirmed-death',
    victimRef: {kind: 'family-person', id: childA.id}, witnesses: [], deathEvidence: 'confirmed',
    deathEvidenceId: 'child-death-confirmed',
    evidenceIds: ['victim-present-at-scene', 'fatal-consequence-confirmed', 'child-death-confirmed']});
  if (childA.d !== S.year || childA.lifeStatus !== 'dead' || childA.deathCause !== '暴力事件による死亡' ||
      childB.d !== 0 || childB.lifeStatus !== 'alive')
    throw Error('別居する一人の子の死亡を、同じ家族内の別の子へ波及させる');
  const priorRegion = S.res, priorJob = S.job, priorAffiliations = S.lifeRecord.affiliations;
  const ursusOrderEvent = EV.find(event => event.id === 'car_urs_guard_choice_captive_order');
  if (!ursusOrderEvent || typeof ursusOrderEvent.show !== 'function')
    throw Error('捕虜への命令を扱う軍務イベントが登録されていない');
  S.res = {...priorRegion, n: 'ウルサス'};
  S.job = 52; // REG_JOBS.urs_guard in the regional career table.
  S.lifeRecord.affiliations = [...(priorAffiliations || []),
    {id: 'ursus-border-mine-guard', status: 'active', role: '炭鉱監視憲兵',
      episodes: [{startedYear:S.year,endedYear:null,roleAtStart:'炭鉱監視憲兵'}], history:[]}];
  if (!affiliationWorkAvailable(S, 'ursus-border-mine-guard') || !ursusOrderEvent.show(S))
    throw Error('現役ウルサス炭鉱監視兵の任地で捕虜への命令イベントを候補化できない');
  const refusalChoice = ursusOrderEvent.c.find(choice => choice.l === '執行を拒み、捕虜へ銃を向けない'),
    executionChoice = ursusOrderEvent.c.find(choice => choice.l === '命令どおりに、拘束された男を撃つ'),
    refusalEffects = refusalChoice?.o?.[0]?.[2], executionEffects = executionChoice?.o?.map(row => row[2]);
  if (!refusalEffects?.violenceAction || !refusalEffects?.lifeAffiliation || executionEffects?.length !== 3)
    throw Error('拒否・実行の結果に記録効果または異なる転帰が接続されていない');
  TRACE_RESOLUTION = {kind:'choice',id:ursusOrderEvent.id,choiceIndex:1,outcomeIndex:0,year:S.year,month:S.mo};
  ap(refusalEffects);
  if (S.violenceState.counters.directDeaths !== 5 ||
      S.lifeRecord.affiliations.find(row => row.id === 'ursus-border-mine-guard')?.role !== '兵舎当番')
    throw Error('捕虜処刑を拒否した兵士の死亡数・任務変更を反映しない');
  const executionAction = executionEffects[0].violenceAction;
  TRACE_RESOLUTION = {kind:'choice',id:ursusOrderEvent.id,choiceIndex:2,outcomeIndex:0,year:S.year,month:S.mo};
  const unprotectedOrder = violenceActionAssessment(S, {...executionAction,
    evidenceIds:executionAction.evidenceIds.filter(id => id !== 'protected-person-target')},
    TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  if (unprotectedOrder.ok || unprotectedOrder.reason !== 'military-action-evidence-incomplete' ||
      S.violenceState.counters.directDeaths !== 5)
    throw Error('捕虜への命令記録が保護対象・命令受領の証拠を要求しない');
  ap(executionEffects[0]);
  if (S.violenceState.counters.directDeaths !== 6 ||
      S.violenceState.incidents.at(-1)?.kind !== 'unlawful-order-execution')
    throw Error('命令に従った確認済みの捕虜殺害が、本人の直接行為として記録されない');
  TRACE_RESOLUTION = {kind:'choice',id:ursusOrderEvent.id,choiceIndex:2,outcomeIndex:2,year:S.year,month:S.mo};
  ap(executionEffects[2]);
  const uncertainVictim = S.violenceState.victims[S.violenceState.incidents.at(-1).victims[0].victimId];
  if (S.violenceState.counters.directDeaths !== 6 || uncertainVictim.actualCondition === 'confirmed-dead')
    throw Error('生死未確認の軍務上の発砲が確定死亡へ変換される');
  TRACE_RESOLUTION = {kind:'choice',id:ursusOrderEvent.id,choiceIndex:2,outcomeIndex:1,year:S.year,month:S.mo};
  ap(executionEffects[1]);
  const injuredVictim = S.violenceState.victims[S.violenceState.incidents.at(-1).victims[0].victimId];
  if (S.violenceState.counters.directDeaths !== 6 || injuredVictim.actualCondition !== 'injured')
    throw Error('命令下で負傷・生存した捕虜を死亡扱いする');
  S.res = {...priorRegion, n: 'ヴィクトリア'};
  S.job = 54; // REG_JOBS.vic_infantry in the regional career table.
  S.lifeRecord.affiliations = [...(priorAffiliations || []),
    {id: 'victoria-regular-infantry', status: 'active', role: '歩兵二等兵',
      episodes: [{startedYear:S.year,endedYear:null,roleAtStart:'歩兵二等兵'}], history:[]}];
  if (!affiliationWorkAvailable(S, 'victoria-regular-infantry'))
    throw Error('現役ヴィクトリア歩兵の任地を認識できない');
  const combat = {action:'resolve-scene', scenarioId:'military-combat-result', kind:'combat-lethal', context:'military',
    decision:'fired-on-combatant', outcome:'confirmed-death', targetGroup:'enemy-combatant',
    victimRef:{kind:'anonymous-person',localOrdinal:1}, witnesses:[], deathEvidence:'observed',
    deathEvidenceId:'enemy-death-observed',
    evidenceIds:['active-military-duty','present-at-theater','confirmed-combatant-target','enemy-death-observed']};
  TRACE_RESOLUTION = {kind:'choice',id:'military-combat-kill',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
  const surrendered = violenceActionAssessment(S, {...combat, evidenceIds:[...combat.evidenceIds,'target-surrendered']},
    TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  if (surrendered.ok || surrendered.reason !== 'combat-lethal-cannot-target-surrendered-or-protected-person')
    throw Error('武器を捨てて降伏した捕虜を通常の交戦戦果として記録できる');
  applyViolenceAction(S, combat, TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  if (S.violenceState.counters.directDeaths !== 7)
    throw Error('実際に確認した現役兵の戦闘死亡が一件だけ記録されない');
  TRACE_RESOLUTION = {kind:'choice',id:'military-command-harm',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
  applyViolenceAction(S, {action:'resolve-scene', scenarioId:'unit-commanded-result', kind:'command-harm', context:'military',
    decision:'issued-order-executed-by-unit', outcome:'confirmed-death', victimRef:{kind:'anonymous-person',localOrdinal:1},
    witnesses:[], deathEvidence:'confirmed', deathEvidenceId:'subordinate-result-reported',
    evidenceIds:['active-military-duty','order-issued','order-executed-by-unit','subordinate-death-confirmed',
      'subordinate-result-reported']}, TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  if (S.violenceState.counters.directDeaths !== 7 || S.violenceState.counters.commandedDeaths !== 1)
    throw Error('部下を通じた死亡を、本人の直接殺害件数へ加算する');
  TRACE_RESOLUTION = {kind:'choice',id:'military-material-assistance',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
  applyViolenceAction(S, {action:'resolve-scene', scenarioId:'purpose-known-preparation', kind:'material-assistance',
    context:'military', decision:'prepared-transport-knowing-purpose', outcome:'unresolved',
    victimRef:{kind:'collective',localOrdinal:1}, witnesses:[],
    evidenceIds:['active-military-duty','purpose-known','prepared-transport','result-unconfirmed']},
    TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  TRACE_RESOLUTION = {kind:'choice',id:'military-witness-only',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
  applyViolenceAction(S, {action:'resolve-scene', scenarioId:'witnessed-combat-unconfirmed', kind:'witness', context:'military',
    decision:'present-at-battle-no-kill-confirmed', outcome:'unresolved', victimRef:{kind:'collective',localOrdinal:1},
    witnesses:[{kind:'recorded-contact',id:'test-friend-1'}],
    evidenceIds:['active-military-duty','present-at-theater','casualties-unconfirmed']},
    TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  const militaryWitnessTie = socialTieFor(S, S.friendContact, false),
    militaryWitnessAwareness = S.violenceState.awareness.at(-1);
  if (S.violenceState.counters.directDeaths !== 7 || S.violenceState.counters.commandedDeaths !== 1 ||
      S.violenceState.counters.assistedDeaths !== 0 || S.violenceState.counters.materialAssistance !== 1 ||
      militaryWitnessAwareness?.relationshipEffect !== 'none' ||
      S.violenceState.familyContactBlocks.some(row => row.personId === 'test-friend-1' && row.status === 'active') ||
      militaryWitnessTie?.history?.at(-1)?.action !== 'witnessed-military-violence')
    throw Error('目的を知って準備した記録・戦場の目撃・指揮下の死亡を直接殺害と混同するか、軍務目撃に民間の接触断絶を適用する');
  S.res = priorRegion; S.job = priorJob; S.lifeRecord.affiliations = priorAffiliations;
  let firstMinorAction = null, firstMinorTrace = null;
  for (let i = 0; i < 50; i++) {
    const id = 'minor-threat-' + i,
      action = {action: 'resolve-scene', scenarioId: 'minor-verbal-threat-' + i, kind: 'threat', context: 'civilian',
        decision: 'raised-voice', outcome: 'no-injury', victimRef: {kind: 'anonymous-person', localOrdinal: 1},
        witnesses: [], evidenceIds: ['verbal-threat', 'no-contact']};
    applyAction(id, action);
    if (i === 0) { firstMinorAction = action; firstMinorTrace = {...TRACE_RESOLUTION}; }
  }
  for (let i = 0; i < 40; i++)
    applyAction('unresolved-major-' + i, {action: 'resolve-scene', scenarioId: 'unresolved-major-' + i,
      kind: 'threat', context: 'civilian', decision: 'unknown-outcome', outcome: 'unresolved',
      victimRef: {kind: 'anonymous-person', localOrdinal: 1}, witnesses: [], evidenceIds: ['outcome-unconfirmed']});
  if (S.violenceState.historyArchive.incidents.count !== 2 ||
      Object.values(S.violenceState.historyArchive.incidents.byKind).reduce((a, b) => a + b, 0) !== 2 ||
      S.violenceState.incidents.filter(row => row.scenarioId.startsWith('minor-verbal-threat-')).length !== 48 ||
      S.violenceState.incidents.filter(row => row.scenarioId.startsWith('unresolved-major-')).length !== 40)
    throw Error('軽微な完了事件は直近48件＋集約2件、未解決重大事件は40件すべて保持されない');
  const stateBeforeArchivedReplay = JSON.stringify(S.violenceState);
  const archivedReplay = violenceActionAssessment(S, firstMinorAction, firstMinorTrace, firstMinorTrace.id);
  if (archivedReplay.ok || archivedReplay.reason !== 'receipt-payload-mismatch' ||
      JSON.stringify(S.violenceState) !== stateBeforeArchivedReplay)
    throw Error('集約後の事件がreceiptIDで再実行を拒否せず、または判定で状態が変わる');
  S.siblings = Array.from({length: 17}, (_, i) => ({id: 'witness-sibling-' + i, nm: '証人' + i,
    d: 0, by: S.year - 20, r: S.r}));
  for (let i = 0; i < 17; i++)
    applyAction('witness-detail-' + i, {action: 'resolve-scene', scenarioId: 'witness-detail-' + i,
      kind: 'threat', context: 'civilian', decision: 'saw-threat', outcome: 'no-injury',
      victimRef: {kind: 'anonymous-person', localOrdinal: 1},
      witnesses: [{kind: 'family-person', id: 'witness-sibling-' + i}], evidenceIds: ['direct-witness']});
  if (S.violenceState.awareness.length !== 16 || S.violenceState.historyArchive.witnessAwareness.count !== 5 ||
      S.violenceState.historyArchive.witnessAwareness.byRelation.family !== 4)
    throw Error('証人詳細は直近16件と関係種別を保つ集約へ圧縮されない');
  const restored = JSON.parse(JSON.stringify(S)),
    restoredProblems = [];
  auditViolenceState(restored, restoredProblems);
  if (restoredProblems.length) throw Error('同版復元後の暴力事件台帳が不正: ' + restoredProblems.join('; '));
  const savedViolenceState = JSON.stringify(S.violenceState),
    savedResolution = {...TRACE_RESOLUTION},
    savedIncident = S.violenceState.incidents.at(-1),
    savedAction = JSON.parse(savedIncident.actionFingerprint),
    resumeSnapshot = makeResumeSnapshot();
  HL = 0; play = () => {}; rd = () => {}; tab = () => {}; restorePendingChoice = () => false;
  if (!cont(resumeSnapshot) || JSON.stringify(S.violenceState) !== savedViolenceState)
    throw Error('同版の実セーブ保存／再開で暴力事件台帳・receiptIDが変わる');
  const duplicateAfterResume = violenceActionAssessment(S, savedAction, savedResolution, savedIncident.sourceEventId),
    afterResumeBeforeReplay = JSON.stringify(S.violenceState);
  if (!duplicateAfterResume.ok || !duplicateAfterResume.duplicate)
    throw Error('同版再開後に解決済みの軍務目撃記録が一回性を失う');
  applyViolenceAction(S, savedAction, savedResolution, savedIncident.sourceEventId);
  if (JSON.stringify(S.violenceState) !== afterResumeBeforeReplay)
    throw Error('同版再開後の同一事件再適用で記録が二重化する');
  return {
    passed: true, victimId, directDeaths: S.violenceState.counters.directDeaths,
    witnessedSpouseStanding: tie.standing, uninformedSiblingStillContactable: true,
    uninformedFriendUnaffected: true, courtOutcome: proceeding.sentence,
    releaseDate: proceeding.completedAt, restoredAudit: 'passed'
  };
`);

assert.equal(result.passed, true);
assert.equal(result.directDeaths, 7);
assert.equal(result.uninformedSiblingStillContactable, true);
assert.equal(result.uninformedFriendUnaffected, true);
console.log('PASS witnessed civilian homicide, evidence, family boundary, court sentence, release and idempotent record');

const marketPreventionContext = context(root).ctx,
  marketPrevention = runIn(marketPreventionContext, `
    born({seed: 1110708, by: 1064, region: 'クルビア'});
    S.age = 34; S.year = 1098; S.mo = 4; S.cash = 1000000;
    S.sp = {id:'market-prevention-spouse',nm:'ユナ',d:0,j:0,
      residenceRegion:'クルビア',residenceBaseId:S.residenceBase?.id,
      marriedYear:S.year-1,sharesHousehold:true,householdArrangement:'shared'};
    const apply = (id, action, choiceIndex = 0, outcomeIndex = 0) => {
      TRACE_RESOLUTION = {kind:'choice',id,choiceIndex,outcomeIndex,year:S.year,month:S.mo};
      ap({violenceAction:action});
    };
    apply('market-formation-one', {action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'market-endorsement-one',basis:'集会で排斥を支持した',audience:'public'});
    apply('market-formation-two', {action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'market-endorsement-two',basis:'別の集会でも排斥を支持した',audience:'public'});
    apply('violence_infected_market_assault', {action:'resolve-scene',scenarioId:'infected-market-assault',
      kind:'assault',context:'civilian',decision:'joined-expulsion-assault',outcome:'injured',targetGroup:'infected',
      victimRef:{kind:'anonymous-person',localOrdinal:1},witnesses:[{kind:'family-role',role:'spouse'}],
      evidenceIds:['visible-oripathy-signs','direct-assault','scene-observed-injury'],followupAfterMonths:1});
    S.mo = 5;
    const event = EV.find(row => row.id === 'violence_infected_market_homicide_followup'),
      choiceIndex = event.c.findIndex(choice => choice.l === '石を拾い、男の頭を狙って振り下ろす'),
      outcomes = event.c[choiceIndex]?.o || [],
      prevented = outcomes[2]?.[2];
    if (!prevented?.violenceAction || prevented.violenceAction.outcome !== 'prevented' ||
        prevented.violenceAction.authorityAction !== 'detain-and-investigate')
      throw Error('文章上の詰所への連行が、未遂事件の捜査記録に接続されていない');
    TRACE_RESOLUTION = {kind:'choice',id:event.id,choiceIndex,outcomeIndex:2,year:S.year,month:S.mo};
    ap(prevented);
    const proceeding = S.violenceState.proceedings[0];
    if (!S.fl.detained || proceeding?.caseType !== 'attempted-civilian-homicide' ||
        proceeding.status !== 'investigation-open' ||
        !S.violenceState.familyContactBlocks.some(row => row.personId === S.sp.id && row.status === 'active'))
      throw Error('実イベントの未遂分岐が拘束・捜査・目撃配偶者への影響へつながらない');
    return {detained:!!S.fl.detained,caseType:proceeding.caseType,
      spouseRoutineContact:violenceEventEligible(EV.find(row=>row.id==='family_daily_spouse_cooking'),S)};
  `);
assert.deepEqual(marketPrevention, {
  detained: true, caseType: 'attempted-civilian-homicide', spouseRoutineContact: false
});
console.log('PASS prevented market homicide attempt proceeds to detention and investigation');

const second = context(root).ctx;
const defense = JSON.parse(vm.runInContext(`JSON.stringify((() => {
  born({seed: 1110702, by: 1064, region: 'クルビア'});
  S.age = 34; S.year = 1098; S.mo = 5;
  S.sp = {id: 'defense-spouse', nm: 'カイ', d: 0, health: 60, j: 0,
    residenceRegion: 'クルビア', residenceBaseId: S.residenceBase?.id, sharesHousehold: true};
  TRACE_RESOLUTION = {kind: 'choice', id: 'test_defense_event', choiceIndex: 0, outcomeIndex: 0};
  applyViolenceAction(S, {
    action: 'resolve-scene', scenarioId: 'test-emergency-defense',
    kind: 'defensive-lethal', context: 'civilian-defense', decision: 'stopped-immediate-attack',
    outcome: 'confirmed-death', victimRef: {kind: 'anonymous-person', localOrdinal: 1},
    witnesses: [{kind: 'family-role', role: 'spouse'}],
    deathEvidence: 'observed', deathEvidenceId: 'attacker-stopped-at-scene',
    evidenceIds: ['immediate-attack', 'attacker-stopped-at-scene']
  }, TRACE_RESOLUTION, TRACE_RESOLUTION.id);
  const incident = S.violenceState.incidents[0];
  return {
    directDeaths: S.violenceState.counters.directDeaths,
    blockCount: S.violenceState.familyContactBlocks.length,
    proceedingCount: S.violenceState.proceedings.length,
    tie: S.personTies.links['defense-spouse']?.standing,
    awareness: S.violenceState.awareness[0]?.relationshipEffect,
    incidentContext: incident.context
  };
})())`, second));
assert.deepEqual(defense, {
  directDeaths: 1, blockCount: 0, proceedingCount: 0, tie: 38,
  awareness: 'distressed-but-not-taboo', incidentContext: 'civilian-defense'
});
console.log('PASS civilian self-defense remains distinct from an unprovoked civilian killing');

const groupNormContext = context(root).ctx,
  groupNormResult = runIn(groupNormContext, `
    born({seed:1110709,by:1064,region:'クルビア'});
    S.age=34; S.year=1098; S.mo=4;
    S.sp={id:'group-norm-spouse',nm:'ユリ',d:0,j:0,residenceRegion:'クルビア',
      residenceBaseId:S.residenceBase?.id,marriedYear:S.year-1,sharesHousehold:true,householdArrangement:'shared'};
    const apply=(id,action,choiceIndex=0,outcomeIndex=0)=>{
      TRACE_RESOLUTION={kind:'choice',id,choiceIndex,outcomeIndex,year:S.year,month:S.mo};
      ap({violenceAction:action});
    };
    apply('group-endorsement-one',{action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'group-endorsement-one',basis:'排斥運動を支持した',audience:'public'});
    apply('group-endorsement-two',{action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'group-endorsement-two',basis:'別の集会でも排斥を支持した',audience:'public'});
    apply('group-assault',{action:'resolve-scene',scenarioId:'group-assault-before-killing',kind:'assault',context:'civilian',
      decision:'struck-target',outcome:'injured',targetGroup:'infected',victimRef:{kind:'anonymous-person',localOrdinal:1},
      witnesses:[],evidenceIds:['visible-oripathy-signs','direct-assault','scene-observed-injury'],followupAfterMonths:1});
    S.mo=5;
    const tie=socialTieFor(S,S.sp,true), before=tie.standing;
    apply('group-approved-killing',{action:'resolve-scene',scenarioId:'group-approved-public-killing',kind:'intentional-killing',
      context:'civilian',decision:'carried-out-in-group-accepted-setting',outcome:'confirmed-death',targetGroup:'infected',
      victimRef:{kind:'incident-victim',sourceEventId:'group-assault',localOrdinal:1},
      witnesses:[{kind:'family-role',role:'spouse'}],deathEvidence:'observed',deathEvidenceId:'death-seen',
      witnessNorm:'violent-group-approval',evidenceIds:['visible-oripathy-signs','death-seen','active-group-norm-explicit']});
    return {tieBefore:before,tieAfter:tie.standing,blocks:S.violenceState.familyContactBlocks.length,
      relationshipEffect:S.violenceState.awareness.at(-1).relationshipEffect};
  `);
assert.equal(groupNormResult.tieAfter, groupNormResult.tieBefore);
assert.equal(groupNormResult.blocks, 0);
assert.equal(groupNormResult.relationshipEffect, 'none');
console.log('PASS explicit violent-group norm does not impose the ordinary civilian taboo');

function testAttemptedHomicide(outcome, seed) {
  const attemptContext = context(root).ctx,
    attemptRun = code => JSON.parse(vm.runInContext('JSON.stringify((() => {' + code + '})())', attemptContext));
  return attemptRun(`
    born({seed: ${seed}, by: 1064, region: 'クルビア'});
    S.age = 34; S.year = 1098; S.mo = 7; S.cash = 1000000; S.priceIndex = 1;
    S.kids = []; S.siblings = []; S.par.fa = null; S.par.mo = null;
    S.sp = {id: 'attempt-spouse-${seed}', nm: 'カナ', d: 0, health: 60, j: 0,
      residenceRegion: 'クルビア', residenceBaseId: S.residenceBase?.id,
      sharesHousehold: true, householdArrangement: 'shared'};
    const apply = (id, action) => {
      TRACE_RESOLUTION = {kind: 'choice', id, choiceIndex: 0, outcomeIndex: 0, year: S.year, month: S.mo};
      ap({violenceAction: action});
    };
    apply('attempt-formation-one-${seed}', {action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'endorsement-one',basis:'集会で排斥を支持した',audience:'public'});
    apply('attempt-formation-two-${seed}', {action:'record-belief',targetGroup:'infected',behavior:'endorse',delta:30,
      evidenceId:'endorsement-two',basis:'別の集会でも排斥を支持した',audience:'public'});
    apply('attempt-assault-${seed}', {action:'resolve-scene',scenarioId:'test-assault-before-attempt',kind:'assault',context:'civilian',
      decision:'struck-target',outcome:'injured',targetGroup:'infected',victimRef:{kind:'anonymous-person',localOrdinal:1},
      witnesses:[{kind:'family-role',role:'spouse'}],evidenceIds:['visible-oripathy-signs','direct-assault','scene-observed-injury'],followupAfterMonths:1});
    S.mo = 8;
    const attempted = {
      action:'resolve-scene',scenarioId:'test-attempted-homicide',kind:'intentional-killing',context:'civilian',
      decision:'struck-to-kill',outcome:${JSON.stringify(outcome)},targetGroup:'infected',
      victimRef:{kind:'incident-victim',sourceEventId:'attempt-assault-${seed}',localOrdinal:1},
      witnesses:[{kind:'family-role',role:'spouse'}],authorityAction:'detain-and-investigate',
      witnessNorm:'ordinary-civilian-taboo',evidenceIds:['direct-lethal-act','authority-witness',${outcome === 'injured' ? "'medical-survival-confirmation'" : "'attack-prevented'"}]
    };
    apply('attempt-harm-${seed}', attempted);
    const caseRow = S.violenceState.proceedings[0], victim = S.violenceState.victims[S.violenceState.incidents.at(-1).victims[0].victimId];
    if (caseRow.caseType !== 'attempted-civilian-homicide' || S.violenceState.counters.directDeaths !== 0 ||
        S.violenceState.counters.attemptedLethalActs !== 1 || victim.actualCondition === 'confirmed-dead' ||
        !S.violenceState.familyContactBlocks.some(row => row.personId === S.sp.id && row.status === 'active') ||
        violenceEventEligible(EV.find(event => event.id === 'family_daily_spouse_cooking'), S))
      throw Error('死亡しなかった致死攻撃が殺人未遂・目撃後の関係境界として記録されない');
    const auditProblems = [];
    auditViolenceState(S, auditProblems);
    if (auditProblems.length) throw Error('殺人未遂記録の監査失敗: ' + auditProblems.join('; '));
    S.year = caseRow.reviewAt.year; S.mo = caseRow.reviewAt.month;
    TRACE_RESOLUTION = {kind:'choice',id:'violence_civilian_attempted_homicide_adjudication',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
    settleEmploymentThrough(S, S.year, Math.max(0, (S.mo || 1) - 1));
    const wallet = () => inSharedHousehold(S) ? S.house.cash : S.cash,
      walletBeforeSentence = wallet();
    ap({violenceAction:{action:'adjudicate-case',incidentId:'$due-violence-case',caseType:'attempted-civilian-homicide'}});
    if (caseRow.status !== 'convicted' || caseRow.sentence.years !== 2 || caseRow.sentence.fine !== 50000)
      throw Error('殺人未遂に対応する判決・罰金・収容期間が不正');
    const walletAfterSentence = wallet();
    if (walletBeforeSentence - walletAfterSentence !== 50000 * (S.priceIndex || 1))
      throw Error('罰金が共有家計または本人の財布へ正確に反映されなかった');
    ap({violenceAction:{action:'adjudicate-case',incidentId:'$due-violence-case',caseType:'attempted-civilian-homicide'}});
    if (wallet() !== walletAfterSentence)
      throw Error('同じ判決を再適用して罰金を二重に徴収した');
    S.year = caseRow.releaseAt.year; S.mo = caseRow.releaseAt.month;
    TRACE_RESOLUTION = {kind:'choice',id:'violence_civilian_attempted_homicide_release',choiceIndex:0,outcomeIndex:0,year:S.year,month:S.mo};
    ap({violenceAction:{action:'complete-sentence',incidentId:'$due-violence-release',caseType:'attempted-civilian-homicide'}});
    auditViolenceState(S, auditProblems);
    if (S.fl.detained || caseRow.status !== 'sentence-served' || auditProblems.length)
      throw Error('殺人未遂の刑期終了後の状態が不正');
    return {outcome:${JSON.stringify(outcome)},caseType:caseRow.caseType,directDeaths:S.violenceState.counters.directDeaths,
      sentence:caseRow.sentence,spouseContactStillBlocked:violenceEventEligible(EV.find(event => event.id === 'family_daily_spouse_cooking'),S) === false};
  `);
}

for (const [outcome, seed] of [['injured', 1110703], ['prevented', 1110704]]) {
  const attempted = testAttemptedHomicide(outcome, seed);
  assert.equal(attempted.caseType, 'attempted-civilian-homicide');
  assert.equal(attempted.directDeaths, 0);
  assert.equal(attempted.sentence.years, 2);
  assert.equal(attempted.sentence.fine, 50000);
  assert.equal(attempted.spouseContactStillBlocked, true);
}
console.log('PASS nonfatal lethal attack records attempted homicide, eyewitness consequences and sentence without inflating deaths');
