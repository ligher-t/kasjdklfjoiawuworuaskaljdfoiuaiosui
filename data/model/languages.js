// model/languages: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("model/languages", function ($terraData, $define, $rules) {
  "use strict";

  // 言語オントロジー台帳（一国一語・一種族一言語の固定を排斥）
  // 確度管理: J=公式日本語版確認, T=作中人物証言, M=二次資料, I=状況推定, S=シミュレーション仮定, ?=未確認
  const LANGUAGE_REGISTRY = {
    victorian: {
      id: "victorian",
      displayName: "ヴィクトリアの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_V78_TARA_IDENTITY", "SRC_FC8_SHADOW"],
      scripts: ["victorian_script"],
      varieties: ["standard_victorian", "taran_accent_context"],
      notes: "ヴィクトリアの公的文書・都市部定住地で広く用いられる。全テラ共通語とは断定しない。"
    },
    taran_heritage: {
      id: "taran_heritage",
      displayName: "ターラーの家庭言語",
      certainty: "J/T",
      sourceRefs: ["SRC_V78_TARA_IDENTITY", "SRC_FC8_SHADOW"],
      scripts: [],
      varieties: ["taran_vernacular"],
      notes: "ターラー系世帯で口承・日常会話として受け継がれる言葉。文字資料は限定的。"
    },
    ursus_civic: {
      id: "ursus_civic",
      displayName: "ウルサスの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_CLASS_URSUS"],
      scripts: ["ursus_script"],
      varieties: ["imperial_civic", "mine_camp_jargon"],
      notes: "ウルサス帝国領域で用いられる行政・生活言語。鉱山や軍部での現場俗語・スラングが発達。"
    },
    yan_civic: {
      id: "yan_civic",
      displayName: "炎国の言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_YAN_LUNGMEN"],
      scripts: ["yan_script"],
      varieties: ["court_administrative", "regional_dialects"],
      notes: "炎国の官公庁・都市文書で用いられる。地方ごとに方言差が存在。"
    },
    lungmen_local: {
      id: "lungmen_local",
      displayName: "龍門の街頭・商業語",
      certainty: "J/T",
      sourceRefs: ["SRC_YAN_LUNGMEN"],
      scripts: ["yan_script"],
      varieties: ["market_vernacular", "police_bureau_standard"],
      notes: "龍門の市場・港湾・近衛局で交わされる地域語彙。炎国標準とは語彙や調子に差がある。"
    },
    leithanien_civic: {
      id: "leithanien_civic",
      displayName: "リターニアの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_LEITHANIEN_NOBLE"],
      scripts: ["leithanien_script"],
      varieties: ["academic_musical", "provincial_civic"],
      notes: "リターニア各選帝侯区・大学・芸術アカデミーで使用。音楽・術式研究の専門語彙群を持つ。"
    },
    laterano_civic: {
      id: "laterano_civic",
      displayName: "ラテラーノの公用語",
      certainty: "J/T",
      sourceRefs: ["SRC_LATERANO_LAW"],
      scripts: ["laterano_script"],
      varieties: ["ecclesiastical_legal", "civic_colloquial"],
      notes: "公証所・教皇庁・法手続きで使用。典礼語彙と日常語彙が併存。"
    },
    siracusa_civic: {
      id: "siracusa_civic",
      displayName: "シラクーザの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_SIRACUSA_FAMILY"],
      scripts: ["siracusa_script"],
      varieties: ["urban_standard", "family_cant"],
      notes: "シラクーザ都市自治・商取引で使用。ファミリー間の沈黙・婉曲な警告・符牒文化を持つ。"
    },
    columbia_local: {
      id: "columbia_local",
      displayName: "クルビアの実務・開拓語",
      certainty: "J/I",
      sourceRefs: ["SRC_COLUMBIA_FRONTIER"],
      scripts: ["victorian_script"],
      varieties: ["corporate_contract", "frontier_slang"],
      notes: "開拓地・企業・研究所で多用される契約・技術実務言語。ヴィクトリア語と書記を共有。"
    },
    iberia_civic: {
      id: "iberia_civic",
      displayName: "イベリアの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_IBERIA_RECOVERY"],
      scripts: ["iberia_script"],
      varieties: ["coastal_standard", "inquisition_legal"],
      notes: "イベリア王国・沿岸部で使用。大静謐以後の監視・宗教裁判記録の文体を含む。"
    },
    gaul_historical: {
      id: "gaul_historical",
      displayName: "旧ガリア語（歴史的言語）",
      certainty: "J/T",
      sourceRefs: ["SRC_GAUL_HISTORICAL"],
      scripts: ["gaul_script"],
      varieties: ["classical_diplomatic", "exile_literary"],
      notes: "四国戦争前の外交・貴族共通語。国家消滅後も古文書・亡命貴族世帯に継承される。"
    },
    sarkaz_languages: {
      id: "sarkaz_languages",
      displayName: "サルカズの諸言語",
      certainty: "J/T/M",
      sourceRefs: ["SRC_KAZDEL_LIFE"],
      scripts: ["ancient_sarkaz_cuneiform", "kazdel_contemporary"],
      varieties: ["contemporary_kazdel", "ancient_inscriptions"],
      notes: "各王庭・氏族の伝承、戦後移動学校の教育言語、古代の石板楔形文字などを含む総称。"
    },
    sami_languages: {
      id: "sami_languages",
      displayName: "サーミの諸部族語",
      certainty: "J/T",
      sourceRefs: ["SRC_SAMI_EXPEDITION"],
      scripts: [],
      varieties: ["snowfield_oral", "tribal_chants"],
      notes: "極北集落で口承される道案内・天候・自然知識の言語群。書記体系は主に外部接触に依存。"
    },
    sargon_languages: {
      id: "sargon_languages",
      displayName: "サルゴンの諸地域語",
      certainty: "J/T",
      sourceRefs: ["SRC_SARGON_CONTRACT"],
      scripts: ["sargon_script"],
      varieties: ["oasis_trade", "jungle_vernacular", "pasha_court"],
      notes: "砂漠オアシス、部族、雨林、パシャ領主宮廷で異なる重層的な言語群。"
    },
    kjerag_local: {
      id: "kjerag_local",
      displayName: "イェラグの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_KJERAG_LIFE"],
      scripts: ["kjerag_script"],
      varieties: ["temple_ritual", "karlan_commercial"],
      notes: "雪山三族・カランド宗教儀礼と近代商業・観光語彙が混在。"
    },
    kazimierz_civic: {
      id: "kazimierz_civic",
      displayName: "カジミエーシュの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_KAZIMIERZ_KNIGHT"],
      scripts: ["kazimierz_script"],
      varieties: ["broadcast_entertainment", "rural_vernacular"],
      notes: "騎士競技・報道・金融商業と伝統農村の言葉。"
    },
    higashi_local: {
      id: "higashi_local",
      displayName: "極東の言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_HIGASHI_LIFE"],
      scripts: ["higashi_script"],
      varieties: ["northern_court", "southern_trade"],
      notes: "南北対立の地域差と神道・武家儀礼の語彙。"
    },
    rim_local: {
      id: "rim_local",
      displayName: "レム・ビリトンの鉱山・共同体語",
      certainty: "J/T",
      sourceRefs: ["SRC_RIM_LIFE"],
      scripts: ["rim_script"],
      varieties: ["mining_safety", "burrow_vernacular"],
      notes: "鉱山安全標識・親族協同組合の現場実務語。"
    },
    bolivar_local: {
      id: "bolivar_local",
      displayName: "ボリバルの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_BOLIVAR_LIFE"],
      scripts: ["bolivar_script"],
      varieties: ["dossoles_commercial", "resistance_vernacular"],
      notes: "三勢力の角逐、ドッソレス観光・移民と伝統集落の言葉。"
    },
    siesta_local: {
      id: "siesta_local",
      displayName: "シエスタの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_SIESTA_LIFE"],
      scripts: ["victorian_script"],
      varieties: ["hospitality_service", "music_culture"],
      notes: "観光・接客・音楽文化の多言語混交語彙。"
    },
    minos_local: {
      id: "minos_local",
      displayName: "ミノスの言葉",
      certainty: "J/T",
      sourceRefs: ["SRC_MINOS_LIFE"],
      scripts: ["minos_script"],
      varieties: ["heroic_literary", "provincial_civic"],
      notes: "伝統叙事詩・鍛冶・祭礼と生活語彙。"
    }
  };

  // 19地域の言語接触・行政・教育プロファイル
  const REGION_LANGUAGE_PROFILES = {
    "ヴィクトリア": {
      primaryCivicLanguage: "victorian",
      homeDistribution: [
        { id: "victorian", weight: 78 },
        { id: "taran_heritage", weight: 16 },
        { id: "gaul_historical", weight: 6 }
      ],
      schoolInstruction: "victorian",
      medicalSupport: "adequate",
      signageLanguages: ["victorian"],
      certainty: "S"
    },
    "龍門": {
      primaryCivicLanguage: "lungmen_local",
      homeDistribution: [
        { id: "lungmen_local", weight: 65 },
        { id: "yan_civic", weight: 25 },
        { id: "victorian", weight: 10 }
      ],
      schoolInstruction: "lungmen_local",
      medicalSupport: "multilingual",
      signageLanguages: ["lungmen_local", "yan_civic", "victorian"],
      certainty: "S"
    },
    "炎国": {
      primaryCivicLanguage: "yan_civic",
      homeDistribution: [
        { id: "yan_civic", weight: 90 },
        { id: "lungmen_local", weight: 10 }
      ],
      schoolInstruction: "yan_civic",
      medicalSupport: "adequate",
      signageLanguages: ["yan_civic"],
      certainty: "S"
    },
    "ウルサス": {
      primaryCivicLanguage: "ursus_civic",
      homeDistribution: [
        { id: "ursus_civic", weight: 92 },
        { id: "victorian", weight: 5 },
        { id: "sarkaz_languages", weight: 3 }
      ],
      schoolInstruction: "ursus_civic",
      medicalSupport: "limited",
      signageLanguages: ["ursus_civic"],
      certainty: "S"
    },
    "ラテラーノ": {
      primaryCivicLanguage: "laterano_civic",
      homeDistribution: [
        { id: "laterano_civic", weight: 88 },
        { id: "iberia_civic", weight: 8 },
        { id: "victorian", weight: 4 }
      ],
      schoolInstruction: "laterano_civic",
      medicalSupport: "adequate",
      signageLanguages: ["laterano_civic"],
      certainty: "S"
    },
    "カジミエーシュ": {
      primaryCivicLanguage: "kazimierz_civic",
      homeDistribution: [
        { id: "kazimierz_civic", weight: 85 },
        { id: "victorian", weight: 10 },
        { id: "leithanien_civic", weight: 5 }
      ],
      schoolInstruction: "kazimierz_civic",
      medicalSupport: "adequate",
      signageLanguages: ["kazimierz_civic", "victorian"],
      certainty: "S"
    },
    "クルビア": {
      primaryCivicLanguage: "columbia_local",
      homeDistribution: [
        { id: "columbia_local", weight: 70 },
        { id: "victorian", weight: 15 },
        { id: "ursus_civic", weight: 5 },
        { id: "sarkaz_languages", weight: 5 },
        { id: "bolivar_local", weight: 5 }
      ],
      schoolInstruction: "columbia_local",
      medicalSupport: "multilingual",
      signageLanguages: ["columbia_local", "victorian"],
      certainty: "S"
    },
    "極東": {
      primaryCivicLanguage: "higashi_local",
      homeDistribution: [
        { id: "higashi_local", weight: 95 },
        { id: "yan_civic", weight: 5 }
      ],
      schoolInstruction: "higashi_local",
      medicalSupport: "adequate",
      signageLanguages: ["higashi_local"],
      certainty: "S"
    },
    "イベリア": {
      primaryCivicLanguage: "iberia_civic",
      homeDistribution: [
        { id: "iberia_civic", weight: 90 },
        { id: "laterano_civic", weight: 10 }
      ],
      schoolInstruction: "iberia_civic",
      medicalSupport: "limited",
      signageLanguages: ["iberia_civic"],
      certainty: "S"
    },
    "シラクーザ": {
      primaryCivicLanguage: "siracusa_civic",
      homeDistribution: [
        { id: "siracusa_civic", weight: 92 },
        { id: "columbia_local", weight: 5 },
        { id: "laterano_civic", weight: 3 }
      ],
      schoolInstruction: "siracusa_civic",
      medicalSupport: "limited",
      signageLanguages: ["siracusa_civic"],
      certainty: "S"
    },
    "サルゴン": {
      primaryCivicLanguage: "sargon_languages",
      homeDistribution: [
        { id: "sargon_languages", weight: 92 },
        { id: "minos_local", weight: 5 },
        { id: "columbia_local", weight: 3 }
      ],
      schoolInstruction: "sargon_languages",
      medicalSupport: "limited",
      signageLanguages: ["sargon_languages"],
      certainty: "S"
    },
    "カズデル": {
      primaryCivicLanguage: "sarkaz_languages",
      homeDistribution: [
        { id: "sarkaz_languages", weight: 75 },
        { id: "victorian", weight: 20 },
        { id: "ursus_civic", weight: 5 }
      ],
      schoolInstruction: "sarkaz_languages",
      medicalSupport: "limited",
      signageLanguages: ["sarkaz_languages", "victorian"],
      certainty: "S"
    },
    "サーミ": {
      primaryCivicLanguage: "sami_languages",
      homeDistribution: [
        { id: "sami_languages", weight: 95 },
        { id: "ursus_civic", weight: 5 }
      ],
      schoolInstruction: "sami_languages",
      medicalSupport: "limited",
      signageLanguages: ["sami_languages"],
      certainty: "S"
    },
    "リターニア": {
      primaryCivicLanguage: "leithanien_civic",
      homeDistribution: [
        { id: "leithanien_civic", weight: 88 },
        { id: "gaul_historical", weight: 7 },
        { id: "victorian", weight: 5 }
      ],
      schoolInstruction: "leithanien_civic",
      medicalSupport: "adequate",
      signageLanguages: ["leithanien_civic"],
      certainty: "S"
    },
    "イェラグ": {
      primaryCivicLanguage: "kjerag_local",
      homeDistribution: [
        { id: "kjerag_local", weight: 92 },
        { id: "victorian", weight: 8 }
      ],
      schoolInstruction: "kjerag_local",
      medicalSupport: "limited",
      signageLanguages: ["kjerag_local"],
      certainty: "S"
    },
    "レム・ビリトン": {
      primaryCivicLanguage: "rim_local",
      homeDistribution: [
        { id: "rim_local", weight: 88 },
        { id: "victorian", weight: 8 },
        { id: "columbia_local", weight: 4 }
      ],
      schoolInstruction: "rim_local",
      medicalSupport: "adequate",
      signageLanguages: ["rim_local"],
      certainty: "S"
    },
    "ボリバル": {
      primaryCivicLanguage: "bolivar_local",
      homeDistribution: [
        { id: "bolivar_local", weight: 75 },
        { id: "columbia_local", weight: 15 },
        { id: "leithanien_civic", weight: 10 }
      ],
      schoolInstruction: "bolivar_local",
      medicalSupport: "limited",
      signageLanguages: ["bolivar_local", "columbia_local"],
      certainty: "S"
    },
    "シエスタ": {
      primaryCivicLanguage: "siesta_local",
      homeDistribution: [
        { id: "siesta_local", weight: 60 },
        { id: "columbia_local", weight: 25 },
        { id: "victorian", weight: 15 }
      ],
      schoolInstruction: "siesta_local",
      medicalSupport: "multilingual",
      signageLanguages: ["siesta_local", "columbia_local", "victorian"],
      certainty: "S"
    },
    "ミノス": {
      primaryCivicLanguage: "minos_local",
      homeDistribution: [
        { id: "minos_local", weight: 90 },
        { id: "sargon_languages", weight: 10 }
      ],
      schoolInstruction: "minos_local",
      medicalSupport: "adequate",
      signageLanguages: ["minos_local"],
      certainty: "S"
    }
  };

  // 場面別の意思疎通・手続きコンテキスト
  const LANGUAGE_CONTEXTS = {
    "victoria-office-application": {
      primaryLanguageId: "victorian",
      mode: "read",
      difficulty: 40,
      register: "administrative",
      alternativeSupports: ["interpreter", "helper"],
      certainty: "S",
      sourceRefs: ["SRC_V78_TARA_IDENTITY"]
    },
    "columbia-frontier-contract": {
      primaryLanguageId: "columbia_local",
      mode: "read",
      difficulty: 45,
      register: "contract",
      alternativeSupports: ["trusted-adviser"],
      certainty: "S",
      sourceRefs: ["SRC_COLUMBIA_FRONTIER"]
    },
    "kazdel-historical-tablet": {
      primaryLanguageId: "sarkaz_languages",
      mode: "read",
      difficulty: 65,
      script: "ancient_sarkaz_cuneiform",
      alternativeSupports: ["archaeologist-collaboration"],
      certainty: "S",
      sourceRefs: ["SRC_KAZDEL_LIFE"]
    },
    "ursus-mine-team": {
      primaryLanguageId: "ursus_civic",
      mode: "listen",
      difficulty: 35,
      cantId: "ursus_mine_jargon",
      alternativeSupports: ["senior-worker"],
      certainty: "S",
      sourceRefs: ["SRC_CLASS_URSUS"]
    },
    "siracusa-street-alert": {
      primaryLanguageId: "siracusa_civic",
      mode: "listen",
      difficulty: 40,
      cantId: "siracusa_family_cant",
      alternativeSupports: ["local-informant"],
      certainty: "S",
      sourceRefs: ["SRC_SIRACUSA_FAMILY"]
    }
  };

  $define("LANGUAGE_REGISTRY", Object.freeze(LANGUAGE_REGISTRY), false);
  $define("REGION_LANGUAGE_PROFILES", Object.freeze(REGION_LANGUAGE_PROFILES), false);
  $define("LANGUAGE_CONTEXTS", Object.freeze(LANGUAGE_CONTEXTS), false);
});
