// Runtime adapter for adopted v3 scenarios; unresolved scene provenance must remain explicitly held.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/social-constraints"
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
  // Generalized rows without age-specific source claims use a conservative age-seven floor.
  const ageRange = row.ageRange || { min: 7, max: null };
  const conditions = String(row.conditionSummary || ''),
    infectedTarget = /感染者|鉱石病/.test(String(row.target || '')),
    workContext = /職場|工房|雇用|労働|仕事|荷受け|職務/.test(conditions) && /現に|実際に|在籍|就労|勤務中/.test(conditions),
    educationContext = /学籍|就学|出席|音楽教育|教育課程/.test(conditions),
    householdContext = /食事を共にする|同居する家族|同じ世帯/.test(conditions);
  return {
    group: row.group,
    interactionScope: minor ? 'minor' : 'major',
    sceneBinding: row.sceneBinding,
    target: row.target,
    domain: row.domain,
    episodeKey: String(row.episodeKey || row.id).slice(0, 100),
    subjectKind: row.requiresPlayerDiagnosis || row.requiresProtagonistOni || row.requiresProtagonistSarkaz || row.requiresProtagonistDurin || row.requiresProtagonistLiberi ? 'protagonist' : 'scene-person',
    knowledgeBasis: String(row.knowledgeBasis || 'scene-observed-or-specific-record').slice(0, 120),
    conditionSummary: String(row.conditionSummary || '').slice(0, 500),
    excludeSummary: String(row.excludeSummary || '').slice(0, 300),
    ageRange,
    regions: row.regions,
    requiresPlayerDiagnosis: row.requiresPlayerDiagnosis,
    knowledgeAudiences: Array.isArray(row.knowledgeAudiences) ? row.knowledgeAudiences : [],
    knowledgeRecipientBinding: row.knowledgeRecipientBinding,
    knowledgeRecipientId: row.knowledgeRecipientId,
    knowledgeRecipientRef: row.knowledgeRecipientRef,
    requiresProtagonistSarkaz: row.requiresProtagonistSarkaz,
    requiresProtagonistDurin: row.requiresProtagonistDurin,
    requiresProtagonistLiberi: row.requiresProtagonistLiberi,
    workJobIds: row.workJobIds,
    educationStages: row.educationStages,
    requiresEducationIntent: row.requiresEducationIntent,
    minYear: row.minYear,
    requiredLanguageVariety: row.requiredLanguageVariety,
    requiresProtagonistOni: row.requiresProtagonistOni,
    protectedInteriorMask: infectedTarget && row.group === 'daily-bias',
    externalSettingRequired: row.target === 'サルカズ' && /組織外/.test(conditions),
    requiresCurrentEmployment: row.requiresCurrentEmployment === true || workContext,
    requiresActiveEducation: row.requiresActiveEducation === true || educationContext,
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
    ...(Number.isFinite(meta.ageRange?.min) ? { ge: { age: meta.ageRange.min } } : {}),
    ...(Number.isFinite(meta.ageRange?.max) ? { le: { age: meta.ageRange.max } } : {}),
    interactionScope: meta.interactionScope,
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
    "id": "soc_gap_01",
    "title": "しまわれた図面",
    "domain": "工房の客間",
    "target": "鬼",
    "ageRange": {
      "min": 15,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "current-worksite",
    "conditionSummary": "極東の同じ地域にJ2/J7/J18/J22の現職と工房・作業場がある。客の前で鬼の職人が説明から外される一回の場面。主人公は同僚または居合わせた人として発言できる。",
    "excludeSummary": "主人公を管理者にせず説明役を任命させない。鬼の職人を主人公の親族・知人として扱わない。",
    "knowledgeBasis": "observed",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.42,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/01",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "図面を見に来た客の前で、親方は鬼の職人に「お前は荷下ろしを頼む。説明はこっちでやる」と告げた。職人は油のついた指を拭き、道具へ向き直った。",
    "choices": [
      {
        "label": "仕事ぶりを見てもらうよう口を挟む",
        "outcome": "客は作業台の方を見た。親方は図面を持ち直し、職人は手元の作業を続けた。",
        "numericEffects": {
          "equityGain": 2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "witness-help"
      },
      {
        "label": "後から本人に話を聞く",
        "outcome": "片づけのあと、職人に先ほどのことを尋ねた。短い返事のあと、職人は道具をしまった。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "private-contact"
      }
    ],
    "requiresCurrentEmployment": true,
    "workJobIds": [
      2,
      7,
      18,
      22
    ]
  },
  {
    "id": "soc_gap_02",
    "title": "名字を問い直す窓口",
    "domain": "受付の書類",
    "target": "鬼",
    "ageRange": {
      "min": 10,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "極東で暮らす鬼の主人公が窓口で用件を伝える一回の場面。本人が外見・名乗りなどから鬼と認識される。通常の記入補助だけで終わり、法的身分・戸籍制度を前提にしない。",
    "excludeSummary": "鬼に名字がないという文化・法律・登録制度を作らない。",
    "knowledgeBasis": "visible-name",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/02",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": true,
    "held": false,
    "text": "窓口で用件を伝え、名前を書こうとしたところ、係員が「その名前はどこの出身だ」と尋ねた。あなたが答えると、係員は書きかけた欄を指でなぞり直した。",
    "choices": [
      {
        "label": "質問の理由を尋ねる",
        "outcome": "係員は「確認だ」とだけ答え、ペンを戻した。あなたは必要事項を書き終えた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "application-submitted-name-note"
      },
      {
        "label": "記入欄を指して手伝いを頼む",
        "outcome": "係員は記入欄を示した。あなたは名前を書き終え、用紙を窓口へ戻した。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "documentation-inquiry"
      }
    ]
  },
  {
    "id": "soc_gap_03",
    "title": "街角の書き付け",
    "domain": "端末の掲示板",
    "target": "鬼",
    "ageRange": {
      "min": 14,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "market-street",
    "conditionSummary": "極東の市街・市場通りで、鬼を貶す街頭の書き付けや雑談を目にする一回の場面。近くの人との短い会話に留める。",
    "excludeSummary": "常時接続端末・ネット投稿・返信・オンライン上の反応を作らない。",
    "knowledgeBasis": "readable-post",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.26,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/03",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "通りの掲示板に鬼を貶す書き付けがあった。「力だけで物を考える連中だ」。通りがかった人が足を止めて読んでいた。",
    "choices": [
      {
        "label": "書き付けに抗議する",
        "outcome": "あなたは近くの人にも声をかけた。書いた人が誰かは分からないまま、通りの人々は歩き去った。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "online-reply"
      },
      {
        "label": "近くの人と話す",
        "outcome": "近くの人は、一緒に働いた鬼の丁寧な仕事ぶりを覚えていた。二人はその場で会話を終えた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "offline-discussion"
      }
    ]
  },
  {
    "id": "soc_gap_04",
    "title": "子ども扱いされた技師",
    "domain": "昇降機の修理現場",
    "target": "ドゥリン",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "サルゴン",
      "クルビア",
      "シエスタ"
    ],
    "sceneBinding": "current-worksite",
    "conditionSummary": "主人公がドゥリンで、J7/J18/J29の技術・修理の現職に就き同じ地域の現場にいる。客が主人公を見て子どもと誤認する一回の場面。",
    "excludeSummary": "別の技師や正式な新規工事契約・受注・報酬を作らない。地下施設だけの仕事は含めない。",
    "knowledgeBasis": "visual-race",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/04",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "修理現場で図面を広げると、立ち会っていた客はあなたの顔を見て「子どもに何が分かる」と後ろを探した。道具箱は足元にあり、止まった歯車が鈍く鳴っていた。",
    "choices": [
      {
        "label": "自分が作業を担当していると伝える",
        "outcome": "あなたが工具を取ると、客は黙って手元を見た。すぐに納得した様子ではなかったが、客は横へ退いた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "engineer-identified"
      },
      {
        "label": "その言葉を問い返す",
        "outcome": "客は気まずそうに視線を外した。歯車の音が戻るまで、あなたは図面を押さえていた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "engineer-heard"
      }
    ],
    "requiresCurrentEmployment": true,
    "requiresProtagonistDurin": true,
    "workJobIds": [
      7,
      18,
      29
    ]
  },
  {
    "id": "soc_gap_05",
    "title": "届かない留め金",
    "domain": "地上の作業台",
    "target": "ドゥリン",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "クルビア",
      "サルゴン",
      "シエスタ"
    ],
    "sceneBinding": "current-worksite",
    "conditionSummary": "主人公がドゥリンで、J2/J7/J18/J19/J22/J29の工場・技術・修理・建設等の現職にあり同じ地域の作業場にいる。作業台の不便と一時的な調整を扱う。",
    "excludeSummary": "地下専用設備、適合済みの作業台、数値化した身体寸法、恒久的な設備改修を作らない。",
    "knowledgeBasis": "physical-ergonomics",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.3,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/05",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "作業台の奥にある留め金へ腕が届かず、手元の部品が床へ転がった。監督は次の作業へ急ぐよう促した。",
    "choices": [
      {
        "label": "監督に低い台を頼む",
        "outcome": "監督は倉庫の台を指した。あなたは近くへ運び、高さが合うか確かめてから作業を再開した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "equipment-adjustment-requested"
      },
      {
        "label": "仲間に一時的に支えてもらう",
        "outcome": "同僚が板を支える間に留め金へ手を伸ばした。作業後、二人で散った部品を拾った。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "coworker-assistance"
      }
    ],
    "requiresCurrentEmployment": true,
    "requiresProtagonistDurin": true,
    "workJobIds": [
      2,
      7,
      18,
      19,
      22,
      29
    ]
  },
  {
    "id": "soc_gap_08",
    "title": "笑いの理由",
    "domain": "公民の会合",
    "target": "リーベリ",
    "ageRange": {
      "min": 10,
      "max": null
    },
    "regions": [
      "ラテラーノ"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "1102年以降のラテラーノで暮らすリーベリが、近所の小さな集まりでサンクタ二人の会話に居合わせる一回のすれ違い。特定の会合・役職・個人の悪意・制度差別を作らない。",
    "excludeSummary": "1101年以前の状態へ適用しない。サンクタ全員やラテラーノ全体の態度として一般化しない。",
    "knowledgeBasis": "empathy-split",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.44,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/08",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "ラテラーノの近所の集まりで、向かいのサンクタ二人がふと顔を見合わせ、同時に笑った。理由を尋ねても、二人は言葉を探してから、話の始まりを少しだけ説明し直した。輪の外にいたような感覚が残った。",
    "choices": [
      {
        "label": "分かるように説明してほしいと伝える",
        "outcome": "二人は言葉を探し、話の始まりから説明し直した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "shared-explanation-request"
      },
      {
        "label": "聞こえた話題に加わる",
        "outcome": "あなたは続きの話題を尋ねた。一人が答え、もう一人は笑ってうなずいた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "partial-minutes"
      }
    ],
    "requiresProtagonistLiberi": true,
    "minYear": 1102
  },
  {
    "id": "soc_gap_12",
    "title": "古い歌の出所",
    "domain": "家族の夕食",
    "target": "ガリア系住民",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [
      "ヴィクトリア",
      "リターニア"
    ],
    "sceneBinding": "ambient",
    "conditionSummary": "ヴィクトリア／リターニアで暮らす主人公が、街の年長者の歌を耳にする一回の場面。ガリア由来は年長者の伝聞として扱い、主人公の出自や親族関係を作らない。",
    "excludeSummary": "家伝・親族・所有する地図・主人公のガリア系祖先を作らない。歌の由来を確定した史実として語らない。",
    "knowledgeBasis": "family-oral-history",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "ordinary-contrast",
    "weight": 0.3,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/12",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "夕方、近所の年長者が古い節を口ずさんでいた。由来を尋ねると、「ガリアの歌だと聞いたことはあるが、誰から伝わったかまでは知らない」と答え、聞き慣れない一節をゆっくり歌い直した。",
    "choices": [
      {
        "label": "歌を覚えて一緒に口ずさむ",
        "outcome": "あなたは節を何度か口の中で繰り返した。年長者は最後の音を伸ばし、小さく笑った。",
        "numericEffects": {
          "k": 1,
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "heritage-song-learned"
      },
      {
        "label": "知っている由来を尋ねる",
        "outcome": "年長者は首を振った。確かな出所は分からないまま、歌の節だけが耳に残った。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "family-history-asked"
      }
    ]
  },
  {
    "id": "soc_gap_13",
    "title": "教室の読み上げ",
    "domain": "学校の読み上げ",
    "target": "ターラー系の話者",
    "ageRange": {
      "min": 9,
      "max": 19
    },
    "regions": [
      "ヴィクトリア"
    ],
    "sceneBinding": "actual-school",
    "conditionSummary": "ヴィクトリアの同じ教育地域で実際に在籍中の主人公が、ターラーの言い回しを交えた読み上げをする場合。教師の模倣と直後の反応だけを扱う。",
    "excludeSummary": "訛りを出自から推定しない。学籍だけで訛りの使用を仮定しない。",
    "knowledgeBasis": "audible-taran-accent",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/13",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "現行の言語状態にはターラー訛りの実使用を記録する項目がないため、学籍だけでは発火させない。",
    "text": "ヴィクトリアの教室で地理の本を声に出して読んでいた。ターラーの言い回しが混じると、後ろの席で笑い声が上がった。教師はその話し方を一度まね、教室の空気が止まった。",
    "choices": [
      {
        "label": "読み続けて最後まで読む",
        "outcome": "あなたは指で行を追い、最後の地名を読み終えた。教師は次の生徒を指した。",
        "numericEffects": {
          "k": 1,
          "p": -1
        },
        "actionDescriptors": [],
        "recordAction": "school-accent-harassment"
      },
      {
        "label": "授業後に教師へ話す",
        "outcome": "人のいなくなった教室で、先ほどの言葉について教師に話した。教師は机の縁を見つめてから、明日の授業について答えた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "teacher-complaint-made"
      }
    ],
    "requiresActiveEducation": true,
    "requiredLanguageVariety": "taran_accent_context"
  },
  {
    "id": "soc_gap_15",
    "title": "教室の掃除当番",
    "domain": "寄宿舎の当番",
    "target": "平民の生徒",
    "ageRange": {
      "min": 12,
      "max": 20
    },
    "regions": [
      "ウルサス"
    ],
    "sceneBinding": "actual-school",
    "conditionSummary": "ウルサスの同じ教育地域で実際に在籍中の主人公が教室の掃除当番に参加する一回の場面。別の生徒が貴族家庭だと自称して当番を押し付ける。",
    "excludeSummary": "寄宿舎・寮長・公式な身分特権を作らない。別の特定事件に属する場面を重ねない。",
    "knowledgeBasis": "class-lineage",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/15",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "教室の掃除当番の日、貴族の家の生徒が「うちは代々この学校の監督役だ」と言い、当番表を書き換えてあなたに箒を渡した。周りの生徒は顔を見合わせた。",
    "choices": [
      {
        "label": "当番表を元に戻すよう頼む",
        "outcome": "生徒は表を見直し、今日の名前を一つずつ確かめた。掃除はその場にいた生徒で始まった。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "dorm-duty-reviewed"
      },
      {
        "label": "一緒に掃除をする",
        "outcome": "あなたは箒を動かし、教室の隅のごみを集めた。当番表は机に残ったままだった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "dorm-work-shared"
      }
    ],
    "requiresActiveEducation": true,
    "educationStages": [
      "primary",
      "lower",
      "upper",
      "preparatory"
    ]
  },
  {
    "id": "soc_gap_17",
    "title": "祭りの歌",
    "domain": "村の祭礼",
    "target": "ミノス文化",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [
      "ミノス"
    ],
    "sceneBinding": "verified-festival",
    "conditionSummary": "ミノスの村で実際に開かれている一度の集まりや祭礼に主人公が居合わせ、親族ではない年長者が古い歌を口ずさむ場面。",
    "excludeSummary": "特定の祖父・家系・定期開催の祭りの由来を作らない。",
    "knowledgeBasis": "ancestral-story",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "ordinary-contrast",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/17",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "現行状態にミノスの当該地域・年の祭礼や集まりを示す記録がないため、確認できるまで発火を保留する。",
    "text": "ミノスの村で人が集まった日、年長者が衣装の裾を縫いながら古い歌を口ずさんでいた。近くで聞いていたあなたが節を尋ねると、年長者は糸を切り、机を指先で叩いて歌い直した。",
    "choices": [
      {
        "label": "年長者に習って歌う",
        "outcome": "最初は音を外したが、年長者がもう一度歌い始めた。通りへ出るころには一番の節を覚えていた。",
        "numericEffects": {
          "k": 1,
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-song-learned"
      },
      {
        "label": "衣装のほつれを直すのを手伝う",
        "outcome": "裏返した袖に針を通し、ほつれを塞いだ。年長者は縫い目を見てうなずいた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-clothing-repaired"
      }
    ]
  },
  {
    "id": "soc_gap_23",
    "title": "開拓募集の掲示",
    "domain": "開拓事業の案内",
    "target": "開拓労働者",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "market-street",
    "conditionSummary": "18歳以上のクルビア居住者が市街の掲示板で開拓事業の募集図を目にする一回の情報収集場面。応募・採用・雇用・宿舎の確保を成立させない。",
    "excludeSummary": "J62などへの実応募・採用は既存の入口へ分ける。宿舎・賃金・契約条件を確定しない。",
    "knowledgeBasis": "published-offer",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.35,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/23",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "街角に開拓計画の募集ポスターが貼られていた。小さな図には離れた街区と宿泊棟が描かれ、細かな費用は問い合わせ先で確かめるよう書かれていた。",
    "choices": [
      {
        "label": "移動費と住まいの目安を見積もる",
        "outcome": "掲示の地名と地図を見比べ、旅費と滞在費を別々に考えた。数字はまだ目安のままだった。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "housing-terms-requested"
      },
      {
        "label": "掲載された窓口を控える",
        "outcome": "問い合わせ先を書き写し、募集図をもう一度見た。応募書類は出さず、その場を離れた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "site-tour-requested"
      }
    ]
  },
  {
    "id": "soc_gap_26",
    "title": "帳場の取り分",
    "domain": "街区の取引交渉",
    "target": "地域の非所属商人",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "シラクーザ"
    ],
    "sceneBinding": "current-worksite",
    "conditionSummary": "シラクーザの同じ地域でJ5/J24の現職として商いをする主人公に、匿名の使いが一度だけ支払いを要求する場面。選択はその場の返答に限る。",
    "excludeSummary": "ファミリー加入、債務・契約・支払・反復徴収・取り立て履歴を作らない。近所の店主はその場の匿名人物。",
    "knowledgeBasis": "demand-and-contact",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/26",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "店じまいのころ、見知らぬ使いが帳場に来て「この通りで商いをするなら取り分を払え」と言った。金額も根拠も告げず、折り畳んだ紙を置いた。",
    "choices": [
      {
        "label": "請求の根拠を尋ねる",
        "outcome": "使いは眉を寄せたが、問いに答えず紙を持って去った。あなたは支払うとは答えなかった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "protection-demand-recorded"
      },
      {
        "label": "近くの店主へ相談する",
        "outcome": "近くの店主は似た要求を聞いたことがあると話した。あなたはまだ応じるか決めていなかった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "merchant-network-consulted"
      }
    ],
    "requiresCurrentEmployment": true,
    "workJobIds": [
      5,
      24
    ]
  },
  {
    "id": "soc_gap_29",
    "title": "港の古地図",
    "domain": "家に残る海図",
    "target": "旧海洋文化の継承者",
    "ageRange": {
      "min": 10,
      "max": null
    },
    "regions": [
      "イベリア"
    ],
    "sceneBinding": "market-street",
    "conditionSummary": "イベリアの市街にある古物店の棚を眺める一回の場面。古い海図や港の記録はその店の商品としてだけ扱う。",
    "excludeSummary": "祖父・家族所有・実在の灯台所有者や特定航海史を作らない。海を禁じる全国制度を推定しない。",
    "knowledgeBasis": "physical-chart",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.31,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/29",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "イベリアの古物店に、古い海図と港の記録が並んでいた。店主は破れかけたページをめくり、「今の海岸線とは違う」とだけ話した。",
    "choices": [
      {
        "label": "地図の印について尋ねる",
        "outcome": "店主は印の形を説明したが、そこに記された土地の来歴までは分からなかった。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "sea-chart-oral-history"
      },
      {
        "label": "紙を傷めないようページを閉じる",
        "outcome": "あなたは開いていたページをそっと戻した。店主は記録を棚へしまった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "chart-preserved"
      }
    ]
  },
  {
    "id": "soc_gap_31",
    "title": "角の仮面",
    "domain": "祭りの露店",
    "target": "サルカズ",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [
      "ヴィクトリア",
      "クルビア",
      "カジミエーシュ"
    ],
    "sceneBinding": "market-street",
    "conditionSummary": "ヴィクトリア／クルビア／カジミエーシュの市街市場で、サルカズの主人公が角などからそう認識され、客の偏見ある発言を聞く一回の場面。",
    "excludeSummary": "祭礼や地域共通の意匠を仮定せず、すべてのサルカズに同じ角の形を割り当てない。",
    "knowledgeBasis": "festival-cultural-provenance",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/31",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "市場の店先には、角の形がそれぞれ違う仮面が並んでいた。客の一人はあなたの角を見て、「サルカズが近くにいると不吉だ」と笑った。",
    "choices": [
      {
        "label": "店主に仮面の仕入れ先を尋ねる",
        "outcome": "店主は仕入れた町の名だけを答え、売り物の仮面を一つ箱へ戻した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-origin-inquiry"
      },
      {
        "label": "その言い方をやめるよう伝える",
        "outcome": "客は肩をすくめて歩き去った。店主は仮面を箱へ戻し、次の品を並べた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "festival-stereotype-challenged"
      }
    ]
  },
  {
    "id": "soc_gap_33",
    "title": "学びの募集要項",
    "domain": "大学の募集案内",
    "target": "辺境居住者",
    "ageRange": {
      "min": 14,
      "max": 28
    },
    "regions": [
      "炎国",
      "ヴィクトリア",
      "ウルサス",
      "サルゴン",
      "イェラグ",
      "レム・ビリトン",
      "ボリバル",
      "イベリア"
    ],
    "sceneBinding": "market-street",
    "conditionSummary": "14〜28歳で大学・職業学校・アーツ課程を検討中の主人公が、指定地域の市街で募集掲示を見る一回の情報収集場面。移動費・滞在費は見積もりに限る。",
    "excludeSummary": "出願・保護者同意・入学・授業料・寄宿先・親の支援を作らない。",
    "knowledgeBasis": "received-admissions-packet",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/33",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": false,
    "text": "町の掲示板に、遠方の大学・職業学校の募集要項が貼られていた。年齢条件と学べる分野、問い合わせ先が記され、旅費と住まいは自分で調べるよう案内されていた。",
    "choices": [
      {
        "label": "旅費と滞在費の目安を考える",
        "outcome": "募集要項の地名を地図と見比べ、旅費と滞在費を別々に書き出した。どちらも見積もりのままだった。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "study-access-cost-calculated"
      },
      {
        "label": "問い合わせ先を書き留める",
        "outcome": "紙の端に連絡先を書き写した。出願書類を用意する前に、募集要項をもう一度読み返した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "boarding-inquiry-sent"
      }
    ],
    "requiresEducationIntent": true,
    "educationStages": [
      "university",
      "vocational",
      "arts"
    ]
  }
];
  $terraData.EV.push(...rows.map(compileSocialEvent));
});
