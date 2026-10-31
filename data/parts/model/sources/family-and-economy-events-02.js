// model/sources/family-and-economy-events-02: construction fragment; evaluation order is declared by data/model/sources.js.
window.TERRA_DATA_BUILD.fragment(
  "model/sources",
  "model/sources/family-and-economy-events-02"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  return [
    {
      id: "family.spouseHealthAgeStart",
      label: "配偶者の年齢負担を計算し始める目安",
      value: 55,
      unit: "歳",
      status: "S",
      scope: "配偶者・健康",
      description:
        "一般健康モデルで年齢差の影響を加え始めるゲーム用境界。テラ人類の公式な老年開始年齢ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["配偶者の年次健康更新"]
    },
    {
      id: "family.spouseHealthAgeDrift",
      label: "配偶者の年齢差による健康目安の変化",
      value: 0.045,
      unit: "健康点/年齢差・年",
      status: "S",
      scope: "配偶者・健康",
      description:
        "基準年齢との差から一般健康目安へ加える小さな年次変化。罹患率・寿命・死亡率ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["配偶者の年次健康更新"]
    },
    {
      id: "family.spouseHealthInfectionDrift",
      label: "感染している配偶者の健康目安への補正",
      value: 0.12,
      unit: "健康点/年",
      status: "S",
      scope: "配偶者・健康",
      description: "感染状態と一般健康目安を弱く接続する仮定。鉱石病進行度・治療効果・生存率を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL"],
      usedBy: ["配偶者の年次健康更新"]
    },
    {
      id: "family.spouseHealthHazardDrift",
      label: "危険な生業の配偶者の健康目安への補正",
      value: 0.08,
      unit: "健康点/年",
      status: "S",
      scope: "配偶者・健康",
      description: "危険属性を持つ生業の負担を弱く反映する仮定。職業別の傷病統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE", "SRC_INDUSTRIAL_LIFE"],
      usedBy: ["配偶者の年次健康更新"]
    },
    {
      id: "family.spouseHealthRandomDrift",
      label: "配偶者の健康目安の年次ばらつき",
      value: 0.6,
      unit: "健康点/年の全幅",
      status: "S",
      scope: "配偶者・健康",
      description: "同じ条件でも個人ごとに異なる小さな年次変動。病気の発生確率を意味しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の年次健康更新"]
    },
    {
      id: "family.spouseHealthWorkThreshold",
      label: "配偶者の就労可能度を調整する健康目安",
      value: 55,
      unit: "健康点",
      status: "S",
      scope: "配偶者・家計",
      description:
        "この値を下回ると、配偶者の推定就労収入を段階的に弱める境界。診断や実際の就労不能判定ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の推定収入"]
    },
    {
      id: "family.spouseHealthWorkFloor",
      label: "健康低下時に残す配偶者の就労可能度",
      value: 0.55,
      unit: "倍率",
      status: "S",
      scope: "配偶者・家計",
      description: "健康目安の低下だけで収入をゼロにしないための下限。障害・雇用保障・統計値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の推定収入"]
    },
    {
      id: "family.spouseHealthRestRelief",
      label: "家事と仕事の負担を分けた場合の健康目安補正",
      value: 0.35,
      unit: "健康点/年",
      status: "S",
      scope: "配偶者・健康",
      description: "家事や仕事の負担を家族で見直す選択後の小さな健康目安補正。回復・治療効果を保証しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の健康相談後の状態"]
    },
    {
      id: "family.spouseHealthConsultBaseCost",
      label: "配偶者の体調相談の基準費",
      value: 35000,
      unit: "龍門幣/回",
      status: "S",
      scope: "配偶者・家計",
      description:
        "近隣の医療担当者へ一般的な体調相談をする一回分の抽象費用。診察料・治療費の公定額ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_RHODES_MEDICAL", "SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の体調相談イベント"]
    },
    {
      id: "family.spouseHealthReviewMinYears",
      label: "配偶者の次回体調相談までの最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "配偶者・健康",
      description: "体調相談後に再び話題を確認できる最短間隔。実際の診療頻度を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の健康相談"]
    },
    {
      id: "family.spouseHealthReviewMaxYears",
      label: "配偶者の次回体調相談までの最長間隔",
      value: 6,
      unit: "年",
      status: "S",
      scope: "配偶者・健康",
      description: "体調相談後の見直し間隔の上限。相談や受診を必ず行うとは限らない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の健康相談"]
    },
    {
      id: "family.spouseHealthNoticeThreshold",
      label: "配偶者との体調相談を始める健康目安",
      value: 58,
      unit: "健康点",
      status: "S",
      scope: "配偶者・健康",
      description: "この値以下で体調の話し合い候補を出すゲーム上の境界。病気の診断や危険判定ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["配偶者の体調相談イベント"]
    },
    {
      id: "family.divorceParentingReviewMinYears",
      label: "離婚後の養育連絡を見直す最短間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・離婚後の養育",
      description:
        "離婚後に子どもの生活や連絡方針を再相談する間隔。親権・面会制度や合意成立を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["離婚後の養育連絡相談"]
    },
    {
      id: "family.divorceParentingReviewMaxYears",
      label: "離婚後の養育連絡を見直す最長間隔",
      value: 5,
      unit: "年",
      status: "S",
      scope: "家族・離婚後の養育",
      description: "次の相談時期を設定する間隔の上限。実際の面会頻度や制度上の期限ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["離婚後の養育連絡相談"]
    },
    {
      id: "economy.childLaunchSupportCost",
      label: "子の別居準備支援費",
      value: 80000,
      unit: "龍門幣/人",
      status: "S",
      scope: "家計・子育て",
      description:
        "親族・共同体の支援を得ながら子が別居を始める際の荷物・移動・当面の備えをまとめた抽象額。地域別の賃料・運賃ではないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の別居準備"]
    },
    {
      id: "economy.childRemittanceAnnualCost",
      label: "別居した成人子への定期送金",
      value: 120000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・親子関係",
      description:
        "別居後の成人した子へ定期的に送る場合の抽象年額。送金慣行や地域別生活費の公式値ではなく、家族内支援の継続を追跡するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人した子への送金"]
    },
    {
      id: "economy.divorcedChildSupportAnnualCost",
      label: "離婚後の未成年子への任意の定期支援",
      value: 160000,
      unit: "龍門幣/年/人",
      status: "S",
      scope: "家計・親子関係",
      description:
        "子どもの主な生活先が元配偶者側の場合に、本人が任意の定期支援を選んだときの基準年額。離婚時に記録した元配偶者の地域物価係数と生活物価指数を掛ける。法的養育費・義務・公式地域価格ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["離婚後の子の定期家計支援"]
    },
    {
      id: "economy.adultChildLocalVisitBaseCost",
      label: "同地域に暮らす成人子への訪問基準費",
      value: 50000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・親子関係",
      description:
        "同じ地域に暮らす別居した成人子を訪ねる際の交通・食事等をまとめた抽象費用。公的運賃・地域別実価格・家族慣行ではなく、ゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["同地域・他地域の成人子訪問"]
    },
    {
      id: "economy.adultChildContactBaseCost",
      label: "成人子との便り・通話の基準費",
      value: 5000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・親子関係",
      description:
        "別居した成人子へ便りや通話をする際の抽象通信費。テラ全域の通信料金を示す資料値ではなく、地域物価と生活物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人した子との便り・通話"]
    },
    {
      id: "economy.siblingContactBaseCost",
      label: "別居きょうだいとの便り・通話の基準費",
      value: 5000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・きょうだい関係",
      description:
        "別居したきょうだいへ便りや通話をする際の抽象通信費。通信手段やテラ全域の料金を定める資料値ではなく、地域物価・生活物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいとの便り・通話"]
    },
    {
      id: "economy.siblingVisitBaseCost",
      label: "別居きょうだいを訪ねる基準費",
      value: 50000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・きょうだい関係",
      description:
        "同地域で別居するきょうだいを訪ねる際の移動・食事等をまとめた抽象額。他地域訪問は経路候補の往復目安運賃を加算する。実際の運賃・交通網ではなく地域物価・生活物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいの訪問"]
    },
    {
      id: "economy.spouseVisitBaseCost",
      label: "別居配偶者を訪ねる基準費",
      value: 65000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・配偶者関係",
      description:
        "別地域の別居配偶者を訪ねる際の食事等をまとめた抽象額。訪問費には経路候補の往復目安運賃も加算する。実際の運賃・交通網ではなく地域物価・生活物価指数で調整するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居配偶者への訪問"]
    },
    {
      id: "economy.spouseLocalVisitBaseCost",
      label: "同じ地域に住む配偶者への訪問基準費",
      value: 8000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・配偶者関係",
      description:
        "同じ地域で別世帯に暮らす配偶者と会うための移動・飲食等の抽象額。実際の交通費を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["同地域の別世帯配偶者への訪問"]
    },
    {
      id: "economy.spouseLocalRejoinBaseCost",
      label: "同じ地域で再合流する基準費",
      value: 25000,
      unit: "龍門幣/回",
      status: "S",
      scope: "家計・配偶者関係",
      description:
        "同じ地域内で住まいを一つにまとめる際の荷造り・移動等の抽象費用。実際の契約料や運賃を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["同地域に住む別世帯配偶者との再合流"]
    },
    {
      id: "family.childFutureDiscussionMinAge",
      label: "子の将来を話し始める目安",
      value: 16,
      unit: "歳",
      status: "S",
      scope: "家族・進路",
      description:
        "家族が進学・仕事・同居継続・別居を話し合うイベントの抽選開始目安。法的成人年齢や全地域共通の独立年齢ではなく、ゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の将来相談"]
    },
    {
      id: "family.childFutureDiscussionMaxAge",
      label: "子の将来相談の対象年齢上限",
      value: 22,
      unit: "歳",
      status: "S",
      scope: "家族・進路",
      description:
        "進路・住まいの相談イベントを初回発生させる年齢上限。独立や就労の期限を定める値ではなく、選択イベントを配置するゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["子の将来相談"]
    },
    {
      id: "family.adultChildMoveReviewMinYears",
      label: "別居した成人子の転居見直し最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "本人の全生涯を計算せず、別居した成人子の居住地を節目ごとに見直す最短間隔。世界の実際の移住頻度・職業移動統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の限定的な居住更新"]
    },
    {
      id: "family.adultChildMoveReviewMaxYears",
      label: "別居した成人子の転居見直し最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "家族・移動",
      description:
        "移住経路を参照して別居した成人子の地域を再検討する上限。転居を保証せず、正史や実際の人口移動統計を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の限定的な居住更新"]
    },
    {
      id: "family.adultChildMoveChance",
      label: "転居見直し時に地域を移る抽象確率",
      value: 0.12,
      unit: "確率",
      status: "S",
      scope: "家族・移動",
      description:
        "別居した成人子が移動経路を用いた見直し時に、仕事や暮らしの縁で別地域へ移るゲーム用確率。地域差・移住統計・正史を表す値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の限定的な居住更新"]
    },
    {
      id: "family.adultChildReturnRequestChance",
      label: "転居後に成人子から帰宅相談が届く抽象確率",
      value: 0.1,
      unit: "確率",
      status: "S",
      scope: "家族・関係",
      description:
        "転居で仕事や住まいが不安定になった場合を抽象化し、本人から帰宅を相談するかを決めるゲーム用確率。統計や正史を表さず、相談の有無は親の選択と分けて記録する。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の本人発の帰宅相談"]
    },
    {
      id: "family.adultChildReturnRoomSetupCost",
      label: "成人子再同居時の寝床・部屋準備費",
      value: 30000,
      unit: "龍門幣（基準額）",
      status: "S",
      scope: "家族・住居・家計",
      description:
        "成人子を受け入れる際の寝床・部屋の準備にかかるゲーム用基準額。居住地域物価で換算し、公式相場・住宅制度・部屋数を表さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["成人子の再同居受入れ"]
    },
    {
      id: "family.siblingContactReviewYears",
      label: "別居きょうだいとの連絡再確認間隔",
      value: 3,
      unit: "年",
      status: "S",
      scope: "家族・関係",
      description:
        "別居した成人きょうだいとの近況確認を再び話題にする目安。実際の連絡頻度を示す統計ではなく、関係を継続して追うためのゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["別居きょうだいとの連絡"]
    },
    {
      id: "family.siblingRecontactReviewMinYears",
      label: "関係終了後の再接触見直し最短間隔",
      value: 5,
      unit: "年",
      status: "S",
      scope: "家族・関係",
      description:
        "関係を絶った別居きょうだいから再び連絡が届く可能性を見直す最短間隔。実際の和解・再接触頻度ではなくゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["関係終了後の再接触"]
    },
    {
      id: "family.siblingRecontactReviewMaxYears",
      label: "関係終了後の再接触見直し最長間隔",
      value: 10,
      unit: "年",
      status: "S",
      scope: "家族・関係",
      description:
        "関係終了後に少数の家族関係を再確認する上限間隔。すべての疎遠関係に再接触が起こることを意味しないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["関係終了後の再接触"]
    },
    {
      id: "family.siblingRecontactInviteChance",
      label: "再接触見直し時に便りが届く抽象確率",
      value: 0.14,
      unit: "確率",
      status: "S",
      scope: "家族・関係",
      description:
        "見直し時に、関係を絶ったきょうだいから便りが届くかを表すゲーム用確率。和解率・家族関係の実統計ではなく、再接触が起きない人生も残す。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["関係終了後の再接触"]
    },
    {
      id: "family.siblingWorkReviewMinYears",
      label: "別居きょうだいの仕事見直し最短間隔",
      value: 4,
      unit: "年",
      status: "S",
      scope: "家族・生業",
      description:
        "別居したきょうだいの生業を節目に再確認する最短間隔。転職頻度や雇用統計ではなく、関係者の生活を限定的に進めるゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの仕事更新"]
    },
    {
      id: "family.siblingWorkReviewMaxYears",
      label: "別居きょうだいの仕事見直し最長間隔",
      value: 8,
      unit: "年",
      status: "S",
      scope: "家族・生業",
      description:
        "別居したきょうだいの生業変化を抽象的に見直す上限。雇用の安定性や正史の出来事を示さないゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの仕事更新"]
    },
    {
      id: "family.siblingWorkChangeChance",
      label: "仕事見直し時に職を変える抽象確率",
      value: 0.18,
      unit: "確率",
      status: "S",
      scope: "家族・生業",
      description:
        "見直し時に別居したきょうだいが別の職業へ移るモデル確率。テラの転職率・職業分布を示すものではなく、本人の人生から少数の関係者だけを動かすゲーム用仮定。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの仕事更新"]
    },
    {
      id: "family.siblingHealthInitial",
      label: "別居きょうだいの初期健康値",
      value: 78,
      unit: "0–100点",
      status: "S",
      scope: "家族・健康",
      description:
        "別居時または旧記録の補完時に置く健康状態の初期値。資料に家族NPCの健康統計はなく、実在の平均値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY", "SRC_TERRA_LIFECOURSE"],
      usedBy: ["別居きょうだいの健康更新"]
    },
    {
      id: "family.parentHealthInitialMin",
      label: "親の生成時最低健康値",
      value: 66,
      unit: "0–100点",
      status: "S",
      scope: "家族・健康",
      description: "親族NPCの初期体調をばらつかせるゲーム用仮定。医学的な健康尺度や人口統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["親族の健康・就労可能度"]
    },
    {
      id: "family.parentHealthInitialMax",
      label: "親の生成時最高健康値",
      value: 96,
      unit: "0–100点",
      status: "S",
      scope: "家族・健康",
      description: "親族NPCの初期体調をばらつかせるゲーム用仮定。医学的な健康尺度や人口統計ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["親族の健康・就労可能度"]
    },
    {
      id: "family.parentHealthAgeStart",
      label: "親の加齢負担を計算し始める年齢",
      value: 52,
      unit: "歳",
      status: "S",
      scope: "家族・健康",
      description: "健康値の年次変化に加齢の弱い負担を加える境界。退職年齢や医学的な閾値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族の健康更新"]
    },
    {
      id: "family.parentHealthAgeDrift",
      label: "親の年齢差による健康負担",
      value: 0.08,
      unit: "健康点/年齢差・年",
      status: "S",
      scope: "家族・健康",
      description: "境界年齢との差に掛ける小さな健康変化。死亡率や寿命の推定値ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["親族の健康更新"]
    },
    {
      id: "family.parentHealthInfectionDrift",
      label: "感染している親の年次健康負担",
      value: 0.22,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description:
        "感染状態を一般健康のモデル値へ反映する仮定。鉱石病の進行・治療効果・生存率を直接表さない。",
      source: "ゲーム用仮定",
      references: ["SRC_ORIPATHY_SOCIAL"],
      usedBy: ["親族の健康更新"]
    },
    {
      id: "family.parentHealthHazardDrift",
      label: "危険職の親の年次健康負担",
      value: 0.12,
      unit: "健康点/年",
      status: "S",
      scope: "家族・健康",
      description: "鉱業・工場・護衛などを危険職とみなす粗いゲーム仮定。職業別労災率を示さない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE", "SRC_INDUSTRIAL_LIFE"],
      usedBy: ["親族の健康更新"]
    },
    {
      id: "family.parentHealthRandomDrift",
      label: "親の体調の年次ばらつき",
      value: 1.4,
      unit: "健康点/年の全幅",
      status: "S",
      scope: "家族・健康",
      description: "健康値に加える小さな無作為変動幅。疾患発症率を意味しない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_FAMILY"],
      usedBy: ["親族の健康更新"]
    },
    {
      id: "family.parentWorkShareHealthThreshold",
      label: "就労可能度が下がり始める健康値",
      value: 58,
      unit: "0–100点",
      status: "S",
      scope: "家族・家計",
      description: "モデル上の健康値から推定就労可能度を計算する境界。定年・雇用制度の基準ではない。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["養育家計の親収入"]
    },
    {
      id: "family.parentWorkShareFloor",
      label: "親の就労可能度の下限",
      value: 0.35,
      unit: "基準賃金比",
      status: "S",
      scope: "家族・家計",
      description:
        "健康値だけで仕事を完全に失わせないためのモデル下限。個別の休職・失業はイベント状態で表す。",
      source: "ゲーム用仮定",
      references: ["SRC_TERRA_LIFECOURSE"],
      usedBy: ["養育家計の親収入"]
    }
  ];
});
