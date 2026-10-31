// world/facilities: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("world/facilities", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "FACILITY_MODEL",
    {
      version: 1,
      kinds: {
        clinic: { label: "近隣の診療拠点", axis: "medical", strained: 0.67, limited: 0.38 },
        school: { label: "通学先となる学び舎", axis: "transport", strained: 0.65, limited: 0.37 },
        workplace: { label: "現在の職種に関係する仕事場", axis: "jobs", strained: 0.66, limited: 0.4 }
      },
      states: { available: "通常の対応", strained: "利用・運営に制約", limited: "一部休止・縮小" },
      policy: "架空の身近な施設の稼働推計。特定都市の実在施設、公式の病院・学校・雇用数や復旧速度を示さない。"
    },
    false
  );

  $terraData.EVENT_FIELD_META.facilityAction = {
    unit: "本人の施設への関わりの記録",
    meaning:
      "施設と職種・居住地を照合し、問い合わせ・支援・代替手段を本人の履歴へ登録する。施設全体の復旧を確定しない",
    status: "S",
    valueType: "object"
  };

  $terraData.SETTING_SOURCES.SRC_FACILITY_TW = {
    title: "ウォルモンドの薄暮 TW-S-1",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    kind: "日本語版非公式本文アーカイブ",
    note: "感染者の臨時診療所と仮設住宅、被災後の物資・人手の制約。一般施設の発生率・稼働率は不明"
  };

  $terraData.SETTING_SOURCES.SRC_FACILITY_PODENCO = {
    title: "ポデンコ 回想秘録「花開く時」",
    url: "https://arknights.timo.beer/operators/podenco/record-1",
    kind: "日本語版非公式本文アーカイブ",
    note: "療養庭園の研究需要、改修承認、人員と設備の制約。一般学校・工場の標準運営制度ではない"
  };

  $terraData.SETTING_SOURCES.SRC_FACILITY_SUSSURRO = {
    title: "ススーロ 回想秘録「精鋭医師」",
    url: "https://arknights.timo.beer/operators/sussurro/record-1",
    kind: "日本語版非公式本文アーカイブ",
    note: "救援時の医療者、資材、設備と地元行政の調整。一般住民への医療提供を保証しない"
  };

  $define(
    "facilityEvents",
    [
      {
        id: "facility_clinic_constrained",
        conf: "S",
        references: ["SRC_FACILITY_TW", "SRC_FACILITY_SUSSURRO"],
        st: ["少年", "青年", "壮年", "老年"],
        need: ["近隣の診療拠点が利用制限中"],
        cd: 4,
        w: 0.85,
        t: "近くの診療所は人手も薬も足りないらしく、日中の窓口が早く閉まるようになっていた。表の張り紙には『急患優先』とあるばかりで、普段の診察や薬の相談はいつ行けばいいのか見当がつかない。",
        c: [
          $terraData.K("受付の係に、普通の診察や他所の窓口を尋ねる", {}, [
            1,
            "忙しそうに立ち働く係の人に声をかけ、一般の患者が診てもらえる時間帯と、隣町の施療院の場所を聞いて帰った。",
            {
              k: 1,
              facilityAction: {
                kind: "clinic",
                action: "referral",
                description: "現在の受付方法と別の窓口の連絡先を調べた"
              }
            }
          ]),
          $terraData.K("家族や知人と、いざという時の付き添いを話し合う", {}, [
            1,
            "急な発熱や怪我の時に誰が仕事を抜けて付き添うか、家の者とあらかじめ段取りを決めておいた。",
            {
              rl: 1,
              facilityAction: {
                kind: "clinic",
                action: "care_plan",
                description: "診療拠点の利用制限を受けて通院の予定を相談した"
              }
            }
          ]),
          $terraData.K("なるべく医者にかからずに済むよう、体をいたわる", {}, [
            1,
            "こんな時期に体調を崩せば診てもらえる保証もない。夜更かしや無理な力仕事を控え、少しでも異変があればすぐ休むようにした。",
            {
              p: 1,
              facilityAction: {
                kind: "clinic",
                action: "observe",
                description: "症状の記録と連絡先の確認をした"
              }
            }
          ])
        ]
      },
      {
        id: "facility_clinic_followup",
        conf: "S",
        references: ["SRC_FACILITY_TW"],
        st: ["青年", "壮年", "老年"],
        need: ["以前この地区の診療拠点を調べた"],
        after: { id: "facility_clinic_constrained", min: 2 },
        once: true,
        w: 0.75,
        t: "以前、診療所がごった返していた頃に別の相談先を調べたことがあった。久しぶりにその前を通りかかると、入口の案内板が新しく塗り替えられているのに気づいた。",
        c: [
          $terraData.K("足を止めて、今の診察時間や薬の受け取り方を確かめる", {}, [
            1,
            "窓口をのぞいて尋ねると、当時とは診察の曜日も担当の医師も変わっていた。新しい時間を頭に入れて通りへ戻った。",
            {
              k: 1,
              facilityAction: {
                kind: "clinic",
                action: "renew",
                description: "以前の診療案内を現在のものと照合した"
              }
            }
          ]),
          $terraData.K("今は元気だからと、そのまま通り過ぎる", {}, [
            1,
            "以前の記憶はもう当てにならないと分かっただけでも十分だ。本当に具合が悪くなった時に改めて聞くことにした。",
            {
              facilityAction: {
                kind: "clinic",
                action: "defer",
                description: "診療案内の再確認をいったん見送った"
              }
            }
          ])
        ]
      },
      {
        id: "facility_school_disruption",
        conf: "S",
        references: ["SRC_FACILITY_TW", "SRC_FACILITY_PODENCO"],
        st: ["児童", "少年", "青年"],
        need: ["就学中", "学び舎の通常授業が制限中"],
        cd: 4,
        w: 0.9,
        t: "通っている学び舎で教室が閉まる日が増え、集会所の隅や空き部屋を借りて細々と授業が行われるようになった。いつ元の教室へ戻れるのかは、先生にも分からないらしい。",
        c: [
          $terraData.K("配られたプリントや教科書を家で繰り返し読む", {}, [
            1,
            "騒がしい家の隅で教科書を広げ、自分の力だけで解ける問題と分からない箇所を一つずつ確かめた。",
            {
              k: 2,
              facilityAction: {
                kind: "school",
                action: "self_study",
                description: "通学の制約中に教材で学習を続けた"
              }
            }
          ]),
          $terraData.K("先生に、次に集まれる場所や質問できる時間を尋ねる", {}, [
            1,
            "片づけをしていた先生に声をかけると、週に二度だけ別の部屋で質問を受け付けると教えてくれた。",
            {
              rl: 1,
              facilityAction: {
                kind: "school",
                action: "study_contact",
                description: "代わりの学習機会と連絡先を確認した"
              }
            }
          ]),
          $terraData.K("学校が休みの日は家の仕事を手伝って過ごす", {}, [
            1,
            "昼間から家で水汲みや掃除を手伝った。学び舎の門には、次の教材を配る日付だけが貼られていた。",
            {
              p: 1,
              facilityAction: {
                kind: "school",
                action: "wait",
                description: "家事を手伝いながら再開を待った"
              }
            }
          ])
        ]
      },
      {
        id: "facility_school_reopen",
        conf: "S",
        references: ["SRC_FACILITY_TW"],
        st: ["児童", "少年", "青年"],
        need: ["就学中", "学び舎の授業が再開した"],
        cd: 6,
        w: 0.92,
        t: "ようやく学び舎の扉が開き、いつもの教室に机が並んだ。黒板の前に立った先生は『休みの前の続きから始める』と言ったが、教科書を開くとどこまで習ったのかすっかり曖昧になっていた。",
        c: [
          $terraData.K("分からない箇所をそのままにせず、先生に聞いて追いつく", {}, [
            1,
            "授業のあとで教壇へ行き、抜けていた範囲を教えてもらった。黒板の字を必死に写すうちに、ようやく教室の空気に勘が戻ってきた。",
            {
              k: 1,
              facilityAction: {
                kind: "school",
                action: "resume",
                description: "再開した授業の内容を確認した"
              }
            }
          ]),
          $terraData.K("教室の進み方には合わせず、自分のペースで自習を続ける", {}, [
            1,
            "いきなり皆と同じところからは追いつけない。休みの間に自分で進めていた頁から、一歩ずつ解き直すことにした。",
            {
              facilityAction: {
                kind: "school",
                action: "continue_study",
                description: "授業再開後も自習を継続した"
              }
            }
          ])
        ]
      },
      {
        id: "facility_work_restricted",
        conf: "S",
        references: ["SRC_FACILITY_PODENCO", "SRC_FACILITY_TW"],
        st: ["青年", "壮年", "老年"],
        need: ["仕事場の業務が縮小中"],
        cd: 5,
        w: 0.78,
        t: "原材料が届かず、仕事場の機械が半分以上止まったままだ。持ち場の作業も減り、現場の責任者は毎日渋い顔でシフトを削っている。来月の給金がどうなるか聞くか、雑用でも買って出るか、それともよその口を探すか。",
        c: [
          $terraData.K("責任者に、当面の出勤日数と給金の扱いを確かめる", {}, [
            1,
            "事務所の戸を叩き、来月どれだけ仕事があるのか、休業中の手当は出るのかを腹を割って尋ねた。",
            {
              k: 1,
              facilityAction: {
                kind: "workplace",
                action: "contract_check",
                description: "業務縮小時の勤務条件を問い合わせた"
              }
            }
          ]),
          $terraData.K("止まった機械の掃除や、動いているラインの手伝いに回る", {}, [
            1,
            "少しでも現場に居場所を残すため、油まみれになって休止中の設備を拭き上げ、人手の足りない工程を手伝った。",
            {
              rl: 1,
              facilityAction: {
                kind: "workplace",
                action: "maintenance",
                description: "縮小中の仕事場でできる作業を手伝った"
              }
            }
          ]),
          $terraData.K("ここが立ち行かなくなった時のために、よその求人を探しておく", {}, [
            1,
            "帰りに職業紹介所へ寄り、自分の腕で移れそうな働き口を探した。応募の紙を懐にしまい、翌朝は何食わぬ顔で職場へ出た。",
            {
              k: 2,
              facilityAction: {
                kind: "workplace",
                action: "job_search",
                description: "業務縮小を受けて別の求人を調べた"
              }
            }
          ])
        ]
      },
      {
        id: "facility_work_recovery",
        conf: "S",
        references: ["SRC_FACILITY_PODENCO"],
        st: ["青年", "壮年", "老年"],
        need: ["仕事場の業務が再開した"],
        cd: 6,
        w: 0.8,
        t: "止まっていた資材がようやく届き、仕事場に機械の唸りが戻ってきた。ただ、人が抜けた穴を埋めるため、貼り出された配置表には見慣れない工程まで自分の名前が書き込まれている。",
        c: [
          $terraData.K("新しく割り振られた工程と安全手順を最初から教わる", {}, [
            1,
            "知ったかぶりをして怪我をしないよう、古株の職人に頭を下げて見慣れない機械の止め方と手順を一つずつ確かめた。",
            {
              k: 1,
              facilityAction: {
                kind: "workplace",
                action: "review_roles",
                description: "再開後の作業と安全手順を確認した"
              }
            }
          ]),
          $terraData.K("まずは慣れた持ち場を回し、無理な掛け持ちは後で掛け合う", {}, [
            1,
            "久しぶりに動く自分の持ち場を無難にこなしながら、一人では抱えきれない分担について責任者へ話す機会をうかがった。",
            {
              p: 1,
              facilityAction: {
                kind: "workplace",
                action: "stay",
                description: "再開した仕事場で勤務を続ける意向を記録した"
              }
            }
          ])
        ]
      },
      {
        id: "facility_new_area_orientation",
        conf: "S",
        references: ["SRC_FACILITY_TW"],
        st: ["青年", "壮年", "老年"],
        need: ["別の生活圏へ転居した経験"],
        cd: 8,
        w: 0.35,
        t: "見知らぬ土地へ越してきて数日が経った。まだ片づかない荷物の山をまたぎながら、どこで水を買い、具合が悪くなったらどこへ駆け込めばいいのか、一から通りを歩いて確かめることにした。",
        c: [
          $terraData.K("まずは診療所と職業紹介所の場所を自分の足で確かめる", {}, [
            1,
            "大通りから路地まで歩き回り、急病の時に駆け込める診療所と、求人札が集まる掲示板の場所を頭に叩き込んだ。",
            {
              k: 1,
              facilityAction: {
                kind: "clinic",
                action: "orientation",
                description: "転居後の地域で診療の連絡先を調べた"
              }
            }
          ]),
          $terraData.K("近所の人に挨拶しがてら、安い食料品店と水場を教えてもらう", {}, [
            1,
            "向かいの住人に声をかけ、新鮮な野菜が入る市場と水場の場所を教わった。夕暮れの知らない街を、買いたてのパンを抱えて帰った。",
            {
              rl: 1,
              localityAction: {
                kind: "social",
                action: "information",
                description: "近所の人に食料品店と水場の場所を尋ねた"
              }
            }
          ])
        ]
      }
    ],
    false
  );

  $terraData.EV.push(...$terraData.facilityEvents);

  $terraData.SETTING_SOURCES.SRC_PEOPLE_MOUSSE = {
    title: "ムース 回想秘録「マイスウィーティ」",
    url: "https://arknights.timo.beer/operators/mousse/record-1",
    kind: "日本語版ゲーム本文の非公式アーカイブ",
    note: "家族面会、厨房での共同作業、同僚が教える料理・裁縫の具体例。職員名簿や全国的な人員数を示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_PEOPLE_PODENCO = {
    title: "ポデンコ 回想秘録「花開く時」",
    url: "https://arknights.timo.beer/operators/podenco/record-1",
    kind: "日本語版ゲーム本文の非公式アーカイブ",
    note: "療養庭園での担当・技術伝達・運営判断と、実際の採用を区別する事例。"
  };

  $terraData.SETTING_SOURCES.SRC_PEOPLE_SUSSURRO = {
    title: "ススーロ 回想秘録「精鋭医師」",
    url: "https://arknights.timo.beer/operators/sussurro/record-1",
    kind: "日本語版ゲーム本文の非公式アーカイブ",
    note: "災害医療の事務所、補給、搬送、限られた人員による継続的な医療への接点。"
  };

  $terraData.SETTING_SOURCES.SRC_PEOPLE_GAME = {
    title: "地区施設と人物の関係モデル v73",
    kind: "ゲーム設計上の仮説",
    note: "教師・同僚・案内係は実在原作人物の代役ではなく架空NPC。転職・休業・近況連絡の確率と年齢条件も仮定。"
  };

  $terraData.EVENT_EFFECT_TYPES.object.push("facilityPersonAction");

  $terraData.EVENT_FIELD_META.facilityPersonAction = {
    status: "S",
    valueType: "object",
    unit: "本人と身近な施設関係者の接触",
    meaning:
      "初回の名乗り、後日の問い合わせ、手伝い、交流の区切りを、個人ID・施設ID・生活圏IDに結び付ける。実際に聞いていない近況は更新しない。",
    assumption: "S"
  };
});
