// Generated from the user-provided v3 ledger. All entries stay held until their specific provenance records exist.
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
    "id": "soc_gap_01",
    "title": "荷の奥にしまわれた図面",
    "domain": "工房の客間",
    "target": "鬼",
    "ageRange": {
      "min": 15,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "worksite-or-visit",
    "conditionSummary": "極東の職場か工房を訪れ、鬼の技能を持つ作業員がその場にいる。客への説明役を決める管理者がいる。",
    "excludeSummary": "鬼の作業員・説明役・管理者の場面が成立しない。",
    "knowledgeBasis": "observed",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.42,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/01",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "客に修理箇所を見せる前、親方は鬼の職人に図面を畳ませた。「お前は荷下ろしを頼む。説明はこっちでやる」。職人は油で汚れた指を拭き、直した機械の脇へ退いた。",
    "choices": [
      {
        "label": "説明に加わるよう親方に頼む",
        "outcome": "親方は職人を呼び戻した。職人が割れた軸受を示すと、客は帳面を開いて話を聞いた。",
        "numericEffects": {
          "equityGain": 2,
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "witness-help"
      },
      {
        "label": "職人へ後から図面を借りに行く",
        "outcome": "工房の奥で図面を広げると、職人は折り目の上へ指を置き、どこを削ったか教えてくれた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "private-contact"
      }
    ]
  },
  {
    "id": "soc_gap_02",
    "title": "名簿にない名字",
    "domain": "受付の書類",
    "target": "鬼",
    "ageRange": {
      "min": 10,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "administrative-service",
    "conditionSummary": "主人公が鬼。氏名記録のある行政・学校・組合の窓口に用件がある。本人の呼称に名字欄の扱いが必要。",
    "excludeSummary": "姓名が完全に登録済みで受付が問題なく処理した場合、所在不明の窓口。",
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
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "受付の女が名前を聞いて筆を止めた。「名字は」。自分の名をもう一度伝えると、女は紙の空欄を爪で叩いた。後ろの人々の靴音が、長い廊下に響いていた。",
    "choices": [
      {
        "label": "普段の名乗り方を説明する",
        "outcome": "女は呼称をもう一度聞き取り、欄外に書き添えた。申請書は控えの束へ入った。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "application-submitted-name-note"
      },
      {
        "label": "記入方法を知っている人に尋ねる",
        "outcome": "列から外れて隣の机を尋ねると、別の係員が余白の使い方を教えてくれた。紙は折らずに持ち帰った。",
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
    "title": "画面の向こうの鬼",
    "domain": "端末の掲示板",
    "target": "鬼",
    "ageRange": {
      "min": 14,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "network-access",
    "conditionSummary": "都市間ネットの端末を実際に利用でき、鬼への悪口が掲示されている。",
    "excludeSummary": "端末と閲覧条件がない、本人が読み取れない文字の掲示。",
    "knowledgeBasis": "readable-post",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.26,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/03",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "掲示板に鬼の話題が上がっていた。「力だけで物を考える連中だ」と書かれた下に、抗議への嘲笑が続く。画面の硝子には、隣で読んでいる人の顔が映っていた。",
    "choices": [
      {
        "label": "悪口に反論を書き込む",
        "outcome": "自分の文章が欄の一番下に表示された。しばらくして短い反論と、礼を述べる返事が一つずつ付いた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "online-reply"
      },
      {
        "label": "画面を閉じて隣の人と話す",
        "outcome": "端末を閉じると、隣の人は「一緒に働いた鬼は丁寧な職人だった」と言った。二人で明日の仕事の話をした。",
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
    "title": "技師を探す番人",
    "domain": "昇降機の修理現場",
    "target": "ドゥリン",
    "ageRange": {
      "min": 12,
      "max": null
    },
    "regions": [
      "サルゴン",
      "クルビア",
      "シエスタ"
    ],
    "sceneBinding": "worksite-or-visit",
    "conditionSummary": "ドゥリンの技師が地上の修理現場へ実際に来ており、主人公が当事者か立ち会い人。",
    "excludeSummary": "ドゥリンが訪れていない、地下都市内部だけの場面。",
    "knowledgeBasis": "visual-race",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/04",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "昇降機の歯車が鳴り、工具箱を持ったドゥリンが戸口をくぐった。番人はその顔を見ると、「子どもは外で待ちな」と言い、後ろにいる技師を探した。",
    "choices": [
      {
        "label": "工具箱の持ち主を紹介する",
        "outcome": "番人は目を丸くして身を引いた。ドゥリンはひとつ頷き、図面を床へ広げた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "engineer-identified"
      },
      {
        "label": "番人の言葉を技師へ伝える",
        "outcome": "技師は顔をしかめて工具箱を置いた。「何度目だろうな」。番人が戸を開けるまで、歯車の音だけが続いた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "engineer-heard"
      }
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
    "conditionSummary": "主人公がドゥリンで地上の作業現場に所属。作業台が本人の身体寸法に合わないと実際に判定。",
    "excludeSummary": "地下の専用設備、適合済みの作業台、現場外。",
    "knowledgeBasis": "physical-ergonomics",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.3,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/05",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "作業台の一番奥に留め金がある。踏み台を移しても腕が届かず、手元の部品が床へ転がった。監督は「急げ」と言い、次の箱を運んできた。",
    "choices": [
      {
        "label": "監督に低い台を頼む",
        "outcome": "監督は倉庫の台を指し、使えるか確かめるよう言った。あなたは運び出して高さを合わせた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "equipment-adjustment-requested"
      },
      {
        "label": "仲間に片側を押さえてもらう",
        "outcome": "仲間が板を支える間に、あなたは留め金へ手を伸ばした。作業を終えると二人で散った部品を拾った。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "coworker-assistance"
      }
    ]
  },
  {
    "id": "soc_gap_06",
    "title": "譜面の余白",
    "domain": "音楽・アーツの授業",
    "target": "アーツ適性の低い学習者",
    "ageRange": {
      "min": 9,
      "max": 23
    },
    "regions": [
      "リターニア"
    ],
    "sceneBinding": "current-education",
    "conditionSummary": "実際の音楽またはアーツ課程の学籍があり、個人の適性記録が低位。評価権限のある教師が在職。",
    "excludeSummary": "学校が閉鎖中、在籍なし、適性未評価、教師の実在不明。",
    "knowledgeBasis": "recorded-arts-aptitude",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/06",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "弦の音が止まると、教師は譜面の横へ「アーツ反応弱」と書いた。旋律の途中に間違いはなかったが、次の稽古から席は後ろへ移された。",
    "choices": [
      {
        "label": "演奏をもう一度聞いてもらう",
        "outcome": "教師は短く頷き、もう一曲弾くよう指示した。弾き終えると評価欄に日付が増えた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "education-review-requested"
      },
      {
        "label": "別の教師へ譜面を持っていく",
        "outcome": "譜面を見た教師は運指の癖を書き込んだ。「来週、これを弾いてみなさい」。新しい練習曲を抱えて教室を出た。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "tutor-consultation"
      }
    ]
  },
  {
    "id": "soc_gap_07",
    "title": "紹介状の封蝋",
    "domain": "学習後援の面談",
    "target": "貧しい学生",
    "ageRange": {
      "min": 12,
      "max": 27
    },
    "regions": [
      "リターニア"
    ],
    "sceneBinding": "education-interview",
    "conditionSummary": "実在する音楽・アーツ教育課程の入学または師事の面談。候補者間の紹介状と経済条件に差がある。",
    "excludeSummary": "面談自体が存在しない、選抜終了済み。",
    "knowledgeBasis": "visible-recommendation",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.28,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/07",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "控室の机には封蝋の残る紹介状が二通置かれていた。豪奢な上着の少年が先に呼ばれ、その後、擦り切れた鞄を抱えた少女が名前を告げた。監督は鞄より紹介状を長く見た。",
    "choices": [
      {
        "label": "面談官へ実演で判断してほしいと頼む",
        "outcome": "面談官は二人に同じ短い曲を指定した。演奏が終わると採点用紙を裏返した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "selection-procedure-requested"
      },
      {
        "label": "少女へ準備の順番を教える",
        "outcome": "少女は鞄から譜面を取り出し、余白を確かめた。呼び出しまでの数分、二人で指を動かして待った。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "candidate-support"
      }
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
    "sceneBinding": "actual-meeting",
    "conditionSummary": "主人公がリーベリでラテラーノの公的・宗教的な会合に参加し、近くに複数のサンクタがいる。",
    "excludeSummary": "非参加、サンクタがいない、共有感覚を利用しない会話。",
    "knowledgeBasis": "empathy-split",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.44,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/08",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "話の途中で向かいのサンクタ二人が顔を見合わせ、同時に笑った。議事録を取っていたあなたが理由を尋ねると、一人は「さっきので分かっただろう」と首をかしげた。",
    "choices": [
      {
        "label": "分かるように説明してほしいと伝える",
        "outcome": "サンクタは言葉を探し、話の始まりから説明し直した。あなたは議事録の空いていた行を埋めた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "shared-explanation-request"
      },
      {
        "label": "議事録に聞こえたことだけを書く",
        "outcome": "笑いの後に続いた発言を書き留めた。隣の席のリーベリが、休憩のときに不足した箇所を尋ねにきた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "partial-minutes"
      }
    ]
  },
  {
    "id": "soc_gap_09",
    "title": "教会の役目",
    "domain": "宗教職の推薦",
    "target": "非サンクタの公民",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "ラテラーノ"
    ],
    "sceneBinding": "verified-office",
    "conditionSummary": "ラテラーノ公民か実際の所属者で、実在する役職の推薦を受ける。対象役職の資格と種族条件は原作で確認済みの個別制度に限定。",
    "excludeSummary": "資格条文が不明な職を「サンクタ限定」として扱う場合、役職自体が不明。",
    "knowledgeBasis": "published-eligibility",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.19,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/09",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "教会の廊下で、推薦状を渡された。窓口の係員は役目の欄を指でなぞり、必要書類の控えを差し出した。長い列の先には、同じ紙を持った人々がいた。",
    "choices": [
      {
        "label": "係員に資格要件を尋ねる",
        "outcome": "係員は綴じた規程を開き、該当する条を示した。あなたは条番号を控えた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "role-rules-queried"
      },
      {
        "label": "推薦者へ別の職務を相談する",
        "outcome": "推薦者は手元の名簿を見て、手伝いを募集している別の部署の名を教えた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "alternate-role-inquiry"
      }
    ]
  },
  {
    "id": "soc_gap_10",
    "title": "封筒の出自",
    "domain": "親子の書類",
    "target": "複雑な血縁",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "ラテラーノ"
    ],
    "sceneBinding": "family-or-clerk",
    "conditionSummary": "登録済みの本人または家族に実際の異種族の親子関係があり、公証・学校への提出書類が存在する。",
    "excludeSummary": "血統が推定だけ、本人や親の情報が他人へ公開されていない場面で相手が知っている設定。",
    "knowledgeBasis": "recorded-parentage",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.21,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/10",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "公証人に渡す封筒の中には、子どもの出生を記した紙があった。宛名を写そうとすると、母の名と父の名の間で筆が止まった。子は戸口で靴の紐を結び直していた。",
    "choices": [
      {
        "label": "子に見せる範囲を家族で相談する",
        "outcome": "家で紙を広げ、子どもにどの名前を見せるか話し合った。公証所へ出す控えは別に包んだ。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "family-consulted-disclosure"
      },
      {
        "label": "公証人へ必要な欄だけ確認する",
        "outcome": "係員は該当する欄を丸で囲み、記入例を渡した。あなたは家族の名を書き写して紙をしまった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "record-requirements-asked"
      }
    ]
  },
  {
    "id": "soc_gap_11",
    "title": "手荷物の目録",
    "domain": "雇用の身元照会",
    "target": "シラクーザ出身ループス",
    "ageRange": {
      "min": 15,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "employment-interview",
    "conditionSummary": "主人公がループスでシラクーザ出身、または本人に紐づく家系・言語等の認知があり、クルビアで応募中。",
    "excludeSummary": "面接先がない、相手が出自を知る経路がない、採用済みの職場。",
    "knowledgeBasis": "known-siracusan-origin",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/11",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "雇い主は履歴書の出身地を読んで指を止めた。「その荷のなかに密輸の品はないだろうな」。書類の上で、あなたの手が固まった。",
    "choices": [
      {
        "label": "担当者に職務経験へ話を戻す",
        "outcome": "担当者は咳払いをし、前職の担当業務を尋ねた。あなたは倉庫で扱った品目を一つずつ答えた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "interview-factual-response"
      },
      {
        "label": "発言を記録し別の求人も探す",
        "outcome": "面接室を出てすぐ、手帳に時刻と担当者の言葉を書いた。帰りの市場で別の求人札を読んだ。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [],
        "recordAction": "interview-incident-recorded"
      }
    ]
  },
  {
    "id": "soc_gap_12",
    "title": "台所で歌う言葉",
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
    "sceneBinding": "actual-family-home",
    "conditionSummary": "家族内にガリア系の言語や歌を伝える人物が実在し、本人がその関係を知っている。",
    "excludeSummary": "家族の出自・伝達相手が登録されていない。",
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
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "夕飯の支度をしながら、年長の親族が古い歌を口ずさんだ。聞き慣れない言葉を一つ聞き返すと、親族は手を洗い、歌の最初からゆっくり教えた。",
    "choices": [
      {
        "label": "歌を覚えて一緒に歌う",
        "outcome": "皿を並べる間に二番まで覚えた。親族は最後の音を伸ばし、小さく笑った。",
        "numericEffects": {
          "k": 1,
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "heritage-song-learned"
      },
      {
        "label": "歌が生まれた場所を尋ねる",
        "outcome": "親族は古い地図を取り出し、指で一つの町を押さえた。あなたはその名を手帳に書き留めた。",
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
    "title": "試験の前の訛り",
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
    "conditionSummary": "学校に実在する学籍があり、主人公がターラー系の訛りを使い、授業の読み上げに参加。",
    "excludeSummary": "非就学、訛りの知識がない、授業なし。",
    "knowledgeBasis": "audible-taran-accent",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/13",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "地理の本を声に出して読むと、後ろの席で笑い声がした。教師はあなたの訛りを一度まね、教室の空気が止まった。",
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
        "outcome": "人のいなくなった教室で、教師に先ほどの言葉を伝えた。教師は机の縁を見つめてから、明日の授業について答えた。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "teacher-complaint-made"
      }
    ]
  },
  {
    "id": "soc_gap_14",
    "title": "封蝋の家紋",
    "domain": "以前の主人からの便り",
    "target": "解放された元奴隷",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "カジミエーシュ"
    ],
    "sceneBinding": "current-residence",
    "conditionSummary": "主人公に実在する奴隷身分と解放の履歴、および元主人またはその家との接点が登録されている。",
    "excludeSummary": "奴隷歴のない通常住民、元主人記録なし。",
    "knowledgeBasis": "verified-enslavement-history",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.2,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/14",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "使いが古い家紋の封筒を持ってきた。手紙には食事の席へ来るよう書かれ、署名の下には以前呼ばれていた名があった。",
    "choices": [
      {
        "label": "用件と条件を書いて返す",
        "outcome": "返事の封を閉じ、誰に何を求められているか確かめてから会うと書いた。使いは封筒を懐へ入れた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "former-master-contact-conditional"
      },
      {
        "label": "会うことを断る",
        "outcome": "短い返事を書いて使いに渡した。門が閉まると、あなたは手紙の写しを棚の奥へしまった。",
        "numericEffects": {
          "p": 1
        },
        "actionDescriptors": [],
        "recordAction": "former-master-visit-declined"
      }
    ]
  },
  {
    "id": "soc_gap_15",
    "title": "寮の鍵",
    "domain": "寄宿舎の当番",
    "target": "平民の生徒",
    "ageRange": {
      "min": 12,
      "max": 20
    },
    "regions": [
      "ウルサス"
    ],
    "sceneBinding": "actual-boarding-school",
    "conditionSummary": "ウルサスの実在する寄宿舎学校に在籍し、貴族家系と一般家庭の生徒の双方がいる。",
    "excludeSummary": "寄宿舎なし、学籍なし、ペテルヘイム事件の特定場面に該当する場合は当該専用イベントを優先。",
    "knowledgeBasis": "class-lineage",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/15",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "寮の鍵を預ける日だった。貴族の家の生徒が「うちは代々監督役だ」と言い、当番表を勝手に書き換えた。平民の生徒は箒を持ったまま立っていた。",
    "choices": [
      {
        "label": "当番表を元に戻すよう頼む",
        "outcome": "生徒監督が表を見直し、一人ずつ名前を呼んだ。鍵は予定どおり当番の手へ渡った。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "dorm-duty-reviewed"
      },
      {
        "label": "平民の生徒の仕事を手伝う",
        "outcome": "二人で廊下を掃き、戸口の雪を払い落とした。鍵の話は夕食まで続いた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "dorm-work-shared"
      }
    ]
  },
  {
    "id": "soc_gap_16",
    "title": "名のない広告枠",
    "domain": "スポンサーとの紙面確認",
    "target": "競技騎士",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "カジミエーシュ"
    ],
    "sceneBinding": "registered-arena-or-office",
    "conditionSummary": "主人公が競技騎士で、実際のスポンサー契約または広報契約の交渉がある。",
    "excludeSummary": "騎士登録・契約のない住民、企業名と本人の同意がない。",
    "knowledgeBasis": "contract-proposal",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.36,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/16",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "試合前の紹介文を見せられた。あなたの名前よりスポンサーの商品名が大きく印刷されている。編集者は赤鉛筆を渡し、「直したいところがあれば」と言った。",
    "choices": [
      {
        "label": "自分の経歴も載せてほしいと頼む",
        "outcome": "編集者は紙の下に二行の空きを作り、あなたの戦歴を聞いて書き込んだ。改稿案は担当者へ回された。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "publicity-change-requested"
      },
      {
        "label": "契約書の条件を読み直す",
        "outcome": "紹介文を脇へ置いて契約書を開いた。印刷物の扱いを書いた条項に紙片を挟んだ。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "sponsor-terms-reviewed"
      }
    ]
  },
  {
    "id": "soc_gap_17",
    "title": "祖父の節回し",
    "domain": "村の祭礼",
    "target": "ミノス文化",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [
      "ミノス"
    ],
    "sceneBinding": "festival-family",
    "conditionSummary": "主人公の親族に古い歌や祭礼を教える人物が実在し、集落で実際に祭礼が開かれる。",
    "excludeSummary": "教える親族が不在、祭礼が行われない歴史時点。",
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
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "祭礼の前に、祖父が衣装の裾を縫っていた。古い歌を頼むと、祖父は糸を切り、机を指先で叩いて節を取った。",
    "choices": [
      {
        "label": "祖父に習って歌う",
        "outcome": "最初は音を外したが、祖父がもう一度歌い始めた。通りへ出る頃には一番の節を覚えていた。",
        "numericEffects": {
          "k": 1,
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-song-learned"
      },
      {
        "label": "衣装を直すのを手伝う",
        "outcome": "裏返した袖に針を通し、ほつれを塞いだ。祖父は縫い目を見てうなずいた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-clothing-repaired"
      }
    ]
  },
  {
    "id": "soc_gap_18",
    "title": "古い出勤簿",
    "domain": "村の記録庫",
    "target": "旧占領期の役人の家系",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "ミノス"
    ],
    "sceneBinding": "verified-local-archive",
    "conditionSummary": "旧支配期に役所勤務した人物と主人公の血縁・後継関係が実際の家系履歴にあり、その名簿が現地で閲覧できる。",
    "excludeSummary": "登録済みの家系履歴なし、時代が支配期以前、記録庫の所在なし。",
    "knowledgeBasis": "verifiable-service-ledger",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.19,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/18",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "記録庫で古い出勤簿を開くと、祖先の名前に印が付いていた。隣で読んでいた老人はその頁を見ると、椅子を遠ざけた。「その家の者か」。",
    "choices": [
      {
        "label": "当時の職務を確認する",
        "outcome": "老人に職務の欄を指して尋ねた。老人は部署名と配給の仕事を説明し、別の簿冊を持ってきた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "ancestor-service-checked"
      },
      {
        "label": "老人に家族の話を聞く",
        "outcome": "老人は長い間黙り、最後に村が飢えた年のことを話した。あなたは言葉を挟まず聞いた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "family-reputation-account"
      }
    ]
  },
  {
    "id": "soc_gap_19",
    "title": "地図にない墓標",
    "domain": "外来測量隊の道案内",
    "target": "サーミの共同体",
    "ageRange": {
      "min": 14,
      "max": null
    },
    "regions": [
      "サーミ"
    ],
    "sceneBinding": "local-survey",
    "conditionSummary": "サーミ現地で外来測量隊との実際の面談があり、地元の案内人と雪祀・年長者の承諾範囲を確かめられる。",
    "excludeSummary": "測量隊不在、探索の立入が拒否されている場所へ本人を強制同行させる場面。",
    "knowledgeBasis": "agreed-survey-boundary",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.35,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/19",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "測量隊は谷の地図へ番号を打ち込んだ。案内人はそこに先祖の墓標があると伝えたが、研究員は「未調査」と書いた札を杭へ結んだ。",
    "choices": [
      {
        "label": "研究員へ墓標の場所を伝える",
        "outcome": "研究員は札を外し、地図の端へ印を移した。案内人は手元の杖を握り直した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "survey-correction-requested"
      },
      {
        "label": "案内人と一緒に雪祀へ相談する",
        "outcome": "二人で雪祀の家まで歩いた。雪祀は地図を見ると、谷を指したまま長く考えた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "snowpriest-consultation"
      }
    ]
  },
  {
    "id": "soc_gap_20",
    "title": "封のない試料箱",
    "domain": "調査隊の荷造り",
    "target": "サーミの共同体",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "サーミ"
    ],
    "sceneBinding": "actual-research-camp",
    "conditionSummary": "調査隊が現地の資料・植物等を採取し、主人公が案内人か調査に立ち会う。採取許諾が議題になっている。",
    "excludeSummary": "調査隊や採取物が存在しない。重大な危険区域での立入が成立しない。",
    "knowledgeBasis": "consent-scope",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.29,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/20",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "研究員が木箱へ採った試料を詰めている。案内人は箱の中の包みを見て、「それは持ち出す話をしていない」と声を上げた。研究員の手が止まった。",
    "choices": [
      {
        "label": "許可を取った人を確かめる",
        "outcome": "研究員は帳面を開いたが、当該の包みを記した頁は空白だった。案内人は箱を閉じるよう頼んだ。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "specimen-permit-audit"
      },
      {
        "label": "地元の代表者を呼んで話す",
        "outcome": "荷運びを止めて村の代表者を迎えた。代表者は一つずつ包みの説明を求め、研究員は答えを記録した。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "specimen-community-consultation"
      }
    ]
  },
  {
    "id": "soc_gap_21",
    "title": "別の印章",
    "domain": "道中の検問所",
    "target": "政権交代地域の住民",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "ボリバル"
    ],
    "sceneBinding": "actual-checkpoint",
    "conditionSummary": "ボリバルの実際の支配主体が分かる検問所を通過。主人公に前の支配主体の証明書がある。",
    "excludeSummary": "検問不在、移動予定なし、書類の発行主体が記録されていない。",
    "knowledgeBasis": "issuer-stamp-and-current-authority",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.28,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/21",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "検問兵は旅券の印章を見て首を振った。「これは前の役所のものだ」。窓の向こうでは荷車が一台ずつ通されていた。",
    "choices": [
      {
        "label": "必要な書類を尋ねる",
        "outcome": "兵は通行係の机を指した。担当は提出する書類の名称を書き、紙を返してきた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "permit-reissue-inquiry"
      },
      {
        "label": "その場で通行を取りやめる",
        "outcome": "荷を背負い直して列から外れた。道の端で行商人が地図を広げていた。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [],
        "recordAction": "crossing-withdrawn"
      }
    ]
  },
  {
    "id": "soc_gap_22",
    "title": "境界の向こうの叔母",
    "domain": "遠方からの便り",
    "target": "異勢力の居住者",
    "ageRange": {
      "min": 12,
      "max": null
    },
    "regions": [
      "ボリバル"
    ],
    "sceneBinding": "correspondence",
    "conditionSummary": "存命で連絡先のある叔母または該当の実在親族が別の支配勢力の地域に住み、郵便経路がある。",
    "excludeSummary": "その親族が存在しない、死去、連絡終了、所在も経路もない。",
    "knowledgeBasis": "registered-relative-region",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.3,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/22",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "叔母から薄い便箋が届いた。病気のことと家の屋根の修理が書いてあり、封筒の端には境界の検閲印が付いていた。",
    "choices": [
      {
        "label": "叔母へ生活の様子を書いて返す",
        "outcome": "叔母の好きな干し果物のことを書き、封を閉じた。郵便の受付へ持っていった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "relative-letter-sent"
      },
      {
        "label": "返事に入れる情報を家族と相談する",
        "outcome": "家の卓に便箋を広げた。家族は仕事の場所と移動の予定について慎重に相談した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "family-disclosure-review"
      }
    ]
  },
  {
    "id": "soc_gap_23",
    "title": "新天地の宿舎",
    "domain": "開拓事業の案内",
    "target": "開拓労働者",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "recruitment-office",
    "conditionSummary": "主人公が開拓事業へ実際に問い合わせるか応募中。広告に宿舎と賃金の説明がある。",
    "excludeSummary": "実際の求人・応募なし、すでに契約と転居を終えた。",
    "knowledgeBasis": "published-offer",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.35,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/23",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "開拓事業の受付には「家族用宿舎完備」と書かれた刷り物が貼られていた。受付係が見せた図面では、寝台が並ぶ小部屋に共同台所が一つ付いていた。",
    "choices": [
      {
        "label": "宿舎の部屋数と賃料を尋ねる",
        "outcome": "係員は台帳を開き、入居待ちの人数と月々の費用を教えた。あなたは広告の裏へ数字を書いた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "housing-terms-requested"
      },
      {
        "label": "現地を見てから応募する",
        "outcome": "見学できる日を聞いて控えた。受付を出ると、次の荷車が資材を積み込んでいた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "site-tour-requested"
      }
    ]
  },
  {
    "id": "soc_gap_24",
    "title": "保護者の印",
    "domain": "研究同意書",
    "target": "研究に参加する子ども",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "actual-research-invitation",
    "conditionSummary": "主人公が実在する子どもの監護者で、研究機関から研究参加を打診された。子どもの同意と親権・監護権を照合。",
    "excludeSummary": "対象児童なし、研究参加の募集なし、監護権がなく署名できない。",
    "knowledgeBasis": "consent-offer-record",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.2,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/24",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "研究員は説明書の最後に赤い印を押した。「こちらへ署名を」。隣の椅子で子どもは病室の窓を見ている。書類には長い検査日程が並んでいた。",
    "choices": [
      {
        "label": "子どもにも説明してほしいと求める",
        "outcome": "研究員は子どもの椅子の前へかがみ、最初の検査について話した。子どもは採血のことを尋ねた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "child-informed-consultation"
      },
      {
        "label": "書類を持ち帰って相談する",
        "outcome": "署名欄を空けたまま説明書を封筒へ戻した。研究員は連絡先を書いて手渡した。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "research-consent-deferred"
      }
    ]
  },
  {
    "id": "soc_gap_25",
    "title": "夜の研究室",
    "domain": "研究室の安全会議",
    "target": "研究対象者",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "クルビア"
    ],
    "sceneBinding": "verified-research-worksite",
    "conditionSummary": "主人公が所属研究機関の職員で、実際に問題となる研究手順を知っている。対象者の同意条件と監督者を参照。",
    "excludeSummary": "研究職でない、実験記録がなく違反を認知する契機がない。",
    "knowledgeBasis": "observed-protocol-conflict",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.19,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/25",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "研究室の灯りが一つ残っていた。検査記録には、被験者が中止を訴えた時刻と次の測定の時刻が重なっていた。責任者は明日の発表資料を直していた。",
    "choices": [
      {
        "label": "責任者へ中止記録を示す",
        "outcome": "責任者は資料を置き、記録の原本を見せるよう言った。あなたは署名と時刻の箇所を開いた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "ethics-concern-raised"
      },
      {
        "label": "安全担当へ記録を送る",
        "outcome": "記録の写しを封に入れ、安全担当の窓口へ届けた。受付が日時を記した控えを返した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "safety-report-filed"
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
    "sceneBinding": "actual-merchant-worksite",
    "conditionSummary": "主人公に実際の露店・商業取引があり、現地でファミリー側の取り立て交渉が発生。",
    "excludeSummary": "店舗・売上や交渉者が存在しない、すでに同じ期間の取り分を確定している。",
    "knowledgeBasis": "demand-and-contact",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/26",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "閉店前、使いの男が帳場に来て「通りを使うなら取り分を」と言った。男は古い封筒を置き、紙へ金額を書き始めた。",
    "choices": [
      {
        "label": "請求の根拠を書いてもらう",
        "outcome": "男は眉を寄せたが、封筒へ地区名と金額を書き込んだ。あなたは控えを取ってしまった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "protection-demand-recorded"
      },
      {
        "label": "近所の店主へ相談する",
        "outcome": "隣の店主は戸を閉めてから、以前の請求書を見せた。あなたは日付を読み比べた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "merchant-network-consulted"
      }
    ]
  },
  {
    "id": "soc_gap_27",
    "title": "叔父の借用書",
    "domain": "自宅への取り立て",
    "target": "家族の借金",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "シラクーザ"
    ],
    "sceneBinding": "current-home",
    "conditionSummary": "生存する叔父等の実在親族に、現実の債務・保証関係が登録され、使いが本人へ訪ねて来た。",
    "excludeSummary": "親族なし、債務履歴なし、当人が保証人であることが記録されていないのに法的返済義務を課す場面。",
    "knowledgeBasis": "debt-record",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.3,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/27",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "戸口で使いが叔父の借用書を差し出した。「あの人が帰さないなら、身内から取り立てる」。あなたの名は書面になかった。",
    "choices": [
      {
        "label": "自分に返済義務があるか書面を確かめる",
        "outcome": "使いは紙を広げ、叔父の署名を指した。あなたが自分の名を問うと、しばらく返事がなかった。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "debt-liability-questioned"
      },
      {
        "label": "叔父本人へ連絡を取る",
        "outcome": "借用書の写しを取り、叔父の連絡先へ使いを出した。返事が来るまで紙を引き出しにしまった。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "family-debt-inquiry"
      }
    ]
  },
  {
    "id": "soc_gap_28",
    "title": "別の旗の工房",
    "domain": "工房の仕事紹介",
    "target": "氏族に縁のある住民",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "イェラグ"
    ],
    "sceneBinding": "local-employment-contact",
    "conditionSummary": "主人公に氏族・雇用先・推薦者の個別関係があり、実在する他氏族の工房から応募の誘いがある。",
    "excludeSummary": "紹介者不在、工房不在、仕事を受ける資格・移動の条件がない。",
    "knowledgeBasis": "actual-clan-connection",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.37,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/28",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "山道で知り合いに呼び止められた。「向こうの工房で手が足りない」。門に掛かる旗は、家が長く仕えてきた氏族のものと違っていた。",
    "choices": [
      {
        "label": "工房の仕事と賃金を聞く",
        "outcome": "知り合いは作る品と働く時間を紙に書いた。あなたは見習いの期間を尋ねた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "cross-clan-offer-queried"
      },
      {
        "label": "家族に先に話す",
        "outcome": "食卓で誘いの話をすると、年長者は旗の色を聞いて箸を止めた。あなたは条件を書いた紙を広げた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "clan-family-consultation"
      }
    ]
  },
  {
    "id": "soc_gap_29",
    "title": "祖父の海図",
    "domain": "家に残る海図",
    "target": "旧海洋文化の継承者",
    "ageRange": {
      "min": 10,
      "max": null
    },
    "regions": [
      "イベリア"
    ],
    "sceneBinding": "family-home-document",
    "conditionSummary": "実在する海図・旧航海資料を家族が保有し、本人へ見せる関係がある。",
    "excludeSummary": "海図なし、親族なし、海を禁じる時代や地区という断定を資料で裏付けられない。",
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
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "祖父は古い衣装箱から巻いた海図を出した。港の線を指でなぞり、かつて灯台があった場所で指を止める。「これは外へ持って行くな」と言って、また箱へ戻した。",
    "choices": [
      {
        "label": "地図の印について聞く",
        "outcome": "祖父は一つの灯台に印を付け、そこで働いた船乗りの名を教えた。あなたは別紙へ書き写した。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "sea-chart-oral-history"
      },
      {
        "label": "箱の保存を手伝う",
        "outcome": "紙の端を布で包み、湿らない棚へ移した。祖父は鍵を確かめて箱を閉じた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "chart-preserved"
      }
    ]
  },
  {
    "id": "soc_gap_30",
    "title": "灯台技師の工具",
    "domain": "遺品の道具箱",
    "target": "旧海洋技術の家族",
    "ageRange": {
      "min": 15,
      "max": null
    },
    "regions": [
      "イベリア"
    ],
    "sceneBinding": "documented-family-property",
    "conditionSummary": "実在する元灯台技師の故人・親族関係と工具が記録され、主人公が実物に接している。",
    "excludeSummary": "故人の職業履歴がなく、工具の出所がない。",
    "knowledgeBasis": "owned-artifact",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.24,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/30",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "屋根裏から錆びた道具箱が見つかった。蓋の内側には故人の名があり、細い調整針と曇ったレンズが布に包まれていた。",
    "choices": [
      {
        "label": "工具の用途を知る人を探す",
        "outcome": "港の古い職人は針を見て、灯りの調整に使ったものだと教えた。どこで磨けばよいかも紙に書いてくれた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "old-lighthouse-tool-identified"
      },
      {
        "label": "家族に使ってよいか尋ねる",
        "outcome": "家族は道具箱の裏を見てから、「返してくれるなら」と鍵を預けた。工具は机へ並べた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "family-tool-consent"
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
    "sceneBinding": "verified-festival",
    "conditionSummary": "サルカズ由来の意匠が実際に商品化された祭りが当地・年代に存在し、主人公がそこを訪れる。",
    "excludeSummary": "祭礼が不在、文化流入や意匠がない、現地の祭りをテラ全土の同一行事と見なす場合。",
    "knowledgeBasis": "festival-cultural-provenance",
    "frequencyClass": "L1_他集団への偏見",
    "group": "daily-bias",
    "weight": 0.27,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/31",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": true,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "祭りの屋台に角を付けた仮面が並び、客の一人が「悪いサルカズの顔だ」と笑っていた。店主は飾りの紐を結び直していた。",
    "choices": [
      {
        "label": "店主に仮面の由来を尋ねる",
        "outcome": "店主は仕入れた町と昔聞いた祭りの話をした。話の途中で、売り物の仮面を一つ裏返した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "festival-origin-inquiry"
      },
      {
        "label": "その言い方をやめるよう伝える",
        "outcome": "客は肩をすくめて歩き去った。店主はしばらく口を閉じ、仮面を箱へ戻した。",
        "numericEffects": {
          "equityGain": 2
        },
        "actionDescriptors": [],
        "recordAction": "festival-stereotype-challenged"
      }
    ]
  },
  {
    "id": "soc_gap_32",
    "title": "父の古い所属証",
    "domain": "地区の推薦状窓口",
    "target": "旧勢力の家族",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "ボリバル"
    ],
    "sceneBinding": "actual-administrative-office",
    "conditionSummary": "主人公の親または養育者が以前の政権・軍に実際に勤務し、その履歴を担当者が知る具体的経路がある。",
    "excludeSummary": "実在する所属履歴なし、担当者が親の過去を知る経路がない。",
    "knowledgeBasis": "parent-service-source",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.23,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/32",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "推薦状の受付で、係員が父の古い所属証を見つけた。「あの隊にいた人の子か」。あなたが現在の住所を告げても、係員は父の名を繰り返した。",
    "choices": [
      {
        "label": "自分の経歴を確認してもらう",
        "outcome": "あなたは学校と仕事の記録を机に並べた。係員は順に目を通し、受付番号を書いた紙を渡した。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "personal-merit-review-requested"
      },
      {
        "label": "差し戻し理由を文書で求める",
        "outcome": "係員は監督者へ尋ねに行き、しばらくして返送理由の記載欄を示した。あなたは控えを受け取った。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "written-decision-requested"
      }
    ]
  },
  {
    "id": "soc_gap_33",
    "title": "遠い大学の封筒",
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
    "sceneBinding": "actual-education-offer",
    "conditionSummary": "本人が大学・職業学校を検討できる年齢で、募集案内への具体的接触がある。移動費・寄宿・学籍を現行教育アクセスモデルで確認。",
    "excludeSummary": "学校の募集自体が存在しない、進学期間外、案内の場所を持たない。",
    "knowledgeBasis": "received-admissions-packet",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.34,
    "cooldownYears": 8,
    "once": false,
    "episodeKey": "gap/33",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "郵便で遠い都市の大学の募集要項が届いた。授業料より下にある旅費と寄宿舎の欄を読み、あなたは食卓の財布を開いた。",
    "choices": [
      {
        "label": "旅費と住まいの費用を計算する",
        "outcome": "紙の裏に数字を書き出した。足りない分の額が分かり、あなたは父母へ紙を見せた。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "study-access-cost-calculated"
      },
      {
        "label": "学校へ寄宿の条件を照会する",
        "outcome": "出願先を確認し、寄宿の条件を教えてほしいと便りを書いた。封を閉じて窓辺に置いた。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "boarding-inquiry-sent"
      }
    ]
  },
  {
    "id": "soc_gap_34",
    "title": "坑道の帰りを待つ",
    "domain": "坑道事故の連絡",
    "target": "鉱山労働者の家族",
    "ageRange": {
      "min": 8,
      "max": null
    },
    "regions": [
      "レム・ビリトン"
    ],
    "sceneBinding": "actual-mining-household",
    "conditionSummary": "実際の世帯の働き手が鉱山に就労しており、その現場で事故が起きた記録がある。家族への連絡経路が存在。",
    "excludeSummary": "鉱山就労のない家、事故記録なし、危機の年が一致しない。",
    "knowledgeBasis": "documented-accident",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.2,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/34",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "坑道の方から使いが来て、夕刻の交代が遅れていると告げた。家では夕飯を温め直し、家族が靴を履いたまま椅子に座っていた。",
    "choices": [
      {
        "label": "現場の救護窓口へ状況を尋ねる",
        "outcome": "窓口の職員は勤務班の名を照合し、待機場所を教えた。家族は湯を持ってそこへ向かった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "mine-accident-contact"
      },
      {
        "label": "家の子どもと食事を先に取る",
        "outcome": "汁物を分け、子どもには食べて休むよう言った。大人は使いの帰る道を何度も見た。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "household-care-wait"
      }
    ]
  },
  {
    "id": "soc_gap_35",
    "title": "二枚の推薦",
    "domain": "就職の紹介状",
    "target": "南北の政治に縁のある家",
    "ageRange": {
      "min": 18,
      "max": null
    },
    "regions": [
      "極東"
    ],
    "sceneBinding": "job-search-with-recommendation",
    "conditionSummary": "主人公の前職・家系に南北どちらかの紹介者との実在する関係があり、他方の求人へ応募する段階。",
    "excludeSummary": "紹介者・応募先不在、政治的所属を本人の種族だけから創作する場合。",
    "knowledgeBasis": "known-regional-ties",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.22,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/35",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "二枚の推薦状を机に広げた。片方には旧い上役の印、もう片方には新しい雇い主の名があった。世話をしてくれた人の言葉を思い出し、あなたは封を閉じる手を止めた。",
    "choices": [
      {
        "label": "応募先へどちらの書類が必要か尋ねる",
        "outcome": "受付に聞くと、担当者は必要な証明の一覧を渡した。あなたは上役の印が付いた紙をいったんしまった。",
        "numericEffects": {
          "k": 1
        },
        "actionDescriptors": [],
        "recordAction": "recommendation-requirement-queried"
      },
      {
        "label": "紹介者へ状況を説明する",
        "outcome": "紹介者はしばらく考え、今の仕事を選ぶなら連絡先を記しておけと言った。あなたは名前を書き留めた。",
        "numericEffects": {
          "rl": 1
        },
        "actionDescriptors": [],
        "recordAction": "patron-informed"
      }
    ]
  },
  {
    "id": "soc_gap_36",
    "title": "守ってやったという言葉",
    "domain": "支援者との面談",
    "target": "氏族・雇い主の庇護下にある住民",
    "ageRange": {
      "min": 16,
      "max": null
    },
    "regions": [
      "イェラグ",
      "シラクーザ",
      "カジミエーシュ",
      "サルゴン",
      "ヴィクトリア"
    ],
    "sceneBinding": "actual-patron-meeting",
    "conditionSummary": "主人公が実際に金銭・住まい・安全な仕事等の支援を受け、支援者の人物IDと当時の条件が保存されている。",
    "excludeSummary": "支援が行われていない、恩義の相手が不明、すでに双方が義務を終えている。",
    "knowledgeBasis": "recorded-prior-aid",
    "frequencyClass": "L2_社会的しがらみ",
    "group": "formation-or-relational",
    "weight": 0.32,
    "cooldownYears": 8,
    "once": true,
    "episodeKey": "gap/36",
    "requiresPlayerDiagnosis": false,
    "requiresProtagonistSarkaz": false,
    "requiresProtagonistOni": false,
    "held": true,
    "holdReason": "必要な当事者・制度・契約・調査・所有・訪問履歴を現行の正本から確認する専用記録がないため、根拠がそろうまで発火を保留する。",
    "text": "支援者は昔の費用を一つずつ挙げた。「あのとき守ってやっただろう」。差し出された手紙には、今度は相手の仕事を手伝ってほしいとあった。",
    "choices": [
      {
        "label": "今回の頼みの条件を尋ねる",
        "outcome": "あなたは働く日と報酬を確認し、紙の余白へ書いた。支援者は椅子を引き、返事を待った。",
        "numericEffects": {
          "k": 2
        },
        "actionDescriptors": [],
        "recordAction": "patron-request-terms"
      },
      {
        "label": "断る理由を伝える",
        "outcome": "あなたは自分の仕事と家の用事を説明した。支援者は押し黙り、手紙を自分の前へ戻した。",
        "numericEffects": {
          "p": -1
        },
        "actionDescriptors": [],
        "recordAction": "patron-request-declined"
      }
    ]
  }
];
  $terraData.EV.push(...rows.map(compileSocialEvent));
});
