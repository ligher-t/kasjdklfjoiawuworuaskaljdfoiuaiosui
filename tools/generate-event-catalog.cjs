'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { isDeepStrictEqual } = require('node:util');
const { loadData } = require('./data-values.cjs');
const { dataFiles } = require('./runtime.cjs');

const ROOT = path.resolve(__dirname, '..');
const METADATA_PATH = path.join(__dirname, 'event-catalog-metadata.json');
const CATALOG_PATH = path.join(ROOT, 'EVENT_CATALOG.md');
const TICK = String.fromCharCode(96);
const functionSource = value => String(value).replace(/\r\n?/g, "\n");
const STAGES = ['乳児', '幼児', '児童', '少年', '青年', '壮年', '老年'];
const REVIEW_STATES = ['未校閲', '確認済み', '要修正', '条件／処理確認', '要照合'];
const PRIORITIES = ['未判定', '高', '中', '低'];
const ISSUE_CATEGORIES = [
  '日本語・文法',
  '視点・語り手',
  '年代・年齢・場所',
  '因果・状況整合',
  '原作・世界観',
  'メタ説明・冗長さ',
  '反復・頻度',
  '条件・表示・処理',
  '選択肢の先回り・他者の意思',
  '婉曲化・露悪性',
  'パラメータ効果との不整合',
  '年代・場所・因果',
  '他者の行動・選択結果',
  '条件と結果',
  '死因・結果の明瞭さ',
  '世界観・制度',
  '世界観・職業条件',
  '年齢・視点',
  '負傷・後続影響',
  '年齢・生活整合',
  '職業・条件整合',
  '労働・経済整合',
  '条件・処理整合',
  '条件・職業整合',
  '年齢・職業整合',
  '因果・結果'
];

const GENRE_RULES = [
  ['日常', ['朝食', '夕食', '食事', '買い物', '洗濯', '掃除', '歌', '遊び', '散歩', '近所', '食卓', '湯を沸']],
  ['家族・介護', ['家族', '親', '父', '母', '子ども', '赤ん坊', '配偶者', 'きょうだい', '兄弟', '姉妹', '同居', '介護', '看病']],
  ['労働・経済', ['仕事', '職場', '労働', '賃金', '給与', '給料', '雇用', '工場', '家計', '負債', '借金', '支払い', '契約', '費用', '店先']],
  ['感染・医療', ['感染者', '感染', '鉱石病', 'オリパシー', '診療', '診察', '診断', '治療', '療養', '薬代', '医療', '病気']],
  ['差別・制度', ['差別', '排斥', '排除', '偏見', '迫害', '侮辱', '入居拒否', '通行証', '通行札', '検問', '出自', '権利', '制度']],
  ['教育・文化', ['学校', '授業', '教室', '教師', '学び', '夜学', '読み書き', '言葉', '方言', '音楽', '楽器', '舞台', '祭り', '伝統', '昔話']],
  ['天災・避難', ['天災', '源石嵐', '避難', '警報', '災害', '移動都市', '仮設', '仮住まい', '復旧', '浸水', '崩落']],
  ['戦争・政治', ['戦争', '戦闘', '軍', '反乱', '革命', '政権', '政治', '貴族', '会戦', '占領', '兵士']],
  ['所属・組織', ['ロドス', 'レユニオン', '所属', '組織', 'オペレーター', '予備隊', 'ファミリー', '騎士団', '労働組合', '互助会']],
  ['移動・物流', ['トランスポーター', '運送', '運搬', '荷車', '荷物', '配達', '交易', '旅人', '転居', '移住', '移動先']]
];

function usage() {
  return [
    'Usage:',
    '  node tools/generate-event-catalog.cjs --initialize --simulation-report <path>',
    '  node tools/generate-event-catalog.cjs --reconcile',
    '  node tools/generate-event-catalog.cjs --write',
    '  node tools/generate-event-catalog.cjs --check',
    '',
    '--initialize creates the metadata sidecar once and writes the catalogue.',
    '--reconcile adds missing event metadata as unreviewed without changing existing records or the catalogue.',
    'Stale IDs and invalid existing records require explicit editorial reconciliation; they are never deleted.',
    '--write refreshes the catalogue without changing editorial metadata.',
    '--check validates metadata and reports whether the catalogue is current.'
  ].join('\n');
}

