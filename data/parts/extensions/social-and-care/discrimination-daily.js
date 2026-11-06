// Generated from the user-provided v3 ledger; edits belong in that ledger and this runtime adapter.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/discrimination-daily"
)(function ($terraData) {
  "use strict";

function socialActionForChoice(choice) {
  const source = [choice.recordAction, ...(choice.actionDescriptors || [])].filter(Boolean).join(' ').toLowerCase();
  if (/help|support|aid|witness-help|援助|助け|支援/.test(source)) return 'record-help';
  if (/inquir|question|ask|consult|private-contact|確認|質問|相談|尋ね|聞く/.test(source)) return 'record-inquiry';
  if (/refus|declin|avoid|reject|距離|回避|断る|避け/.test(source)) return 'record-refusal';
  if (/bias|harass|slur|stereotype|排除|侮辱|偏見|差別|蔑視|迫害/.test(source)) return 'record-bias';
  if (/obligation|debt|master|clan|kinship|義務|負債|主人|氏族|血縁|恩義/.test(source)) return 'record-obligation';
  return 'record-response';
}
function socialConstraintMetadata(row) {
  const minor = /^(L0|L1)_/.test(row.frequencyClass);
  const conditions = String(row.conditionSummary || ''),
    infectedTarget = /感染者|鉱石病/.test(String(row.target || '')),
    workContext = /職場|工房|雇用|労働|仕事|荷受け|職務/.test(conditions) && /現に|実際に|在籍|就労|勤務中/.test(conditions),
    educationContext = /学籍|就学|出席|音楽教育|教育課程/.test(conditions),
    householdContext = /食事を共にする|同居する家族|同じ世帯/.test(conditions);
  return {
    group: row.group,
    presentation: minor ? 'minor-choice' : 'major-choice',
    sceneBinding: row.sceneBinding,
    target: row.target,
    domain: row.domain,
    episodeKey: String(row.episodeKey || row.id).slice(0, 100),
    subjectKind: row.requiresPlayerDiagnosis || row.requiresProtagonistOni || row.requiresProtagonistSarkaz ? 'protagonist' : 'scene-person',
    knowledgeBasis: String(row.knowledgeBasis || 'scene-observed-or-specific-record').slice(0, 120),
    conditionSummary: String(row.conditionSummary || '').slice(0, 500),
    excludeSummary: String(row.excludeSummary || '').slice(0, 300),
    ageRange: row.ageRange,
    regions: row.regions,
    requiresPlayerDiagnosis: row.requiresPlayerDiagnosis,
    knowledgeAudiences: ['public'],
    requiresProtagonistSarkaz: row.requiresProtagonistSarkaz,
    requiresProtagonistOni: row.requiresProtagonistOni,
    protectedInteriorMask: infectedTarget && row.group === 'daily-bias',
    externalSettingRequired: row.target === 'サルカズ' && /組織外/.test(conditions),
    requiresCurrentEmployment: workContext,
    requiresActiveEducation: educationContext,
    requiresHouseholdScene: householdContext,
    requiresRhodesBranch: /rhodes-staff|rhodes-care/.test(conditions),
    requiresReunionBase: /reunion-1096\/reunion-reorg/.test(conditions),
    requiresReunionMobileTeam: /レユニオン移動隊/.test(conditions),
    requiresSamiCommunity: row.regions.includes('サーミ') && /共同体|居住先/.test(conditions),
    held: row.held,
    holdReason: row.holdReason
  };
}
function compileSocialEvent(row) {
  const meta = socialConstraintMetadata(row);
  return {
    id: row.id,
    conf: 'S',
    references: ['SRC_SOCIAL_CONSTRAINTS_V3'],
    w: row.weight,
    cd: row.cooldownYears,
    once: row.once,
    presentation: meta.presentation,
    socialConstraint: meta,
    t: row.text,
    c: row.choices.map(choice => ({
      l: choice.label,
      o: [[1, choice.outcome, {
        ...Object.fromEntries(Object.entries(choice.numericEffects || {}).filter(([, value]) => typeof value === 'number' && Number.isFinite(value))),
        socialConstraintAction: {
          action: socialActionForChoice(choice),
          episodeKey: String(row.episodeKey || row.id).slice(0, 100),
          kind: String(row.domain || 'social-response').slice(0, 100),
          target: String(row.target || 'unspecified').slice(0, 80),
          subjectKind: meta.subjectKind,
          memoryTags: [...new Set([choice.recordAction, ...(choice.actionDescriptors || [])].filter(value => typeof value === 'string').map(value => value.slice(0, 80)))].slice(0, 12)
        }
      }]]
    }))
  };
}

  const rows = [
  {
    "id": "disc_day_ob01",
    "title": "帳場の鉛筆",
    "domain": "商店・会計",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7歳以上。店を利用する生活圏。受付で感染欄に印を付けた別客がいて、それを店主が見た。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.46,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "商店・会計|感染者|市街地の雑貨店",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "帳場で鉛筆を借りた客が、書類の感染欄に丸をつけた。店主はその鉛筆を脇へよけ、新しい一本を奥から出して次の客に渡した。",
    "choices": [
      {
        "label": "店主に鉛筆の扱いを尋ねる",
        "outcome": "「別に汚れてはいないだろう」と言うと、店主は古い鉛筆を引き出しに押し込んだ。",
        "numericEffects": {
          "k": 1,
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:pencil-question"
        ],
        "recordAction": null
      },
      {
        "label": "自分の買い物を済ませる",
        "outcome": "荷物を受け取って店を出た。帳場には二本の鉛筆が離して置かれていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:pencil-witness"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob02",
    "title": "湯気の向こう側",
    "domain": "食堂・座席",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "食堂に入る機会がある。感染者であることを当人が店側に伝えた。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.38,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "食堂・座席|感染者|市街地の大衆食堂",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "昼の食堂で、感染者だと名乗った客が相席を頼んだ。卓を囲む男たちは膳を寄せ、「そこだけは空けておく」と言って席を立った。",
    "choices": [
      {
        "label": "空いた席へ移る",
        "outcome": "椀を持って客の向かいに座った。客は短く礼を言い、冷めかけた汁をすすった。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "socialConflictAction:help/infected/seating"
        ],
        "recordAction": null
      },
      {
        "label": "席を移らずに食べる",
        "outcome": "店員が別の卓を片づけるあいだ、客は盆を持ったまま待っていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:canteen-seating-witness"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob03",
    "title": "水筒の蓋",
    "domain": "水場・近隣",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "共同水場の利用が生活圏にある。村の井戸・共用給水施設の存在を検証。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.3,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "水場・近隣|感染者|共同水場のある街区・集落",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "水汲み場で、隣の住人が感染者の使った柄杓を土の上へ放った。「次はあっちを使え」と別の桶を指さす。柄杓に残った水が地面へ落ちた。",
    "choices": [
      {
        "label": "柄杓を拾って水を汲む",
        "outcome": "泥を払って水を汲むと、住人は口をつぐんだ。感染者の女性は黙って水筒を閉めた。",
        "numericEffects": {
          "equityGain": 3
        },
        "actionDescriptors": [
          "記憶:water-bystander-help"
        ],
        "recordAction": null
      },
      {
        "label": "別の桶へ移る",
        "outcome": "言われた方の桶で水を汲んだ。地面の柄杓は誰にも拾われずに残った。",
        "numericEffects": {
          "biasInf": 1
        },
        "actionDescriptors": [
          "記憶:water-bystander-passive"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob04",
    "title": "届かなかった新聞",
    "domain": "郵便・届け物",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "新聞・掲示配達がある都市街区。配達人が相手を感染者として認識している。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.35,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "郵便・届け物|感染者|郵便受け・掲示配達のある街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "配達人が新聞を束ね、感染者の家の戸口だけを飛ばした。「あそこは後でいい」と言って袋の口を縛る。窓から、紙を待つ手がのぞいていた。",
    "choices": [
      {
        "label": "配達人に置き忘れを指摘する",
        "outcome": "配達人は舌打ちし、新聞を一部引き抜いて戸口の石に置いた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:delivery-corrected"
        ],
        "recordAction": null
      },
      {
        "label": "自分の配達物を受け取る",
        "outcome": "紙束の擦れる音が通りの向こうへ遠ざかった。隣家の窓は開いたままだった。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:delivery-skipped"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob05",
    "title": "子どもの鞠",
    "domain": "遊び場・目撃",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7歳以上。近隣に子どもの遊び場がある。少年の感染について父親は直接知っている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "遊び場・目撃|感染者|住宅地の共同遊び場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "通りで鞠が転がり、感染者の少年が拾って返した。持ち主の父親が駆け寄って鞠を取り上げ、服の裾で何度もこすった。少年の伸ばした手が下がる。",
    "choices": [
      {
        "label": "少年に声をかける",
        "outcome": "「ありがとうな」と言うと、少年は小さくうなずいて走り去った。父親は鞠を抱えたままこちらを見ていた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:ball-thanks"
        ],
        "recordAction": null
      },
      {
        "label": "子どもたちを見送る",
        "outcome": "鞠を取り戻した子どもは走り出した。拾った少年だけが少し離れた壁際に残った。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:ball-witness"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob06",
    "title": "買い忘れの塩",
    "domain": "商店・優先順",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "小売店を利用。店員が客の感染を事前に知る具体的な事情あり。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.42,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "商店・優先順|感染者|食料品を扱う小売店",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "塩を一袋買おうとした感染者の男に、店員が「ほかの客が済んでから」と告げた。後ろにいた二人が先に会計を終え、男は同じ小銭を握ったまま並んでいた。",
    "choices": [
      {
        "label": "店員に順番を戻すよう頼む",
        "outcome": "店員は渋い顔で男の塩を量った。秤の皿が小さく鳴った。",
        "numericEffects": {
          "equityGain": 3
        },
        "actionDescriptors": [
          "記憶:queue-order-restored"
        ],
        "recordAction": null
      },
      {
        "label": "店を出てから男に声をかける",
        "outcome": "「いつものことだ」と男は袋を握り直した。塩の粒が結び目から少しこぼれていた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:queue-outside-talk"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob07",
    "title": "借り手の名前",
    "domain": "市場・貸道具",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "生活圏に貸道具・職人の商いがある。店主が感染を認識している。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "市場・貸道具|感染者|職人の道具貸出所・市場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "鋸を借りに来た感染者の女性が名を告げると、帳場の男は貸出帳を閉じた。「壊されると困る」と言って棚に鍵をかける。隣では別の客が同じ鋸を受け取っていた。",
    "choices": [
      {
        "label": "貸出帳の条件を聞く",
        "outcome": "男は「うちの決まりだ」と答え、帳場の奥へ消えた。女性は空の手を見下ろした。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:tool-lender-query"
        ],
        "recordAction": null
      },
      {
        "label": "女性に別の貸出所を教える",
        "outcome": "行きつけの工房の道を教えた。女性は礼を言い、鋸の借用札を握りつぶした。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "socialConflictAction:help/infected/alternative-loan"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob08",
    "title": "切れた話題",
    "domain": "路地・近隣",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "近隣で人が集まる街路に立ち寄る。相手の感染は住民間で既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.5,
    "cooldownYears": 5,
    "once": false,
    "episodeKey": "路地・近隣|感染者|人の集まる街区の路地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "路地で夕飯の献立を話していた人々が、感染者の隣人の姿を見て一斉に黙った。隣人が角を曲がると、誰かがまた魚の値段を話し始めた。",
    "choices": [
      {
        "label": "隣人に挨拶する",
        "outcome": "「今日は冷えるね」と声をかけると、隣人は買い物籠を抱え直して笑った。背後ではまた会話が止まった。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:greeting-neighbor"
        ],
        "recordAction": null
      },
      {
        "label": "会話の輪に残る",
        "outcome": "魚の値段を聞きながら、角を曲がった隣人の足音が消えるのを待った。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:silent-when-neighbor-comes"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob09",
    "title": "皿を持つ手",
    "domain": "配膳・祭礼",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "公共の炊き出し・共同食事の現場。配給対象の感染を係員が認識。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.39,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "配膳・祭礼|感染者|屋外の共同炊き出し",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "炊き出しの列で感染者の女性が盆を持つと、配膳係は鍋の蓋を閉めた。「その人の分は最後に」と言い、ほかの器だけ先に満たしていく。",
    "choices": [
      {
        "label": "配膳係に女性の分も頼む",
        "outcome": "係は黙って蓋を上げ、器に粥を盛った。女性は盆を両手で支えて受け取った。",
        "numericEffects": {
          "equityGain": 3
        },
        "actionDescriptors": [
          "記憶:meal-served"
        ],
        "recordAction": null
      },
      {
        "label": "女性と一緒に順番を待つ",
        "outcome": "鍋の前に残り、次の配膳が始まるまで話をした。湯気が消える頃、ようやく二人分の器が並んだ。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:meal-wait-together"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob10",
    "title": "掲示板の余白",
    "domain": "掲示・求人",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "地元の求人掲示・市場労働が存在。募集文面が実際に掲示されている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.44,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "掲示・求人|感染者|求人掲示板のある地区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "掲示板の片隅に「感染者不可」と書いた求人紙が貼られた。朝には別の紙で半分隠され、昼にはまた上から貼り直されていた。",
    "choices": [
      {
        "label": "掲示を出した者に理由を尋ねる",
        "outcome": "近くの店の主人は「雇う側の勝手だ」と言った。貼り紙の糊はまだ乾いていなかった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:job-ad-question"
        ],
        "recordAction": null
      },
      {
        "label": "求人紙の文言を控える",
        "outcome": "紙の端に残る店名と条件を書き留めた。夕方には新しい広告が上から貼られていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:job-ad-copy"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob11",
    "title": "銭箱の席",
    "domain": "祭り・寄付",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "集落の祭り・寄付受付を利用。名簿への記名慣行がある場面。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.25,
    "cooldownYears": 12,
    "once": false,
    "episodeKey": "祭り・寄付|感染者|町内の祭り・寄付受付",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "祭りの準備金を集める席で、感染者の老人が小銭を置いた。会計係は名簿を裏返し、「寄付だけ頂きます」と言って老人の名を書かなかった。",
    "choices": [
      {
        "label": "名前も記してもらうよう話す",
        "outcome": "係は筆先を止めて老人の名を書き足した。老人は小銭をしまう布袋をゆっくり結んだ。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:donor-name-written"
        ],
        "recordAction": null
      },
      {
        "label": "老人の後に自分の分を納める",
        "outcome": "帳場の紙には自分の名が記された。老人が置いた小銭は銭箱の底に沈んだ。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:donor-name-omitted"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob12",
    "title": "洗濯紐の場所",
    "domain": "近隣・家事",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "共同洗濯場のある住居施設。衣類の持ち主が周囲に感染者と知られている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.31,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "近隣・家事|感染者|共同洗濯場を持つ住宅街",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "共同の洗濯紐に感染者の家の衣類が掛けられた。隣人が無言で紐の端へ押しやり、そこに自分の布を広げた。濡れた袖が地面へ垂れた。",
    "choices": [
      {
        "label": "落ちた袖を掛け直す",
        "outcome": "土のついた袖を軽く払って紐に戻した。隣人は何も言わず洗濯籠を持ち去った。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:laundry-replaced"
        ],
        "recordAction": null
      },
      {
        "label": "その家に布を届ける",
        "outcome": "落ちた衣類を持って戸口を叩いた。住人は洗い直すと言って布を受け取った。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:laundry-returned"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob13",
    "title": "後ろの灯り",
    "domain": "街灯・警備",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "地域の見回り体制がある市街地。横丁の感染者居住が番人に既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.24,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "街灯・警備|感染者|見回りのある市街地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "夜の巡回で、番人が感染者の住む横丁だけを素通りした。「あそこは面倒だ」と提灯を向けず、表通りへ戻っていく。奥では窓が一つだけ光っていた。",
    "choices": [
      {
        "label": "番人に見回りを頼む",
        "outcome": "番人は渋々横丁の入口まで歩いたが、奥へ進まず引き返した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:watchman-asked"
        ],
        "recordAction": null
      },
      {
        "label": "横丁の住民に知らせる",
        "outcome": "戸を叩いて番人の巡回を伝えた。住民は閂をもう一本掛けた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:watchman-warning"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob14",
    "title": "安売りの札",
    "domain": "市場・噂",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "屋外の市場・露店を利用。感染者排斥を売り文句にする店が存在する環境。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.43,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "市場・噂|感染者|露店が並ぶ生活圏",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "果物屋の札に「感染者が触れていません」と書き足されていた。隣の露店主がそれを読んで鼻で笑い、自分の箱には何も書かなかった。",
    "choices": [
      {
        "label": "果物屋に札の意味を尋ねる",
        "outcome": "「客が安心するだろう」と店主は答えた。売り物の梨を布で磨き直した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:market-sign-question"
        ],
        "recordAction": null
      },
      {
        "label": "隣の露店で買う",
        "outcome": "隣の店で梨を選んだ。果物屋の札は通りの真ん中からよく見えた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:market-sign-avoid-shop"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob15",
    "title": "席順の相談",
    "domain": "会合・街区",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人が任意集会に参加。世話役が住民の感染を認識している。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.31,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "会合・街区|感染者|地域の任意の集会",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "町内の話し合いで、感染者の住民が入ると世話役が座席を指し示した。ほかの席は輪になっているのに、その椅子だけ柱の後ろに置かれていた。",
    "choices": [
      {
        "label": "椅子を輪の中に動かす",
        "outcome": "脚を引きずって椅子を寄せた。世話役は咳払いし、会合の議題を読み上げた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:meeting-chair-moved"
        ],
        "recordAction": null
      },
      {
        "label": "隣に座って話を聞く",
        "outcome": "柱の陰へ自分の椅子を運んだ。二人で同じ議事の紙をのぞき込んだ。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:meeting-next-seat"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob16",
    "title": "荷車の番",
    "domain": "荷運び・商業",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "荷車や手運びのある市場・搬入口。荷受け係はその運搬人の感染を認識している。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.35,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "荷運び・商業|感染者|運搬人が集まる荷捌き場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "荷車を押してきた感染者の男に、荷受け係が「中の箱は触るな」と言った。男は運賃を受け取ると、車から離れた場所で積み荷が数えられるのを見ていた。",
    "choices": [
      {
        "label": "荷受け係に手伝いを申し出る",
        "outcome": "あなたが箱を一つずつ下ろす間、男は車輪の泥を落としていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:loading-help"
        ],
        "recordAction": null
      },
      {
        "label": "男に荷運びの道を尋ねる",
        "outcome": "男は近道を教えてくれた。荷受け係が呼ぶまで、二人で車輪のそばに立っていた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:loader-talk"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob17",
    "title": "戸口の箒",
    "domain": "掃除・通り",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "路地と商店のある生活圏。同じ住人に対する反復行為として目撃。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "掃除・通り|感染者|居住街区の路地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "感染者の住人が通るたび、向かいの店主が箒を持って出てきた。その日も足音が遠ざかると、通りの乾いた石畳を何度も掃いた。",
    "choices": [
      {
        "label": "店主に掃除の理由を尋ねる",
        "outcome": "店主は「気になるんだよ」とだけ答え、箒の先を敷居に立て掛けた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:sweeping-question"
        ],
        "recordAction": null
      },
      {
        "label": "通りの住人に挨拶する",
        "outcome": "その住人は買い物籠を上げて挨拶を返した。店主の箒の音が背後で続いていた。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:sweeping-bystander"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ob18",
    "title": "修理札の赤い印",
    "domain": "修理・サービス",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "修理窓口のある生活圏。職人が相手の感染を事前に知っている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.29,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "修理・サービス|感染者|生活用品の修理窓口",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "道具の修理札を出した感染者の客に、職人は赤い印を押した。「こっちは後回しだ」と言い、同じ壊れ方をした別の品を先に棚へ載せた。",
    "choices": [
      {
        "label": "修理順を尋ねる",
        "outcome": "職人は赤い印を指で隠し、「急ぎの仕事がある」と言った。客は札を折って懐へしまった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:repair-order-query"
        ],
        "recordAction": null
      },
      {
        "label": "客に別の職人を教える",
        "outcome": "通りの先にある修理屋を教えた。客は品を包み直して外へ出た。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:repair-alternative"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi01",
    "title": "二つの値札",
    "domain": "小売・買い物",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.41,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "小売・買い物|感染者|市街地の食料品店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "干し肉を選んでいると、店主があなたの包みにだけ別の値札を貼った。「感染者には手間がかかる」と平然と言う。隣の客の値札はそのままだった。",
    "choices": [
      {
        "label": "元の値段で売るよう求める",
        "outcome": "店主は舌打ちして値札を剥がした。代金を払うと、包みを台に滑らせて寄越した。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:overpriced-price-restored"
        ],
        "recordAction": null
      },
      {
        "label": "買わずに品を戻す",
        "outcome": "干し肉を棚へ戻し、空の買い物袋を持って店を出た。店主は新しい値札を貼り直した。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:overpriced-walked-away"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi02",
    "title": "帳簿の署名",
    "domain": "商い・受取",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。受取予定の荷物が実際に記録されている場合。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.25,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "商い・受取|感染者|荷物の受取窓口",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "受取予定の荷物に結び付く注文履歴が現行状態にない。",
    "text": "注文した荷物の受取帳に署名すると、窓口の男は「感染者は保証人を連れてこい」と言って帳簿を閉じた。荷札にはあなたの名前がはっきり書かれている。",
    "choices": [
      {
        "label": "注文控えを示して引き渡しを求める",
        "outcome": "控えと帳簿を見比べた男は渋々荷物を出した。縄の結び目がやけに固かった。",
        "numericEffects": {
          "p": -1,
          "k": 1
        },
        "actionDescriptors": [
          "記憶:parcel-released"
        ],
        "recordAction": null
      },
      {
        "label": "後日あらためて受け取りに来る",
        "outcome": "控えを畳んで戻った。荷物を預けたまま帰る道は、行きより長く感じられた。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:parcel-deferred"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi03",
    "title": "髪を切る椅子",
    "domain": "理容・サービス",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。理髪の需要・商店利用が成立。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.28,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "理容・サービス|感染者|理髪店のある市街地",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "理髪店で順番を待っていると、店主はあなたを指して「感染者の髪は別の店で切ってもらえ」と告げた。椅子には白い布が一枚、きれいに掛かっている。",
    "choices": [
      {
        "label": "理由を問い、通常の料金を示す",
        "outcome": "店主は布を外しもせず、入口の戸を開けた。店の客たちは鏡越しにこちらを見ていた。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:barber-refused"
        ],
        "recordAction": null
      },
      {
        "label": "別の理髪店を探す",
        "outcome": "髪を結び直し、店を出た。隣の通りでは若い理髪師が客の頭を洗っていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:barber-search"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi04",
    "title": "洗い直す布",
    "domain": "家事・注文",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。洗濯・仕立てを外注している生活場面。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.32,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "家事・注文|感染者|仕立て・洗濯を請ける店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "洗濯・仕立てを外注した継続関係の記録が現行状態にない。",
    "text": "洗い上がった布を受け取りに行くと、店の女はあなたの包みだけを棒の先で押し出した。「そのまま持って帰って」と言い、ほかの客には手渡ししていた。",
    "choices": [
      {
        "label": "包みの受け渡しを頼む",
        "outcome": "女は唇を結び、棒から包みを外して台に置いた。糸の端が少しほつれていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:laundry-handled"
        ],
        "recordAction": null
      },
      {
        "label": "包みを拾って帰る",
        "outcome": "布を抱えて店を出た。背中で木の棒が床へ転がる音がした。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:laundry-pole"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi05",
    "title": "町の回覧",
    "domain": "近隣・情報",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。回覧や伝言のある居住形態。本人は集会・祭礼の案内対象。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.43,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "近隣・情報|感染者|回覧板・伝言がある街区",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "戸口に回覧板が届かなかった。隣人に聞くと、「病気の家へ回すのは嫌だって皆が」と言われる。祭礼の集合時刻は、あなた以外の家だけに伝わっていた。",
    "choices": [
      {
        "label": "回覧の順番に加えるよう頼む",
        "outcome": "隣人は板を持って来て、次の家へ回す順番を書き足した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:circular-restored"
        ],
        "recordAction": null
      },
      {
        "label": "祭礼の世話役に直接聞く",
        "outcome": "世話役は時刻を書いた紙を一枚渡した。ほかの家には既に配り終えていた。",
        "numericEffects": {
          "k": 1,
          "p": -1
        },
        "actionDescriptors": [
          "記憶:circular-direct"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi06",
    "title": "余った火鉢",
    "domain": "共同生活・暖房",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。共同暖房設備・共有空間への正当な利用権。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.26,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "共同生活・暖房|感染者|共同暖房のある宿舎・家屋",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "寒い朝、共用の火鉢へ近づくと、一緒に暖を取っていた二人が立ち上がった。「お前は向こうだ」と冷えた隅を指す。炭火の赤が遠くなった。",
    "choices": [
      {
        "label": "火鉢のそばに座る",
        "outcome": "二人は奥へ移った。あなたは伸ばした手を火にかざし、冷え切った指を温めた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:hearth-stayed"
        ],
        "recordAction": null
      },
      {
        "label": "別の暖かい場所を探す",
        "outcome": "上着を合わせて廊下に出た。台所の窓からかすかな湯気が漏れていた。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:hearth-left"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi07",
    "title": "道具箱の鍵",
    "domain": "共同作業・工房",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。実際の工房勤務・共同道具箱。就業中か短期職人仕事の現場。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.28,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "共同作業・工房|感染者|職人の共同作業場",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仕事台へ戻ると、共用道具箱に新しい鍵が付いていた。親方は「感染者に触られると客が嫌がる」と言い、あなたの持ち場だけ道具を渡さなかった。",
    "choices": [
      {
        "label": "自分の担当分の道具を求める",
        "outcome": "親方は箱を開け、鈍った刃物を一本だけ差し出した。あなたは研ぎ石を探した。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:work-tools-limited"
        ],
        "recordAction": null
      },
      {
        "label": "別の作業を願い出る",
        "outcome": "木屑を掃く仕事を任された。仕事台には削りかけの板が残った。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:work-reassigned-request"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi08",
    "title": "窓越しの釣銭",
    "domain": "商売・接客",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.43,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "商売・接客|感染者|窓口のある日用品店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "代金を払うと、店員は釣銭を窓枠の外へ一枚ずつ並べた。あなたの後ろの客には掌へ渡している。「病気の人にはこの方がいい」と店員は言った。",
    "choices": [
      {
        "label": "並べられた釣銭を受け取る",
        "outcome": "小銭を数えて財布へ入れた。窓枠にはあなたの指の跡だけが残っていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:change-window"
        ],
        "recordAction": null
      },
      {
        "label": "同じ受け渡しをしてほしいと伝える",
        "outcome": "店員は眉を寄せ、小銭を一度まとめてから台に置いた。",
        "numericEffects": {
          "equityGain": 1,
          "p": -1
        },
        "actionDescriptors": [
          "記憶:change-request"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi09",
    "title": "名を呼ぶ順番",
    "domain": "地域・受付",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。受付番号制の実在。医療・学校など強い制度効果は個別イベントへ譲る。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.31,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "地域・受付|感染者|混雑する地域サービスの受付",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "窓口の名簿であなたの名が飛ばされた。受付係は次の人を呼び、こちらへ「感染者の分は夕方だ」と言った。窓の向こうでは時計の針が進んでいた。",
    "choices": [
      {
        "label": "受付係に順番を示す",
        "outcome": "控えの番号を見せると、係は顔をしかめながら名簿に印を付けた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:reception-number-restored"
        ],
        "recordAction": null
      },
      {
        "label": "夕方に来ると伝える",
        "outcome": "控えを懐にしまった。外の明るい通りには、今からできる用事がいくつか残っていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:reception-return"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi10",
    "title": "二枚の包み紙",
    "domain": "市場・買い物",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "市場・買い物|感染者|乾物屋・肉屋など食材店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "乾物を注文すると、店主はあなたの袋だけを紙で二重に包んだ。「感染者に売ったと知られるのは困る」と小声で言う。袋の口がひどく固く結ばれた。",
    "choices": [
      {
        "label": "その場で包みをほどく",
        "outcome": "店主の前で上の紙を外した。乾物の匂いがふっと広がった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:double-wrapping-opened"
        ],
        "recordAction": null
      },
      {
        "label": "包みを受け取って帰る",
        "outcome": "紙の重みが買い物籠の底に残った。家に着いても結び目は固かった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:double-wrapping-carried"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi11",
    "title": "遊びの見学",
    "domain": "子ども・余暇",
    "target": "感染者",
    "ageRange": {
      "min": 6,
      "max": 15
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。本人が6〜15歳。遊び仲間または遊び場との接点がある。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.47,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "子ども・余暇|感染者|町内の遊び場",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "子どもたちの縄跳びに入ろうとすると、大人が「感染者の子は見ているだけにして」と手を伸ばした。縄が足元で止まり、向こうの子が口を開きかけた。",
    "choices": [
      {
        "label": "一緒に跳びたいと伝える",
        "outcome": "隣の子が縄の片端を渡してくれた。大人は不機嫌そうに腕を組んだ。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:rope-participation"
        ],
        "recordAction": null
      },
      {
        "label": "輪の外で数を数える",
        "outcome": "縄が跳ねるたびに声を出して数えた。腕に巻いた上着だけが次第に冷たくなった。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:rope-sidelined"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi12",
    "title": "祈祷の小札",
    "domain": "祈り・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。宗教的な小札授与の慣行が現地に実在。特定宗派の規則は創作事例として扱う。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.2,
    "cooldownYears": 12,
    "once": false,
    "episodeKey": "祈り・日常|感染者|個別の祈祷・祭礼を行う場所",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "家族のために小札を求めると、受付の老人は「鉱石病の家には渡せない」と小札を引き出しへ戻した。後ろの参拝客には同じものを手渡している。",
    "choices": [
      {
        "label": "理由を尋ねる",
        "outcome": "老人は「代々の決まりだ」と言って引き出しを閉めた。あなたは賽銭を握り直した。",
        "numericEffects": {
          "k": 1,
          "p": -1
        },
        "actionDescriptors": [
          "記憶:charm-refused"
        ],
        "recordAction": null
      },
      {
        "label": "別の祈り方を選ぶ",
        "outcome": "境内の端で手を合わせ、家族の名を一人ずつ思い浮かべた。",
        "numericEffects": {
          "p": 1
        },
        "actionDescriptors": [
          "記憶:charm-private-prayer"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi13",
    "title": "配達の時間",
    "domain": "町内・便り",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。継続した配達依頼と同一配達人の勤務が必要。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "町内・便り|感染者|配達サービスのある市街地",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "継続配達と同一配達人の人物IDを照合できない。",
    "text": "頼んだ荷物だけが毎度日暮れに届く。配達人は今日も「感染者の家は最後にしている」と肩をすくめた。夕食の支度に使う品が、紙包みの中で冷えていた。",
    "choices": [
      {
        "label": "配達の予定を相談する",
        "outcome": "配達人は明日の便から順番を変えると言い、荷車の台帳に印を付けた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:delivery-time-adjusted"
        ],
        "recordAction": null
      },
      {
        "label": "荷物を受け取って戸を閉める",
        "outcome": "包みの紐をほどき、冷えた品を取り出した。外で荷車の車輪が軋んだ。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:delivery-time-late"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vi14",
    "title": "買い物の列の印",
    "domain": "商店・登録",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人が感染・診断済み。相手の認知がinfectionAwarenessに本人・同生活圏・当該受け手として記録済み。場面固有の施設利用を確認。店に実際の常連名簿がある。法令上の感染者登録制度とは分ける。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "感染診断本人・受け手・現在の受取場所が照合できる。無関係な隣人へ感染を自動拡散しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.3,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "商店・登録|感染者|登録客のある生活用品店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "店の常連名簿という実在文書の記録が現行状態にない。",
    "text": "会員帳を開いた店員が、あなたの名前の横に小さな黒い印を押した。「これなら誰が相手をしたか分かる」と言う。前の客の欄は白いままだった。",
    "choices": [
      {
        "label": "印の意味を問い、取り消しを求める",
        "outcome": "店員は帳簿を引っ込め、黒い印の上に細い線を引いた。紙には跡が残った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:customer-mark-crossed"
        ],
        "recordAction": null
      },
      {
        "label": "買い物を済ませる",
        "outcome": "品物を持って店を出た。帳簿にはあなたの名前と黒い印が並んでいた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:customer-mark-left"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs01",
    "title": "パンの端",
    "domain": "市場・食べ物",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.46,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "市場・食べ物|サルカズ|パン屋のある市街地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "パン屋で焼き立てを頼むと、店主はあなたの角を見て、棚の端に残った固い一つを指した。「サルカズにはそれで十分だ」と言う。湯気の立つ籠は腕の届かぬ所へ置かれた。",
    "choices": [
      {
        "label": "同じ代金で同じ品を求める",
        "outcome": "店主は顔をしかめ、新しいパンを一つ紙に包んだ。紙から温かさが伝わった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:bakery-equal-sale"
        ],
        "recordAction": null
      },
      {
        "label": "棚の端のパンを買う",
        "outcome": "固い皮を指で押して確かめ、金を払った。店主は籠をすぐ奥へ戻した。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:bakery-stale-sale"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs02",
    "title": "名前の綴り",
    "domain": "帳場・姓名",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。帳簿・受付のある場所。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "帳場・姓名|サルカズ|宿帳・業務受付のある施設",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "受付係があなたの名を聞き、帳簿にわざと別の綴りを書いた。「サルカズの名は難しくてね」と笑い、言い直しても筆を止めなかった。",
    "choices": [
      {
        "label": "書き直すよう頼む",
        "outcome": "係は面倒そうに紙を擦り、正しい名を書いた。消した字は薄く透けて残った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:name-corrected"
        ],
        "recordAction": null
      },
      {
        "label": "そのまま用を済ませる",
        "outcome": "別の綴りの札を受け取り、用事を終えた。名を呼ばれるたび少しだけ首を上げた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:name-misspelled"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs03",
    "title": "荷台の横",
    "domain": "運送・同乗",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。実際に乗合便が利用可能。所有荷車での移動には出さない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.33,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "運送・同乗|サルカズ|共同の荷車・乗合便",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "乗合の荷車で空いた座を示すと、御者はあなたの角を一瞥し、「サルカズは荷物の横に座れ」と荷台の端を叩いた。座には二人分の空きがあった。",
    "choices": [
      {
        "label": "空いた座に座る",
        "outcome": "御者は小さく舌打ちし、手綱を引いた。揺れる座板をしっかり握った。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:wagon-seat-held"
        ],
        "recordAction": null
      },
      {
        "label": "荷台の端へ移る",
        "outcome": "麻袋の横へ腰を下ろした。車輪が跳ねるたび、背中に箱の角が当たった。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:wagon-cargo-seat"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs04",
    "title": "盃を断る理由",
    "domain": "食堂・社交",
    "target": "サルカズ",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。食事・酒場の利用年齢に適合。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "食堂・社交|サルカズ|酒場・食事処",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仕事帰りに店へ寄ると、隣席の男があなたの角を見て盃を伏せた。「サルカズと同じ卓で飲む気はない」と言い、料理を残して席を立った。",
    "choices": [
      {
        "label": "店主に一人分の食事を頼む",
        "outcome": "店主は温かい皿を置いた。空いた席に残った盃だけが伏せられていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:tavern-stayed"
        ],
        "recordAction": null
      },
      {
        "label": "店を出る",
        "outcome": "代金を払う前に戸口へ向かった。背後で誰かが椅子を引く音がした。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:tavern-left"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs05",
    "title": "針の貸し借り",
    "domain": "職場・工房",
    "target": "サルカズ",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。現に同じ仕事場へ出入り。針・手工具の使われる職種に限る。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.31,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "職場・工房|サルカズ|実際に通う裁縫・細工の仕事場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "手工具・針作業を伴う職務種別を現在の勤務記録から確認できない。",
    "text": "仕事場で針を一本借りると、向かいの職人が「サルカズの使った物は戻すな」と声を上げた。針箱は職人たちの間を普通に行き来している。",
    "choices": [
      {
        "label": "針を手入れして箱へ戻す",
        "outcome": "使い終えた針を拭いて元の穴に差した。職人は箱を見たまま黙った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:needle-returned"
        ],
        "recordAction": null
      },
      {
        "label": "自分の針を買い足す",
        "outcome": "帰りに細い針を二本買い、布に刺して包んだ。翌朝からは自分の箱を持っていった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:needle-private"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs06",
    "title": "帳場の身元札",
    "domain": "居住・身元確認",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。実際の宿泊の必要と宿帳制度。武器所持を本文から捏造しない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "居住・身元確認|サルカズ|短期宿泊の受付",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "宿の帳場で身元札を出すと、主人は角を眺めて「傭兵なら先に武器を預けろ」と言った。あなたが持っているのは旅荷だけである。",
    "choices": [
      {
        "label": "荷物を開いて旅の用件を説明する",
        "outcome": "包みの中の衣類と道具を見せた。主人は渋々宿帳を差し出した。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:inn-credentials"
        ],
        "recordAction": null
      },
      {
        "label": "別の宿を探す",
        "outcome": "身元札をしまい、まだ明るい通りへ戻った。後ろで帳場の戸が閉まった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:inn-other-search"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs07",
    "title": "祭りの飾り",
    "domain": "祭礼・手伝い",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。祭礼の地元当番がある。宗教的禁忌は当該の人物の信念として扱う。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.28,
    "cooldownYears": 12,
    "once": false,
    "episodeKey": "祭礼・手伝い|サルカズ|町内で飾り付けをする祭礼",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "祭りの飾りを結ぶ手伝いに名乗り出ると、古参の男が縄を取り上げた。「サルカズに結ばせると縁起が悪い」と言う。飾りの鈴は風に揺れていた。",
    "choices": [
      {
        "label": "縄を返してほしいと伝える",
        "outcome": "男は返事をせず、隣の若者に縄を渡した。若者がこちらを見て眉をひそめた。",
        "numericEffects": {
          "p": -2
        },
        "actionDescriptors": [
          "記憶:festival-rebuff"
        ],
        "recordAction": null
      },
      {
        "label": "ほかの作業を探す",
        "outcome": "祭りの台を運ぶ手伝いを見つけた。縄を結ぶ音が背中で続いていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:festival-alternate-work"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs08",
    "title": "包まれた薬",
    "domain": "薬屋・日常",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。一般の薬品販売に限り、診断や処方箋を新たに創作しない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "薬屋・日常|サルカズ|町の薬屋",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "薬包みを受け取ると、店員は「サルカズは呪いの薬でも飲むのか」と笑った。処方の紙を読んでもいない。乳鉢の音だけが奥で続いていた。",
    "choices": [
      {
        "label": "薬の用件を説明する",
        "outcome": "風邪に使う薬だと伝えると、店員は口をつぐんだ。包みの紐を固く結んで渡された。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:apothecary-explained"
        ],
        "recordAction": null
      },
      {
        "label": "代金を置いて帰る",
        "outcome": "薬包みを懐に入れた。店を出るまで店員は笑みを引っ込めなかった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:apothecary-joke"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs09",
    "title": "市場の手秤",
    "domain": "市場・信用",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。量り売りする露店の実在。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.39,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "市場・信用|サルカズ|量り売りの市場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "豆の量を確かめようと秤へ手を伸ばすと、商人が分銅を引き寄せた。「サルカズに秤を任せたら何をするか分からん」と言って、見えない所で量り直した。",
    "choices": [
      {
        "label": "目の前で量り直すよう求める",
        "outcome": "商人は渋々秤を台の端へ戻した。針が真ん中で止まるまで、二人で見つめた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:scale-transparent"
        ],
        "recordAction": null
      },
      {
        "label": "豆を買わずに帰る",
        "outcome": "袋を戻して通りへ出た。ほかの店では分銅の音が軽く響いていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:scale-abandoned"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs10",
    "title": "絵葉書の裏",
    "domain": "郵便・連絡",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。郵便・書簡送付制度が現地にある。便りの宛先も実際に存在。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.26,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "郵便・連絡|サルカズ|文書を扱う窓口",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "郵便経路と実在する宛先人物を同時に確認できない。",
    "text": "便りを出そうとすると、係員は宛名を見て「サルカズの手紙は後で調べる」と別の箱へ放り込んだ。前の客の便りはすぐに封を切らず流れていった。",
    "choices": [
      {
        "label": "通常の扱いを求める",
        "outcome": "係員は面倒そうに箱から便りを拾い、普通の束に差し入れた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:letter-regular-post"
        ],
        "recordAction": null
      },
      {
        "label": "控えをもらって窓口を離れる",
        "outcome": "控えには日付だけが書かれていた。別箱の口は固く閉まっていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:letter-special-box"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs11",
    "title": "修繕した扉",
    "domain": "近隣・労働",
    "target": "サルカズ",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。主人公が実際に修繕を引き受けた職種・短期仕事。仕事の成立と報酬は既存契約で管理。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.28,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "近隣・労働|サルカズ|近隣に修理仕事のある住宅街",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "修理依頼・契約・完了の仕事記録が現行状態にない。",
    "text": "頼まれた扉の蝶番を直すと、家主はきちんと閉まる戸を試したあと、「サルカズにしては手先が器用だ」と笑った。工具の先に木屑がついていた。",
    "choices": [
      {
        "label": "仕事ぶりを見て判断してほしいと返す",
        "outcome": "家主は扉をもう一度開け閉めし、「まあ、直った」と答えた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:door-repair-reply"
        ],
        "recordAction": null
      },
      {
        "label": "道具を片づける",
        "outcome": "工具を箱に収めた。扉は静かに閉まったが、言葉はしばらく耳に残った。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:door-repair-passive"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs12",
    "title": "縁日のくじ",
    "domain": "祭礼・娯楽",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。催事のくじ遊びがある街。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.25,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "祭礼・娯楽|サルカズ|縁日・市日のくじ屋",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "くじ箱へ手を入れようとすると、主人が箱を抱えて退いた。「サルカズは何を仕込むか分からん」と言う。並んでいた子どもたちがあなたの手元をのぞき込んだ。",
    "choices": [
      {
        "label": "くじを引く条件を聞く",
        "outcome": "主人は「ほかの人が終わってからだ」と箱を戻した。列の後ろでは子どもが笑っていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:lottery-delayed"
        ],
        "recordAction": null
      },
      {
        "label": "列から抜けて別の屋台へ行く",
        "outcome": "焼き菓子を一つ買った。背後ではくじ箱を振る音がまた始まった。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:lottery-left"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs13",
    "title": "図書の貸出札",
    "domain": "学び・読書",
    "target": "サルカズ",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。本を貸す施設が現地に存在し、主人公が利用する。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "学び・読書|サルカズ|本の貸出がある集会所・私設図書室",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "本を借りようとすると、係の女が貸出札を裏返した。「サルカズは返しに来ない人が多いから」と言い、ほかの客の札だけに日付を記した。",
    "choices": [
      {
        "label": "返却日を約束する",
        "outcome": "日付を声に出して伝えると、係はしぶしぶ札を受け取った。借りた本の背が少し破れていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:library-borrowed"
        ],
        "recordAction": null
      },
      {
        "label": "その場で本を読む",
        "outcome": "窓際の席で頁を開いた。係が閉館を告げるまで、同じ椅子に座っていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:library-on-site"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_vs14",
    "title": "名前を伏せた花",
    "domain": "近隣・弔意",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "本人の種族がサルカズ。相手が角・氏名・名乗りなどから当人をサルカズと認識。組織外の商業・街区場面。実際に弔意を寄せる隣人・関係先が存在。葬儀場面が成立。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "種族と、会話・容貌・名前等により相手が認識した場面。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.19,
    "cooldownYears": 15,
    "once": false,
    "episodeKey": "近隣・弔意|サルカズ|近隣で葬送に花を供える習慣のある生活圏",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "弔事の発生と本人の近隣関係・参列を示す記録が現行状態にない。",
    "text": "近所の葬儀へ花を持って行くと、受付の男はあなたの名を紙に書きかけて止めた。「サルカズの名前は表に出さない方がいい」と言って、花だけ受け取った。",
    "choices": [
      {
        "label": "名を残してほしいと頼む",
        "outcome": "男は短くうなずき、花の横に名前を書き添えた。墨の乾く匂いがした。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:flower-name-listed"
        ],
        "recordAction": null
      },
      {
        "label": "花を託して帰る",
        "outcome": "門の外へ出た。花の色だけが他の供え物の間に見えた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:flower-anonymous"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac01",
    "title": "軒下の一歩",
    "domain": "通り・雨宿り",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7歳以上。市街地の商店前。感染者であることが当人の発言・既知の札などで分かっている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.39,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "通り・雨宿り|感染者|商店の軒下",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "雨が強くなり、軒下に入った感染者の旅人を店主が追い払おうとした。「客でもない病人を置くな」と叫ぶ。雨粒が路面で白く跳ねていた。",
    "choices": [
      {
        "label": "旅人に隣へ入るよう声をかける",
        "outcome": "二人で荷を抱えて軒下に寄った。店主は舌打ちしたが、追い払うのをやめた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "socialConflictAction:help/infected/shelter-rain"
        ],
        "recordAction": null
      },
      {
        "label": "店主の言うまま場所を空ける",
        "outcome": "旅人は濡れた鞄を持ち直して雨へ出た。軒の雨だれが一筋だけ太くなった。",
        "numericEffects": {
          "biasInf": 1
        },
        "actionDescriptors": [
          "socialConflictAction:remain/infected/observe-exclusion"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac02",
    "title": "店の釣銭皿",
    "domain": "商店・接客",
    "target": "感染者",
    "ageRange": {
      "min": 14,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "主人公が実際に小売店の会計業務を担当。来店客が感染者と認知された事情あり。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.37,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "商店・接客|感染者|主人公が客へ会計を行う小売店",
    "requiresPlayerDiagnosis": true,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "小売会計担当という具体的な職務を現在の勤務記録から確認できない。",
    "text": "帳場で感染者の客から代金を受け取ると、隣の店員が「皿を使え、手で受けるな」と耳打ちした。客は買い物袋を持って待っている。",
    "choices": [
      {
        "label": "いつも通り会計を済ませる",
        "outcome": "小銭を数えて手渡した。客は袋を持ち替え、「どうも」と言って店を出た。",
        "numericEffects": {
          "biasInf": -2
        },
        "actionDescriptors": [
          "社会行動:ordinary-service"
        ],
        "recordAction": null
      },
      {
        "label": "釣銭皿へ置いて渡す",
        "outcome": "客は小銭を指で集め、店を出た。隣の店員は満足そうにうなずいた。",
        "numericEffects": {
          "biasInf": 2
        },
        "actionDescriptors": [
          "社会行動:social-distance"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac03",
    "title": "仲間内の呼び名",
    "domain": "仲間・雑談",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "9歳以上。雑談の相手とサルカズ運搬人を目撃。本人がサルカズの場合は同調肢を別の自集団内反応に切り替える。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.48,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "仲間・雑談|サルカズ|近隣や職場での雑談",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仲間が新しく来たサルカズの運搬人を指して「角付き」と呼んだ。本人がこちらを見ると、仲間は急に声を落として笑った。",
    "choices": [
      {
        "label": "名前で呼ぼうと言う",
        "outcome": "仲間は肩をすくめ、次は運搬人の名を呼んだ。運搬人は縄を解く手を止めなかった。",
        "numericEffects": {
          "biasSar": -2,
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "仲間の冗談に合わせる",
        "outcome": "同じ呼び名を一度口にした。運搬人は荷を持って通りの向こうへ歩いていった。",
        "numericEffects": {
          "biasSar": 3
        },
        "actionDescriptors": [
          "socialConflictAction:endorse/sarkaz/derogatory-nickname"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac04",
    "title": "貼り紙の余白",
    "domain": "掲示・自治",
    "target": "感染者",
    "ageRange": {
      "min": 12,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "公共掲示板に実際の排斥紙が貼られ、主人公が現場に居合わせる。後者は本人の偏見値20以上か排斥団体所属時のみ表示。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.3,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "掲示・自治|感染者|市街地の掲示板",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "地区の掲示板に、感染者の通行を避けるよう促す紙が貼られた。隣に立つ青年が「もっと大きく書けばいい」と筆を差し出してきた。",
    "choices": [
      {
        "label": "筆を断って紙を剥がす",
        "outcome": "紙を外すと、糊の痕が白く残った。青年は不満そうに筆をしまった。",
        "numericEffects": {
          "equityGain": 3
        },
        "actionDescriptors": [
          "社会行動:oppose-poster"
        ],
        "recordAction": null
      },
      {
        "label": "筆を借りて文字を太くする",
        "outcome": "墨を足した文字は遠くからでも読めた。青年は満足そうに掲示板を見上げた。",
        "numericEffects": {
          "biasInf": 4
        },
        "actionDescriptors": [
          "socialConflictAction:endorse/infected/advertise-exclusion"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac05",
    "title": "誰が掃除する",
    "domain": "職場・分担",
    "target": "感染者",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "現に勤務。共同当番表があり、同僚の感染情報が職場で認知されている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.42,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "職場・分担|感染者|現に働く職場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "当番表を回すと、班長が感染者の同僚の名前にだけ掃除の印をつけた。「余計な仕事はあいつにやらせればいい」と笑う。机には全員の名前が並んでいる。",
    "choices": [
      {
        "label": "自分の当番も引き受ける",
        "outcome": "班長から箒を一本受け取り、同僚と二人で床を掃いた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "socialConflictAction:help/infected/shared-duty"
        ],
        "recordAction": null
      },
      {
        "label": "当番表に従う",
        "outcome": "仕事の終わりに同僚だけが箒を持った。あなたは灯りを消して工房を出た。",
        "numericEffects": {
          "biasInf": 1
        },
        "actionDescriptors": [
          "socialConflictAction:remain/infected/unfair-duty"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac06",
    "title": "卓の端の話題",
    "domain": "食卓・噂",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "8歳以上。実際に食事を共にする人がいる。野菜の持ち主について感染者だと知る手掛かりを明示。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.49,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "食卓・噂|感染者|知人と食事する生活場面",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "夕飯の席で、知人が感染者の隣人の作った料理を「食べたら病気がうつる」と笑った。皿の上にはその隣人から分けてもらった野菜が載っていた。",
    "choices": [
      {
        "label": "野菜を食べながら言い返す",
        "outcome": "知人は箸を止め、やがて別の話を始めた。皿はいつも通り空になった。",
        "numericEffects": {
          "biasInf": -2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "知人に調子を合わせる",
        "outcome": "笑って野菜を避けた。残ったひと切れは食事の終わりまで冷えていた。",
        "numericEffects": {
          "biasInf": 3
        },
        "actionDescriptors": [
          "socialConflictAction:endorse/infected/food-rumor"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac07",
    "title": "寄せた箱",
    "domain": "商店・仕事",
    "target": "サルカズ",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "現に荷受け・仕分けの職務に従事。対象運送人はサルカズと分かっている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "商店・仕事|サルカズ|主人公が荷の仕分けを担当する現場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "荷受け・仕分け担当という職務と相手の運送人情報を現行記録から確認できない。",
    "text": "荷場の男が、サルカズの運送人が運んだ箱だけを隅に積むよう指示した。「あいつらの荷は後で数えろ」と言って帳簿を閉じる。",
    "choices": [
      {
        "label": "荷札の順に並べる",
        "outcome": "到着時刻を見て箱を並べ直した。後から来た荷が隅へ移った。",
        "numericEffects": {
          "equityGain": 2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "言われた通り隅に積む",
        "outcome": "箱を重ね終えると、運送人がしばらくその前に立っていた。",
        "numericEffects": {
          "biasSar": 2
        },
        "actionDescriptors": [
          "socialConflictAction:exclude/sarkaz/delayed-cargo"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac08",
    "title": "一つ多い皿",
    "domain": "食堂・客席",
    "target": "サルカズ",
    "ageRange": {
      "min": 14,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "労働仲間との食堂利用。実在する新入りをこの一場面のNPCとして生成可能。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.41,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "食堂・客席|サルカズ|食堂のある労働地区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "同僚たちが昼の席を取ると、サルカズの新入りの分だけ椅子が出されなかった。新入りは盆を持ったまま「どこへ座ればいい」と尋ねた。",
    "choices": [
      {
        "label": "椅子を運んで席を空ける",
        "outcome": "新入りは隣に座り、冷めかけた皿を食べ始めた。向かいの同僚は目を合わせなかった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "socialConflictAction:help/sarkaz/canteen-seat"
        ],
        "recordAction": null
      },
      {
        "label": "何も言わず食べ始める",
        "outcome": "新入りは窓際の立ち席へ移った。食堂の喧騒は変わらず続いた。",
        "numericEffects": {},
        "actionDescriptors": [
          "社会行動:passive-bystander"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac09",
    "title": "借りた縄",
    "domain": "農作業・共同作業",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "共同作業と実際の道具貸与。本人の種族がサルカズなら自集団回避の選択を内面化軸へ記録。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "農作業・共同作業|サルカズ|共同で作業する荷捌き・農作業",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "縄を貸してくれたサルカズの旅人が去ったあと、作業仲間が「やつらの物は使いにくい」と言った。縄には丈夫な結び目が一つ残っていた。",
    "choices": [
      {
        "label": "縄の丈夫さを伝える",
        "outcome": "仲間は結び目を引いて試し、「まあ使えるな」と返した。",
        "numericEffects": {
          "biasSar": -2
        },
        "actionDescriptors": [
          "記憶:rope-praise"
        ],
        "recordAction": null
      },
      {
        "label": "縄を脇へ置く",
        "outcome": "借りた縄を束ね、別の縄を探した。作業は少し遅れた。",
        "numericEffects": {
          "biasSar": 2
        },
        "actionDescriptors": [
          "記憶:rope-rejected"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac10",
    "title": "忘れた挨拶",
    "domain": "近隣・社交",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7歳以上。居住街区で当人の感染が隣人に既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.54,
    "cooldownYears": 5,
    "once": false,
    "episodeKey": "近隣・社交|感染者|住宅街の路地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "隣人が感染者の住人にだけ挨拶を返さなかった。住人の方は二度目も「おはよう」と言い、荷を抱え直して歩いていった。",
    "choices": [
      {
        "label": "自分から住人に声をかける",
        "outcome": "住人は足を止め、今日の天気の話をした。隣人は戸を閉めた。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:street-greeting-responded"
        ],
        "recordAction": null
      },
      {
        "label": "隣人と一緒に歩く",
        "outcome": "何も言わず歩き出した。住人の荷車が角を曲がる音が聞こえた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:street-greeting-passed"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac11",
    "title": "わざとの言い間違い",
    "domain": "市井・言語",
    "target": "ターラー系",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ヴィクトリア"
    ],
    "sceneBinding": "session",
    "conditionSummary": "ヴィクトリアで実際にターラー系住民と出会う街路・商店。話者が相手の出自・言語を識別。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.35,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "市井・言語|ターラー系|ヴィクトリアの人の集まる場所",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "通りの男がターラー人の客の言葉をわざと大声で真似た。仲間が笑うと、客は釣銭をしまって店を離れた。男はまだその発音を繰り返している。",
    "choices": [
      {
        "label": "真似をやめるよう伝える",
        "outcome": "男は肩をすくめたが、同じ言葉を繰り返すのをやめた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:accent-mockery-stopped"
        ],
        "recordAction": null
      },
      {
        "label": "仲間と笑う",
        "outcome": "真似した言葉を口にして笑った。客の背中は通りの人波に消えた。",
        "numericEffects": {},
        "actionDescriptors": [
          "biasIdentity:2",
          "社会行動:endorse/tara/language-mockery"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac12",
    "title": "乗せない木箱",
    "domain": "商店・配送",
    "target": "感染者",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "現に配送・倉庫に関わる仕事。実際の納期と運送便が記録された場合。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "商店・配送|感染者|配達用の荷車がある現場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "実際の納期と配送便・倉庫の勤務記録を照合できない。",
    "text": "運搬係が、感染者の得意先へ届ける箱を車の脇へ戻した。「あそこは明日でいい」と言う。帳簿の納期には今日の日付が記されていた。",
    "choices": [
      {
        "label": "今日の便に箱を積む",
        "outcome": "箱を荷台へ持ち上げ、ほかの荷と縄で締めた。運搬係は黙って車を出した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:shipment-kept"
        ],
        "recordAction": null
      },
      {
        "label": "係の判断に従う",
        "outcome": "箱を倉庫の隅へ戻した。得意先の宛名札が扉の方を向いていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "社会行動:complicit-delay"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac13",
    "title": "分ける塗料",
    "domain": "共同修繕・作業",
    "target": "感染者",
    "ageRange": {
      "min": 12,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "地域の共同修繕が実際に行われている。二人が同じ現場で作業できる。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.26,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "共同修繕・作業|感染者|共同で修繕する街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "壁の塗り直しで、感染者の大工にだけ色の薄い塗料が渡された。「裏手を塗ってくれ、客から見えないから」と世話役が言う。大工は刷毛を握り直した。",
    "choices": [
      {
        "label": "大工と表側を塗る",
        "outcome": "大工は新しい刷毛を差し出し、二人で正面の壁へ塗料を伸ばした。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "socialConflictAction:help/infected/repair-work"
        ],
        "recordAction": null
      },
      {
        "label": "言われた裏手の壁を塗る",
        "outcome": "薄い色を黙って伸ばした。表通りの方からは笑い声が聞こえていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "社会行動:accept-inferior-assignment"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ac14",
    "title": "友人の家の皿",
    "domain": "家庭・交友",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "友人宅への実際の訪問と共食。サルカズの来客が同席。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.28,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "家庭・交友|サルカズ|友人宅の食事会",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "友人の家へ招かれると、主人が同席するサルカズの客にだけ欠けた皿を出した。「丈夫そうだから平気だろう」と笑う。客は黙って皿を眺めた。",
    "choices": [
      {
        "label": "自分の皿と交換する",
        "outcome": "欠けた皿を引き寄せ、使える方を客へ渡した。主人は何か言いかけて飲み込んだ。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:plate-exchanged"
        ],
        "recordAction": null
      },
      {
        "label": "主人に皿を替えるよう頼む",
        "outcome": "主人は棚から新しい皿を一枚取り出した。客は短く礼を言った。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:plate-requested"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch01",
    "title": "朝の戸口",
    "domain": "家庭・社会化",
    "target": "感染者",
    "ageRange": {
      "min": 5,
      "max": 13
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "5〜13歳。同居する存命の親または養育者が感染者への軽い警戒を示す（beliefs.infected 25〜64）。同じ地域で隣家の感染が周知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.55,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "家庭・社会化|感染者|家族と暮らす街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "朝、親が窓から隣家を眺め、「あの家は鉱石病の人が住んでいるから、あまり近づくな」と言った。隣の家からはいつものように鍋の音がしていた。",
    "choices": [
      {
        "label": "何が怖いのか親に聞く",
        "outcome": "親は病の名前を繰り返したが、家の人が何をしたかは話さなかった。",
        "numericEffects": {
          "biasInf": -1,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "言いつけを守って遠回りする",
        "outcome": "翌朝、同じ家の前を通らずに学校や用事へ向かった。角を一つ余計に曲がった。",
        "numericEffects": {
          "biasInf": 3
        },
        "actionDescriptors": [
          "記憶:family-avoid-neighbor"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch02",
    "title": "母の買い物籠",
    "domain": "家庭・社会化",
    "target": "感染者",
    "ageRange": {
      "min": 6,
      "max": 13
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "6〜13歳。買い物をする同居の母または養育者がいる。家族の感染認知と話者の軽い不安が成立。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.46,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "家庭・社会化|感染者|家庭での買い物・帰宅",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "母が買い物籠の底に薬包みを見つけ、「隣の感染者の薬と混ざっていないよね」と眉を寄せた。包装紙には自分の家の名前が書いてある。",
    "choices": [
      {
        "label": "包みの名を読む",
        "outcome": "紙に書かれた家の名を読んで見せると、母は籠を戻して夕飯の支度を始めた。",
        "numericEffects": {
          "k": 1,
          "biasInf": -1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "心配になって包みを離す",
        "outcome": "薬包みを机の端へ置いた。母が買ってきたパンまで遠く感じられた。",
        "numericEffects": {
          "biasInf": 2
        },
        "actionDescriptors": [
          "記憶:medicine-basket-fear"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch03",
    "title": "犬の散歩道",
    "domain": "路地・遊び",
    "target": "感染者",
    "ageRange": {
      "min": 6,
      "max": 14
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "6〜14歳。近隣で同年代と遊ぶ機会。相手の家が感染者世帯であることを友人が知っている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.6,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "路地・遊び|感染者|住居の近くの道",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "一緒に遊んでいた子が、感染者の家の前へ来ると歩みを止めた。「あそこの道は通るなって言われた」と言う。家の前では犬が寝そべっていた。",
    "choices": [
      {
        "label": "いつもの道を通る",
        "outcome": "家の前を歩くと、犬は片耳を動かしただけだった。友だちは少し遅れてついてきた。",
        "numericEffects": {
          "biasInf": -2
        },
        "actionDescriptors": [
          "記憶:children-passed-house"
        ],
        "recordAction": null
      },
      {
        "label": "友だちと別の道を選ぶ",
        "outcome": "細い裏道を通った。塀の向こうで犬の鳴き声が聞こえた。",
        "numericEffects": {
          "biasInf": 2
        },
        "actionDescriptors": [
          "記憶:children-detoured"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch04",
    "title": "広場の鬼ごっこ",
    "domain": "遊び場・仲間",
    "target": "サルカズ",
    "ageRange": {
      "min": 6,
      "max": 14
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "6〜14歳。共同遊び場と複数の遊び仲間がいる。主人公がサルカズの場合は同調肢の偏見値をselfStigmaへ。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.6,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "遊び場・仲間|サルカズ|街区の広場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "鬼ごっこでサルカズの子が鬼になると、年上の子が「角があるんだからずっと鬼だ」と決めつけた。石畳の上でその子は腕を下ろした。",
    "choices": [
      {
        "label": "交代する順番を提案する",
        "outcome": "年上の子は顔をしかめたが、数を数えて鬼を交代した。",
        "numericEffects": {
          "biasSar": -2,
          "equityGain": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "そのまま遊び続ける",
        "outcome": "同じ子が何度も鬼になった。夕暮れに遊びが終わるまで、誰も順番を変えなかった。",
        "numericEffects": {
          "biasSar": 2
        },
        "actionDescriptors": [
          "記憶:game-unequal-turns"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch05",
    "title": "黒板の落書き",
    "domain": "学校・仲間",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": 17
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "7〜17歳。実際に就学・出席し、学校と同級生が存在。同級生の感染は学校側に既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "学校・仲間|感染者|実際の通学校内",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "休み時間、黒板に感染者の同級生の名と「病気をうつす」と書かれていた。同級生は教室の入口に立ち、文字を見つめている。",
    "choices": [
      {
        "label": "黒板を消す",
        "outcome": "布で字を消すと白い粉が舞った。同級生は荷物を持って自分の机へ向かった。",
        "numericEffects": {
          "biasInf": -2,
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "書いた子を探す",
        "outcome": "何人かに尋ねたが、誰も筆跡を知っているとは言わなかった。黒板の字は次の授業まで残った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:blackboard-investigated"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch06",
    "title": "ぼろ布の冠",
    "domain": "学校外・手伝い",
    "target": "サルカズ",
    "ageRange": {
      "min": 8,
      "max": 16
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "8〜16歳。学校外の職人・店の手伝いに接する。本人がサルカズなら選択肢を自集団内の反応として扱う。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.46,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "学校外・手伝い|サルカズ|路地の雑用・見習い場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "見習いの仕事をしていると、年上の子が布で作った角を頭につけ、サルカズの職人の歩き方を真似した。周りから笑い声が上がった。",
    "choices": [
      {
        "label": "やめるよう言う",
        "outcome": "年上の子は布を投げ捨てた。サルカズの職人は黙って作業台を拭いていた。",
        "numericEffects": {
          "biasSar": -2,
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "一緒に笑う",
        "outcome": "笑うと仲間が肩を叩いた。職人は道具を片づけて奥へ入った。",
        "numericEffects": {
          "biasSar": 3
        },
        "actionDescriptors": [
          "socialConflictAction:endorse/sarkaz/child-mockery"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch07",
    "title": "絵本の裏表紙",
    "domain": "家族・読み聞かせ",
    "target": "サルカズ",
    "ageRange": {
      "min": 5,
      "max": 11
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "5〜11歳。読み聞かせをする養育者が存命で接触可能。本の所有・借用が成立。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "家族・読み聞かせ|サルカズ|家庭内の絵本・読み聞かせ",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "大人が古い絵本を閉じると、裏表紙に角のある悪役の絵が残った。「サルカズってみんなこんな顔なの」と聞くと、大人は少し考えてから本を置いた。",
    "choices": [
      {
        "label": "実際に会った人の話を聞く",
        "outcome": "大人は市場で会ったサルカズの鍛冶屋の話をした。絵本の悪役とは似ても似つかなかった。",
        "numericEffects": {
          "biasSar": -2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "絵の顔を覚える",
        "outcome": "眠る前にもう一度裏表紙を開いた。暗い色で塗られた角が目に焼きついた。",
        "numericEffects": {
          "biasSar": 2
        },
        "actionDescriptors": [
          "記憶:storybook-stereotype"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch08",
    "title": "母屋の裏口",
    "domain": "家族・近所",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": 14
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7〜14歳。家庭内に感染者がおり近隣にそれが知られている。皿の届け物が実在する生活関係。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.37,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "家族・近所|感染者|近所の家と親の行き来",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "親に頼まれて皿を届けに行くと、相手の家の大人が「感染者の家の子なら裏へ回って」と言った。表の戸は開いたままだった。",
    "choices": [
      {
        "label": "裏へ回って皿を渡す",
        "outcome": "裏口の土間で皿を受け取った大人は、礼も言わず戸を閉めた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [
          "記憶:child-back-door"
        ],
        "recordAction": null
      },
      {
        "label": "表口で親の伝言を言う",
        "outcome": "伝言を告げると、大人はしぶしぶ皿を受け取った。表の戸がゆっくり閉まった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:child-front-door"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch09",
    "title": "先生の沈黙",
    "domain": "学校・教師",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": 17
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7〜17歳。実在する学校・教師・同級生。本人がサルカズなら発話の対象を自己集団経験として切り替える。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "学校・教師|サルカズ|実際の学校",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "教室で同級生がサルカズの子を「傭兵の子」と呼んだ。教師は顔を上げたが、鐘が鳴るまで何も言わなかった。呼ばれた子はノートを閉じた。",
    "choices": [
      {
        "label": "教師に止めてほしかったと伝える",
        "outcome": "教師は短く息を吐き、次の時間にその呼び方をやめるよう話した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:teacher-confronted"
        ],
        "recordAction": null
      },
      {
        "label": "同級生に直接話す",
        "outcome": "呼び方が嫌だと伝えると、同級生は肩をすくめて席に戻った。",
        "numericEffects": {
          "biasSar": -2
        },
        "actionDescriptors": [
          "記憶:peer-confronted"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch10",
    "title": "市場の手押し車",
    "domain": "市場・家族",
    "target": "感染者",
    "ageRange": {
      "min": 6,
      "max": 14
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "6〜14歳。家族と市場に出る生活圏。親子の感染認知が行為者に成立。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.46,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "市場・家族|感染者|家族の買い出し",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "市場で感染者の親子が荷車を押すと、通りの男が「近くを通るな」と子どもを引き離した。荷車には野菜と小さな鍋が載っていた。",
    "choices": [
      {
        "label": "荷車の持ち手を押す手伝いをする",
        "outcome": "子どもが笑って礼を言った。荷車の片輪は少し曲がっていた。",
        "numericEffects": {
          "biasInf": -2,
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "自分の家族の後ろへ下がる",
        "outcome": "家族の背中に隠れて見送った。荷車のきしむ音が遠くへ消えた。",
        "numericEffects": {
          "biasInf": 2
        },
        "actionDescriptors": [
          "記憶:child-market-withdrawal"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch11",
    "title": "褒め言葉のあと",
    "domain": "学校外・習い事",
    "target": "サルカズ",
    "ageRange": {
      "min": 8,
      "max": 16
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "8〜16歳。見習い職人を目撃できる仕事場・学習場。学校在籍は問わない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.44,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "学校外・習い事|サルカズ|読み書き・仕事を教わる場所",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "年上の職人がサルカズの見習いを褒めたあと、「角があってもまじめに働くんだな」と笑った。見習いは手にした削り屑を払い、また台へ向かった。",
    "choices": [
      {
        "label": "見習いの道具を見せてもらう",
        "outcome": "見習いは刃の研ぎ方を教えてくれた。作業台に細い木屑が落ちた。",
        "numericEffects": {
          "biasSar": -2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "職人の言葉を真似て褒める",
        "outcome": "同じ言い方をすると、見習いは少し顔を伏せた。",
        "numericEffects": {
          "biasSar": 2
        },
        "actionDescriptors": [
          "記憶:backhanded-praise"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch12",
    "title": "友だちの昼餉",
    "domain": "学校外・食事",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": 15
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "7〜15歳。近所の子どもと共食する機会。感染者の子を友人として固定せずこの場面の知人でよい。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.51,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "学校外・食事|感染者|近所の子どもとの昼食",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "昼餉の包みを広げると、友だちが感染者の子の隣から離れた。「一緒に食べるなって家で言われた」と言う。感染者の子は握ったパンを半分に割った。",
    "choices": [
      {
        "label": "感染者の子の隣に座る",
        "outcome": "三人分の影が石段に並んだ。友だちは少し迷ってから戻ってきた。",
        "numericEffects": {
          "biasInf": -3
        },
        "actionDescriptors": [
          "socialContact:infected"
        ],
        "recordAction": null
      },
      {
        "label": "友だちの方へ移る",
        "outcome": "石段の端に腰を下ろした。向こうの子は一人でパンを食べ終えた。",
        "numericEffects": {
          "biasInf": 2
        },
        "actionDescriptors": [
          "記憶:lunch-separation"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch13",
    "title": "父の仕事の噂",
    "domain": "家庭・仕事話",
    "target": "サルカズ",
    "ageRange": {
      "min": 6,
      "max": 13
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "6〜13歳。実在の養育者が仕事に出ている。サルカズ運搬人との同じ仕事場・行き来の噂の出所がある。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.41,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "家庭・仕事話|サルカズ|養育者の帰宅後",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仕事から帰った父が、サルカズの運搬人に道具を盗まれたという噂をこぼした。机の上には無くしたと言っていた手袋が置かれている。",
    "choices": [
      {
        "label": "手袋のことを尋ねる",
        "outcome": "父は机を見て苦笑し、運搬人の話をやめた。手袋を棚へ片づけた。",
        "numericEffects": {
          "biasSar": -2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "父の話を信じる",
        "outcome": "翌日その運搬人を見かけたとき、思わず鞄の紐を握り締めた。",
        "numericEffects": {
          "biasSar": 3
        },
        "actionDescriptors": [
          "記憶:false-theft-rumor"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ch14",
    "title": "帰り道の風邪",
    "domain": "子ども・誤解",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": 15
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "7〜15歳。同年代の集まりがある。風邪の診断は噂の当事者の家族から実際に聞いた情報として表す。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "目撃した子どもが知り得る事実だけを使う。両親・教師・同級生を生成する場合は実在する関係正本を参照。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.49,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "子ども・誤解|感染者|家路・遊び場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "遊んだ翌日に熱を出した子が、「感染者の子と遊んだからだ」と言い始めた。周りの子どもは顔を見合わせ、感染者の子の姿を探した。",
    "choices": [
      {
        "label": "風邪のことを大人に確かめる",
        "outcome": "診療所へ行った家族から普通の風邪だと聞いた。噂を広めた子は鼻をすすっていた。",
        "numericEffects": {
          "biasInf": -2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "その子と遊ぶのを控える",
        "outcome": "夕方、いつもの遊び場を通り過ぎた。背後で誰かが名前を呼んだ。",
        "numericEffects": {
          "biasInf": 3
        },
        "actionDescriptors": [
          "記憶:cold-misattribution"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg01",
    "title": "診療所の小窓",
    "domain": "炎国・近隣",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "炎国"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "炎国。診療所が利用できる地域街区。話者が患者を感染者として知っている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "炎国・近隣|感染者|炎国の小規模市街・診療所の外",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "診療所の外で、感染者の女性が道を尋ねると、茶屋の主人は扇子で裏通りを指した。「患者なら表を歩き回るな」と言う。女は薬袋を抱えて歩き出した。",
    "choices": [
      {
        "label": "近道を教える",
        "outcome": "曲がり角まで一緒に歩き、看板のある道を教えた。女は薬袋を持ち直した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:yan-clinic-directions"
        ],
        "recordAction": null
      },
      {
        "label": "茶屋の主人の話を聞く",
        "outcome": "主人は患者の多い時期の話を長々と続けた。女は通りから見えなくなった。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:yan-teahouse-rumor"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg02",
    "title": "屋台の片隅",
    "domain": "龍門・露店",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "龍門"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "龍門の市街。露店への立寄り。ロドス本艦や感染者の互助区画内を除く。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.48,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "龍門・露店|感染者|龍門の通常の市場区画",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "龍門の屋台で、感染者の客が茶を頼むと、主人は「外で飲め」と紙杯を渡した。ほかの客には腰掛けを勧めている。客は湯気の立つ杯を持って立った。",
    "choices": [
      {
        "label": "客に席を譲る",
        "outcome": "腰掛けを一つ空けると、客は短く礼を言って座った。店主は顔をしかめた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:lungmen-stall-seat"
        ],
        "recordAction": null
      },
      {
        "label": "茶を受け取って歩く",
        "outcome": "自分の杯を持って通りへ出た。屋台の前にはまだ立っている客がいた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:lungmen-stall-left"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg03",
    "title": "乾きかけた切符",
    "domain": "ヴィクトリア・言語",
    "target": "ターラー人",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ヴィクトリア"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "ヴィクトリアで窓口のある交通機関を利用。ターラー人への言語的侮蔑が場面で明示。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.38,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "ヴィクトリア・言語|ターラー人|ヴィクトリアの都市の切符窓口",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "切符売りが、ターラーの訛りで行き先を告げた男に「ちゃんとした言葉で言え」と何度も言い直させた。男の手には運賃が揃っていた。",
    "choices": [
      {
        "label": "行き先を聞き取って伝える",
        "outcome": "あなたが町の名を繰り返すと、切符売りはようやく一枚渡した。",
        "numericEffects": {
          "equityGain": 2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "自分の順番を待つ",
        "outcome": "男が切符を受け取るまで、列は少しずつ長くなっていった。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:victoria-accent-queue"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg04",
    "title": "市場の検札",
    "domain": "ウルサス・街区",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ウルサス"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "ウルサス。見回り制度と露店がある地区。大規模摘発史実の再現と分ける。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.5,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "ウルサス・街区|感染者|ウルサスの街路市場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "市場の見回り人が感染者の売り手だけに何度も身分札を見せろと言った。札を返すとき、男は「次は店ごと閉めるぞ」と吐き捨てた。",
    "choices": [
      {
        "label": "見回り人の氏名を尋ねる",
        "outcome": "男は名乗らず立ち去った。売り手は身分札を布で包んでしまった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ursus-patrol-name-request"
        ],
        "recordAction": null
      },
      {
        "label": "売り手から品を買う",
        "outcome": "野菜を一束受け取った。売り手は手元の札を確かめてから代金をしまった。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:ursus-market-purchase"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg05",
    "title": "門番の数え方",
    "domain": "ラテラーノ・来訪",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ラテラーノ"
    ],
    "sceneBinding": "session",
    "conditionSummary": "ラテラーノ。主人公が実際に来訪者用の施設前にいる。サルカズ旅人の身分は門番に既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.4,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "ラテラーノ・来訪|サルカズ|ラテラーノの来訪者向け施設",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "来訪者の列で、門番がサルカズの旅人だけを脇へ呼んだ。「あんたは最後だ」と言って帳簿を閉じる。旅人の荷は小さな布袋一つだった。",
    "choices": [
      {
        "label": "門番に順番を確かめる",
        "outcome": "門番は列の札を見直し、旅人の番を告げた。旅人は一度だけ振り返った。",
        "numericEffects": {
          "equityGain": 2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "旅人に列の後ろを教える",
        "outcome": "最後尾の場所を示した。旅人は黙って布袋を抱え直した。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:laterano-gate-passive"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg06",
    "title": "見せない旗",
    "domain": "カジミエーシュ・娯楽",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "カジミエーシュ"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "カジミエーシュ。競技騎士文化を扱う市場。実在する特定の騎士名を無断で創作しない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.31,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "カジミエーシュ・娯楽|感染者|競技騎士の広告がある街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "競技騎士の絵札を売る商人が、感染者の騎士の旗だけを箱の下へしまった。「客が嫌がるから」と言う。幼い客はその絵札を探していた。",
    "choices": [
      {
        "label": "その旗も見せるよう頼む",
        "outcome": "商人は箱を開け、折り目のついた旗を一枚取り出した。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:kazimierz-banner-shown"
        ],
        "recordAction": null
      },
      {
        "label": "別の絵札を買う",
        "outcome": "子どもは残った絵札を眺めていた。あなたは一枚の代金を払った。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:kazimierz-banner-hidden"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg07",
    "title": "工房の募集札",
    "domain": "クルビア・仕事",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "session",
    "conditionSummary": "クルビアの工業・研究地区に限る。募集条件が実際に掲示されている。保険の制度詳細は話者の言い分。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.33,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "クルビア・仕事|感染者|クルビアの工業・研究街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "工房の求人札に「病歴のある者は応相談」と小さく追記されていた。主人は口頭で「感染者を雇うと保険が面倒なんだ」と話し、紙の上の賃金を指で隠した。",
    "choices": [
      {
        "label": "募集条件を聞き取る",
        "outcome": "主人は時給の代わりに「後で決める」と繰り返した。記載された額だけが紙に残っていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:columbia-job-term"
        ],
        "recordAction": null
      },
      {
        "label": "別の求人札を探す",
        "outcome": "隣の通りの掲示板へ歩いた。数枚の求人紙が風にめくれていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:columbia-job-witness"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg08",
    "title": "古い家名",
    "domain": "極東・近隣",
    "target": "家系・出自",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "session",
    "conditionSummary": "極東。実際に居住者の寄り合い・当番がある生活圏。地方の一人の発言として描く。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.3,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "極東・近隣|家系・出自|極東の地区の寄り合い",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "地区の掃除当番を決める席で、老人が移り住んだ一家の苗字を見て「その家筋は昔からよそ者だ」と言った。一家の女は箒を持ったまま立っていた。",
    "choices": [
      {
        "label": "当番の人数を数え直す",
        "outcome": "人数に合わせて掃除道具を配り直した。女は箒を一本受け取った。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:higashi-chore-included"
        ],
        "recordAction": null
      },
      {
        "label": "老人の話を聞く",
        "outcome": "老人は昔の争いを語った。掃除の時間になり、ようやく話が切れた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:higashi-family-gossip"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg09",
    "title": "漁網を畳む手",
    "domain": "イベリア・港",
    "target": "エーギル系住民",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "イベリア"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "イベリアの実在する沿岸・港の地区。海に関わらない内陸集落では不発。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "イベリア・港|エーギル系住民|イベリアの沿岸港・漁業集落",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "漁網を干す浜で、エーギル系の若者が手伝いを申し出た。網元は「海から来た連中には任せない」と言い、乾いた網をひったくった。若者の手にはまだ砂がついていた。",
    "choices": [
      {
        "label": "網を畳む仕事を一緒に始める",
        "outcome": "若者は網目を整え、あなたは端をたぐった。網元は黙って遠くの船へ向かった。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:iberia-net-help"
        ],
        "recordAction": null
      },
      {
        "label": "別の網元を訪ねる",
        "outcome": "浜の先で働く人に声をかけた。若者は網の端を放してついてきた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:iberia-other-boat"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg10",
    "title": "頼み事の後回し",
    "domain": "シラクーザ・商店",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "シラクーザ"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "シラクーザの商業区画。実在する荷運びの予約と、話者が相手の感染を知る経路。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.39,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "シラクーザ・商店|感染者|シラクーザの地区商店",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "店に来た感染者の男が荷運びを頼むと、主人は「先に昔からの客だ」と断った。後から入った別の客の荷は、その日のうちに車へ積まれていく。",
    "choices": [
      {
        "label": "運搬順を確かめる",
        "outcome": "主人は帳簿を見直し、「明日の朝だ」と男に告げた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:siracusa-delivery-priority"
        ],
        "recordAction": null
      },
      {
        "label": "男に別の運搬人を教える",
        "outcome": "市場の端の運搬人を紹介した。男は代金を確かめに歩いていった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:siracusa-other-hauler"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg11",
    "title": "井戸端の約束",
    "domain": "サルゴン・共同体",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "サルゴン"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "サルゴンの感染者排斥圧力が実在する領主・集落に限定。感染者を病者として普通に受け入れる密林氏族では不発。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.24,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "サルゴン・共同体|感染者|サルゴンの特定オアシス・集落",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "集落の井戸で、長老の取り巻きが感染者の旅人へ「水は一番最後だ」と告げた。旅人は革袋を抱え、日陰の短い影へ座った。",
    "choices": [
      {
        "label": "列の順番を伝える",
        "outcome": "前に並んでいた者が道を空け、旅人は水袋を満たした。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:sargon-water-turn"
        ],
        "recordAction": null
      },
      {
        "label": "自分の水を先に汲む",
        "outcome": "革袋を満たして立ち去った。旅人は日陰で順番を待ち続けた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:sargon-water-wait"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg12",
    "title": "布の色",
    "domain": "カズデル・避難",
    "target": "異郷の避難民",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "カズデル"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "カズデルの実際の避難・市場地区。サルカズへの外部差別を自国内へ機械的に持ち込まない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.29,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "カズデル・避難|異郷の避難民|カズデルの戦後・戦時の現地市場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "市場の長椅子で、避難してきたよそ者が座ろうとすると、古参の商人が「この土地を知らぬ者は座るな」と言った。避難民は色褪せた布包みを抱え直した。",
    "choices": [
      {
        "label": "椅子の端を空ける",
        "outcome": "布包みを置く隙間ができ、避難民は小さく頭を下げた。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:kazdel-stranger-seat"
        ],
        "recordAction": null
      },
      {
        "label": "商人の話を聞く",
        "outcome": "商人は昔の戦の話を続けた。避難民は通りの石段へ移った。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:kazdel-stranger-excluded"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg13",
    "title": "暖かい鍋",
    "domain": "サーミ・相互扶助",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "サーミ"
    ],
    "sceneBinding": "session",
    "conditionSummary": "サーミの共同体・居住先への参加が実際に成立。感染者への排斥率が低い共同体での通常の共食。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "contextual-opportunity",
    "weight": 0.46,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "サーミ・相互扶助|感染者|サーミの氏族の共同体内",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "雪の中から帰った感染者の猟師が、鍋のそばに濡れた手袋を広げた。誰かが椀を渡し、別の誰かが薪をくべた。猟師は椀を両手で包んだ。",
    "choices": [
      {
        "label": "猟師の荷を降ろす手伝いをする",
        "outcome": "猟師は肩の荷を床に置き、火のそばへ寄った。外では雪がしんしんと降り続いていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:sami-mutual-help"
        ],
        "recordAction": null
      },
      {
        "label": "鍋を囲んで話を聞く",
        "outcome": "猟師は今日の雪道のことを話した。椀が空になる頃、家の中が少し暖まった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:sami-ordinary-meal"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg14",
    "title": "譜面台の端",
    "domain": "リターニア・音楽",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "リターニア"
    ],
    "sceneBinding": "session",
    "conditionSummary": "リターニア。実際に音楽教育・合奏へ出席。個別教室の差別的指導者がいる場合。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.29,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "リターニア・音楽|感染者|リターニアの実在する音楽稽古の場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "音楽・合奏課程の学籍を現行の教育正本から区別できない。",
    "text": "合奏の稽古で、指導者が感染者の学生の譜面台だけを戸口へ移した。「病気の子は離れて弾け」と言う。音合わせの鐘が鳴っても、その譜面台だけ遠かった。",
    "choices": [
      {
        "label": "指導者に席順を尋ねる",
        "outcome": "指導者は黙って譜面台を戻した。学生は楽譜を開き直した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:leith-music-stand"
        ],
        "recordAction": null
      },
      {
        "label": "演奏の合図を待つ",
        "outcome": "戸口の方から遅れて音が聞こえた。指導者は指揮棒を下ろさなかった。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:leith-separated-stand"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg15",
    "title": "よそ者の道案内",
    "domain": "イェラグ・旅人",
    "target": "外来者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "イェラグ"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "イェラグ。山道の集落と来訪者の実際の通行が成立。鉱石病の排斥に読み替えない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.32,
    "cooldownYears": 11,
    "once": false,
    "episodeKey": "イェラグ・旅人|外来者|イェラグの山道・集落の案内所",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "山道の案内を求めた外来者に、村人は「外の商売人には道を教えない」と言った。外来者は地図を広げたまま立っていた。",
    "choices": [
      {
        "label": "通れる道を教える",
        "outcome": "雪の深い所と避けるべき崖を地図に印した。外来者は礼を言って荷を背負った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:kjerag-directions"
        ],
        "recordAction": null
      },
      {
        "label": "村人に案内を任せる",
        "outcome": "村人は手を振って歩き去った。外来者は地図の向きを何度も変えていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:kjerag-refused-guide"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg16",
    "title": "粉塵のせい",
    "domain": "レム・ビリトン・鉱区",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "レム・ビリトン"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "レム・ビリトンの工業・採掘生活圏。送風機・坑夫がいる実際の環境。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.41,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "レム・ビリトン・鉱区|感染者|レム・ビリトンの実在する採掘・製錬街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "作業帰りの男たちが、感染者の坑夫を見て「粉塵の量が増えたのはあいつらのせいだ」と笑った。空には煙突から出る灰色の煙が流れていた。",
    "choices": [
      {
        "label": "換気の話を持ち出す",
        "outcome": "坑夫の一人が送風機の不調を話し始めた。男たちは煙突を見上げた。",
        "numericEffects": {
          "k": 1,
          "biasInf": -2
        },
        "actionDescriptors": [],
        "recordAction": null
      },
      {
        "label": "その場を離れる",
        "outcome": "作業服についた粉を払って通りへ戻った。坑夫の笑い声が遠くなった。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:rim-powder-blame"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg17",
    "title": "貼り替えられた地図",
    "domain": "ボリバル・避難",
    "target": "国内避難民",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ボリバル"
    ],
    "sceneBinding": "session",
    "conditionSummary": "ボリバルの避難者受入地区。実際に避難民向け案内がある。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.33,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "ボリバル・避難|国内避難民|ボリバルの現地避難市場・掲示所",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "避難民向けの配給場所を示す地図が、掲示板の裏側へ移されていた。商人が「避難してきた連中が増えると客が減る」と言っていた。",
    "choices": [
      {
        "label": "地図を表へ戻す",
        "outcome": "紙を元の場所へ貼ると、通りがかりの人が立ち止まって道順を読んだ。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:bolivar-aid-map-restored"
        ],
        "recordAction": null
      },
      {
        "label": "掲示の位置を覚える",
        "outcome": "必要な場所を読み取ってから離れた。地図は裏側で風にめくれていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:bolivar-aid-map-hidden"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg18",
    "title": "海辺の制服",
    "domain": "シエスタ・観光",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "シエスタ"
    ],
    "sceneBinding": "session",
    "conditionSummary": "シエスタ。実際に観光業の売店が営業している時期・地区。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 10,
    "once": false,
    "episodeKey": "シエスタ・観光|感染者|シエスタの観光客向け街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "浜辺の売店で、感染者の店員が制服を着て立っていると、客が「病人が触るなら買わない」と騒いだ。店員は注文票を持ったまま顔を上げた。",
    "choices": [
      {
        "label": "客に通常の接客だと伝える",
        "outcome": "客は言い返さず店を離れた。店員は注文票を台に戻した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [
          "記憶:siesta-worker-supported"
        ],
        "recordAction": null
      },
      {
        "label": "店員から品を買う",
        "outcome": "店員は手際よく品を包み、礼を言った。客の声は遠ざかっていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:siesta-normal-purchase"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_reg19",
    "title": "英雄像の前",
    "domain": "ミノス・祭礼",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ミノス"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "ミノスの英雄信仰が実在する地区・場面。一般の医療や商店サービスからの排除に広げない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L1_日常",
    "group": "daily-bias",
    "weight": 0.23,
    "cooldownYears": 12,
    "once": false,
    "episodeKey": "ミノス・祭礼|感染者|ミノスの英雄像や祭礼がある地区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "英雄像の前で感染者の参列者が花を供えると、年配の男が「鉱石病にかかった者は英雄の気高さを失う」と告げた。花を捨てろとは言わず、男は像へ背を向けた。",
    "choices": [
      {
        "label": "参列者に花を供える場所を尋ねる",
        "outcome": "参列者は像の足元を示し、一緒に花を置いた。",
        "numericEffects": {
          "equityGain": 1
        },
        "actionDescriptors": [
          "記憶:minos-flowers-together"
        ],
        "recordAction": null
      },
      {
        "label": "男にその考えの由来を聞く",
        "outcome": "男は昔の神官の話を始めた。参列者は静かに花を整えていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:minos-hero-belief"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct01",
    "title": "同じ湯呑み",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "session",
    "conditionSummary": "茶屋が実際にある。一般市街の対照場面。感染者の常連は店主に既知。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.35,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "日常・対照|感染者|都市の小さな茶屋",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "店主は感染者の常連へ、いつも通り湯呑みを出した。客が「今日も同じ茶で」と頼むと、店主は笑って茶葉を量った。",
    "choices": [
      {
        "label": "隣で茶を頼む",
        "outcome": "湯気の立つ湯呑みが二つ並んだ。常連は近頃の天気を話してくれた。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:same-cup-normal"
        ],
        "recordAction": null
      },
      {
        "label": "茶屋の仕事ぶりを見る",
        "outcome": "店主は空いた湯呑みを洗い、次の客を迎えた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:same-cup-service"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct02",
    "title": "一緒の鍋",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "共同の食事が実在する時。感染者と非感染者が日常的に共食している生活圏。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.38,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "日常・対照|感染者|共同の食事場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仕事を終えた感染者の女性が鍋から汁をよそい、隣の男へ椀を渡した。男は礼を言ってパンを割り、女性へ半分差し出した。",
    "choices": [
      {
        "label": "鍋の後片づけを手伝う",
        "outcome": "鍋底をこする間、二人が明日の仕事の話をしていた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:shared-pot-cleanup"
        ],
        "recordAction": null
      },
      {
        "label": "同じ卓で食べる",
        "outcome": "三人分の椀が並び、夕飯は賑やかに過ぎた。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:shared-pot-meal"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct03",
    "title": "釘を一本",
    "domain": "日常・対照",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "住宅街に共同修繕の機会がある。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "日常・対照|サルカズ|共同の家屋修繕",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "壊れた戸を直しているサルカズの職人が、隣家の男に釘を求めた。男は釘を一握り渡し、「足りなければまた来い」と言った。",
    "choices": [
      {
        "label": "道具箱を運ぶ",
        "outcome": "木屑を避けて箱を運んだ。職人は戸を軽く押して具合を確かめた。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:sarkaz",
          "記憶:ordinary-sarkaz-craft"
        ],
        "recordAction": null
      },
      {
        "label": "出来上がった戸を試す",
        "outcome": "戸は小さな音で閉まった。男と職人が満足そうにうなずいた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-sarkaz-neighbor"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct04",
    "title": "傷んだ靴紐",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "靴直し店への出入りがある。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "日常・対照|感染者|地元の靴直し店",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "靴を直しに来た感染者の客が、紐の切れた片足を差し出した。靴職人は底をひっくり返して見せ、直す値段を紙に書いた。",
    "choices": [
      {
        "label": "靴の直し方を見る",
        "outcome": "職人は古い紐を抜き、革を傷つけないよう穴を整えた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-shoe-service"
        ],
        "recordAction": null
      },
      {
        "label": "次の客の椅子を空ける",
        "outcome": "椅子を引くと、客は直った靴を履き直して店を出た。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:ordinary-shoe-wait"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct05",
    "title": "庭先の苗",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "畑や庭での共同作業が可能な住宅形態。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.32,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "日常・対照|感染者|共同の畑・庭先",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "共同の畑で、感染者の隣人が育てた苗を分けてくれた。「今年はよく伸びた」と言って土を払う。隣の家の老人が礼を言って受け取った。",
    "choices": [
      {
        "label": "苗を植える手伝いをする",
        "outcome": "小さな穴を掘り、根を折らないよう土を寄せた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "socialContact:infected"
        ],
        "recordAction": null
      },
      {
        "label": "育て方を聞く",
        "outcome": "隣人は朝の水やりの加減を教えた。苗の葉が風に揺れていた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:seedling-advice"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct06",
    "title": "祭礼の灯り",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "灯りを使う祭礼のある地区。参加資格・年代が合う場面。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.25,
    "cooldownYears": 12,
    "once": false,
    "episodeKey": "日常・対照|感染者|一般市民の祭礼",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "祭礼の灯りを運ぶ列で、感染者の男が重そうな箱を持っていた。前を歩く女性が「少し代わろうか」と声をかけ、箱の片側を支えた。",
    "choices": [
      {
        "label": "空いた側を持つ",
        "outcome": "三人で歩くと箱が安定し、灯りが揺れにくくなった。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:festival-lantern-shared"
        ],
        "recordAction": null
      },
      {
        "label": "列の後ろから見守る",
        "outcome": "灯りの列が通りを曲がり、歌声だけがしばらく残った。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:festival-lantern-ordinary"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct07",
    "title": "紙包みの薬",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "病院・薬局が存在する生活圏。ロドス内部での同等例は組織枠を使用。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "日常・対照|感染者|一般の診療所・薬局",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "薬屋の主人は感染者の患者に薬を渡し、飲む時間を一つずつ指で示した。患者が聞き返すと、主人はもう一度ゆっくり説明した。",
    "choices": [
      {
        "label": "薬包みの目印を手伝う",
        "outcome": "包みの角に小さな印を付けた。患者は手順を確かめて帰った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-pharmacy-help"
        ],
        "recordAction": null
      },
      {
        "label": "順番を待って用事を済ませる",
        "outcome": "主人は患者を送り出し、次にあなたを呼んだ。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:ordinary-pharmacy-next"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct08",
    "title": "貸した物差し",
    "domain": "日常・対照",
    "target": "サルカズ",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "木工作業がある職場・学習機会。学校在籍は不要。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.35,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "日常・対照|サルカズ|徒弟・職人の作業場",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "木工の職人がサルカズの見習いへ物差しを投げ渡した。「こっちの長さも頼む」と言う。見習いは板を測り、寸法を声に出して確かめた。",
    "choices": [
      {
        "label": "見習いの計測を手伝う",
        "outcome": "板の端を押さえると、見習いは線をまっすぐ引いた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "socialContact:sarkaz"
        ],
        "recordAction": null
      },
      {
        "label": "仕事の仕上がりを見る",
        "outcome": "親方が板を組むと、角がぴたりと合った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-workshop-measure"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct09",
    "title": "夜の見回り札",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "自治的な夜回り・隣組の当番が実在する地域。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.29,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "日常・対照|感染者|見回りを共同で行う街区",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "見回りの番が回ってきた感染者の住人が、札を戸口へ掛けた。前の当番が提灯を渡し、「風が強いから気をつけて」と言った。",
    "choices": [
      {
        "label": "提灯の火を整える",
        "outcome": "芯を少し下げると炎が落ち着いた。住人は提灯を持って夜道へ出た。",
        "numericEffects": {},
        "actionDescriptors": [
          "socialContact:infected",
          "記憶:ordinary-night-patrol"
        ],
        "recordAction": null
      },
      {
        "label": "当番表の場所を覚える",
        "outcome": "明日の名前を確かめて表を閉じた。札はきちんと次の家へ回った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-night-roster"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_ct10",
    "title": "仕立て屋の古い客",
    "domain": "日常・対照",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [],
    "sceneBinding": "ambient",
    "conditionSummary": "仕立て屋と常連関係がある商店地区。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "日常・対照|感染者|住宅街の仕立て屋",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "仕立て屋に感染者の常連が顔を出すと、主人は奥から預かっていた上着を持ってきた。「今度は袖を長くしておいたよ」と笑う。常連は鏡の前で腕を広げた。",
    "choices": [
      {
        "label": "上着の仕上がりを褒める",
        "outcome": "主人は縫い目を見せ、常連は照れくさそうに袖を撫でた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:ordinary-tailor-kindness"
        ],
        "recordAction": null
      },
      {
        "label": "自分の直したい服を相談する",
        "outcome": "主人は次の仕上がり日を教えてくれた。常連は上着を抱えて出ていった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:ordinary-tailor-next"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org01",
    "title": "本艦の回診表",
    "domain": "ロドス内部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ロドス本艦"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "isRhodesLandshipResident(s)または本艦の実際の医療業務・患者としての滞在が記録されている。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.5,
    "cooldownYears": 6,
    "once": false,
    "episodeKey": "ロドス内部・日常|感染者|ロドス本艦の医療区画",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "本艦の回診表には、感染者と非感染者の名前が並んでいた。医療スタッフが一人ずつ声をかけ、次の処置の時間を告げていく。",
    "choices": [
      {
        "label": "回診に必要な備品を運ぶ",
        "outcome": "器具の入った箱を台へ置くと、医療スタッフが礼を言った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:rhodes-routine-round"
        ],
        "recordAction": null
      },
      {
        "label": "呼び出しの順番を確認する",
        "outcome": "時間を書き写すと、患者の一人が自分の予定を尋ねてきた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:rhodes-round-roster"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org02",
    "title": "通路の消毒箱",
    "domain": "ロドス内部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ロドス本艦"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "本艦居住または明示的な本艦滞在。感染者差別を演出するための特別な清掃と解釈しない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "ロドス内部・日常|感染者|ロドス本艦の共用通路",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "共用通路では、感染者も非感染者も同じ手順で器具を拭いていた。作業を終えた職員が消毒箱を閉じ、次の当番へ渡す。",
    "choices": [
      {
        "label": "当番へ器具を渡す",
        "outcome": "器具を一つずつ数えて渡した。当番は記録欄へ印をつけた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:rhodes-equal-protocol"
        ],
        "recordAction": null
      },
      {
        "label": "消毒箱の片づけを手伝う",
        "outcome": "棚に箱を戻した。通路にはいつもの足音が続いていた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:rhodes-sanitation-routine"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org03",
    "title": "支部の白い封筒",
    "domain": "ロドス地域支部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ロドス現地支部"
    ],
    "sceneBinding": "session",
    "conditionSummary": "rhodes-staffのposting.kind=branchで現地一致、またはrhodes-careのappointmentが当該支部で有効。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.48,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "ロドス地域支部・日常|感染者|ロドスの現地支部の受付",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "支部の受付で、感染者の患者が次の通院日を尋ねた。係は日付を紙に書き、道順を添えて封筒に入れた。",
    "choices": [
      {
        "label": "封筒に地図を添える",
        "outcome": "細い路地の曲がり角を描くと、患者は地図を確かめて頷いた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:rhodes-branch-map"
        ],
        "recordAction": null
      },
      {
        "label": "受付を片づける",
        "outcome": "封筒を渡し終えた係と、帳簿を棚へ戻した。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:rhodes-branch-reception"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org04",
    "title": "包帯の余り",
    "domain": "ロドス内部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "ロドス現地医療拠点"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "実際のロドス担当の医療拠点での滞在・利用を記録。ロドスへの遠隔連絡だけで現地滞在と扱わない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.45,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "ロドス内部・日常|感染者|ロドスの臨時医療拠点",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "処置が終わったあと、感染者の患者が包帯の巻き方を尋ねた。医療スタッフは残った包帯を使って腕で手順を見せた。",
    "choices": [
      {
        "label": "患者と一緒に手順を確かめる",
        "outcome": "巻き終えた包帯の端を軽く留めた。患者は自分の腕を見てうなずいた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:rhodes-bandage-help"
        ],
        "recordAction": null
      },
      {
        "label": "備品を元の棚へ戻す",
        "outcome": "空の包帯箱を数えて棚へ戻した。次の患者の名前が呼ばれた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:rhodes-bandage-restore"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org05",
    "title": "野営地の火",
    "domain": "レユニオン内部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "レユニオン野営地"
    ],
    "sceneBinding": "session",
    "conditionSummary": "reunion-1096/reunion-reorgがactiveで、residenceBaseの当該camp/column、postingと同じ現地に実在。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.44,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "レユニオン内部・日常|感染者|レユニオンの実際の野営地",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "野営地で感染者の仲間が冷えた手を火にかざしていると、見張りが薪を一本足した。「明日は早いぞ」と言って交代の札を渡す。",
    "choices": [
      {
        "label": "薪を集める手伝いをする",
        "outcome": "乾いた枝を数本持ち帰ると、火が勢いを取り戻した。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:reunion-camp-hearth"
        ],
        "recordAction": null
      },
      {
        "label": "見張りの交代時刻を確かめる",
        "outcome": "札の時間を読んで返した。見張りは外套の襟を立てた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:reunion-camp-shift"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org06",
    "title": "同じ傷の手当",
    "domain": "レユニオン内部・日常",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "レユニオン移動隊"
    ],
    "sceneBinding": "session",
    "conditionSummary": "実際にレユニオン移動隊の当該postingで活動。傷を負った者は場面NPCで、主人公の負傷へ転記しない。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.39,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "レユニオン内部・日常|感染者|レユニオン移動隊の休憩所",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "移動隊の休憩所で感染者の隊員が手に傷を負った。隣の隊員は水で泥を洗い、布を巻き直してやった。",
    "choices": [
      {
        "label": "清潔な布を渡す",
        "outcome": "新しい布を手渡すと、傷を負った隊員が礼を言った。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:reunion-wound-cloth"
        ],
        "recordAction": null
      },
      {
        "label": "周囲の荷を片づける",
        "outcome": "休む場所を広げると、隊員は横になって目を閉じた。",
        "numericEffects": {},
        "actionDescriptors": [
          "記憶:reunion-rest-clear"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org07",
    "title": "互助会の封切り",
    "domain": "感染者互助会内部",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "感染者互助会の現地活動"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "infected-mutual-aidのactive・atRecordedLocality(s)を満たす当番・会合の現地場面。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.44,
    "cooldownYears": 7,
    "once": false,
    "episodeKey": "感染者互助会内部|感染者|当該生活圏の感染者互助会",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "互助会で薬の共同購入品が届き、皆で封を切った。感染者の老人が品目を読み上げ、若い会員が帳簿の数字を一つずつ確かめた。",
    "choices": [
      {
        "label": "配分表を書き写す",
        "outcome": "人数に合わせて数を確かめた。老人は薬箱に封を戻した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:aid-ledger-count"
        ],
        "recordAction": null
      },
      {
        "label": "荷を分ける手伝いをする",
        "outcome": "袋の数をそろえて棚に並べた。手伝いが終わる頃、部屋には夕日が差していた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:aid-packets-sort"
        ],
        "recordAction": null
      }
    ]
  },
  {
    "id": "disc_day_org08",
    "title": "古い仲間の便り",
    "domain": "感染者互助会内部",
    "target": "感染者",
    "ageRange": {
      "min": 7,
      "max": null
    },
    "regions": [
      "感染者互助会の現地活動"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "感染者互助会の実際の会合・現地当番がある。旧友家族の具体的IDがない場合は集団からの便りとしてのみ記録。",
    "excludeSummary": "本人が別の場所で拘束・隔離中、または該当場面の利用・訪問が成立しない場合。",
    "knowledgeBasis": "場面NPCの感染・種族は本文上の事実として生成可能。主人公の認知や感染公表履歴へ自動転記しない。",
    "frequencyClass": "L0_対照日常",
    "group": "ordinary-contrast",
    "weight": 0.35,
    "cooldownYears": 9,
    "once": false,
    "episodeKey": "感染者互助会内部|感染者|感染者互助会の連絡当番",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "holdReason": null,
    "text": "互助会に、以前この地区を離れた感染者の家族から便りが届いた。病院の場所を教えてもらった礼が、小さな紙に丁寧に書かれている。",
    "choices": [
      {
        "label": "返事を代筆する",
        "outcome": "次に必要な薬の入手先を尋ねる短い便りを書いた。封を閉じる前に皆で読み返した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [
          "記憶:aid-letter-reply"
        ],
        "recordAction": null
      },
      {
        "label": "便りを皆に読み上げる",
        "outcome": "読み終えると、部屋の誰かが「あの人たちは元気なのか」と尋ねた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [
          "記憶:aid-letter-read"
        ],
        "recordAction": null
      }
    ]
  }
];
  $terraData.EV.push(...rows.map(compileSocialEvent));
});
