// extensions/education-and-later-life/elder-life: construction fragment; evaluation order is declared by data/extensions/education-and-later-life.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/education-and-later-life/elder-life"
)(function ($terraData, $define, $rules) {
  "use strict";

  $terraData.EV.push(
      // --- A. 引退・隠居後の生活と地域 ---
      {
        id: "elder_daily_morning_walk",
        conf: "S",
        references: ["SRC_REGIONAL_ORDINARY_LIFE_REVIEW", "SRC_LOCALITY_GAME"],
        st: ["老年"],
        ge: { age: 50 },
        cd: 2,
        w: 0.6,
        t: "朝もやの残る街角をゆっくりと散歩した。若い頃には気づかなかった建物の装飾や、露天商が荷解きをする静かな物音に耳を傾けながら、歩調を緩めた。",
        fx: { p: 1, h: 1 }
      },
      {
        id: "elder_daily_old_tools_care",
        conf: "S",
        references: ["SRC_INDUSTRIAL_LIFE", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 52 },
        cd: 3,
        w: 0.5,
        t: "かつて現場で何十年も使い込んできた道具を木箱から取り出し、油を引いて柔らかい布で磨いた。手になじんだ柄の感触が、大地を駆け抜けた歳月を静かに思い出させた。",
        fx: { p: 1, k: 1 }
      },
      {
        id: "elder_daily_neighborhood_tea",
        conf: "S",
        references: ["SRC_REGIONAL_ORDINARY_LIFE_REVIEW", "SRC_TERRA_FAMILY"],
        st: ["老年"],
        ge: { age: 50 },
        cd: 3,
        w: 0.55,
        t: "広場のベンチで同じ年頃の老人たちとお茶を分け合い、他愛もない世間話に花を咲かせた。互いに古傷の痛みを笑い合いながら、穏やかな昼下がりの陽光を浴びた。",
        fx: { rl: 2, p: 1 }
      },
      {
        id: "elder_daily_weather_aches",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 55 },
        cd: 3,
        w: 0.5,
        t: "節々の痛みが強くなり、天気が下り坂だと肌で感じ取った。薪をくべて部屋を暖め、雨が降り出す前に古い常備薬の煎じ湯をゆっくりとすすった。",
        fx: { h: -1 }
      },
      {
        id: "elder_choice_craft_teaching",
        conf: "S",
        references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_FAMILY"],
        st: ["老年"],
        ge: { age: 55 },
        cd: 4,
        w: 0.4,
        t: "近所の若い見習い職人が、作業のコツが掴めずに悩んでいると耳にした。長年の現場経験で培った勘と技術を、次の世代へ教える機会が巡ってきた。",
        c: [
          $terraData.K(
            "手取り足取り作業の勘所を惜しみなく教える",
            {},
            [
              1,
              "作業台の前に並んで手本を見せ、道具の持ち方や力の抜き方を丁寧に教えた。若者の目が輝き、感謝の言葉とともに深々と頭を下げられた。",
              { k: 2, rl: 3, p: 2 }
            ]
          ),
          $terraData.K(
            "自分で試行錯誤して覚えるのも修行だと温かく見守る",
            {},
            [
              1,
              "細かい口出しはせず、温かい茶を差し入れながら見守った。自分で工夫して壁を乗り越えた若者の姿に、頼もしさを覚えた。",
              { rl: 1, p: 1 }
            ]
          )
        ]
      },
      {
        id: "elder_choice_community_mediator",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_LOCALITY_GAME"],
        st: ["老年"],
        ge: { age: 58 },
        cd: 4,
        w: 0.35,
        t: "通りの住人同士で井戸水の使い方や通路の荷物をめぐる口論が起きていた。長年この区画で暮らしてきた古株として、間に入って仲裁するか問われた。",
        c: [
          $terraData.K(
            "双方の言い分を丁寧に聞き、公平な妥協案を提示する",
            {},
            [
              1,
              "双方の不満をじっくりと聞き届けて筋を通し、互いが納得できる利用規則を取り決めた。場が穏やかに収まり、近所からの信頼が深まった。",
              { rl: 4, p: 2, k: 1 }
            ]
          ),
          $terraData.K(
            "若い者同士の衝突に首を突っ込まず、静かに引き取る",
            {},
            [
              1,
              "当人同士で落としどころを見つけるべきだと考え、静かにその場を離れた。少し後味の悪さは残ったが、無用な諍いに巻き込まれずに済んだ。",
              { p: -1 }
            ]
          )
        ]
      },

      // --- B. 孫・次世代とのふれあい ---
      {
        id: "elder_daily_grandchild_visit",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 52 },
        cd: 3,
        w: 0.55,
        show: s => (s.ch?.length || 0) > 0,
        t: "独立した子供が幼い孫を連れて顔を見せにやってきた。部屋中を元気いっぱいに駆け回る孫の笑顔を見つめるうちに、胸の奥から温かいものが込み上げた。",
        fx: { p: 3, rl: 2 }
      },
      {
        id: "elder_daily_grandchild_letter",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 55 },
        cd: 3,
        w: 0.45,
        show: s => (s.ch?.length || 0) > 0,
        t: "子や孫から近況を知らせる便りが届いた。日々の遊びや家の出来事を綴った文字を、眼鏡を掛け直して何度も嬉しそうに読み返した。",
        fx: { p: 2, rl: 1 }
      },
      {
        id: "elder_choice_grandchild_gift",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 54 },
        cd: 4,
        w: 0.4,
        show: s => (s.ch?.length || 0) > 0,
        t: "孫の成長に合わせ、読み書きに使える品やお祝いの小遣いを贈りたいと思った。学校へ通えるかどうかは、本人たちの暮らしと受入先の事情を確かめてからの話だ。",
        c: [
          $terraData.K(
            "奮発してお祝いの小遣いを持たせる（費用 30,000）",
            { en: { ge: { cash: 30000 } }, why: "手元の現金が足りない" },
            [
              1,
              "封筒に小遣いを包んで孫の手の中に握らせた。目を丸くして大喜びする孫と、恐縮しながら頭を下げる子供の姿に顔が綻んだ。",
              { cash: -30000, p: 4, rl: 3 }
            ]
          ),
          $terraData.K(
            "昔自分が大切に使っていた頑丈な万年筆を譲る",
            {},
            [
              1,
              "引き出しの奥から手入れの行き届いた古い万年筆を取り出し、孫に手渡した。祖父母の歴史を受け継いだ孫は、誇らしげに胸ポケットに差し込んだ。",
              { p: 3, rl: 3, k: 1 }
            ]
          )
        ]
      },
      {
        id: "elder_choice_family_folklore",
        conf: "S",
        references: ["SRC_TERRA_FAMILY", "SRC_LOCALITY_GAME"],
        st: ["老年"],
        ge: { age: 55 },
        cd: 4,
        w: 0.4,
        show: s => (s.ch?.length || 0) > 0,
        t: "夕暮れ時、暖炉の周りに集まった子供や孫たちから「昔のテラの大地や旅の話を聞かせてほしい」とせがまれた。",
        c: [
          $terraData.K(
            "かつて経験した天災や過酷な旅の教訓を真剣に語り聞かせる",
            {},
            [
              1,
              "雲の色の変わり目や大地が鳴る合図など、生き抜くための知恵を噛み砕いて語り聞かせた。幼い者たちは真剣な眼差しで聞き入り、大地の厳しさを心に刻んだ。",
              { k: 2, rl: 3, p: 2 }
            ]
          ),
          $terraData.K(
            "大地に伝わる古い英雄の民話をおどけて面白おかしく語る",
            {},
            [
              1,
              "身振り手振りを交えて怪物の声真似をし、子供たちをどっと笑わせた。家族の明るい笑い声が部屋いっぱいに響き渡り、幸福な夜を過ごした。",
              { p: 3, rl: 2 }
            ]
          )
        ]
      },

      // --- C. 終活・自伝・遺言・世代継承 ---
      {
        id: "elder_choice_write_memoir",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_TERRA_FAMILY"],
        st: ["老年"],
        ge: { age: 60 },
        cd: 5,
        w: 0.35,
        once: true,
        t: "机に向かい、古びた手帳と万年筆を手に取った。激動のテラの大地で過ごした自らの人生の軌跡を、一冊の回顧録として書き残そうと考えた。",
        c: [
          $terraData.K(
            "苦難と誇りをありのままに綴り、次代への手記を完成させる",
            {},
            [
              1,
              "幾夜も机に向かい、喜びも悲しみも偽りなく手記に記し終えた。自らの生きた証が一冊の束となり、深い達成感と心の静けさを得た。",
              { k: 4, p: 5, rl: 2 }
            ]
          ),
          $terraData.K(
            "筆を置き、ただ心の中だけに大切な記憶を留めておく",
            {},
            [
              1,
              "静かに手帳を閉じ、思い出は自らの胸の奥にしまっておくことにした。飾らない自分だけの人生を噛み締め、穏やかな笑みを浮かべた。",
              { p: 2 }
            ]
          )
        ]
      },
      {
        id: "elder_choice_make_will",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_LOCALITY_GAME"],
        st: ["老年"],
        ge: { age: 60 },
        cd: 5,
        w: 0.35,
        once: true,
        t: "万が一の時に備え、公証人を招いて正式な遺言書を作成する機会を持った。これまで蓄えてきた財産や家財の処遇をどう定めるか熟考した。",
        c: [
          $terraData.K(
            "家族や愛する者たちへ均等に分配する旨を記す",
            {},
            [
              1,
              "公証人の前で署名捺印し、身近な者たちが諍いを起こさぬよう明確に分与を定めた。将来への義務を果たし、肩の荷が下りた心地がした。",
              { rl: 4, p: 3 }
            ]
          ),
          $terraData.K(
            "貧しい感染者の生活支援基金へ一部を遺贈する旨を記す",
            {},
            [
              1,
              "自らの遺産の一部を、救護所や感染者支援の基金へ寄付する条項を盛り込んだ。苦難の大地に少しでも光を遺せることに、確かな安らぎを覚えた。",
              { p: 5, rl: 2, k: 1 }
            ]
          )
        ]
      },
      {
        id: "elder_choice_clean_house_legacy",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_TERRA_FAMILY"],
        st: ["老年"],
        ge: { age: 62 },
        cd: 4,
        w: 0.4,
        t: "戸棚の奥に眠っていた古い書類や収集品を整理した。身の回りの生前整理を進め、大切な品を後世に残すための準備を始めた。",
        c: [
          $terraData.K(
            "愛用品を信頼できる友人や弟子に形見分けとして手渡す",
            {},
            [
              1,
              "長年愛用してきた品々を、意味を理解してくれる仲間たちに一つずつ託した。受け取った者たちの真摯な眼差しに、心が温かくなった。",
              { rl: 3, p: 2 }
            ]
          ),
          $terraData.K(
            "不要な品を整理して古道具屋に引き取ってもらい身軽になる",
            {},
            [
              1,
              "余分な荷物を整理して部屋をすっきりと片付けた。手元に少しの小銭が残り、心身ともに風通しの良い身軽さを取り戻した。",
              { cash: 15000, p: 2 }
            ]
          )
        ]
      },
      {
        id: "elder_daily_cemetery_visit",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 60 },
        cd: 3,
        w: 0.5,
        t: "丘の上の墓地を訪れ、自分より先に逝った両親や旧友の墓石の苔を静かに拭った。野の花を手向け、今の穏やかな暮らしを心の中で報告した。",
        fx: { p: 2, rl: 1 }
      },

      // --- D. 穏やかな緩和ケアと命の受容 ---
      {
        id: "elder_daily_peaceful_sunshine",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 65 },
        cd: 3,
        w: 0.55,
        t: "窓から差し込む午後の柔らかな光を浴びながら、揺り椅子に深く身を沈めた。柱時計の規則正しい音を聞きながら、穏やかな微睡みの中に身を委ねた。",
        fx: { p: 2, h: 1 }
      },
      {
        id: "elder_choice_palliative_care_switch",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_ORIPATHY_SOCIAL"],
        st: ["老年"],
        ge: { age: 60 },
        cd: 4,
        w: 0.35,
        show: s => s.inf > 0 || (s.h || 0) < 30,
        once: true,
        t: "身体の痛みや衰えが日増しに強くなり、医師から今後の療養方針を尋ねられた。身体に負担の大きい積極的な投薬を続けるか、それとも痛みを和らげ自然な安らぎを優先するか。",
        c: [
          $terraData.K(
            "無理な延命を避け、痛みを抑える緩和ケアで穏やかに過ごす",
            {},
            [
              1,
              "強い薬の副作用から解放され、痛みを抑えながら家族と語らう穏やかな日常を選んだ。残された時間を穏やかに噛み締めた。",
              { p: 5, h: -2 }
            ]
          ),
          $terraData.K(
            "最後の一日まで諦めず、治療薬を飲み続けて病と戦う",
            {},
            [
              1,
              "苦い薬を飲み干し、気力を振り絞って病に立ち向かう意志を示した。医師もその気迫に打たれ、手厚い診療を約束してくれた。",
              { h: 3, p: -2 }
            ]
          )
        ]
      },
      {
        id: "elder_daily_reading_past_letters",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_TERRA_FAMILY"],
        st: ["老年"],
        ge: { age: 65 },
        cd: 3,
        w: 0.45,
        t: "机の引き出しから黄ばんだ古い手紙の束を取り出した。若い日の恋人、旅立った友、亡き親からの懐かしい筆跡を指でなぞり、遠い日々に思いを馳せた。",
        fx: { p: 2, rl: 1 }
      },
      {
        id: "elder_choice_life_reflection",
        conf: "S",
        references: ["SRC_LIFE_ENDING_GAME", "SRC_REGIONAL_ORDINARY_LIFE_REVIEW"],
        st: ["老年"],
        ge: { age: 70 },
        cd: 5,
        w: 0.35,
        once: true,
        t: "暮れゆく夕焼け空を見つめながら、自らが歩んできた長い生涯を静かに振り返った。天災、戦争、病、飢え……幾多の苦難が渦巻くテラの大地で、自分は今日まで確かに生き抜いてきた。",
        c: [
          $terraData.K(
            "「悔いのない、誇り高き生涯だった」と自らの歩みを深く肯定する",
            {},
            [
              1,
              "どれほど泥にまみれようと、精一杯に生きた日々に一点の曇りもない。夕暮れの風を受けながら、満ち足りた静かな誇りを胸に抱いた。",
              { p: 8, k: 2 }
            ]
          ),
          $terraData.K(
            "巡り会えたすべての人々に心からの感謝を捧げる",
            {},
            [
              1,
              "支えてくれた家族、共に汗を流した仲間、すれ違った旅人たち……すべての出会いに手を合わせた。温かい感謝の涙が頬を伝った。",
              { p: 6, rl: 4 }
            ]
          )
        ]
      }
    );
  });
