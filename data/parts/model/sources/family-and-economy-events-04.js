// model/sources/family-and-economy-events-04: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy-events-04"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "family.careNetworkMoveReviewMaxYears",
      label: "養育ネットワークの転居再検討最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description: "移動経路上の地域への転居を再検討する上限。転居を保証しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育ネットワークの限定的な転居"]
    },
    {
      id: "family.careNetworkMoveChance",
      label: "転居再検討時に養育ネットワークが移る確率",
      value: 0.18,
      unit: "確率",
      status: "S",
      scope: "家族・移動",
      description:
        "仕事・住居・構成員の事情で、追跡対象の養育ネットワークが別地域へ移るゲーム用仮定。地域別移住率や組織の公式行動を表さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育ネットワークの限定的な転居"]
    },
    {
      id: "family.careNetworkMoveNoticeChance",
      label: "養育ネットワーク転居の知らせ成立確率",
      value: 0.62,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "関係が続く/間を置く状態で転居が起きた際、知らせが経路に乗る抽象確率。通信網や地域の伝達率を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育ネットワーク転居情報"]
    },
    {
      id: "family.careNetworkMoveLetterReach",
      label: "便り・移動親族経路の到達係数",
      value: 0.75,
      unit: "倍率",
      status: "S",
      scope: "家族・情報",
      description: "移動候補が接続する場合の知らせ経路係数。郵便網・通信成功率の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育ネットワーク転居情報"]
    },
    {
      id: "family.careNetworkMoveRelayReach",
      label: "親族・共同体伝言の到達係数",
      value: 0.5,
      unit: "倍率",
      status: "S",
      scope: "家族・情報",
      description: "直接移動候補が接続しない場合の伝言経路係数。口承頻度・信頼性の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育ネットワーク転居情報"]
    },
    {
      id: "family.careNetworkMemberMoveReviewMinYears",
      label: "養育者個人の転居再検討最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "家計分離後、構成員ごとに独立して移転可能性を見直す最短間隔。地域別移住率を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育者個人の限定的な転居"]
    },
    {
      id: "family.careNetworkMemberMoveReviewMaxYears",
      label: "養育者個人の転居再検討最長間隔",
      value: 7,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description: "構成員ごとの転居再検討間隔の上限。全員の同時転居を意味しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育者個人の限定的な転居"]
    },
    {
      id: "family.careNetworkMemberMoveChance",
      label: "養育者個人の転居再検討時確率",
      value: 0.12,
      unit: "確率",
      status: "S",
      scope: "家族・移動",
      description:
        "構成員ごとの仕事・住居・家族事情による地域移動の抽象確率。地域別移住率や正史上の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ENVIRONMENT", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育者個人の限定的な転居"]
    },
    {
      id: "family.careNetworkMemberMoveNoticeChance",
      label: "養育者個人の転居知らせ成立確率",
      value: 0.62,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "別居した構成員の転居が便りや伝言で本人へ届く抽象確率。通信到達率の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育者個人の転居情報"]
    },
    {
      id: "family.careNetworkMemberDeathNoticeChance",
      label: "養育者個人の訃報到達抽象確率",
      value: 0.7,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "養育者の死亡が対面・便り・親族や共同体の伝言を通じて本人へ届くゲーム用仮定。地域別死亡率・訃報到達率を表す統計ではない。死亡そのものは既存のゲーム用死亡係数を再利用し、種族別人口統計を主張しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育者個人の訃報"]
    },
    {
      id: "family.careNetworkMemberMissingChance",
      label: "戦乱下の養育者消息不明抽象確率",
      value: 0.045,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "コードに年・地域が明記された戦乱圧力下で、別居した養育者との連絡・所在が途絶えるゲーム用仮定。死亡確率や実際の戦争行方不明率を示さず、消息不明は生死未確認として保持する。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["養育者個人の消息不明"]
    },
    {
      id: "family.careNetworkMemberFoundChance",
      label: "消息不明後に安否が分かる抽象確率",
      value: 0.24,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "消息不明状態の養育者について、親族・共同体・便りを通じて所在や生存が判明するゲーム用仮定。失踪・避難・通信断の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["養育者個人の安否確認"]
    },
    {
      id: "family.socialContactMissingChance",
      label: "戦乱下の友人・隣人の消息不明抽象確率",
      value: 0.025,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "確立した友人・近隣関係に限り、年表上の戦乱地域で所在・連絡が不明になるゲーム用仮定。死亡率や紛争統計を表さず、養育者モデルより低い対象範囲で発生する。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS", "SRC_REGIONAL_ENVIRONMENT"],
      usedBy: ["友人・隣人の消息不明"]
    },
    {
      id: "family.socialContactFoundChance",
      label: "消息不明の友人・隣人の安否確認抽象確率",
      value: 0.2,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "消息不明の友人・隣人について、便りや共通の知人を介して生存が分かるゲーム用仮定。移動先や連絡先が分かる確率ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["友人・隣人の安否確認"]
    },
    {
      id: "family.socialContactSearchBoost",
      label: "捜索努力による安否確認確率の加算",
      value: 0.06,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "関係者へ手がかりを尋ねる選択が、その後の安否確認抽象確率へ加えるゲーム用補正。実際の捜索効果の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["友人・隣人の安否確認"]
    },
    {
      id: "family.socialContactRecontactChance",
      label: "消息不明後に再連絡の返事を得る抽象確率",
      value: 0.28,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "消息不明だった友人・隣人へ伝言を託した後、共通の知人を通じて返事が得られるゲーム用仮定。返事が届いても所在地や面会可能性は示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["消息不明後の再連絡"]
    },
    {
      id: "family.socialContactRecontactRelayYears",
      label: "共通の知人経由で返事が届く遅延",
      value: 2,
      unit: "年",
      status: "S",
      scope: "家族・情報",
      description:
        "所在地不明の相手からの返事を、共通の知人・地域伝言経由で受け取るまでのゲーム用遅延。テラの通信所要期間を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["消息不明後の再連絡"]
    },
    {
      id: "family.siblingParentSupportReviewMinYears",
      label: "別居きょうだいの親世帯支援見直し最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・家計",
      description:
        "親世帯への継続拠出を本人の生活・資金余力と合わせて再検討する最短間隔。扶養義務や制度上の支援頻度を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["きょうだいの親世帯支援"]
    },
    {
      id: "family.siblingParentSupportReviewMaxYears",
      label: "別居きょうだいの親世帯支援見直し最長間隔",
      value: 7,
      unit: "年",
      status: "S",
      scope: "家族・家計",
      description: "親世帯への継続拠出を再検討するまでの上限。家族の実際の合意周期を示す値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["きょうだいの親世帯支援"]
    },
    {
      id: "family.siblingParentNeedSignalChance",
      label: "近況連絡で親世帯の家計状態が伝わる抽象確率",
      value: 0.62,
      unit: "確率",
      status: "S",
      scope: "家族・情報",
      description:
        "近況確認の機会に、家計状態を含む便りや会話が成立する抽象確率。経路と到達遅延は地域間の移動候補表に基づくゲーム用区分であり、通信普及率や家族義務の統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentNeedFaceToFaceReach",
      label: "対面で近況を伝えられる機会係数",
      value: 1,
      unit: "倍率",
      status: "S",
      scope: "家族・情報",
      description: "同地域の対面連絡が成立する機会係数。通信・面会統計ではない調整用のゲーム仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentNeedLetterReach",
      label: "便り・移動親族経由の近況到達係数",
      value: 0.75,
      unit: "倍率",
      status: "S",
      scope: "家族・情報",
      description:
        "地域間移動候補が接続する場合の便り/移動親族による伝達機会係数。テラの郵便網や到達率を示す実統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentNeedRelayReach",
      label: "親族・共同体経由の近況到達係数",
      value: 0.5,
      unit: "倍率",
      status: "S",
      scope: "家族・情報",
      description:
        "直接移動候補がない場合の親族/共同体の伝言による伝達機会係数。地域の口承頻度や信頼度の統計ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentNeedReviewMinYears",
      label: "きょうだいの親世帯近況の確認最短間隔",
      value: 1,
      unit: "年",
      status: "S",
      scope: "家族・情報",
      description:
        "別居きょうだいが親世帯の近況を確かめる機会を見直す最短間隔。通信・面会の実統計ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentNeedReviewMaxYears",
      label: "きょうだいの親世帯近況の確認最長間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・情報",
      description:
        "親世帯の近況確認機会を再設定する上限。地域の移動候補を連絡経路の抽象化に使うが、実際の郵便網・所要日数を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE", "SRC_TERRA_INFO_NETWORKS"],
      usedBy: ["きょうだいが知る親世帯の家計状況"]
    },
    {
      id: "family.siblingParentSupportChance",
      label: "家計難時にきょうだいが支援を始める抽象確率",
      value: 0.32,
      unit: "確率",
      status: "S",
      scope: "家族・家計",
      description:
        "親世帯に家計難があり、本人に余力がある場合の支援開始確率。親孝行傾向・扶養意識の統計や種族特性ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["きょうだいの親世帯支援"]
    },
    {
      id: "family.siblingParentSupportIncomeShare",
      label: "支援時にきょうだいが拠出する収入割合",
      value: 0.07,
      unit: "年収比",
      status: "S",
      scope: "家族・家計",
      description:
        "支援に合意した別居きょうだいの年収から拠出額を見積もる割合。現金残高と親世帯費用で上限を設けるゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["きょうだいの親世帯支援"]
    },
    {
      id: "family.siblingParentSupportExpenseCapShare",
      label: "親世帯費用に対するきょうだい拠出上限割合",
      value: 0.12,
      unit: "実家年支出比",
      status: "S",
      scope: "家族・家計",
      description:
        "一人のきょうだいの年次拠出が直近の親世帯支出を超えないための抽象上限。扶養費や療養費の標準額ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["きょうだいの親世帯支援"]
    },
    {
      id: "economy.childInfectionCareAnnualCost",
      label: "家族が扶養する感染者の鉱石病ケア費",
      value: 200000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "鉱石病の通院・薬・移動等に対する抽象的な追加費用。子どもや、同居家族が継続支援を選んだ感染きょうだいなど、家計が費用を負担する場合に適用する。治療の成功や病の治癒を意味せず、公式価格ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      usedBy: ["家族が療養費を負担する家計"]
    },
    {
      id: "economy.childInfectionTreatmentAnnualCost",
      label: "扶養する感染した子の継続治療費",
      value: 400000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "専門診療と薬を続ける場合の抽象的な追加費用。未成年に加え、成人後も家族が生活を支える選択をした感染児に適用する。公式価格や治療効果の確率ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      usedBy: ["子どものいる成人家計"]
    },
    {
      id: "economy.childInfectionInitialSupportCost",
      label: "感染した子の初回受診・家族支援費",
      value: 300000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "診断直後の診察、移動、薬などをまとめた抽象的な初回費用。地域物価で換算し、治療継続費とは分ける。公的価格ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      usedBy: ["感染した子の初回家族対応"]
    },
    {
      id: "economy.childInfectionSpecialistStartCost",
      label: "感染した子の専門診療開始費",
      value: 800000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "初回の専門診療・検査・薬をまとめた抽象費用。地域医療係数と物価で換算し、継続療養費は別計上する。公定価格や治療効果ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      usedBy: ["感染した子の初回専門診療"]
    },
    {
      id: "economy.childInfectionTreatmentRestartCost",
      label: "感染した子の療養再開費",
      value: 400000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "休止後に専門診療を再開する際の診察・薬・移動の抽象費用。地域医療係数と物価で換算する公定価格ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      usedBy: ["感染した子の療養再開"]
    },
    {
      id: "economy.siblingInfectionSupportAnnualCost",
      label: "別居きょうだいへの療養生活支援額",
      value: 260000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "別居した感染きょうだいへ家族が任意で送る年次支援の基準額。医療費の公式価格、治療効果、全家庭の義務ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいへの任意支援"]
    },
    {
      id: "economy.parentInfectionTreatmentAnnualCost",
      label: "感染した親の継続療養費基準",
      value: 320000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・鉱石病",
      description:
        "診断を知る家族が継続療養を選んだ親にかかる抽象的な年額。扶養家計では全額、成人後の支援では支援方式別の本人負担割合を計上する。地域医療圧力・通院アクセス・物価を反映するが、公定価格や治療効果を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL", "SRC_TERRA_FAMILY", "SRC_MOBILE_CITY_MOBILITY"],
      usedBy: ["養育家計の親療養費", "成人後の親療養費支援"]
    },
    {
      id: "economy.petAnnualCost",
      label: "飼育動物の年間費用",
      value: 50000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計",
      description: "餌・世話用品などの抽象的な維持費。動物種別の公式価格は未確認。",
      source: "ゲーム用仮定",
      usedBy: ["家計更新", "本人資産更新"]
    },
    {
      id: "economy.petXishouAnnualCost",
      label: "鼷獣の年間飼育費",
      value: 60000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・飼育動物",
      description:
        "夜行性の小動物の餌・寝床・齧り対策をまとめた抽象年額。飼育価格・費用は資料にないゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA"],
      usedBy: ["家計更新", "本人資産更新"]
    },
    {
      id: "economy.petCloudbeastAnnualCost",
      label: "雲獣の年間飼育費",
      value: 90000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・飼育動物",
      description: "餌・手入れ用品をまとめた抽象年額。雲獣の飼育価格・費用は資料にないゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA"],
      usedBy: ["家計更新", "本人資産更新"]
    },
    {
      id: "economy.petOripathySlugAnnualCost",
      label: "オリジムシの年間飼育費",
      value: 70000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・飼育動物",
      description:
        "飼育用品・清掃・給餌をまとめた抽象年額。公式価格ではなくゲーム上の仮定。野生個体の感染リスクをなくすと保証する値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA"],
      usedBy: ["家計更新", "本人資産更新"]
    },
    {
      id: "economy.petSandbeastAnnualCost",
      label: "砂獣の飼育・訓練費",
      value: 100000,
      unit: "龍門幣/年",
      status: "S",
      scope: "家計・飼育動物",
      description:
        "砂獣を狩猟の相棒として飼う場合の餌・訓練・世話用品をまとめた抽象年額。作中の公式価格ではなくゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_SARGON_ECOLOGY", "SRC_SAND_BEAST"],
      usedBy: ["家計更新", "本人資産更新"]
    },
    {
      id: "economy.petLifeReviewMinYears",
      label: "飼育動物の終末期相談が始まる最短経過年数",
      value: 6,
      unit: "飼育開始からの年",
      status: "S",
      scope: "飼育動物",
      description:
        "飼育動物に関する終末期相談イベントを抽選可能にする最短の経過年数。資料に動物種別の寿命がないため、公式寿命・平均寿命を表さない共通のゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["飼育動物の終末期相談"]
    },
    {
      id: "economy.petLifeReviewMaxYears",
      label: "飼育動物の終末期相談が始まる最長経過年数",
      value: 18,
      unit: "飼育開始からの年",
      status: "S",
      scope: "飼育動物",
      description:
        "飼育開始時に最短値との一様抽選で決める終末期相談の開始目安。動物種別の実寿命を示す値ではなく、寿命情報がない部分を可視化したゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["飼育動物の終末期相談"]
    },
    {
      id: "economy.petLifeReviewExtensionYears",
      label: "終末期治療で延長する相談間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "飼育動物",
      description:
        "終末期相談で治療が奏功した場合、次の相談まで延長する抽象年数。治療効果や動物寿命の資料根拠ではないゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAUNA", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["飼育動物の終末期相談"]
    },
    {
      id: "economy.hobbyAnnualCost",
      label: "趣味の年間費用",
      value: 40000,
      unit: "龍門幣/年/趣味",
      status: "S",
      scope: "家計",
      description: "継続中の趣味一種ごとに必要な会費・材料費等の抽象費用。地域物価係数を適用する。",
      source: "ゲーム用仮定",
      usedBy: ["本人資産更新", "家族UI"]
    },
    {
      id: "economy.rimSupplyKitCost",
      label: "レム・ビリトン整備の消耗品負担",
      value: 12000,
      unit: "龍門幣/一回",
      status: "S",
      scope: "生業・家計",
      description:
        "部品の遅延時に個人が消耗品を補う選択の基準額。職場の補償・標準経費・公式価格ではなく、地域物価で調整するゲーム上の仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_RIM_WORK"],
      usedBy: ["レム・ビリトン整備職イベント"]
    }
  ];
});