function parseArgs(argv) {
  const result = { mode: null, simulationReport: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--initialize' || arg === '--reconcile' || arg === '--write' || arg === '--check') {
      if (result.mode) throw new Error('Choose only one mode.\n' + usage());
      result.mode = arg.slice(2);
    } else if (arg === '--simulation-report') {
      result.simulationReport = argv[++i];
      if (!result.simulationReport) throw new Error('--simulation-report needs a path.');
    } else {
      throw new Error('Unknown argument: ' + arg + '\n' + usage());
    }
  }
  if (!result.mode) throw new Error(usage());
  if (result.mode === 'initialize' && !result.simulationReport) {
    throw new Error('--initialize requires --simulation-report.');
  }
  if (result.mode !== 'initialize' && result.simulationReport) {
    throw new Error('--simulation-report is valid only with --initialize.');
  }
  return result;
}

function lineAt(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function buildSourceOrigins(events) {
  const explicit = new Map();
  const declarations = new Map();
  const generatedCalls = [];
  const documents = [];
  for (const file of dataFiles(ROOT)) {
    const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
    documents.push({ file, source });
    let localCall = 0;
    for (const match of source.matchAll(/\$terraData\.F\s*\(/g)) {
      localCall++;
      generatedCalls.push({
        file,
        line: lineAt(source, match.index),
        anchor: file + '#F-' + localCall
      });
    }
    for (const match of source.matchAll(/(?:\$terraData\.)?EV\.push\(\s*\{\s*id\s*:\s*(["'])(.*?)\1/g)) {
      const id = match[2];
      const rows = declarations.get(id) || [];
      rows.push({ file, line: lineAt(source, match.index), anchor: file + '#id-' + id });
      declarations.set(id, rows);
    }
    for (const match of source.matchAll(/\bid\s*:\s*(["'])(.*?)\1/g)) {
      const id = match[2];
      const rows = explicit.get(id) || [];
      rows.push({ file, line: lineAt(source, match.index), anchor: file + '#id-' + id });
      explicit.set(id, rows);
    }
  }

  const origins = new Map();
  for (const event of events) {
    const generated = /^f(\d+)$/.exec(event.id);
    if (generated) {
      const location = generatedCalls[Number(generated[1]) - 1];
      if (!location) throw new Error('No source call found for generated event ID ' + event.id);
      origins.set(event.id, location);
      continue;
    }
    const locations = declarations.get(event.id) || explicit.get(event.id);
    if (locations && locations.length) {
      origins.set(event.id, locations[0]);
      continue;
    }
    const tokens = getTextAndConditionStrings(event)
      .filter(value => value.length >= 32)
      .sort((a, b) => b.length - a.length);
    let found = null;
    for (const token of tokens) {
      for (const document of documents) {
        const offset = document.source.indexOf(token);
        if (offset >= 0) {
          found = { file: document.file, line: lineAt(document.source, offset) };
          break;
        }
      }
      if (found) break;
    }
    if (!found) throw new Error('No source declaration or text anchor found for event ID ' + event.id);
    found.anchor = found.file + '#id-' + event.id;
    origins.set(event.id, found);
  }
  if (origins.size !== events.length) throw new Error('Could not locate every event source.');
  return origins;
}

function walkStrings(value, output, seen = new Set()) {
  if (typeof value === 'string') {
    output.push(value);
    return;
  }
  if (typeof value === 'function') {
    output.push(String(value));
    return;
  }
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) walkStrings(item, output, seen);
  } else {
    for (const item of Object.values(value)) walkStrings(item, output, seen);
  }
}

function getTextAndConditionStrings(event) {
  const result = [];
  walkStrings(event.t, result);
  walkStrings(event.c, result);
  for (const key of ['st', 'need', 'ban', 'ge', 'le', 'after', 'once', 'months', 'who', 'show']) {
    walkStrings(event[key], result);
  }
  return result;
}

function suggestTags(event, regions) {
  const all = getTextAndConditionStrings(event);
  const haystack = all.join('\n');
  const conditionParts = [];
  for (const key of ['need', 'ban', 'ge', 'le', 'after', 'show']) walkStrings(event[key], conditionParts);
  const conditions = conditionParts.join('\n');
  const regionTags = [];

  for (const region of regions) {
    const explicitGate = conditions.includes('国:' + region);
    const searchableText = region === '龍門' ? haystack.replaceAll('龍門幣', '') : haystack;
    if (explicitGate || searchableText.includes(region)) regionTags.push(region);
  }
  if (!regionTags.length) regionTags.push('未特定');

  const genreTags = [];
  for (const [tag, keywords] of GENRE_RULES) {
    if (keywords.some(keyword => haystack.includes(keyword))) genreTags.push(tag);
  }
  if (!genreTags.length) genreTags.push('未分類');

  const situationTags = [];
  const stages = Array.isArray(event.st) ? event.st : typeof event.st === 'string' ? [event.st] : [];
  for (const stage of STAGES) if (stages.includes(stage)) situationTags.push('年齢：' + stage);
  if (event.c?.length) situationTags.push('選択イベント');
  else situationTags.push('自動発生イベント');
  if (typeof event.t === 'function') situationTags.push('動的本文');
  if (Array.isArray(event.t)) situationTags.push('条件付き本文');
  if (typeof event.show === 'function') situationTags.push('動的表示条件');
  if (conditions.includes('国:')) situationTags.push('国の発生条件あり');
  if (/職[:：]/.test(conditions)) situationTags.push('職業条件あり');
  if (/感染|鉱石病/.test(haystack)) situationTags.push('感染・鉱石病に言及');
  if (/感染者/.test(haystack) && /隠|秘密|ばれ|噂|公開|告白|打ち明け|知ら/.test(haystack)) {
    situationTags.push('感染の開示・露見に言及');
  }
  if (/ロドス|レユニオン|感染者互助組織|感染者排除団体|ファミリー/.test(haystack)) {
    situationTags.push('組織・所属に言及');
  }
  if (/移動都市|避難|仮住まい/.test(haystack)) situationTags.push('移動都市・避難に言及');
  if (!situationTags.length) situationTags.push('未特定');

  return {
    region: [...new Set(regionTags)],
    genre: [...new Set(genreTags)],
    situation: [...new Set(situationTags)]
  };
}

function compactCoverage(row) {
  return {
    type: row.type,
    candidateSlots: row.candidateSlots,
    fired: row.fired,
    fireRateAmongCandidateSlots: row.fireRateAmongCandidateSlots,
    reachability: row.reachability
  };
}

function compactBranch(row) {
  return {
    choiceIndex: row.choiceIndex,
    label: row.label,
    shown: row.shown,
    enabled: row.enabled,
    outcomes: row.outcomes.map(outcome => ({
      outcomeIndex: outcome.outcomeIndex,
      probability: outcome.probability,
      count: outcome.count
    }))
  };
}

function importSimulationReport(reportPath, currentEvents) {
  const report = JSON.parse(fs.readFileSync(path.resolve(reportPath), 'utf8'));
  if (report.schema !== 'terra-dev-simulation-report' || !Array.isArray(report.eventCoverage) ||
      !Array.isArray(report.choiceBranches)) {
    throw new Error('The supplied file is not a supported Terra developer simulation report.');
  }
  const coverage = {};
  const currentIds = new Set(currentEvents.map(event => event.id));
  const currentById = new Map(currentEvents.map(event => [event.id, event]));
  for (const row of report.eventCoverage) {
    if (Object.hasOwn(coverage, row.eventId)) throw new Error('Duplicate simulation event row: ' + row.eventId);
    coverage[row.eventId] = compactCoverage(row);
  }
  const branches = {};
  for (const row of report.choiceBranches) {
    const rows = branches[row.eventId] || [];
    const event = currentById.get(row.eventId);
    const choice = event?.c?.[row.choiceIndex];
    const currentLabel = typeof choice?.l === 'string' ? choice.l : '（動的ラベル）';
    const labelMatches = Boolean(choice) && currentLabel === row.label;
    const outcomesMatch = Boolean(choice) && choice.o?.length === row.outcomes.length &&
      row.outcomes.every((outcome, index) => {
        const currentProbability = Number.parseFloat(choiceProbability(choice.o, index));
        return Number.isFinite(currentProbability) &&
          Math.abs(currentProbability - outcome.probability) < 0.001;
      });
    rows.push({ ...compactBranch(row), labelMatches, outcomesMatch });
    branches[row.eventId] = rows;
  }
  const unmatchedEventIds = Object.keys(coverage).filter(eventId => !currentIds.has(eventId));
  const unmatchedChoiceEventIds = Object.keys(branches).filter(eventId => !currentIds.has(eventId));
  return {
    provenance: {
      fileName: path.basename(reportPath),
      generatedAt: report.generatedAt,
      elapsedMs: report.elapsedMs,
      fingerprints: report.fingerprints,
      options: report.options,
      summary: report.summary,
      assumptions: report.assumptions
    },
    eventCoverage: coverage,
    choiceBranches: branches,
    unmatchedEventIds,
    unmatchedChoiceEventIds
  };
}

function initialEventMetadata(event, origins, regions) {
  return {
    origin: origins.get(event.id),
    tags: suggestTags(event, regions),
    tagBasis: '本文・条件からの初期自動候補。未校閲。',
    reviewStatus: '未校閲',
    priority: '未判定',
    issues: [],
    note: ''
  };
}

function initializeMetadata(events, origins, data, reportPath) {
  const metadata = {
    schemaVersion: 1,
    taggingNote: 'タグは本文・条件からの自動候補。タグの監査状態はreviewStatusと別管理で、未確認の分類が残る。',
    allowedReviewStates: REVIEW_STATES,
    allowedPriorities: PRIORITIES,
    allowedIssueCategories: ISSUE_CATEGORIES,
    simulationSample: importSimulationReport(reportPath, events),
    events: {}
  };
  const regions = (data.REG || []).map(row => row.n || row.name || row.id).filter(Boolean);
  for (const event of events) {
    metadata.events[event.id] = initialEventMetadata(event, origins, regions);
  }
  return metadata;
}

function reconcileMetadata(metadata, events, origins, data) {
  if (!metadata || metadata.schemaVersion !== 1 || !metadata.events ||
      typeof metadata.events !== 'object' || Array.isArray(metadata.events)) {
    throw new Error('Unsupported event-catalog metadata schema.');
  }
  const current = new Set(events.map(event => event.id));
  const stale = Object.keys(metadata.events).filter(id => !current.has(id));
  if (stale.length) {
    throw new Error('Stale metadata IDs require explicit reconciliation; no records were removed: ' + stale.slice(0, 20).join(', '));
  }
  const missing = events.filter(event => !Object.hasOwn(metadata.events, event.id));
  const regions = (data.REG || []).map(row => row.n || row.name || row.id).filter(Boolean);
  for (const event of missing) {
    metadata.events[event.id] = initialEventMetadata(event, origins, regions);
  }
  // Invalid existing annotations and changed source anchors still block the write.
  validateMetadata(metadata, events, origins);
  return missing.length;
}

function validateMetadata(metadata, events, origins) {
  if (!metadata || metadata.schemaVersion !== 1 || !metadata.events || typeof metadata.events !== 'object') {
    throw new Error('Unsupported event-catalog metadata schema.');
  }
  if (!Array.isArray(metadata.allowedIssueCategories) ||
      ISSUE_CATEGORIES.some(category => !metadata.allowedIssueCategories.includes(category))) {
    throw new Error('Issue-category vocabulary is missing or incomplete.');
  }
  const current = new Set(events.map(event => event.id));
  const recorded = new Set(Object.keys(metadata.events));
  const missing = [...current].filter(id => !recorded.has(id));
  const stale = [...recorded].filter(id => !current.has(id));
  if (missing.length || stale.length) {
    throw new Error([
      'Metadata and current event IDs do not match.',
      missing.length ? 'Missing metadata: ' + missing.slice(0, 20).join(', ') : '',
      stale.length ? 'Stale metadata: ' + stale.slice(0, 20).join(', ') : '',
      'Reconcile the sidecar before regenerating.'
    ].filter(Boolean).join('\n'));
  }
  for (const event of events) {
    const row = metadata.events[event.id];
    if (!row || !row.tags || !Array.isArray(row.tags.region) ||
        !Array.isArray(row.tags.genre) || !Array.isArray(row.tags.situation)) {
      throw new Error('Invalid or missing tag arrays for event ' + event.id);
    }
    if (!REVIEW_STATES.includes(row.reviewStatus)) {
      throw new Error('Invalid reviewStatus for event ' + event.id);
    }
    if (!PRIORITIES.includes(row.priority)) throw new Error('Invalid priority for event ' + event.id);
    if (!Array.isArray(row.issues)) throw new Error('issues must be an array for event ' + event.id);
    if (row.issues.some(issue => !metadata.allowedIssueCategories.includes(issue))) {
      throw new Error('Unknown issue category for event ' + event.id);
    }
    if (!row.origin || row.origin.anchor !== origins.get(event.id)?.anchor) {
      throw new Error('Source anchor changed for ' + event.id + '; reconcile its metadata origin.');
    }
  }
}

function stableValue(value, seen = new Set()) {
  if (value === undefined) return '[未定義]';
  if (typeof value === 'function') return { dynamicFunction: functionSource(value) };
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return '[循環参照]';
  seen.add(value);
  if (Array.isArray(value)) {
    const result = value.map(item => stableValue(item, seen));
    seen.delete(value);
    return result;
  }
  const result = {};
  for (const key of Object.keys(value)) result[key] = stableValue(value[key], seen);
  seen.delete(value);
  return result;
}

function jsonBlock(value) {
  const body = JSON.stringify(stableValue(value), null, 2);
  return TICK.repeat(3) + 'json\n' + body + '\n' + TICK.repeat(3);
}

function metadataJson(metadata) {
  const mapLines = map => Object.entries(map).map(([key, value]) =>
    '      ' + JSON.stringify(key) + ': ' + JSON.stringify(value)
  );
  const simulation = metadata.simulationSample;
  const lines = [
    '{',
    '  "schemaVersion": ' + JSON.stringify(metadata.schemaVersion) + ',',
    '  "taggingNote": ' + JSON.stringify(metadata.taggingNote) + ',',
    '  "allowedReviewStates": ' + JSON.stringify(metadata.allowedReviewStates) + ',',
    '  "allowedPriorities": ' + JSON.stringify(metadata.allowedPriorities) + ',',
    '  "allowedIssueCategories": ' + JSON.stringify(metadata.allowedIssueCategories) + ',',
    '  "simulationSample": {',
    '    "provenance": ' + JSON.stringify(simulation.provenance) + ',',
    '    "eventCoverage": {',
    mapLines(simulation.eventCoverage).join(',\n'),
    '    },',
    '    "choiceBranches": {',
    mapLines(simulation.choiceBranches).join(',\n'),
    '    },',
    '    "unmatchedEventIds": ' + JSON.stringify(simulation.unmatchedEventIds) + ',',
    '    "unmatchedChoiceEventIds": ' + JSON.stringify(simulation.unmatchedChoiceEventIds),
    '  },',
    '  "events": {',
    mapLines(metadata.events).join(',\n'),
    '  }',
    '}'
  ];
  return lines.join('\n') + '\n';
}

function escapeInline(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function eventPlainText(event) {
  const values = [];
  const visit = value => {
    if (typeof value === 'string') values.push(value);
    else if (typeof value === 'function') values.push('（動的本文）');
    else if (Array.isArray(value)) for (const row of value) visit(row);
    else if (value && typeof value === 'object') {
      if (typeof value.t === 'string') visit(value.t);
      else for (const item of Object.values(value)) visit(item);
    }
  };
  visit(event.t);
  return values.join(' ').replace(/\s+/g, ' ').trim();
}

function renderText(value) {
  if (typeof value === 'string') {
    return value.split(/\r?\n/).map(line => '> ' + line).join('\n');
  }
  if (typeof value === 'function') {
    return '**動的本文**：実行時状態から文章を組み立てます。本文を一つに固定せず、生成関数を示します。\n\n' +
      TICK.repeat(3) + 'js\n' + functionSource(value) + '\n' + TICK.repeat(3);
  }
  if (Array.isArray(value)) {
    return value.map((candidate, index) => {
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate) && Object.hasOwn(candidate, 't')) {
        const condition = Object.hasOwn(candidate, 'when') ? candidate.when : '(条件指定なし)';
        return [
          '#### 条件付き本文 ' + (index + 1),
          '',
          '条件：',
          jsonBlock(condition),
          '',
          renderText(candidate.t)
        ].join('\n');
      }
      return '#### 本文候補 ' + (index + 1) + '\n\n' + renderText(candidate);
    }).join('\n\n');
  }
  return '本文データ：\n\n' + jsonBlock(value);
}

function choiceProbability(outcomes, index) {
  const current = Number(outcomes[index]?.[0]);
  const previous = index ? Number(outcomes[index - 1]?.[0]) : 0;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return '確率値未確認';
  const scale = current <= 1 && previous <= 1 ? 100 : 1;
  return ((current - previous) * scale).toFixed(3).replace(/\.?0+$/, '') + '%';
}

function tagAnchor(axis, index) {
  return 'tag-' + axis + '-' + index;
}

function eventAnchor(id) {
  return 'event-' + id.replace(/[^a-zA-Z0-9_-]/g, '-');
}

function choiceAnchor(id, choiceIndex) {
  return 'choice-' + id.replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + choiceIndex;
}

function outcomeAnchor(id, choiceIndex, outcomeIndex) {
  return 'outcome-' + id.replace(/[^a-zA-Z0-9_-]/g, '-') + '-' + choiceIndex + '-' + outcomeIndex;
}

function shortPreview(event) {
  const text = eventPlainText(event);
  return escapeInline(text ? text.slice(0, 74) + (text.length > 74 ? '…' : '') : '（動的本文）');
}

function buildTagGroups(events, metadata, axis) {
  const groups = new Map();
  for (const event of events) {
    for (const tag of metadata.events[event.id].tags[axis]) {
      const rows = groups.get(tag) || [];
      rows.push(event);
      groups.set(tag, rows);
    }
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b, 'ja'));
}

function renderIndex(events, metadata, axis, heading) {
  const groups = buildTagGroups(events, metadata, axis);
  const lines = ['## ' + heading, ''];
  if (!groups.length) return lines.concat(['分類なし', '']).join('\n');
  lines.push(groups.map(([tag], index) =>
    '[' + tag + ' (' + groups[index][1].length + ')](#' + tagAnchor(axis, index) + ')'
  ).join('　・　'));
  lines.push('');
  for (const [index, [tag, rows]] of groups.entries()) {
    lines.push('<a id="' + tagAnchor(axis, index) + '"></a>');
    lines.push('### ' + tag + '（' + rows.length + '）');
    for (const event of rows) {
      lines.push('- [' + event.id + '](#' + eventAnchor(event.id) + ') — ' + shortPreview(event));
    }
    lines.push('');
  }
  return lines.join('\n');
}

function renderEvent(event, annotation, sample) {
  const lines = [
    '<a id="' + eventAnchor(event.id) + '"></a>',
    '## ' + event.id,
    '',
    '- 出典位置：' + annotation.origin.file + ':' + annotation.origin.line,
    '- 分類確度：' + annotation.tagBasis,
    '- 校閲状態：' + annotation.reviewStatus + '　優先度：' + annotation.priority,
    '- 国・地域：' + annotation.tags.region.join('、'),
    '- ジャンル：' + annotation.tags.genre.join('、'),
    '- 状況：' + annotation.tags.situation.join('、'),
    '- 指摘分類：' + (annotation.issues.length ? annotation.issues.join('、') : '未記入（問題なしの確認を意味しない）'),
    '- 注記：' + (annotation.note || 'なし'),
    '',
    '### 本文',
    '',
    renderText(event.t),
    '',
    '### 発生条件・構造',
    '',
    jsonBlock(Object.fromEntries(Object.entries(event).filter(([key]) => !['t', 'c'].includes(key)))),
    '',
    '### 旧1000人シムの観測'
  ];
  const frequency = sample?.eventCoverage?.[event.id];
  if (!frequency) {
    lines.push('', '未計測（添付シムにこのイベントIDの記録なし。0件ではありません。）');
  } else if (frequency.type !== (event.c ? 'choice' : 'daily')) {
    lines.push('', '要照合（旧シムと現行イベントの種別が異なるため、発生数を対応付けていません。）');
  } else {
    lines.push(
      '',
      '添付された旧版固定条件での観測値。現行版の発生率や人口統計ではありません。',
      '',
      '- 発生数：' + frequency.fired,
      '- 候補枠数：' + frequency.candidateSlots,
      '- 候補枠内発生率：' + (frequency.fireRateAmongCandidateSlots === null ? '算出不可' : frequency.fireRateAmongCandidateSlots + '%'),
      '- 到達状況：' + frequency.reachability
    );
  }
  lines.push('', '### 選択肢と結果枝', '');
  if (!event.c?.length) {
    lines.push('選択肢なし。');
  } else {
    const observed = sample?.choiceBranches?.[event.id] || [];
    for (const [choiceIndex, choice] of event.c.entries()) {
      const branchStats = observed.find(row => row.choiceIndex === choiceIndex);
      lines.push('#### 選択肢 ' + (choiceIndex + 1), '');
      lines.push('<a id="' + choiceAnchor(event.id, choiceIndex) + '"></a>');
      lines.push('選択肢文：' + (typeof choice.l === 'string' ? choice.l : '動的ラベル'));
      if (typeof choice.l === 'function') lines.push('', renderText(choice.l));
      const details = Object.fromEntries(Object.entries(choice).filter(([key]) => !['l', 'o', 'ethics'].includes(key)));
      if (Object.keys(details).length) {
        lines.push('', '表示・選択条件と補助情報：', '', jsonBlock(details));
      }
      const sampleMatches = branchStats && branchStats.labelMatches && branchStats.outcomesMatch;
      if (sampleMatches) {
        lines.push('', '旧シム観測：表示 ' + branchStats.shown + '、選択可能 ' + branchStats.enabled);
      } else if (branchStats) {
        lines.push('', '旧シム観測：選択肢文または結果確率が現行と異なるため要照合。');
      } else {
        lines.push('', '旧シム観測：未計測（記録なし。0件ではありません。）');
      }
      lines.push('', '結果枝：');
      for (const [outcomeIndex, outcome] of (choice.o || []).entries()) {
        lines.push('<a id="' + outcomeAnchor(event.id, choiceIndex, outcomeIndex) + '"></a>');
        lines.push('', '- **結果 ' + (outcomeIndex + 1) + '（設定確率 ' + choiceProbability(choice.o, outcomeIndex) + '）**');
        lines.push('');
        lines.push(renderText(outcome[1]));
        lines.push('');
        lines.push('効果：');
        lines.push('');
        lines.push(jsonBlock(outcome[2] === undefined ? null : outcome[2]));
        const observedOutcome = sampleMatches
          ? branchStats.outcomes.find(row => row.outcomeIndex === outcomeIndex)
          : null;
        lines.push('');
        lines.push('旧シム観測回数：' + (observedOutcome ? observedOutcome.count : '未計測'));
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}

function assertCatalogCoverage(catalog, events) {
  const counts = {
    events: events.length,
    choices: 0,
    outcomes: 0
  };
  const required = [];
  for (const event of events) {
    required.push(eventAnchor(event.id));
    for (const [choiceIndex, choice] of (event.c || []).entries()) {
      counts.choices++;
      required.push(choiceAnchor(event.id, choiceIndex));
      for (const [outcomeIndex] of (choice.o || []).entries()) {
        counts.outcomes++;
        required.push(outcomeAnchor(event.id, choiceIndex, outcomeIndex));
      }
    }
  }
  const anchors = new Set();
  const starts = new Map();
  let searchFrom = 0;
  for (const anchor of required) {
    if (anchors.has(anchor)) throw new Error('Duplicate catalog anchor: ' + anchor);
    anchors.add(anchor);
    const marker = '<a id="' + anchor + '"></a>';
    const start = catalog.indexOf(marker, searchFrom);
    if (start < 0) throw new Error('Missing catalog entry: ' + anchor);
    starts.set(anchor, start);
    searchFrom = start + marker.length;
  }
  const requiredText = value => {
    if (typeof value === 'string') return value.split(/\r?\n/).filter(line => line.trim());
    if (typeof value === 'function') return [functionSource(value)];
    if (Array.isArray(value)) return value.flatMap(requiredText);
    if (value && typeof value === 'object') {
      if (Object.hasOwn(value, 't')) return requiredText(value.t);
      return [];
    }
    return [];
  };
  for (const [eventIndex, event] of events.entries()) {
    const start = starts.get(eventAnchor(event.id));
    const next = eventIndex + 1 < events.length
      ? starts.get(eventAnchor(events[eventIndex + 1].id))
      : catalog.length;
    const section = catalog.slice(start, next);
    const textSlots = requiredText(event.t);
    for (const choice of event.c || []) {
      textSlots.push(...requiredText(choice.l), ...requiredText(choice.why));
      for (const outcome of choice.o || []) textSlots.push(...requiredText(outcome[1]));
    }
    for (const literal of textSlots) {
      if (!section.includes(literal)) {
        throw new Error('Text is missing from the catalog entry for ' + event.id);
      }
    }
  }
  const indexEnd = catalog.indexOf('## イベント本文と分岐');
  const indexText = indexEnd >= 0 ? catalog.slice(0, indexEnd) : catalog;
  const definedAnchors = new Set([...catalog.matchAll(/<a id="([^"]+)"><\/a>/g)].map(match => match[1]));
  for (const match of indexText.matchAll(/\]\(#([^)]+)\)/g)) {
    if (!definedAnchors.has(match[1])) throw new Error('Broken catalog index link: #' + match[1]);
  }
  return counts;
}

function buildCatalog(events, metadata) {
  const sample = metadata.simulationSample;
  const provenance = sample?.provenance;
  const lines = [
    '# イベント全量カタログ',
    '',
    'この一覧は現行のGAME_DATA.EVから生成しています。本文候補・選択肢・結果枝はイベントデータの表記を保持し、動的な本文や条件を特定の一場面へ固定しません。',
    '',
    'タグは初期自動候補です。校閲状態が未校閲の間、タグや指摘欄を監査済みとは扱いません。指摘欄が空でも問題がないことを意味しません。',
    '',
    'イベント数：' + events.length +
      '　選択肢数：' + events.reduce((sum, event) => sum + (event.c?.length || 0), 0) +
      '　結果枝数：' + events.reduce((sum, event) => sum + (event.c || []).reduce((branchSum, choice) => branchSum + (choice.o?.length || 0), 0), 0),
    '',
    '頻度欄は添付された旧版シムの観測値です。' +
      (provenance ? ' birthYear=' + (provenance.options?.birthYearMin ?? '?') +
        '–' + (provenance.options?.birthYearMax ?? '?') + '、seed=' +
        (provenance.options?.masterSeed ?? '?') + '、source=' +
        (provenance.fingerprints?.source ?? '?') + '。' : '') +
      '現行版の確率・テラの人口統計・正史上の頻度ではありません。候補枠数と発生数は人の人数ではなく抽選枠の記録です。',
    '',
    '各イベント本文は詳細部に一度だけ記載します。索引の抜粋は検索用です。',
    '',
    renderIndex(events, metadata, 'region', '国・地域別索引'),
    renderIndex(events, metadata, 'genre', 'ジャンル別索引'),
    renderIndex(events, metadata, 'situation', '状況別索引'),
    '## イベント本文と分岐',
    ''
  ];
  for (const event of events) lines.push(renderEvent(event, metadata.events[event.id], sample), '');
  lines.push('<!-- generated from current source; edit the metadata sidecar, not this file -->');
  const catalog = lines.join('\n').replace(/\n{4,}/g, '\n\n\n') + '\n';
  assertCatalogCoverage(catalog, events);
  return catalog;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const { data } = loadData(ROOT);
  const events = data.EV;
  const ids = events.map(event => event.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate event IDs in GAME_DATA.EV.');
  const origins = buildSourceOrigins(events);

  if (args.mode === 'initialize') {
    if (fs.existsSync(METADATA_PATH) || fs.existsSync(CATALOG_PATH)) {
      throw new Error('Metadata or catalog already exists; initialization will not overwrite existing files.');
    }
    const metadata = initializeMetadata(
      events,
      origins,
      data,
      path.resolve(args.simulationReport)
    );
    validateMetadata(metadata, events, origins);
    const catalog = buildCatalog(events, metadata);
    fs.writeFileSync(METADATA_PATH, metadataJson(metadata), 'utf8');
    fs.writeFileSync(CATALOG_PATH, catalog, 'utf8');
    console.log(JSON.stringify({
      initialized: true,
      events: events.length,
      choices: events.reduce((sum, event) => sum + (event.c?.length || 0), 0),
      outcomes: events.reduce((sum, event) => sum + (event.c || []).reduce((n, choice) => n + (choice.o?.length || 0), 0), 0),
      catalogBytes: Buffer.byteLength(catalog),
      metadataBytes: fs.statSync(METADATA_PATH).size
    }, null, 2));
    return;
  }

  const metadata = JSON.parse(fs.readFileSync(METADATA_PATH, 'utf8'));
  if (args.mode === 'reconcile') {
    const added = reconcileMetadata(metadata, events, origins, data);
    if (added) {
      const serialized = metadataJson(metadata);
      if (!isDeepStrictEqual(JSON.parse(serialized), metadata)) {
        throw new Error('Metadata serialization would discard existing fields; no changes were written.');
      }
      fs.writeFileSync(METADATA_PATH, serialized, 'utf8');
    }
    console.log(JSON.stringify({ reconciled: true, added, preserved: events.length - added, events: events.length, catalogWritten: false }, null, 2));
    return;
  }
  validateMetadata(metadata, events, origins);
  const catalog = buildCatalog(events, metadata);
  if (args.mode === 'check') {
    if (!fs.existsSync(CATALOG_PATH)) throw new Error('Catalog is missing: ' + CATALOG_PATH);
    const current = fs.readFileSync(CATALOG_PATH, 'utf8').replace(/\r\n?/g, '\n');
    if (current !== catalog) throw new Error('Catalog is stale. Run with --write to refresh it.');
    console.log(JSON.stringify({
      current: true,
      events: events.length,
      choices: events.reduce((sum, event) => sum + (event.c?.length || 0), 0),
      outcomes: events.reduce((sum, event) => sum + (event.c || []).reduce((n, choice) => n + (choice.o?.length || 0), 0), 0),
      catalogBytes: Buffer.byteLength(current),
      metadataBytes: fs.statSync(METADATA_PATH).size
    }, null, 2));
    return;
  }
  fs.writeFileSync(CATALOG_PATH, catalog, 'utf8');
  console.log(JSON.stringify({
    written: true,
    events: events.length,
    choices: events.reduce((sum, event) => sum + (event.c?.length || 0), 0),
    outcomes: events.reduce((sum, event) => sum + (event.c || []).reduce((n, choice) => n + (choice.o?.length || 0), 0), 0),
    catalogBytes: Buffer.byteLength(catalog)
  }, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
