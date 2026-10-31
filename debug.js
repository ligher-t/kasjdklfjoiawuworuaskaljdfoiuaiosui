(() => {
  "use strict";
  const api = window.TERRA_DEBUG_API;
  if (!api || new URLSearchParams(location.search).get("debug") !== "1") return;
  const data = api.catalog();
  const scenarios = [
    {
      id: "iberia-lighthouse-warning",
      name: "イベリア市場で出所不明の海上警戒文を受け取る",
      birth: {
        seed: 1103103,
        by: 1073,
        region: "イベリア",
        fatherRace: "エーギル",
        motherRace: "エーギル",
        race: "エーギル",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      contactKind: "friend",
      state: { age: 30, year: 1103 },
      event: "sr_iberia_lighthouse_warning",
      note: "市場の包み紙に添えられた一枚の警戒文だけを受領します。海の危険や灯台網の稼働、警告の頻度は確定しません。"
    },
    {
      id: "npc-workplace-biography",
      name: "身近な同僚の生活が変わる入口",
      birth: {
        seed: 1099874,
        by: 1074,
        region: "リターニア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: { age: 25, year: 1099, job: 2 },
      event: "people_work_introduction",
      note: "まず互いに名乗る選択から開始します。後の生活事情は年次更新で変化し、本人へ尋ねた範囲しか主人公には伝わりません。直接の有名人物ではない、架空の一般職員です。"
    },
    {
      id: "chernobog-student-aid",
      name: "1096年・チェルノボーグから避難した中学生",
      birth: {
        seed: 109601,
        by: 1080,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "ウルサス",
        race: "ウルサス",
        wealth: "平均的",
        socialPosition: "貴族・地主の家",
        sex: "女",
        jobId: 0
      },
      state: { age: 12, year: 1092 },
      event: "life_ursus_school_habit",
      note: "学びと同級生との関係形成から始め、チェルノボーグ事変はこの人生で起きた後にのみ扱います。『人々、我々』本文の再現ではありません。"
    },
    {
      id: "chernobog-civilian-resident",
      name: "チェルノボーグ事変期の一般住民",
      birth: {
        seed: 109615,
        by: 1068,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "リーベリ",
        race: "ウルサス",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 28,
        year: 1096,
        home: "移動都市",
        localCity: "チェルノボーグ",
        cash: 1600000,
        known: { chernobog_incident: 1 },
        world: { events: { chernobog_incident: 1096 } }
      },
      event: "life_chernobog_resident_response",
      note: "感染者組織や学生経路を前提にしない一般住民の仮想人生。年次圧力期の地域判断を扱い、家族全員の安否や具体的戦闘参加は設定しません。"
    },
    {
      id: "ursus-student-assembly",
      name: "デイティ・グリファーバーグ学生連合の周辺参加者",
      birth: {
        seed: 110101,
        by: 1084,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "ウルサス",
        race: "ウルサス",
        wealth: "平均的",
        socialPosition: "貴族・地主の家",
        sex: "女",
        jobId: 0
      },
      state: { age: 17, year: 1101, home: "移動都市", localCity: "デイティ・グリファーバーグ" },
      event: "life_ursus_student_assembly_contact",
      note: "無名の首都学生の仮想人生です。既知の学生自治団5人に加えず、公式2026年公開作の事件は周辺参加者の視点で扱います。"
    },
    {
      id: "special-rhodes-support-applicant",
      name: "ロドスの物資・生活職を探す一般住民",
      birth: {
        seed: 1103101,
        by: 1076,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 2
      },
      state: { age: 27, year: 1103, k: 18, h: 72, ar: 14 },
      event: "sr_rhodes_recruitment_contact",
      note: "応募照会を開始する入口。採用は次年以降の審査と本人の選択で決まり、デバッグのイベント強制は一般プレイの出現率を表しません。"
    },
    {
      id: "special-rhodes-research-applicant",
      name: "ロドスの診療記録補助へ応募できる人",
      birth: {
        seed: 1103102,
        by: 1077,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: { age: 26, year: 1103, k: 79, h: 87, ar: 40 },
      event: "sr_rhodes_recruitment_contact",
      note: "一般採用から記録補助に至る選択肢を確認する固定初期条件。原作の個人ではありません。"
    },
    {
      id: "special-reunion-civilian",
      name: "再編レユニオンの周辺にいる民間人",
      birth: {
        seed: 1098103,
        by: 1072,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "ウルサス",
        race: "ウルサス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 1
      },
      state: { age: 26, year: 1098 },
      event: "sr_reunion_neighbour_contact",
      note: "連絡先への接触と所属は別の選択。直接の軍事行動や物語の有名人物との接触を保証しません。"
    },
    {
      id: "special-arena-worker",
      name: "カジミエーシュ競技会場の無名職員",
      birth: {
        seed: 1104104,
        by: 1076,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 2
      },
      state: { age: 28, year: 1104 },
      event: "sr_kazimierz_arena_backstage",
      note: "競技会場の裏方へ応募する入口。騎士の身分や競技の勝利を与えるシードではありません。"
    },
    {
      id: "laterano-sarkaz-border-review",
      name: "通行条件を問い合わせたサルカズの後年の仕事選択",
      birth: {
        seed: 1104107,
        by: 1075,
        region: "ヴィクトリア",
        fatherRace: "サルカズ",
        motherRace: "サルカズ",
        race: "サルカズ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 26,
        year: 1101,
        intergroupHistory: [
          {
            year: 1098,
            region: "ヴィクトリア",
            areaKey: null,
            personRace: "サルカズ",
            context: "border",
            response: "資格を照会し代替経路を検討",
            topic: "ラテラーノ方面の通行制限",
            basis: "player-choice"
          }
        ]
      },
      event: "inter_laterano_sarkaz_route_review_v87",
      note: "1098年の求人条件照会から三年後の本人の選択を確認する固定開始です。入域許可・採用・移住は設定せず、照会継続/保留/断念と本人の仕事目標だけを記録します。"
    },
    {
      id: "kazimierz-regional-report-intake",
      name: "カジミエーシュ・11月に地域紙を受け取る",
      birth: {
        seed: 1104108,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 20,
        year: 1097,
        mo: 11,
        home: "移動都市",
        known: { kazimierz_major: 1 },
        world: { events: { kazimierz_major: 1097 } }
      },
      event: "sr_kazimierz_outage_report",
      note: "地域紙の初回受領を再現するデバッグ入口です。個人の知識・伝達相手・街区被害は事前設定せず、読み書きと家計に応じた紙面購入、無料の口頭要約、見送りを確認します。年次配置や一般的な遭遇率を示すものではありません。"
    },
    {
      id: "kazimierz-regional-report-print",
      name: "カジミエーシュ・紙面購入条件を確認する",
      birth: {
        seed: 1104109,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 20,
        year: 1097,
        mo: 10,
        home: "移動都市",
        cash: 5000,
        socialLearning: { literacy: 60 },
        known: { kazimierz_major: 1 },
        world: { events: { kazimierz_major: 1097 } }
      },
      event: "sr_kazimierz_outage_report",
      note: "紙面購入の実画面を確認する固定デバッグ入口です。読み書き60・手元資金5,000を明示した仮想状態で購入後の費用と受領記録を確認します。通常の能力分布や遭遇率を示しません。"
    },
    {
      id: "kazimierz-information-workplace",
      name: "カジミエーシュ報道を会場職員へ伝える",
      birth: {
        seed: 1104106,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 2
      },
      state: {
        age: 21,
        year: 1098,
        job: 32,
        known: { kazimierz_major: 1 },
        world: { events: { kazimierz_major: 1097 } },
        lifeRecord: {
          version: 4,
          goals: [
            {
              id: "kazimierz-arena-work",
              title: "会場の仕事で生活を立てる",
              priority: "生業",
              status: "active",
              startedYear: 1097,
              history: []
            }
          ],
          skills: [],
          affiliations: [
            {
              id: "kazimierz-arena-staff",
              title: "競技会場の運営職",
              kind: "employer",
              status: "active",
              role: "施設運営・整備",
              startedYear: 1097,
              endedYear: null,
              episodes: [
                {
                  startedYear: 1097,
                  endedYear: null,
                  roleAtStart: "施設運営・整備",
                  returning: false,
                  basis: "recorded"
                }
              ],
              history: []
            }
          ],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [],
          bodyChanges: [],
          careerChanges: [],
          milestones: [],
          hobbies: [],
          artifacts: [],
          workRelationships: []
        },
        informationClaims: [
          {
            id: "kazimierz-grid-restoration",
            eventId: "kazimierz_major",
            text: "大騎士領の停電では送電網の一部が切り離され、完全復旧まで時間がかかる",
            recordedYear: 1097,
            claimant: "ローズ新聞の記事（取材記者の個人名不明）",
            channel: "街頭で入手した地域紙",
            scope: "大騎士領で発生した停電と復旧状況。主人公の居住区での停電や原因を示さない",
            status: "unverified",
            evidence: [],
            transmissions: [],
            assessments: [],
            history: [
              {
                year: 1097,
                action: "received-unverified",
                eventId: "sr_kazimierz_outage_report",
                detail: "紙面の報道として受領。居住区の停電、原因、全街区への到達は未確認"
              }
            ],
            receiptContext: { region: "カジミエーシュ", home: "移動都市", month: 11 }
          }
        ]
      },
      event: "sr_kazimierz_outage_followup",
      note: "1097年に受け取った地域紙の主張と、現役の競技会場運営職を再現用に設定した中途開始です。職場への伝達表示を確認するためのデバッグ条件で、通常プレイの遭遇率・雇用率・自然発生頻度を示しません。"
    },
    {
      id: "special-siracusa-independent",
      name: "シラクーザの市場で帳簿を手伝う住民",
      birth: {
        seed: 1104105,
        by: 1073,
        region: "シラクーザ",
        fatherRace: "ループス",
        motherRace: "ループス",
        race: "ループス",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 5
      },
      state: { age: 31, year: 1104 },
      event: "sr_siracusa_independent_business",
      note: "ファミリーの噂に接しても構成員とは限らない一般商売の入口。"
    },
    {
      id: "reunion-1096",
      name: "1096年・感染者支援からレユニオンへ",
      birth: {
        seed: 109602,
        by: 1076,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "ウルサス",
        race: "ウルサス",
        wealth: "貧しい",
        socialPosition: "貧民街・避難世帯",
        sex: "男",
        jobId: 0,
        infected: true
      },
      state: {
        age: 20,
        year: 1096,
        known: { chernobog_incident: 1 },
        world: { events: { chernobog_incident: 1096 } }
      },
      event: "life_reunion_local_entry",
      note: "食料運びへの接触から始めます。参加後の命令・地域支援・離脱は次のイベントで分岐します。"
    },
    {
      id: "reunion-reorg",
      name: "再編後レユニオンの連絡網",
      birth: {
        seed: 109703,
        by: 1067,
        region: "カズデル",
        fatherRace: "サルカズ",
        motherRace: "サルカズ",
        race: "サルカズ",
        wealth: "貧しい",
        socialPosition: "移動・離散したサルカズ世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: {
        age: 30,
        year: 1097,
        known: { chernobog_incident: 1 },
        world: { events: { chernobog_incident: 1096 } }
      },
      event: "kaz_reunion",
      note: "1096年の指揮系統と同一視せず、後年の互助連絡に関する不確かな紹介から始めます。"
    },
    {
      id: "rhodes-patient",
      name: "感染診断後のロドス紹介",
      birth: {
        seed: 109704,
        by: 1072,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: { age: 25, year: 1097 },
      event: "life_rhodes_referral",
      note: "診療・紹介の入口から始め、受入れや就業は自動確定しない選択を確認します。"
    },
    {
      id: "rhodes-research",
      name: "ロドス研究班の記録補助",
      birth: {
        seed: 109705,
        by: 1068,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0,
        infected: true
      },
      state: {
        age: 29,
        year: 1097,
        lifeRecord: {
          version: 1,
          goals: [],
          skills: [
            {
              id: "clinical-records",
              title: "匿名化した診療記録の整理",
              level: 40,
              practiceCount: 3,
              history: []
            }
          ],
          affiliations: [
            {
              id: "rhodes-staff",
              title: "ロドス・アイランド",
              kind: "employer",
              status: "active",
              role: "物資・記録の補助",
              startedYear: 1095,
              endedYear: null,
              history: []
            }
          ],
          groupStandings: [],
          regionalImpacts: [],
          milestones: []
        }
      },
      event: "life_rhodes_research_offer",
      note: "研究班への参加後の役割・停滞・倫理・退出を反復確認するための中途開始です。"
    },
    {
      id: "infected-organizing",
      name: "感染者をめぐる地域組織",
      birth: {
        seed: 109706,
        by: 1070,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: { age: 27, year: 1097, biasInfected: 65 },
      event: "life_infected_association_choice",
      note: "同じ会合から排除運動と互助組織の両方へ分岐できる対照用開始です。"
    },
    {
      id: "infected-exclusion-founder-followup",
      name: "排除団体を設立した感染者の後日談",
      birth: {
        seed: 870023,
        by: 1050,
        region: "龍門",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: {
        age: 36,
        year: 1086,
        inf: 1,
        fl: { dg: 1 },
        lifeRecord: {
          version: 4,
          goals: [
            {
              id: "order-through-exclusion",
              title: "感染者を遠ざけて地域の秩序を守る",
              priority: "秩序",
              status: "active",
              startedYear: 1085,
              history: [{ year: 1085, action: "start", from: "active", to: "active", note: "" }],
              lastChangedYear: 1085
            }
          ],
          skills: [],
          affiliations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              kind: "political-local-group",
              status: "active",
              role: "立上げ人",
              startedYear: 1085,
              endedYear: null,
              episodes: [
                {
                  startedYear: 1085,
                  endedYear: null,
                  roleAtStart: "立上げ人",
                  returning: false,
                  basis: "recorded"
                }
              ],
              history: [
                {
                  year: 1085,
                  action: "join",
                  from: "outside",
                  to: "active",
                  role: "立上げ人",
                  episodeIndex: 0,
                  note: ""
                }
              ],
              lastChangedYear: 1085
            }
          ],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [
            {
              id: "infected-exclusion",
              title: "感染者排除を求める住民会",
              kind: "political-local-group",
              status: "active",
              startedYear: 1085,
              endedYear: null,
              formedRegion: "龍門",
              formedHome: "固定集落",
              formedLocalityKind: "固定都市の街区",
              formedCity: null,
              foundingCost: 5000,
              contributionsTotal: 5000,
              operatingReserve: 0,
              spentTotal: 5000,
              policy: "感染者の立入・雇用制限",
              participation: "設立者",
              history: [
                {
                  year: 1085,
                  action: "found",
                  amount: 5000,
                  funding: null,
                  policy: "感染者の立入・雇用制限",
                  participation: "設立者",
                  status: "active",
                  note: ""
                }
              ]
            }
          ],
          bodyChanges: [],
          careerChanges: [],
          milestones: [],
          hobbies: [],
          artifacts: [],
          workRelationships: []
        },
        socialConflict: {
          version: 1,
          acts: [
            {
              year: 1085,
              age: 35,
              action: "exclude",
              target: "infected",
              context: "founded-exclusion-association",
              eventId: null,
              choice: null,
              regionKey: "龍門",
              localityKey: "龍門|都市名未特定|固定集落|固定都市の街区",
              localityKind: "固定都市の街区",
              locationBasis: "current-location-at-event"
            }
          ],
          experienced: [],
          reports: [],
          infectionShock: {
            year: 1085,
            source: "test-diagnosis",
            priorBias: 0,
            priorActions: 1,
            priorAvoids: 0,
            priorPresence: 0,
            priorEndorsement: 0,
            priorActionHistoryBasis: "complete-since-start",
            diagnosisKnown: false
          },
          familyBreach: null,
          actTotals: { "infected:exclude": 1 },
          actTotalsBasis: "complete-since-start",
          experienceTotals: {},
          experienceTotalsBasis: "complete-since-start",
          reportTotals: {},
          reportTotalsBasis: "complete-since-start"
        },
        socialAftermath: {
          version: 1,
          episodes: [],
          actions: [],
          nextId: 1,
          episodeCount: 0,
          episodeCountBasis: "complete-since-start"
        }
      },
      event: "v87_exclusion_organizer_infected",
      note: "診断後、過去に感染者を排除する団体を立ち上げた本人の固定中途開始です。個人例外・規則改定の提案・規則維持の各応答を確認します。通常の発生率や地域全体への影響を示しません。"
    },
    {
      id: "infected-family-rejection",
      name: "診断後、同居中の親が拒絶する",
      birth: {
        seed: 109724,
        by: 1072,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: {
        age: 24,
        year: 1096,
        inf: 1,
        residenceArrangement: "family_home_shared_budget",
        fl: { dg: 1 },
        infection: { year: 1096, cause: "known-condition", basis: "debug-scenario" },
        socialLearning: { familyNorms: { infected: 35 } }
      },
      event: "v78_parent_rejection_diagnosis",
      note: "感染診断後も親と同居し続ける架空の成人を固定条件から再現します。親ごとの拒絶/拒絶しない選択と後年記録を確認する中途開始で、正史上の人物・発生率・和解を示しません。"
    },
    {
      id: "infected-family-contact-boundary",
      name: "別居中の親へ診療連絡の範囲を尋ねる",
      birth: {
        seed: 109723,
        by: 1072,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: {
        age: 24,
        year: 1096,
        residenceArrangement: "independent_rental",
        biasInfected: 40,
        socialLearning: { familyNorms: { infected: 35 } },
        fl: { household_separated: 1 }
      },
      event: "v87_family_contact_boundary_diagnosis",
      note: "別の賃貸住居で暮らす診断済みの成人と生存中の親を固定条件から再現します。同居中の住居拒絶とは分けた連絡境界の表示・選択を確認するためのデバッグ開始です。"
    },
    {
      id: "londinium-relief",
      name: "ロンディニウムの避難者支援",
      birth: {
        seed: 109807,
        by: 1076,
        region: "ヴィクトリア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0
      },
      state: {
        age: 22,
        year: 1098,
        localCity: "ロンディニウム",
        known: { chernobog_incident: 1, londinium_war: 1 },
        world: { events: { chernobog_incident: 1096, londinium_war: 1098 } },
        lifeRecord: {
          version: 1,
          goals: [],
          skills: [],
          affiliations: [
            {
              id: "reunion-reorg",
              title: "再編後レユニオンに連なる互助連絡網",
              kind: "local-relief-network",
              status: "active",
              role: "臨時連絡先",
              startedYear: 1097,
              endedYear: null,
              history: []
            }
          ],
          groupStandings: [],
          regionalImpacts: [],
          milestones: []
        }
      },
      event: "life_reunion_londinium_local_aid",
      note: "ロンディニウム現地の民間支援とレユニオンの指揮系統を別に扱う分岐を確認します。"
    },
    {
      id: "londinium-civilian-resident",
      name: "戦時下のロンディニウム住民",
      birth: {
        seed: 109816,
        by: 1074,
        region: "ヴィクトリア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 24,
        year: 1098,
        home: "移動都市",
        localCity: "ロンディニウム",
        cash: 300000,
        known: { londinium_war: 1 },
        world: { events: { londinium_war: 1098 } }
      },
      event: "life_londinium_civilian_response",
      note: "レユニオンとの所属・紹介を前提にせず、現地住民として支援参加・一度の手伝い・距離を置く選択を比較します。"
    },
    {
      id: "londinium-claim-conflict-recipient",
      name: "市場で食い違う話を知人へ伝える",
      birth: {
        seed: 109817,
        by: 1074,
        region: "ヴィクトリア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      contactKind: "friend",
      state: {
        age: 30,
        year: 1100,
        known: { londinium_war: 1 },
        world: { events: { londinium_war: 1098 } },
        informationClaims: [
          {
            id: "londinium-market-price-rise",
            eventId: "londinium_war",
            text: "ロンディニウム戦争の影響で、周辺の物資が値上がりするかもしれない",
            recordedYear: 1098,
            claimant: "市場で話していた人物（個人名・所属不明）",
            channel: "市場での対面の話",
            scope: "本人が訪れた市場の会話",
            status: "unverified",
            evidence: [],
            transmissions: [],
            assessments: [],
            history: [
              {
                year: 1098,
                action: "received-unverified",
                eventId: "sr_londinium_distant_news",
                detail: "発言者・裏付け・戦争との因果関係は未確認"
              }
            ]
          },
          {
            id: "londinium-grain-price-stability",
            eventId: "londinium_war",
            text: "この市場で扱う穀物は、当面値上がりしないだろう",
            recordedYear: 1099,
            claimant: "別の売り手（個人名・所属不明）",
            channel: "市場での対面の話",
            scope: "本人が訪れた市場の穀物取引・短期見通し",
            status: "unverified",
            evidence: [],
            transmissions: [],
            assessments: [],
            history: [
              {
                year: 1099,
                action: "received-unverified",
                eventId: "sr_londinium_price_followup",
                detail: "別の売り手の見通し。市場状況や先の主張との関係は未確認"
              }
            ],
            relation: {
              claimId: "londinium-market-price-rise",
              type: "different-outlook-unresolved",
              status: "unresolved"
            }
          }
        ]
      },
      event: "sr_londinium_claim_conflict_followup",
      note: "二つの市場談話を受領済みの中途開始です。友人への伝達経路を操作確認する固定デバッグ条件で、実在の価格・因果・街の反応を示しません。"
    },
    {
      id: "columbia-career-entry",
      name: "クルビアの技術職応募",
      birth: {
        seed: 109808,
        by: 1079,
        region: "クルビア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: { age: 18, year: 1097, k: 35, cash: 500000 },
      event: "car",
      note: "進路イベントから技師職を含む地域の求人へ進む中途開始です。採用資格や採用結果をゲーム上の確定制度として扱いません。"
    },
    {
      id: "victoria-clerk-entry",
      name: "ヴィクトリアの帳簿係応募",
      birth: {
        seed: 109811,
        by: 1079,
        region: "ヴィクトリア",
        fatherRace: "ヴイーヴル",
        motherRace: "ヴイーヴル",
        race: "ヴイーヴル",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: { age: 18, year: 1097, k: 24, cash: 500000 },
      event: "car",
      note: "紹介先を通じた個別の帳簿係応募から始める中途開始です。保険仲介所の求人条件・採用と処遇はゲーム上の仮定で、地域共通制度を意味しません。"
    },
    {
      id: "siracusa-familia-youth",
      name: "シラクーザのファミリアで初仕事",
      birth: {
        seed: 109809,
        by: 1078,
        region: "シラクーザ",
        fatherRace: "ループス",
        motherRace: "ループス",
        race: "ループス",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0
      },
      state: { age: 14, year: 1092, fl: { family: 1 } },
      event: "fam_mafia",
      note: "ファミリアの若年期の一場面から始める中途開始です。家族の都合と本人の選択、後年の責任を確認します。"
    },
    {
      id: "siracusa-familia-entry",
      name: "15歳・シラクーザの地区ファミリーから初めて誘われる",
      birth: {
        seed: 109816,
        by: 1078,
        region: "シラクーザ",
        fatherRace: "ループス",
        motherRace: "ループス",
        race: "ループス",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0
      },
      state: { age: 15, year: 1093 },
      event: "sir_family",
      note: "ファミリーとの関係をすでに持つ状態ではなく、初めて仕事を誘われた時点から始めます。参加・断る選択の後、成人後の関係見直しや借りの履歴へ進めます。"
    },
    {
      id: "kazimierz-knight-trial",
      name: "カジミエーシュの競技選手募集",
      birth: {
        seed: 109810,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: { age: 20, year: 1097, cash: 150000, h: 76 },
      event: "kaz_knight",
      note: "競技への応募・会場の日雇い・見送りを比べる中途開始です。選考と将来の地位は保証されません。"
    },
    {
      id: "kazimierz-injury-adaptation",
      name: "カジミエーシュの競技負傷後",
      birth: {
        seed: 109812,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "クランタ",
        motherRace: "クランタ",
        race: "クランタ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0
      },
      state: {
        age: 22,
        year: 1099,
        cash: 420000,
        h: 46,
        k: 25,
        job: 2,
        lifeRecord: {
          version: 1,
          goals: [],
          skills: [],
          affiliations: [],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [],
          bodyChanges: [
            {
              id: "kaz-knight-shoulder",
              title: "競技中の肩の重傷",
              cause: "カジミエーシュの競技中の転倒",
              function: "腕を高く上げる動作や重い荷運びで痛み・力の抜けを感じる",
              status: "recovering",
              startedYear: 1097,
              reviewYear: 1099,
              accommodation: null,
              history: [
                {
                  year: 1097,
                  age: 20,
                  eventId: "kaz_knight",
                  choice: "登録料を払い、選手として出場する",
                  action: "start",
                  status: "recovering"
                }
              ]
            }
          ],
          milestones: []
        }
      },
      event: "kaz_knight_injury_adaptation",
      note: "競技中の重傷から2年後の確認場面を固定条件で再現します。就労中の人には、肩への負担を減らす作業調整と職業転換の道も表示します。"
    },
    {
      id: "savra-injury-longlife-integrated",
      name: "負傷後の転職から長命期の仕事まで",
      birth: {
        seed: 107705,
        by: 1077,
        region: "カジミエーシュ",
        fatherRace: "サヴラ",
        motherRace: "サヴラ",
        race: "サヴラ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: { age: 20, year: 1097, cash: 1600000, h: 70, k: 30 },
      event: "kaz_knight",
      note: "競技負傷後の作業調整・事務職への応募から始め、後年に移住先の仕事と技能を積み直すfocused経路です。42歳までの中間年は個別のイベントをすべて再現しない固定経路です。サヴラ全体の寿命モデルを示しません。"
    },
    {
      id: "rim-quiet-craft-birth",
      name: "レム・ビリトンの職人が歩んだ一生",
      birth: {
        seed: 107805,
        by: 1078,
        region: "レム・ビリトン",
        fatherRace: "コータス",
        motherRace: "コータス",
        race: "コータス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0
      },
      state: { age: 0, year: 1078, k: 22, fl: { workplace_hazard: 0 } },
      note: "誕生時から開始します。家族・就学・近所での暮らしを経て、17歳以降の進路、仕事、家族、後年へ進む通常プレイ確認用です。生家の貧しさや就学・就職の結果は固定せず、個人の選択とシード付きの出来事に委ねます。"
    },
    {
      id: "rim-quiet-craft",
      name: "レム・ビリトンの整備仕事を始めたばかり",
      birth: {
        seed: 109814,
        by: 1078,
        region: "レム・ビリトン",
        fatherRace: "コータス",
        motherRace: "コータス",
        race: "コータス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 18
      },
      state: { age: 18, year: 1096, k: 22, cash: 180000, fl: { workplace_hazard: 0 } },
      event: "life_skill_practice",
      note: "就労開始直後の技能練習から始める経路です。鉱区・工場関連の危険や部品調達は地域設定をもとにした個別のゲーム内出来事で、レム・ビリトン全域の標準制度を意味しません。"
    },
    {
      id: "rim-quiet-craft-from-entry",
      name: "レム・ビリトンで見習い口を探す十七歳",
      birth: {
        seed: 109815,
        by: 1078,
        region: "レム・ビリトン",
        fatherRace: "コータス",
        motherRace: "コータス",
        race: "コータス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 0
      },
      state: { age: 17, year: 1095, k: 22, cash: 260000, fl: { workplace_hazard: 0 } },
      event: "car",
      note: "特定の英雄譚ではない若者が、地域で実際に提示された進路を見て整備職を選ぶ入口です。以後の熟達・同僚関係・後年の働き方を一つの人生として続けて確認できます。"
    },
    {
      id: "rim-work-skill",
      name: "レム・ビリトンの手仕事と技能",
      birth: {
        seed: 109811,
        by: 1070,
        region: "レム・ビリトン",
        fatherRace: "コータス",
        motherRace: "コータス",
        race: "コータス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 18
      },
      state: { age: 28, year: 1098, k: 22, fl: { workplace_hazard: 0 } },
      event: "life_skill_practice",
      note: "修理や製作の仕事を続ける人物の技能練習場面から始めます。職業・技能と生活時間の兼ね合いを見る中途開始です。"
    },
    {
      id: "rim-skill-handover",
      name: "レム・ビリトンの整備仕事と技の引継ぎ",
      birth: {
        seed: 109813,
        by: 1070,
        region: "レム・ビリトン",
        fatherRace: "コータス",
        motherRace: "コータス",
        race: "コータス",
        wealth: "貧しい",
        socialPosition: "都市労働者世帯",
        sex: "男",
        jobId: 18
      },
      state: {
        age: 42,
        year: 1112,
        k: 35,
        job: 18,
        lifeRecord: {
          version: 1,
          goals: [],
          skills: [{ id: "job-18", title: "修理・整備工の実務", level: 64, practiceCount: 8, history: [] }],
          affiliations: [],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [],
          bodyChanges: []
        }
      },
      event: "life_rim_skill_handover",
      note: "整備の熟達後に、現場で教える・個人の手帳に残す・今は引き受けない分岐を確認します。前半生と経験の蓄積を省いた中途開始です。"
    },
    {
      id: "savra-long-life-craft",
      name: "サヴラの長い職業人生と後年の引継ぎ",
      birth: {
        seed: 1170115,
        by: 1070,
        region: "レム・ビリトン",
        fatherRace: "サヴラ",
        motherRace: "サヴラ",
        race: "サヴラ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 18
      },
      state: {
        age: 100,
        year: 1170,
        job: 18,
        h: 58,
        k: 38,
        cash: 640000,
        sn: {},
        lifeRecord: {
          version: 3,
          goals: [
            {
              id: "craft-knowledge-sharing",
              title: "手仕事の知識を次に働く人へ渡す",
              priority: "仕事と技術の継承",
              status: "active",
              startedYear: 1112,
              history: [
                {
                  year: 1112,
                  age: 42,
                  eventId: "life_rim_skill_handover",
                  choice: "勤務の中で点検の順序を一緒に確かめる",
                  action: "start",
                  from: null,
                  to: "active",
                  note: "作業場で新人と確認"
                }
              ]
            }
          ],
          skills: [
            {
              id: "job-18",
              title: "修理・整備工の実務",
              level: 72,
              practiceCount: 14,
              history: [
                {
                  year: 1098,
                  age: 28,
                  eventId: "life_skill_practice",
                  choice: "道具を揃えて経験者に教わる",
                  before: 40,
                  after: 48,
                  context: "整備仕事を続けた"
                },
                {
                  year: 1112,
                  age: 42,
                  eventId: "life_rim_skill_handover",
                  choice: "勤務の中で点検の順序を一緒に確かめる",
                  before: 64,
                  after: 68,
                  context: "新人と点検の順序を確認"
                }
              ]
            }
          ],
          affiliations: [],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [],
          bodyChanges: [],
          careerChanges: [],
          milestones: [],
          hobbies: [],
          artifacts: []
        }
      },
      event: "life_savra_late_craft",
      note: "18歳以降の整備仕事・技能練習・42歳での引継ぎを履歴に記録した、100歳からの後半生シナリオです。サヴラ全員の寿命を表すものではなく、長命個体の後年を直接再現します。"
    },
    {
      id: "londinium-organization-conflict-pair",
      name: "地域組織の会合で二つの市場情報を出所別に話す",
      birth: {
        seed: 110012,
        by: 1068,
        region: "ヴィクトリア",
        fatherRace: "リーベリ",
        motherRace: "リーベリ",
        race: "リーベリ",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 2
      },
      state: {
        age: 32,
        year: 1100,
        known: { londinium_war: 1 },
        world: { events: { londinium_war: 1098 } },
        lifeRecord: {
          version: 1,
          goals: [],
          skills: [],
          affiliations: [],
          groupStandings: [],
          regionalImpacts: [],
          organizations: [
            {
              id: "infected-mutual-aid",
              title: "感染者と家族の共同購入・診療連絡会",
              kind: "infected-mutual-aid",
              status: "active",
              role: "運営世話役",
              startedYear: 1099,
              endedYear: null,
              formedRegion: "ヴィクトリア",
              formedHome: "移動都市",
              formedLocalityKind: "移動都市の居住区",
              formedCity: null,
              history: []
            }
          ],
          milestones: []
        },
        informationClaims: [
          {
            id: "londinium-market-price-rise",
            eventId: "londinium_war",
            text: "ロンディニウム戦争の影響で、周辺の物資が値上がりするかもしれない",
            recordedYear: 1098,
            claimant: "市場で話していた人物（個人名・所属不明）",
            channel: "市場での対面の話",
            scope: "本人が訪れた市場の会話",
            status: "unverified",
            evidence: [],
            transmissions: [],
            groupTransmissions: [],
            assessments: [],
            history: [
              {
                year: 1098,
                action: "received-unverified",
                eventId: "sr_londinium_distant_news",
                detail: "発言者・裏付け・戦争との因果関係は未確認"
              }
            ]
          },
          {
            id: "londinium-grain-price-stability",
            eventId: "londinium_war",
            text: "この市場で扱う穀物は、当面値上がりしないだろう",
            recordedYear: 1099,
            claimant: "別の売り手（個人名・所属不明）",
            channel: "市場での対面の話",
            scope: "本人が訪れた市場の穀物取引・短期見通し",
            status: "unverified",
            evidence: [],
            transmissions: [],
            groupTransmissions: [],
            assessments: [],
            history: [
              {
                year: 1099,
                action: "received-unverified",
                eventId: "sr_londinium_price_followup",
                detail: "別の売り手の見通し。市場状況や先の主張との関係は未確認"
              }
            ],
            relation: {
              claimId: "londinium-market-price-rise",
              type: "different-outlook-unresolved",
              status: "unresolved"
            }
          }
        ]
      },
      event: "sr_information_claim_organization_meeting",
      note: "地域組織と二つの未確認市場談話を置いた固定デバッグ経路です。一度の会合で出所別に話す選択、個別の会員反応を推定しない記録、保存状態を確認します。正史上の組織や市場価格を表しません。"
    },
    {
      id: "infected-survivor-mutual-aid",
      name: "排斥を経験した人が互助の連絡先を探した後の選択",
      birth: {
        seed: 1105101,
        by: 1050,
        region: "ウルサス",
        fatherRace: "ウルサス",
        motherRace: "ウルサス",
        race: "ウルサス",
        wealth: "平均的",
        socialPosition: "都市労働者世帯",
        sex: "女",
        jobId: 0,
        infected: true
      },
      state: {
        age: 35,
        year: 1085,
        socialConflict: {
          version: 1,
          acts: [],
          experienced: [
            {
              year: 1084,
              action: "social-rejection",
              target: "infected",
              context: "diagnosis-related-neighbor-withdrawal"
            }
          ],
          reports: [{ year: 1084, action: "seek-mutual-aid", target: "infected", context: "mutual-care" }]
        }
      },
      event: "v78_mutual_aid_conflict",
      note: "中途開始の仮想人生です。既往の排斥と互助連絡の試みを設定し、他の参加者が同じ考えか、謝罪が受け入れられたか、実際の支援が継続したかは設定しません。"
    }
  ];
  scenarios.push({
    id: "victoria-sarkaz-employer-exclusion",
    name: "ヴィクトリアの職場でサルカズ応募者を排除する",
    birth: {
      seed: 110177,
      by: 1070,
      region: "ヴィクトリア",
      fatherRace: "サヴラ",
      motherRace: "サヴラ",
      race: "サヴラ",
      wealth: "平均的",
      socialPosition: "都市労働者世帯",
      sex: "男",
      jobId: 2
    },
    state: {
      age: 30,
      year: 1100,
      job: 2,
      biasSarkaz: 82,
      socialLearning: { equityCommitment: 0 },
      lifeRecord: {
        version: 4,
        goals: [],
        skills: [],
        affiliations: [
          {
            id: "victoria-sarkaz-test-employer",
            title: "ヴィクトリアの地域工場",
            kind: "employer",
            status: "active",
            role: "設備点検",
            startedYear: 1098,
            endedYear: null,
            episodes: [
              {
                startedYear: 1098,
                endedYear: null,
                roleAtStart: "設備点検",
                returning: false,
                basis: "recorded"
              }
            ],
            history: []
          }
        ],
        groupStandings: [],
        regionalImpacts: [],
        organizations: [],
        bodyChanges: [],
        careerChanges: [],
        milestones: [],
        hobbies: [],
        artifacts: [],
        workRelationships: []
      }
    },
    event: "v78_hardline_sarkaz_employer",
    note: "固定の中途開始で、強硬な反サルカズ偏見を持つ工場職員が一人の求職者に行う判断を表示します。応募者の身元はこの面接で初めて作られ、過去・信頼・採用結果は設定しません。後年の確認は同じ雇用関係が続いた場合だけ開きます。"
  });
  const workplaceCorrectionBase = scenarios.find(item => item.id === "kazimierz-information-workplace");
  scenarios.push({
    ...workplaceCorrectionBase,
    id: "kazimierz-information-workplace-correction",
    name: "職場へ伝えた入城非難を限定訂正する",
    state: {
      ...workplaceCorrectionBase.state,
      age: 22,
      year: 1099,
      informationClaims: [
        ...workplaceCorrectionBase.state.informationClaims,
        {
          id: "kazimierz-campaign-knight-panic",
          eventId: "kazimierz_major",
          text: "大騎士領の停電が続くなか、征戦騎士の無断入城が市民の生活を損ね、混乱をあおった",
          recordedYear: 1097,
          claimant: "商業連合会の代弁者マッキー（中央ジャーナル中継記事）",
          channel: "ローズ新聞系ニュース番組の記事転記",
          scope: "停電下の征戦騎士入城と商業連合会の非難。監査会の反論や実際の市民全体の反応は不明",
          status: "unverified",
          evidence: [
            {
              year: 1098,
              type: "official-emergency-entry-rule",
              scope: "非常時における征戦騎士の大騎士領入城の可否",
              source: "国民評議会の緊急規則に関する市内掲示（掲示を見つける経路はゲーム上の仮定）",
              result:
                "非常時の入城は認められるとの説明を確認。無断入城との主張を限定する根拠だが、停電の継続時間、市民生活への影響、混乱の程度や原因は判定しない"
            }
          ],
          transmissions: [],
          groupTransmissions: [
            {
              year: 1098,
              age: 21,
              eventId: "sr_kazimierz_outage_statement_followup",
              workplaceId: "kazimierz-arena-staff",
              workplaceTitle: "競技会場の運営職",
              receiverGroup: "同じ持ち場にいた競技会場職員",
              region: "カジミエーシュ",
              home: "移動都市",
              localityKind: "移動都市の居住区",
              city: null,
              channel: "休憩中の口頭会話",
              scope:
                "主人公が勤務中の休憩に述べた一度の発言。同席者の聴取・理解・同意・行動や勤務先の方針への反映は未確認"
            }
          ],
          assessments: [],
          history: [
            {
              year: 1097,
              action: "received-unverified",
              eventId: "sr_kazimierz_outage_statement",
              detail: "商業連合会側の公開主張として受領。監査会の返答と、混乱が市民全体に及んだかは未確認"
            },
            {
              year: 1098,
              action: "present-unverified-to-workplace",
              eventId: "sr_kazimierz_outage_statement_followup",
              detail: "勤務先の休憩中に一度発言。誰が聞いたか、職場の方針に反映されたかは未確認"
            },
            {
              year: 1098,
              action: "verify-emergency-entry-rule",
              eventId: "sr_kazimierz_outage_statement_followup",
              detail: "別系統の公開規則を照合。入城可否についてのみ主張の範囲を限定"
            }
          ],
          relation: {
            claimId: "kazimierz-grid-restoration",
            type: "different-source-and-scope-unresolved",
            status: "unresolved"
          },
          receiptContext: { region: "カジミエーシュ", home: "移動都市", month: 11 }
        }
      ]
    },
    event: "sr_kazimierz_claim_correction",
    note: "職場で以前の主張を述べた後、別の非常時入城規則を確認した時点から始まる固定デバッグ状態です。職場向けの限定訂正が表示・記録されるかを確認します。発言を聞いた人や訂正の受け止めは設定しません。"
  });
  const esc = value =>
    String(value ?? "").replace(
      /[&<>"']/g,
      ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]
    );
  const options = values =>
    values.map(value => `<option value="${esc(value)}">${esc(value)}</option>`).join("");
  const jobs = data.jobs.map(job => `<option value="${job.id}">${esc(job.name)}</option>`).join("");
  const css = document.createElement("style");
  css.textContent = `#terra-debug{position:fixed;right:12px;bottom:12px;z-index:50;width:min(420px,calc(100vw - 24px));max-height:82vh;overflow:auto;background:var(--pn,#171923);color:var(--fg,#f3f4f6);border:2px solid #d38cff;border-radius:12px;padding:12px;box-shadow:0 8px 32px #0008;font:14px/1.4 system-ui}#terra-debug h3{margin:0 0 8px}#terra-debug fieldset{border:1px solid #7778;border-radius:8px;margin:8px 0;padding:8px}#terra-debug label{display:grid;grid-template-columns:125px 1fr;gap:8px;margin:5px 0;align-items:center}#terra-debug input,#terra-debug select,#terra-debug textarea{min-width:0;width:100%;box-sizing:border-box}#terra-debug textarea{height:160px;font:12px monospace}#terra-debug .dbg-actions{display:flex;flex-wrap:wrap;gap:6px}#terra-debug button{padding:5px 8px}#terra-debug small{opacity:.8}`;
  document.head.append(css);
  const panel = document.createElement("aside");
  panel.id = "terra-debug";
  panel.setAttribute("aria-label", "開発デバッグ");
  panel.innerHTML = `<h3>Terra Life — 開発デバッグ</h3><small>このパネルは URL に <code>?debug=1</code> を付けた時だけ読み込まれます。現在の人生を書き換える操作を含みます。一時チェックポイントはメモリー内だけに保持します。</small><fieldset><legend>出生条件</legend><label>乱数シード<input id="td-seed" type="number" value="731" min="0"></label><label>出生年<input id="td-birth-year" type="number" value="1077" min="${data.birthYears.min}" max="${data.birthYears.max}"></label><label>出生地<select id="td-region">${options(data.regions)}</select></label><label>父の種族<select id="td-father">${options(data.races)}</select></label><label>母の種族<select id="td-mother">${options(data.races)}</select></label><label>本人の種族<select id="td-race"></select></label><label>家計階層<select id="td-wealth">${options(data.wealth)}</select></label><label>家の立場<select id="td-class">${options(data.socialPositions)}</select></label><label>性別<select id="td-sex"><option>女</option><option>男</option></select></label><label>初期職業<select id="td-job">${jobs}</select></label><label>感染状態<select id="td-inf"><option value="0">非感染</option><option value="1">感染・診断済み</option></select></label><div class="dbg-actions"><button id="td-create">指定条件で新しい人生を作る</button><button id="td-validate">状態・イベント検査</button></div></fieldset><fieldset><legend>経路シナリオ</legend><label>シナリオ検索<input id="td-scenario-search" type="search"></label><label>開始地点<select id="td-scenario">${options(scenarios.map(item => `${item.id} — ${item.name}`))}</select></label><small id="td-scenario-note"></small><div class="dbg-actions"><button id="td-scenario-start">条件を設定して最初の選択を表示</button></div><small>代表経路の入口を固定条件から再現します。中途開始シナリオは、その前段を省略することを説明欄に記します。</small></fieldset><fieldset><legend>状態の確認・操作</legend><label>年齢<input id="td-age" type="number" min="0" max="120" value="0"></label><label>イベント検索<input id="td-event-search" type="search"></label><label>選択式イベント<select id="td-event"><option value="">選択式イベントを選ぶ</option>${data.jobs.slice(0, 0).join("")}</select></label><div class="dbg-actions"><button id="td-event-status">発生条件を確認</button><button id="td-event-run">条件を満たす場合に表示</button><button id="td-force">条件を無視して強制表示</button><button id="td-age-set">年齢・年を直接変更</button><button id="td-slot">通常の1枠を進める</button><button id="td-year-end">選択待ち・死亡・年末まで進行</button><button id="td-year">イベント枠を省略し年次更新</button><button id="td-save">現在状態をJSON保存</button></div><label>状態パッチ(JSON)<textarea id="td-patch" spellcheck="false">{}</textarea></label><div class="dbg-actions"><button id="td-apply">状態パッチを適用</button><button id="td-refresh">概要を再読込</button><button id="td-details">全状態・全イベントを検査表示</button><button id="td-checkpoint">一時チェックポイント</button><button id="td-restore">一時復帰</button><button id="td-hide">パネルを閉じる</button></div></fieldset><pre id="td-output" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre>`;
  document.body.append(panel);
  const $ = id => panel.querySelector(`#${id}`);
  const eventSelect = $("td-event");
  const apiEvents = api.catalog().events || [];
  const listed = apiEvents.length ? apiEvents : [];
  for (const event of listed.filter(event => event.choice)) {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = `${event.id} — ${event.label || ""}`;
    eventSelect.append(option);
  }
  function updateChildRace() {
    const eligible = [$("td-father").value, $("td-mother").value];
    const child = $("td-race");
    child.innerHTML = [...new Set(eligible)]
      .map(value => `<option value="${esc(value)}">${esc(value)}</option>`)
      .join("");
  }
  $("td-father").onchange = updateChildRace;
  $("td-mother").onchange = updateChildRace;
  updateChildRace();
  function show(value) {
    $("td-output").textContent = JSON.stringify(value?.state ? api.summary() : value, null, 2);
  }
  function refresh() {
    const current = api.summary();
    show(current);
    if (current) $("td-age").value = current.age;
  }
  function act(fn) {
    try {
      show(fn());
    } catch (error) {
      show({ error: error.message });
    }
  }
  $("td-create").onclick = () =>
    act(() => {
      const seed = Number($("td-seed").value);
      api.seed(seed);
      return api.newLife({
        seed,
        by: Number($("td-birth-year").value),
        region: $("td-region").value,
        fatherRace: $("td-father").value,
        motherRace: $("td-mother").value,
        race: $("td-race").value,
        wealth: $("td-wealth").value,
        socialPosition: $("td-class").value,
        sex: $("td-sex").value,
        jobId: Number($("td-job").value),
        infected: $("td-inf").value === "1"
      });
    });
  function selectedScenario() {
    const id = $("td-scenario").value.split(" — ")[0];
    return scenarios.find(item => item.id === id);
  }
  const scenarioNote = () => {
    const scenario = selectedScenario();
    $("td-scenario-note").textContent = scenario?.note || "";
  };
  $("td-scenario").onchange = scenarioNote;
  scenarioNote();
  $("td-scenario-start").onclick = () =>
    act(() => {
      const scenario = selectedScenario();
      if (!scenario) throw new Error("経路シナリオが選択されていません");
      api.seed(scenario.birth.seed);
      api.newLife(scenario.birth);
      if (scenario.contactKind) api.ensureContact(scenario.contactKind);
      const current = api.inspect()?.state;
      if (!current) throw new Error("人生の作成に失敗しました");
      const patch = { ...scenario.state, fl: { ...(current.fl || {}), ...(scenario.state.fl || {}) } };
      if (scenario.state.socialLearning)
        patch.socialLearning = {
          ...(current.socialLearning || {}),
          ...scenario.state.socialLearning,
          familyNorms: {
            ...(current.socialLearning?.familyNorms || {}),
            ...(scenario.state.socialLearning.familyNorms || {})
          }
        };
      api.setState(patch);
      return scenario.event ? api.forceEvent(scenario.event) : api.inspect();
    });
  $("td-event-search").oninput = () => {
    const term=$("td-event-search").value.toLocaleLowerCase("ja");
    for(const option of eventSelect.options) option.hidden=!!option.value && !option.textContent.toLocaleLowerCase("ja").includes(term);
  };
  $("td-scenario-search").oninput = () => {
    const term=$("td-scenario-search").value.toLocaleLowerCase("ja");
    for(const option of $("td-scenario").options) option.hidden=!option.textContent.toLocaleLowerCase("ja").includes(term);
  };
  $("td-event-status").onclick=()=>act(()=>api.eventStatus($("td-event").value));
  $("td-event-run").onclick=()=>act(()=>api.forceEvent($("td-event").value,true));
  $("td-slot").onclick=()=>act(()=>api.advanceSlot());
  $("td-year-end").onclick=()=>act(()=>api.advanceToYearEnd());
  $("td-checkpoint").onclick=()=>act(()=>api.checkpoint());
  $("td-restore").onclick=()=>act(()=>api.restoreCheckpoint());
  $("td-details").onclick=()=>{try{$("td-output").textContent=JSON.stringify(api.inspect(true),null,2);}catch(error){show({error:error.message});}};
  $("td-validate").onclick = () => act(() => api.validate());
  $("td-force").onclick = () => act(() => api.forceEvent($("td-event").value));
  $("td-age-set").onclick = () => act(() => api.setState({ age: Number($("td-age").value) }));
  $("td-year").onclick = () => act(() => api.advanceYear());
  $("td-apply").onclick = () => act(() => api.setState(JSON.parse($("td-patch").value)));
  $("td-refresh").onclick = refresh;
  $("td-save").onclick = () =>
    act(() => {
      const blob = new Blob([JSON.stringify(api.inspect()?.state, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "terra-debug-state.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      return { downloaded: a.download };
    });
  $("td-hide").onclick = () => {
    panel.hidden = true;
    const button = document.createElement("button");
    button.id = "td-reopen";
    button.textContent = "開発デバッグを開く";
    button.style = "position:fixed;right:12px;bottom:12px;z-index:50";
    button.onclick = () => {
      panel.hidden = false;
      button.remove();
    };
    document.body.append(button);
  };
  refresh();
})();
