// P17 reviewed full prose: 80 records, 159 choices, 46 conditional notifications.
// Only event IDs explicitly listed below are registered as game events. The
// remaining text is retained verbatim for subsequent guarded migration.
// Six source-design '保留' entries are never made executable.
window.TERRA_EDUCATION_INJECT_P17=function ($terraData) {
  "use strict";
  const reviewed=[
  {
    "reviewId": "E01",
    "eventId": "edu_primary_area_check",
    "title": "初等学校の所在",
    "decision": "修正",
    "body": "家の人が学校の場所を尋ねて戻ってきた。今の地区では、通える初等の教室があるのか、はっきりした返事を得られなかった。",
    "choices": [
      {
        "letter": "A",
        "label": "隣の地区に学校がないか調べてもらう",
        "result": "家の人は荷車の行き先や路線の案内を確かめ、隣の地区まで調べてみることにした。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今は家で教わる",
        "result": "夕食のあと、使い古した紙の裏に文字を書いてみた。学校に通うことは見送っても、家で覚えられることはある。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E02",
    "eventId": "edu_neighbor_school_notice",
    "title": "隣接校の照会結果",
    "decision": "修正",
    "body": "頼んでいた学校の調査について、返事が届いた。通える学校が見つかったのか、手元の紙を開いて確かめた。",
    "choices": [
      {
        "letter": "A",
        "label": "見つかった学校に通学方法を尋ねる",
        "result": "候補に挙がった学校へ手紙を出し、授業の始まる時刻と必要な書類を尋ねた。通えるかどうかは、まだ分からない。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "候補がないので今年は見送る",
        "result": "調べた地区には募集先を見つけられなかった。地図の端に印を付け、別の地区を調べられる日を待つことにした。",
        "notifications": []
      },
      {
        "letter": "C",
        "label": "調べた学校の名だけ控えておく",
        "result": "確認できた学校の名前と場所を控え、紙を机にしまった。通えるかどうかの返事は、まだ出していない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E03",
    "eventId": "edu_primary_commute_guardian",
    "title": "幼い通学者の付き添い",
    "decision": "修正",
    "body": "候補の学校へ向かう便があるらしい。けれど、朝に着けても、授業のあとに戻れるとは限らない。家の人は時刻表を広げていた。",
    "choices": [
      {
        "letter": "A",
        "label": "家の人に送り迎えを頼む",
        "result": "家の人は勤務の時刻と往復の便を見比べ、送り迎えのできる日を確かめた。",
        "notifications": [
          "仕事と帰りの便が合わず、送り迎えの約束はまだできなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "今年は遠くの学校へ通わない",
        "result": "小さな鞄は部屋の隅に掛けたままにした。入学をあきらめたことまで、勉強をやめる理由にはしたくなかった。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E04",
    "eventId": "edu_lower_stage_site_review",
    "title": "前期中等へ続く学校",
    "decision": "修正",
    "body": "初等課程の修了を認める書類を受け取った。次に進む授業が同じ校舎にあるとは限らず、家では新しい通学先を探す話になった。",
    "choices": [
      {
        "letter": "A",
        "label": "前期中等の学校を探す",
        "result": "修了の記録を折れないよう封筒にしまい、次の学校の募集案内を集めた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "しばらく家や仕事の手伝いをする",
        "result": "授業のない朝が始まった。初等課程で学んだことは残り、次にどこで学ぶかはまだ決まっていない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E05",
    "eventId": "edu_upper_locality_review",
    "title": "上級学校が地元にない",
    "decision": "修正",
    "body": "上の学校へ進もうと集めた案内には、今住む地区の外にある学校ばかりが載っていた。まだ調べていない場所も残るが、道の長さが気になった。",
    "choices": [
      {
        "letter": "A",
        "label": "近隣の学校と通学手段を探す",
        "result": "家族で机を囲み、通える街と運賃を一つずつ書き出した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "寄宿や転居が必要な進学先を調べる",
        "result": "遠い学校の募集要項を取り寄せた。学費とは別に、住む場所をどうするか考えなければならなかった。",
        "notifications": []
      },
      {
        "letter": "C",
        "label": "進学を延期する",
        "result": "授業の続きが書かれたノートは捨てずに残した。働きながら、もう一度機会を待つことにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E06",
    "eventId": "edu_higher_search_decision",
    "title": "高等教育先の所在",
    "decision": "修正",
    "body": "進学の話をすると、知人は遠い街の学校について話した。どんな課程を教えているのか、願書を受け付けているのか、まだ何も確かめていない。",
    "choices": [
      {
        "letter": "A",
        "label": "志望課程を持つ学校を照会する",
        "result": "学校の案内を集め、授業科目と所在地の欄に印を付けた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今期は出願を見送る",
        "result": "集めた案内をしまい、仕事や家事の予定を立て直した。今回は願書を出しておらず、試験の結果もない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E07",
    "eventId": "edu_applicant_institution_shortlist",
    "title": "行ける学校と行けない学校",
    "decision": "修正",
    "body": "集めた募集案内を広げると、同じ分野でも選抜の方法や通う場所が違っていた。日帰りできそうな学校もあれば、住まいを考え直す必要のある学校もあった。",
    "choices": [
      {
        "letter": "A",
        "label": "通える候補を一校に絞って相談する",
        "result": "自分の学力と暮らしを考え、願書を出したい学校に丸を付けた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "条件の合う学校がないので探し直す",
        "result": "紙を並べ替え、今は手の届かない進路と、まだ調べていない道を分けて書いた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E08",
    "eventId": "edu_school_opening_not_admission",
    "title": "校舎と募集の違い",
    "decision": "修正",
    "body": "確かめた学校の校舎は残っていたが、希望する課程への募集は今期行われていなかった。窓口には理由と次の予定を尋ねる人がいた。",
    "choices": [
      {
        "letter": "A",
        "label": "別の学校を探す",
        "result": "閉じた門の前で立ち止まるのはやめ、別の学び舎の案内を探しに歩いた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "再開を待つ",
        "result": "募集のなかった課程と問い合わせ先を書き留めた。次に募集があるかは、まだ分からない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E09",
    "eventId": "edu_course_admission_contract",
    "title": "入学前の最終確認",
    "decision": "修正",
    "body": "志望校から入学を認める通知が届いた。始業までに必要な書類と費用、住まいのことを改めて確かめなければならない。",
    "choices": [
      {
        "letter": "A",
        "label": "条件を満たして入学を確定する",
        "result": "必要な書類と支払いを確認し、学校へ入学の意思を伝えた。学籍が成立したことを知らせる控えを受け取った。",
        "notifications": [
          "書類か支払いに不足が見つかり、学籍の登録はまだ終わらなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "合格は辞退する",
        "result": "許可状を丁寧に畳んだ。手に届いた席を手放すことになったが、受けていた試験の結果は消えない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E10",
    "eventId": "edu_secondary_gap_reentry",
    "title": "遅れた学年への復帰",
    "decision": "修正",
    "body": "学校を離れて何度も季節が過ぎた。以前使っていた教材を持って相談すると、教員はどこまで学んでいたかを一つずつ尋ねた。",
    "choices": [
      {
        "letter": "A",
        "label": "受け入れられる学年からやり直す",
        "result": "前の記録と今の力を確かめてもらい、学校から受入の返事を待つことになった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今は学校外で学び続ける",
        "result": "新しい時間割はもらわなかった。暮らしの合間に少しずつ覚え直せるよう、必要な教材だけ控えた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E11",
    "eventId": "edu_overage_equivalency_review",
    "title": "上級課程へ戻るための資格",
    "decision": "修正",
    "body": "何年も働いた手で、資格の案内を広げた。これまで学んだことを認めてもらう方法があるのか、実施科目と申請条件を確かめようとした。",
    "choices": [
      {
        "letter": "A",
        "label": "認定課程の受講条件を調べる",
        "result": "講習の日程と働く時間を並べ、資格を得るまでの長さを数えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "仕事や家庭での学びを続ける",
        "result": "願書は出さず、手の届く本を一冊買うか借りることにした。今日覚えたことは無駄にはならない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E12",
    "eventId": "edu_no_path_year_close",
    "title": "進路候補がない年の結末",
    "decision": "修正",
    "body": "願書と時刻表を片付ける時期になった。調べた範囲では今年の入学先を決められなかったが、また学ぶ道まで閉ざされたわけではない。",
    "choices": [
      {
        "letter": "A",
        "label": "来年の募集を待ち、生活を立てる",
        "result": "必要な書類を残し、明日からの暮らしを整えた。来年も募集があるか、改めて確かめるつもりでいる。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "学校外の学びを探す",
        "result": "正規の学籍は得られなかったが、読み書きや技術を教えてくれる人を探し始めた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E13",
    "eventId": "edu_route_first_fare",
    "title": "片道の運賃",
    "decision": "修正",
    "body": "一回分の運賃を確かめ、往復の日数を掛けてみた。毎日通うと、学費のほかにも少なくない金と時間が要る。",
    "choices": [
      {
        "letter": "A",
        "label": "定期便を使って通学する",
        "result": "行きと帰りの便を確かめ、通学のために必要な金額を家の支出に書き加えた。",
        "notifications": [
          "運賃まで用意できず、定期の手配を見送った。"
        ]
      },
      {
        "letter": "B",
        "label": "寄宿先を探す",
        "result": "遠い道を毎日往復する代わりに、学校の近くで暮らせる場所がないか尋ねた。",
        "notifications": []
      },
      {
        "letter": "C",
        "label": "今期は断念する",
        "result": "時刻表を折って棚に置き、別の道を探すことにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E14",
    "eventId": "edu_route_weather_closure",
    "title": "雪と雨で塞がれた道",
    "decision": "修正",
    "body": "学校へ向かう便が運休になり、発着所には行き先の消された板が掛かっていた。天気が戻るまでの何日かで済むのか、誰にも分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "別の道と臨時便を調べる",
        "result": "荷を運ぶ人に別の道を尋ね、今も通れる便があるか調べた。",
        "notifications": [
          "運行している別の便が見つかった。遠回りになる分の時間と費用を、もう一度確かめた。",
          "地図には道が残っていても、今使える便は見つからなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "一時的に授業を休み、学校へ連絡する",
        "result": "先生に事情を知らせ、欠席が続く日数を手帳へ記した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E15",
    "eventId": "edu_mobile_city_separation",
    "title": "遠ざかる移動都市",
    "decision": "修正",
    "body": "昨日まで使えた都市間の連絡便が、しばらく止まるという。学校の校舎は残っているが、いつもの時刻にはたどり着けなくなった。",
    "choices": [
      {
        "letter": "A",
        "label": "学校の側に移り住む方法を探す",
        "result": "荷物の量と部屋の空きを数え、学校から離れずに済む住まいを探した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "遠距離通学を中断する",
        "result": "学校へ通えない事情を伝え、届いた課題だけを確かめた。欠席した授業を受けたことにはならない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E16",
    "eventId": "edu_boarding_application",
    "title": "寄宿舎の申込み",
    "decision": "修正",
    "body": "学校から寮の案内が届いた。部屋の広さ、食事代、必要な保証人の欄が並んでいる。申し込めることと、実際に部屋を借りられることは別だった。",
    "choices": [
      {
        "letter": "A",
        "label": "寮へ申し込む",
        "result": "書類を揃えて申し込んだ。部屋が取れるかどうかは、学校からの返事を待つことになった。",
        "notifications": [
          "寮から部屋を用意できるという知らせが届いた。入寮の手続きは、まだ残っている。",
          "寮から満室の知らせが届いた。通うには別の住まいを探す必要がある。"
        ]
      },
      {
        "letter": "B",
        "label": "民間の下宿を探す",
        "result": "寮の一覧から目を離し、学校の近くで部屋を貸している家を調べた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E17",
    "eventId": "edu_boarding_rules_review",
    "title": "寄宿舎の規則と生活費",
    "decision": "修正",
    "body": "寮の管理人は、消灯時刻と外泊の届けを説明した。ここで暮らすなら、家から仕送りが届かない月も考えておかなければならない。",
    "choices": [
      {
        "letter": "A",
        "label": "必要条件を整えて入寮する",
        "result": "必要な書類を届け、決まった寝床へ荷物を運んだ。家を離れて過ごす最初の晩、同じ建物の生活音に耳を澄ませた。",
        "notifications": [
          "書類か負担金が揃わず、入寮の手続きはまだ終わらなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "入寮を取りやめる",
        "result": "鍵を受け取らず、外の家をもう一度探した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E18",
    "eventId": "edu_relative_lodging",
    "title": "親戚の空き部屋",
    "decision": "採用",
    "body": "遠方に暮らす親戚から、しばらくなら空き部屋を使ってよいと便りが来た。返事には、家事の分担についても書いてある。",
    "choices": [
      {
        "letter": "A",
        "label": "条件を相談して世話になる",
        "result": "寝具を運び込み、朝の水汲みと夕食の手伝いを引き受けた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "礼を言って断る",
        "result": "招いてくれたことだけを手紙で伝えた。部屋を借りる話は、そこでいったん終わりにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E19",
    "eventId": "edu_school_relocation_family",
    "title": "家族を残して出るか",
    "decision": "修正",
    "body": "学校のある街へ移るには、衣類だけを持てばよいわけではなかった。家族と離れて暮らす日々のことを考えると、荷造りの手が止まった。",
    "choices": [
      {
        "letter": "A",
        "label": "自分だけ新しい街で暮らす",
        "result": "移動と部屋の契約を済ませて、家族の戸口で荷を担ぎ直した。遠い教室へ通うため、しばらく別の場所で暮らすことになった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "家族と一緒に移ることを相談する",
        "result": "家賃と働き口を書き出して話し合った。皆が移れるかは、まだ決められなかった。",
        "notifications": []
      },
      {
        "letter": "C",
        "label": "今の家に残る",
        "result": "荷をほどき、入学先には進学を見送ると知らせた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E20",
    "eventId": "edu_crossborder_documents",
    "title": "国境の向こうの学校",
    "decision": "修正",
    "body": "遠方の学校へ行くために、途中でどんな身分証明が必要か尋ねた。国境を越える道には、移動を許されるか確かめる場所があるという。",
    "choices": [
      {
        "letter": "A",
        "label": "必要書類を申請する",
        "result": "今使う道で必要と言われた書類を申請し、窓口からの返事を待った。",
        "notifications": [
          "必要な渡航書類の交付を受けた。実際に通学できるか、乗継ぎと費用を改めて確かめた。",
          "必要な許可が下りず、今の道では学校へ向かえなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "国内の候補校を探す",
        "result": "願書をしまい、同じ課程を教える別の学校がないか探した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E21",
    "eventId": "edu_classroom_language_gate",
    "title": "授業の言葉が分からない",
    "decision": "修正",
    "body": "募集の説明には、まだ意味をつかめない言葉があった。授業で話される言葉も、教本の文字も、今の自分にどこまで分かるか心配だった。",
    "choices": [
      {
        "letter": "A",
        "label": "準備講座か言語支援を探す",
        "result": "分からない言葉を紙に書き、ゆっくり話してくれる人を探した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今期の出願を延期する",
        "result": "手続の意味を理解できるようになってから、改めて願書を出すことにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E22",
    "eventId": "edu_commute_daily_fatigue",
    "title": "朝の乗継ぎ",
    "decision": "採用",
    "body": "まだ暗いうちに家を出た。乗り継ぎの待ち時間に教科書を開いたものの、車体が揺れるたびに字を追い直す。教室に着いたころには、すでに半日働いたような疲れがあった。",
    "choices": []
  },
  {
    "reviewId": "E23",
    "eventId": "edu_route_recovered_notice",
    "title": "道が戻った知らせ",
    "decision": "修正",
    "body": "運休していた便が再び走り始めたと聞いた。新しい時刻表には、以前とは違う数字が並んでいる。今の暮らしで使えるかどうかは、改めて確かめなければならない。",
    "choices": [
      {
        "letter": "A",
        "label": "今の暮らしに合うなら再び使う",
        "result": "今の住まいからの往復時間と費用を確かめ、必要なら通学路を組み直すことにした。",
        "notifications": [
          "新しい便で行き帰りができることを確かめ、通学計画を更新した。",
          "便は戻ったが、以前の校舎の授業はまだ再開していなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "知らせだけ受け取る",
        "result": "時刻表を眺めてから、その場を離れた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E24",
    "eventId": "edu_fee_itemization",
    "title": "学費以外の金額",
    "decision": "修正",
    "body": "学校から届いた授業料の案内とは別に、教材と通学、住まいの見積を集めた。今日必要な金と、毎年掛かる金を分けて数えることにした。",
    "choices": [
      {
        "letter": "A",
        "label": "項目ごとに支払先と年度を確かめる",
        "result": "紙の端に印を付け、もう払った金とこれから必要な金を分けた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "負担が大きいため別の学校を探す",
        "result": "同じ課程を受けられる場所がないか、費用の安い候補を探し直した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E25",
    "eventId": "edu_entrance_exam_journey",
    "title": "試験会場までの道",
    "decision": "修正",
    "body": "受験案内に、集合時刻と会場の場所が書かれていた。まだ合否の分からない学校まで行くために、家では旅費を数え直した。",
    "choices": [
      {
        "letter": "A",
        "label": "旅費を用意して受験する",
        "result": "旅費を支払い、試験会場へ向かった。試験を受けられるかどうかは、当日の受付でも確かめることになった。",
        "notifications": [
          "試験会場に着き、受験の受付を済ませた。解答を終えたあとは、結果を知らせる便を待った。",
          "旅費と行き帰りの手段を用意できず、今回は会場へ向かえなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "今回は試験を受けない",
        "result": "受験票を封筒へ戻した。試験の結果欄は空白のまま残した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E26",
    "eventId": "edu_scholarship_application",
    "title": "奨学金の選考",
    "decision": "修正",
    "body": "募集案内に、学費を支える制度が記されていた。申請には本人や世帯の事情を示す書類が必要らしい。",
    "choices": [
      {
        "letter": "A",
        "label": "事情を書いて応募する",
        "result": "条件を確かめて申請書を提出し、選考の返事を待った。",
        "notifications": [
          "支援が認められたという通知を受け取った。決まった額を次の支払いに充てられる。",
          "今回は採択されなかった。予定していた授業料の負担はそのまま残った。"
        ]
      },
      {
        "letter": "B",
        "label": "申請しない",
        "result": "掲示をもう一度読んでから、別の方法で学費を準備することにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E27",
    "eventId": "edu_employer_sponsored_course",
    "title": "雇い主の学資援助",
    "decision": "修正",
    "body": "職場に、仕事に関わる講習の費用を支援する案内が回ってきた。勤務を続ける約束が要るのか、返還の条件があるのか、細かな字まで確かめた。",
    "choices": [
      {
        "letter": "A",
        "label": "勤務条件を確かめて申し込む",
        "result": "支援の条件を尋ね、書類を提出した。講習の受入と援助の決定を待つことになった。",
        "notifications": [
          "援助の条件を記した返事が届いた。受講に必要な費用の一部を、雇い主が負担することになった。",
          "条件が合わず、今回の援助は見送られた。"
        ]
      },
      {
        "letter": "B",
        "label": "拘束のない道を選ぶ",
        "result": "書類を戻し、自分で払える講習を探すことにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E28",
    "eventId": "edu_education_credit_terms",
    "title": "借入金の返済表",
    "decision": "修正",
    "body": "学費の貸付について、返済の期日と支払額が細かく書かれていた。今の納付を助けても、将来の暮らしに負担が残る。",
    "choices": [
      {
        "letter": "A",
        "label": "返済総額を確かめて契約する",
        "result": "返済額と支払先を確かめ、審査に必要な書類を出した。",
        "notifications": [
          "貸付が承認され、決まった授業料の請求に充当された。借りた分の返済はこれから始まる。",
          "貸付の審査は通らず、納付の課題が残った。"
        ]
      },
      {
        "letter": "B",
        "label": "借りずに別の支援を探す",
        "result": "返済表を畳み、先に奨学金や費用の低い課程を調べることにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E29",
    "eventId": "edu_unpaid_commute_cost_review",
    "title": "授業料を払えても通えない",
    "decision": "修正",
    "body": "授業料を払う見通しは立った。それでも通学のための金が足りず、通える日を減らさずに済む方法を考えた。",
    "choices": [
      {
        "letter": "A",
        "label": "通学費への支援を申請する",
        "result": "交通の費用を支える制度があるか尋ね、必要な書類を確かめた。",
        "notifications": [
          "交通費への支援が決まり、今期の往復に掛かる金額を新しく見積もった。",
          "使える支援を見つけられず、別の通い方を考え直した。"
        ]
      },
      {
        "letter": "B",
        "label": "通学をいったん中断する",
        "result": "支払済みの授業料を無駄にしたくはなかったが、通えない日は登校したことにできない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E30",
    "eventId": "edu_household_tuition_discussion",
    "title": "誰が学費を払うか",
    "decision": "修正",
    "body": "食卓に学校の納付書を広げた。家の人は「払えるかどうか」と「払いたいかどうか」を、なかなか同じ言葉では話してくれなかった。",
    "choices": [
      {
        "letter": "A",
        "label": "家族に分担を相談する",
        "result": "話し合いに応じた家族と、負担できる額と時期を紙に書き出した。",
        "notifications": [
          "実際に分担する額と支払先が決まり、必要な書類に署名をもらった。",
          "誰がいつ払えるか決まらず、納付書は食卓に残った。"
        ]
      },
      {
        "letter": "B",
        "label": "自分で資金を貯めてから進む",
        "result": "進学先の欄にしおりを挟み、働ける時期と支払いの期限を考えた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E31",
    "eventId": "edu_study_work_balance",
    "title": "働きながら学ぶ",
    "decision": "修正",
    "body": "働きながら受けられる講習があると聞いた。勤務と授業の時間を並べると、家の用事まで含めて休める時間が少なくなりそうだった。",
    "choices": [
      {
        "letter": "A",
        "label": "勤務を調整して受講する",
        "result": "勤め先と授業の予定を照らし合わせ、実際に通える日を確かめた。",
        "notifications": [
          "勤務先から日程の調整を認められ、講習へ通える日を手帳に書き込んだ。",
          "勤務先の都合で時間を空けられず、受講日は決められなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "受講を見送って働く",
        "result": "教材だけを机に置き、当分は仕事の終わる時間を優先することにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E32",
    "eventId": "edu_admission_document_missing",
    "title": "学籍証明がない",
    "decision": "修正",
    "body": "次の学校に提出するため、前に学んだことを示す記録を探した。必要な書類が手元に見当たらず、どこへ照会すればよいか尋ねた。",
    "choices": [
      {
        "letter": "A",
        "label": "旧校や先生に照会を頼む",
        "result": "以前の担任の名と学校の所在地を書き、記録が残っているか尋ねた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "認定試験を受ける方法を調べる",
        "result": "足りない書類の代わりに何を学び直せばよいのか、募集案内を確かめた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E33",
    "eventId": "edu_institution_specific_exclusion",
    "title": "窓口で止まった願書",
    "decision": "修正",
    "body": "願書を受け取った人は記載を確かめ、しばらく奥の部屋へ消えた。戻ってきたとき、学校の決定は受入を見送るという短いものだった。",
    "choices": [
      {
        "letter": "A",
        "label": "理由と異議申立ての方法を尋ねる",
        "result": "決定を記した文書と、問い合わせ先を求めた。理由が知らされるかどうかは、まだ分からない。",
        "notifications": [
          "学校から受入判断に関する説明を受け、利用できる申立ての方法を確認した。",
          "窓口からは、これ以上の手続きは案内できないと伝えられた。"
        ]
      },
      {
        "letter": "B",
        "label": "別の学校へ出願する",
        "result": "返された願書を持ち帰り、同じ課程を教える場所を探し直した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E34",
    "eventId": "edu_school_confidential_disclosure",
    "title": "誰に病状を話したか",
    "decision": "修正",
    "body": "診察のため授業を休む日のことを、誰に話すか考えた。担任にだけ相談する方法も、学校の担当窓口へ知らせる方法もある。",
    "choices": [
      {
        "letter": "A",
        "label": "担任一人に相談する",
        "result": "先生は話を聞き、ほかの人へ伝えるかは改めて相談することになった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "学校の正式窓口に相談する",
        "result": "担当窓口に必要な事情を伝え、休む日や授業上の配慮について返事を待った。",
        "notifications": []
      },
      {
        "letter": "C",
        "label": "今は話さない",
        "result": "机の上の紙をしまい、誰にも知らせず帰宅した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E35",
    "eventId": "edu_first_day_of_actual_school",
    "title": "初めての席",
    "decision": "採用",
    "body": "教室にはまだ誰も座っていない席があった。自分の名前が書かれた札を見つけ、鞄を机の横へ置く。窓の外では、登校してきた生徒たちの声が重なっていた。",
    "choices": []
  },
  {
    "reviewId": "E36",
    "eventId": "edu_teacher_shortage",
    "title": "先生のいない教室",
    "decision": "修正",
    "body": "黒板には前の授業の日付が残っている。担当の教え手が来られない日が続き、教室では予定した授業がなかなか進まなかった。",
    "choices": [
      {
        "letter": "A",
        "label": "補習のある日だけでも通う",
        "result": "机を並べ直して授業を待った。習えたのは予定の一部だったが、分からないことを尋ねる時間はできた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "ほかの教え手を探す",
        "result": "近所に頼れる人がいないか尋ねて回った。教室の外にも、教えてくれる人はいるかもしれない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E37",
    "eventId": "edu_course_specific_equipment",
    "title": "専門科目の実習室",
    "decision": "採用",
    "body": "実習室の机には測定器と使い込まれた工具が並んでいた。先生は急いで触れないよう注意し、計測の順序を黒板に書いた。数値が少しずつ揃っていくのを見て、ようやく説明の意味が分かった。",
    "choices": []
  },
  {
    "reviewId": "E38",
    "eventId": "edu_school_closed_by_disaster",
    "title": "教室が開かない朝",
    "decision": "修正",
    "body": "学校へ向かう道に人だかりができていた。校舎の一部が使えなくなり、授業再開の日取りもまだ決まらないと聞いた。鞄だけが、いつもどおり肩に掛かっている。",
    "choices": [
      {
        "letter": "A",
        "label": "別の学校への転学を相談する",
        "result": "学籍の記録を受け取り、通える教室が残っていないか尋ねた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "再開まで休学する",
        "result": "学校へ連絡を送り、休学の手続きを相談した。認められた場合も、実際に受けなかった授業は履修に含めない。",
        "notifications": [
          "学校に休学の申請を受け付けてもらった。授業を受けられない間の記録も残すことになった。",
          "学校へ連絡したが、今は休学の申請を受け付ける窓口が見つからなかった。"
        ]
      }
    ]
  },
  {
    "reviewId": "E39",
    "eventId": "edu_teacher_evacuated",
    "title": "避難する担任",
    "decision": "採用",
    "body": "先生は数冊の本を箱に詰め、避難する車に載せていた。「続きはどこかで教えられるといいね」と言って、黒板の文字を消した。",
    "choices": [
      {
        "letter": "A",
        "label": "連絡先を交換して見送る",
        "result": "書き損じの紙に行き先を書いてもらった。いつ会えるかは分からないが、名前だけでも忘れずにいたかった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教室の片付けを手伝う",
        "result": "壊れなかった教材を箱へ詰めた。学校は閉じても、持ち出せる本は残っていた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E40",
    "eventId": "edu_temporary_classroom",
    "title": "仮設の教室",
    "decision": "修正",
    "body": "倉庫を片付けた一角に板を立て掛け、間に合わせの黒板を作った。外からは荷車の音が聞こえるが、先生は出席を取ろうとしている。",
    "choices": [
      {
        "letter": "A",
        "label": "授業として認められるか確かめて参加する",
        "result": "短い時間でも机を囲み、ノートに日付を書いた。授業として認められるかは、記録を照合してから決まる。",
        "notifications": [
          "仮の教室での授業が認められ、出席した時間が在籍校の履修記録に加えられた。",
          "教わった内容は残ったが、この時間は正式な出席とは認められなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "家で教材を読み進める",
        "result": "配られた紙を持ち帰り、分からない問題に印を付けた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E41",
    "eventId": "edu_real_institution_transfer",
    "title": "別の学び舎へ移る",
    "decision": "修正",
    "body": "別の学校から受入の案内が届いた。以前の授業と進み方が違うらしく、持っている履修の記録を見せてほしいという。",
    "choices": [
      {
        "letter": "A",
        "label": "受入先へ学籍を移す",
        "result": "古い学籍の終了と新しい学籍の開始を確かめ、移った先の時間割を受け取った。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "転学を見送る",
        "result": "受入先には辞退を伝えた。元の学校へ戻れるか、別の進路を探すかは、まだ決まっていない。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E42",
    "eventId": "edu_exam_cancelled",
    "title": "試験の延期",
    "decision": "修正",
    "body": "試験を行わないという知らせが届いた。会場へ向かう前の者も、すでに門の前で待っていた者も、改めて予定を考えることになった。",
    "choices": [
      {
        "letter": "A",
        "label": "振替日を申し込む",
        "result": "振替日が決まっているか確認し、必要なら次の申請をすることにした。",
        "notifications": [
          "新しい試験日を知らせる紙を受け取り、受験の予定を立て直した。",
          "代わりの試験日について、まだ案内は出ていなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "今回は受験を取りやめる",
        "result": "受験票を手帳にはさみ、今期の予定を引き直した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E43",
    "eventId": "edu_graduation_record_review",
    "title": "修了の記録を確かめる",
    "decision": "修正",
    "body": "学期の終わり、これまでの出席と評価を学校で照合することになった。休んだ年や別の学校で学んだ月も、同じ一行にはまとめられない。",
    "choices": [
      {
        "letter": "A",
        "label": "実際に履修した記録を照合する",
        "result": "年ごとの授業と試験の記録を出し、修了の条件を満たしたか確かめてもらった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "不足した履修を補う方法を聞く",
        "result": "足りない科目を控え、補習や再履修の方法を尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E44",
    "eventId": "edu_former_teacher_meeting",
    "title": "昔の先生との再会",
    "decision": "修正",
    "body": "道端で見覚えのある声に呼び止められた。昔の先生は、今もノートを取っているのかと尋ねた。何年も前の教室の窓の明るさを、ふと思い出した。",
    "choices": [
      {
        "letter": "A",
        "label": "学校を出てからの暮らしを話す",
        "result": "仕事や家族の話をすると、先生は何度も頷いて聞いてくれた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "短く挨拶して別れる",
        "result": "頭を下げて歩き出した。別れ際、先生が昔と同じように手を振った。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E45",
    "eventId": "edu_child_guardian_disagreement",
    "title": "学校へ行きたいと言う子",
    "decision": "修正",
    "body": "学校の話になると家の空気が重くなった。行ってみたいと告げたが、家の人は仕事や家計のことばかり気にしている。",
    "choices": [
      {
        "letter": "A",
        "label": "自分の希望をもう一度話す",
        "result": "何を学びたいのか、できるだけ自分の言葉で話した。家の人の答えが変わるかは分からない。",
        "notifications": [
          "家の人は募集案内を開き直し、学校へ相談することにした。",
          "家の人の返事は変わらず、今回の入学の話は先へ進まなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "家の手伝いを続ける",
        "result": "言いたいことを飲み込んで、明日の用事を確かめた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E46",
    "eventId": "edu_sibling_school_cost_conflict",
    "title": "きょうだいの二枚の納付書",
    "decision": "修正",
    "body": "家の机には、きょうだいの納付書が二枚並んでいた。どちらも同じ時期に金が要る。家族は黙ったまま、今年の働き口の見通しを話し始めた。",
    "choices": [
      {
        "letter": "A",
        "label": "費用を分けられる支援を探す",
        "result": "それぞれの学校に、使える支援と申請期限を尋ねた。返事は子どもごとの請求に分けて控えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "支払う順序を家族と相談する",
        "result": "誰か一人の希望だけで決めぬよう、何度も話し合った。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E47",
    "eventId": "edu_roving_teacher_visit",
    "title": "巡回する教師",
    "decision": "採用",
    "body": "隊商と一緒に来た人が、集会所の隅へ古い本を並べた。数日だけ文字と計算を教えてくれるという。",
    "choices": [
      {
        "letter": "A",
        "label": "通える日だけでも教わる",
        "result": "紙を大事に使いながら、分からなかった字を一つずつ教わった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教材を借りて自分で読む",
        "result": "返す日を約束し、薄い本を鞄に入れた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E48",
    "eventId": "edu_community_tent_learning",
    "title": "天幕の小さな授業",
    "decision": "採用",
    "body": "風を防ぐために布を二重に張り、倒れかけた木箱を机にした。板切れの上の文字を、子どもたちは交替で指差して読んでいる。",
    "choices": [
      {
        "letter": "A",
        "label": "読み書きと計算を教わる",
        "result": "使い慣れない筆記具を握り、昨日より少し長い文を書けるようになった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教材や場所の準備を手伝う",
        "result": "雨が入らないよう布を結び直し、明日の授業に使う板を拭いた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E49",
    "eventId": "edu_apprentice_literacy_exchange",
    "title": "工房の帳面",
    "decision": "採用",
    "body": "工房の親方は仕事のあとで帳面を開き、材料の数え方を教えてくれた。手を動かすだけでは済まない仕事が、思ったより多い。",
    "choices": [
      {
        "letter": "A",
        "label": "仕事と一緒に帳面の読み方を習う",
        "result": "道具を片付けてから机へ戻り、使った材料の数を自分で書いた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今日は実技に集中する",
        "result": "材料の扱いを繰り返し、次に使う道具を覚えた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E50",
    "eventId": "edu_correspondence_lessons",
    "title": "届く教材",
    "decision": "採用",
    "body": "何週間も前に申し込んだ教材がようやく届いた。封筒の角は傷んでいたが、中の問題用紙はまだ読める。",
    "choices": [
      {
        "letter": "A",
        "label": "解答を送り返して添削を受ける",
        "result": "消し跡の残る紙を畳み、次の便に託した。返事がいつ来るかは分からない。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "手元の教材で学ぶ",
        "result": "答えをすぐ確かめられなくても、今日は一問ずつ進めることにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E51",
    "eventId": "edu_religious_school_nonformal",
    "title": "礼拝の後の教え",
    "decision": "採用",
    "body": "集会が終わって人の気配が薄れると、年長者が古い本を机へ置いた。文字を教える時間と、教義を聞く時間は分けてあるという。",
    "choices": [
      {
        "letter": "A",
        "label": "読み書きの時間に参加する",
        "result": "字の形を真似し、読めなかった名前を少しずつ覚えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教えの由来を尋ねる",
        "result": "本の余白を示しながら、知らない土地の昔話を聞いた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E52",
    "eventId": "edu_clan_knowledge_transmission",
    "title": "地図に載らない道",
    "decision": "採用",
    "body": "年長者は小さな沢の前で足を止め、土の乾き方と風向きを確かめた。帰り道が分からなくなったとき、地図より先に見るものがあるという。",
    "choices": [
      {
        "letter": "A",
        "label": "見分け方を教わる",
        "result": "同じ景色を何度も見比べ、危ない場所と水のある場所を覚えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "話を記録して残す",
        "result": "語られた地名と道の印を覚え、後で家族へ伝えた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E53",
    "eventId": "edu_adult_evening_literacy",
    "title": "働いたあとの教室",
    "decision": "修正",
    "body": "仕事帰りに灯りのついた部屋をのぞくと、机の上に短い文章が並んでいた。初めて来た人のために、先生は鉛筆を一本残してくれていた。",
    "choices": [
      {
        "letter": "A",
        "label": "夜学に申し込む",
        "result": "申込みを済ませ、次の週も通えるか仕事の予定を確かめた。受講した日は、使った言葉と教材を記録することにした。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "見学だけして帰る",
        "result": "学びたい科目と授業の日を控え、今日は帰ることにした。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E54",
    "eventId": "edu_informal_skill_assessment",
    "title": "学校外で学んだ証し",
    "decision": "修正",
    "body": "これまでに覚えた仕事や読み書きの内容を書き出した。学校の外で身につけた腕を、どの資格なら審査してもらえるのか確かめる必要があった。",
    "choices": [
      {
        "letter": "A",
        "label": "技能試験か補習を受ける",
        "result": "認定機関に申請し、実技と筆記が必要なら日程を確かめた。結果が出るまでは、正式な資格には記載しない。",
        "notifications": [
          "審査で認められた範囲の技能について、正式な証明を受け取った。",
          "今回は認定の条件に届かなかった。身につけた技術そのものは失われない。"
        ]
      },
      {
        "letter": "B",
        "label": "資格を申請せず仕事に生かす",
        "result": "書類をしまい、今日の仕事に使う道具を整えた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E55",
    "eventId": "edu_dependent_future_school_consult",
    "title": "子どもの進学先を尋ねる",
    "decision": "修正",
    "body": "子どもが遠方の学校の話を持ち帰ってきた。どこまで確かな案内なのか、本人も分からないところがあるらしい。",
    "choices": [
      {
        "letter": "A",
        "label": "本人と費用や通い方を調べる",
        "result": "子どもが聞いてきた地名と日程を書き出し、家から通う方法と費用を一緒に確かめた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "別の学び方も一緒に考える",
        "result": "近くで教わる方法と、遠くへ出る方法の両方を紙に書いた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E56",
    "eventId": "edu_region_yan_public_study",
    "title": "炎国：書院の門前",
    "decision": "採用",
    "body": "書院の門前に、今期の講義と選抜試験の案内が貼られていた。雨除けの下で書き写す人々は、皆同じ試験を目指しているわけでもないらしい。",
    "choices": [
      {
        "letter": "A",
        "label": "受講できる講義を尋ねる",
        "result": "係の人から科目と入門の条件を教わり、見学できる日を書き留めた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "門前の書物売りに教本を尋ねる",
        "result": "入門向けの薄い本を何冊か見せてもらい、読みやすい一冊を選んだ。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E57",
    "eventId": "edu_region_lungmen_registered_district",
    "title": "龍門：見える校門、届かない窓口",
    "decision": "保留",
    "body": "通りの向こうに、子どもたちが入っていく校門が見えた。受付では書類のことを尋ねられ、今の住まいで用意できるか確かめる必要があった。",
    "choices": [
      {
        "letter": "A",
        "label": "必要な登録を調べる",
        "result": "実際に提出が求められる書類と受付期限を確かめ、用意できるものを分けて控えた。",
        "notifications": [
          "受入に必要な書類を揃え、学校へ提出した。審査の返事はまだ届いていない。",
          "提出できる書類が足りず、この学校への申請はまだ終わらなかった。"
        ]
      },
      {
        "letter": "B",
        "label": "別の受入校を探す",
        "result": "人の流れを離れ、校区外からでも相談できる学校を尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E58",
    "eventId": "edu_region_victoria_disrupted_college",
    "title": "ヴィクトリア：戻らない講義室",
    "decision": "修正",
    "body": "大学の回廊には、授業を休む知らせと再開する知らせが日付を変えて貼られていた。使える教室がいくつ残るのか、学生たちは案内の前で立ち止まっていた。",
    "choices": [
      {
        "letter": "A",
        "label": "再開した科目を確かめる",
        "result": "事務室の前で名簿を確かめ、受けられる講義だけを書き出した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教室の整備を手伝う",
        "result": "埃を払った机を運び込み、授業に戻る人々の通り道を空けた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E59",
    "eventId": "edu_region_ursus_class_and_school",
    "title": "ウルサス：異なる二つの制服",
    "decision": "保留",
    "body": "雪の残る通りを、別々の学校の生徒が通り過ぎた。制服の違いは目についたが、入学の条件は学校に尋ねてみなければ分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "入学資格と学費の違いを調べる",
        "result": "両方の募集要項を並べ、家の条件で受験できる学校に印を付けた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "通える学校を先に確かめる",
        "result": "近いほうの学校へ出向き、必要な書類を尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E60",
    "eventId": "edu_region_laterano_monastery_track",
    "title": "ラテラーノ：修道院の教室",
    "decision": "保留",
    "body": "集会が終わると、修道院の一角で書物を広げる人々がいた。どんな人が学べるのか、正式な課程が設けられているのかは、まだ聞いていない。",
    "choices": [
      {
        "letter": "A",
        "label": "基礎の授業を受けられるか相談する",
        "result": "担当者は年齢と住まいを尋ね、参加できる時間を教えてくれた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "専門課程の条件を確かめる",
        "result": "分厚い教本と履修条件を見せてもらった。今すぐ始められるかは別の審査になるという。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E61",
    "eventId": "edu_region_kazimierz_sponsor_training",
    "title": "カジミエーシュ：競技学校の広告",
    "decision": "修正",
    "body": "訓練場の外に、競技騎士の姿を刷った募集看板が立っていた。必要な用具と講習の費用が書かれ、支援が受けられるかどうかは別の欄に記されていた。",
    "choices": [
      {
        "letter": "A",
        "label": "訓練課程の費用と選考を尋ねる",
        "result": "看板の華やかさとは別に、必要な装備と実技の条件を聞いた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "ほかの学び方を探す",
        "result": "その学校の受講は見送り、今の暮らしに合う講習や学び場を探すことにした。",
        "notifications": [
          "別の学び方を探す"
        ]
      }
    ]
  },
  {
    "reviewId": "E62",
    "eventId": "edu_region_columbia_corporate_scholarship",
    "title": "クルビア：企業の学資募集",
    "decision": "修正",
    "body": "大学の掲示板に、企業が費用を支援する講習・研究課程の案内が貼られていた。支援額だけでなく、応募資格と返還の条件も読まなければならない。",
    "choices": [
      {
        "letter": "A",
        "label": "条件を読み、応募を検討する",
        "result": "支援額だけでなく、守らなければならない約束も書き写した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "条件の付かない支援を探す",
        "result": "掲示板を離れ、別の学校や奨学金の一覧を見た。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E63",
    "eventId": "edu_region_higashi_dojo_learning",
    "title": "極東：道場の稽古札",
    "decision": "修正",
    "body": "道場の戸口に、稽古の時間が書かれていた。教え手が、初めてなら見学してもよいと声を掛けてきた。",
    "choices": [
      {
        "letter": "A",
        "label": "教わる内容を確かめる",
        "result": "仕事や学校と重ならない時間を尋ね、続けて通えるか考えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "師範に一度教えを請う",
        "result": "床を拭いてから稽古に混ざり、基本の姿勢を何度も直してもらった。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E64",
    "eventId": "edu_region_iberia_closed_library",
    "title": "イベリア：閉ざされた書庫の鍵",
    "decision": "修正",
    "body": "潮の匂いが残る建物の扉には、かつての授業時間が彫られていた。中の本を使えるのか、今も教え手がいるのかは、外から見ただけでは分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "資料の閲覧を許されるか尋ねる",
        "result": "管理する人に声を掛け、使ってよい棚と触れてはいけない箱を確かめた。",
        "notifications": [
          "閲覧を許された棚を案内され、使える本の目録を受け取った。",
          "書庫はまだ公開されていないと告げられた。"
        ]
      },
      {
        "letter": "B",
        "label": "ほかの教え手を探す",
        "result": "書庫を離れ、町で勉強を教えてくれる人がいないか尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E65",
    "eventId": "edu_region_siracusa_professional_school",
    "title": "シラクーザ：医学校の募集",
    "decision": "保留",
    "body": "石畳の広場に、医療や衛生を学ぶ講座の案内が貼られていた。どこまで学べるのか、実習に進む条件があるのか、文字を追っただけでは分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "基礎課程の受験資格を尋ねる",
        "result": "学歴と実習先の欄を読み、どこから始められるか確かめた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "まず医療補助の仕事や講習を探す",
        "result": "長い課程に進む前に、今できる仕事がないか調べた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E66",
    "eventId": "edu_region_sargon_reform_school",
    "title": "サルゴン：新しい学科の看板",
    "decision": "保留",
    "body": "市場の通りに、新しい講座の案内が貼られた。地元で学んできた方法に加え、遠い土地の教材も使うという。立ち止まって内容を聞く人が何人もいた。",
    "choices": [
      {
        "letter": "A",
        "label": "受講できる科目を確かめる",
        "result": "案内役から内容を聞き、今まで習ってきたことと照らし合わせた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "身近な教え手にも話を聞く",
        "result": "新しい講座のことを、以前から頼っている年長者に話してみた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E67",
    "eventId": "edu_region_kazdel_school_rebuild",
    "title": "カズデル：焼けた学校の屋根",
    "decision": "修正",
    "body": "崩れた壁の上に新しい梁が渡され、雨の入らない部屋が一つできた。通りかかった人々が入口から中をのぞいていたが、授業が始まるかどうかはまだ分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "教室の再開時期を尋ねる",
        "result": "先生を集められるか、机をいくつ用意できるか、責任者に話を聞いた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "教材の運び込みを手伝う",
        "result": "傷んだ机を外へ運び、本の残った箱を乾いた床へ並べた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E68",
    "eventId": "edu_region_sami_clan_or_school",
    "title": "サーミ：ふたつの学びの場所",
    "decision": "修正",
    "body": "旅を共にする年長者は、雪の下の足跡の見分け方を教えてくれた。交易所の近くに文字を教える部屋があるとも聞いたが、確かなことはまだ分からない。",
    "choices": [
      {
        "letter": "A",
        "label": "氏族の人から土地の知識を教わる",
        "result": "雪の硬さを手で確かめ、歩いてよい場所を覚えた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "交易所の学び舎について調べる",
        "result": "次に交易所へ行ける日を聞き、実際に教室が開いているか尋ねることにした。",
        "notifications": [
          "交易所では、今はそのような教室の案内を得られなかった。"
        ]
      }
    ]
  },
  {
    "reviewId": "E69",
    "eventId": "edu_region_leithanien_arts_selectivity",
    "title": "リターニア：学院の実技室",
    "decision": "修正",
    "body": "学院の案内板に、実技試験の課題と募集条件が書かれていた。扉の向こうから繰り返す旋律が聞こえるが、自分がどの授業に入れるかはまだ決まっていない。",
    "choices": [
      {
        "letter": "A",
        "label": "実技の課題を確かめて準備する",
        "result": "難しい譜面の読み方を教わり、足りない技術をひとつずつ書き出した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "一般課程や別の専攻を探す",
        "result": "別の教室の案内も読み、今の自分が学べる科目に印を付けた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E70",
    "eventId": "edu_region_kjerag_mountain_and_school",
    "title": "イェラグ：山越えの入学案内",
    "decision": "採用",
    "body": "谷の向こうの学校から入学案内が届いた。晴れた日なら道は見えるが、雪の季節には峠を越えられないと家の人は言う。",
    "choices": [
      {
        "letter": "A",
        "label": "季節ごとの通学路を調べる",
        "result": "山を越す便の運行時期を尋ね、授業が途切れる月を書き出した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "近くで教えてくれる人を探す",
        "result": "家族や信仰の場に頼り、学べる科目がないか尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E71",
    "eventId": "edu_region_rim_mining_training",
    "title": "レム・ビリトン：鉱区の安全講習",
    "decision": "採用",
    "body": "鉱区の集会所に、機械の整備と避難手順を教える講習の日程が貼られていた。机には工具の図と、事故が起きた時の連絡順序が並んでいる。",
    "choices": [
      {
        "letter": "A",
        "label": "安全講習を受ける",
        "result": "繰り返し手順を確かめ、危険な兆候を見分ける練習をした。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "正式な職業課程の案内も調べる",
        "result": "修了を証明できる課程があるか、運営元に尋ねた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E72",
    "eventId": "edu_region_bolivar_school_under_conflict",
    "title": "ボリバル：使われなくなった校庭",
    "decision": "採用",
    "body": "校庭に子どもの姿はなく、雨の後の水たまりが残っていた。先生たちの行き先はばらばらで、学校の再開日も決まっていない。",
    "choices": [
      {
        "letter": "A",
        "label": "仮の授業があるか探す",
        "result": "家々を回り、子どもを集めて教えている人がいないか尋ねた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "学校の再開を手伝う",
        "result": "使える机を運び出し、教室の雨漏りを確かめた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E73",
    "eventId": "edu_region_siesta_school_transition",
    "title": "シエスタ：新しい街の教室",
    "decision": "保留",
    "body": "旧市街の教室の前に、今後の授業について知らせる紙が貼られていた。移転先が決まっているのか、次の学期に同じ先生がいるのか、誰もまだ詳しいことを知らない。",
    "choices": [
      {
        "letter": "A",
        "label": "転学先と再開日を確かめる",
        "result": "分かっている移転予定と授業開始時期を書き留めた。まだ決まっていない欄には何も書き足さなかった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "残る教材を片付ける",
        "result": "箱に教科書を詰め、運び出せるものに札を付けた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E74",
    "eventId": "edu_region_minos_learning_and_debate",
    "title": "ミノス：広場の問いかけ",
    "decision": "採用",
    "body": "列柱のある広場で、若い学徒が古い英雄譚の意味を問い直していた。年長の語り手は答えを急がず、まず何を知っているのか尋ねた。",
    "choices": [
      {
        "letter": "A",
        "label": "話に加わり、自分の考えを述べる",
        "result": "聞いたことのある伝承を引き合いに出すと、別の解釈が返ってきた。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "黙って聞き、後で調べる",
        "result": "日が傾くまで議論を聞き、知らない名前を手帳に書き留めた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E75",
    "eventId": "edu_ursus_school_displacement_memory",
    "title": "教室にいた日の記憶",
    "decision": "採用",
    "body": "昔の学校がどうなったのかを知らせる便りが来た。あのとき教室で聞いた物音や、隣に座っていた友人の顔が、紙の文字を読むうちに浮かんできた。",
    "choices": [
      {
        "letter": "A",
        "label": "当時の友人へ連絡を取る",
        "result": "覚えている名前を頼りに便りを出した。返事が来るかは分からなくても、どこかで暮らしていてほしかった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "その日の記録を残す",
        "result": "見たことと聞いたことを分けて書いた。年月が過ぎても、確かに自分がいた場所のことだった。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E76",
    "eventId": "edu_ursus_school_bystander_memory",
    "title": "同じ日に街にいた人",
    "decision": "修正",
    "body": "あの日の通りの様子を話す人がいた。学校の方から逃げてきた子どもたちの姿を、自分も見たことを思い出した。教室の中で何が起きたかまでは知らない。",
    "choices": [
      {
        "letter": "A",
        "label": "知っている範囲の話を伝える",
        "result": "自分がいた場所と、実際に見たことだけを伝えた。知らない教室の出来事については語らなかった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "話すことを控える",
        "result": "相手の話を聞いたまま、その日は何も付け足さなかった。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E77",
    "eventId": "edu_student_public_meeting_distinction",
    "title": "学生の集まりを見かける",
    "decision": "採用",
    "body": "広場の端に、人の輪ができていた。学校のことを話す声もあれば、働き口や街の暮らしを訴える声も聞こえる。",
    "choices": [
      {
        "letter": "A",
        "label": "話を聞いて帰る",
        "result": "輪の外から議論を聞き、何を求めて集まったのかを知った。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "自分の考えを話す",
        "result": "一度だけ輪の中で口を開いた。賛同する人も、反論する人もいた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E78",
    "eventId": "edu_school_peer_exclusion_route",
    "title": "教室に残る空席",
    "decision": "修正",
    "body": "教室で机を動かす音がして、隣の席が空いた。こちらを見てひそひそ話す声は聞こえたが、何を言っているのかまでは分からなかった。",
    "choices": [
      {
        "letter": "A",
        "label": "理由を尋ねる",
        "result": "どうして席を離れたのか尋ねた。相手は言葉を濁し、はっきりした理由は聞けなかった。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "信頼できる人に相談する",
        "result": "放課後、先生か知人のもとへ行き、今日起きたことを話した。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E79",
    "eventId": "edu_safety_for_disabled_student",
    "title": "階段の先の教室",
    "decision": "修正",
    "body": "授業を受ける部屋までの道に、自分には使いづらい場所があった。別の入口を通れるのか、教室を変えてもらえるのか、学校へ相談しようと考えた。",
    "choices": [
      {
        "letter": "A",
        "label": "通れる経路と設備の変更を相談する",
        "result": "学校の人と一緒に通れる経路を確かめ、使える教室や補助の方法を探した。",
        "notifications": [
          "授業を受けられる経路か設備が確保され、学校から利用方法を教わった。",
          "この校舎では今使える設備が見つからず、ほかの教室や支援を探すことになった。"
        ]
      },
      {
        "letter": "B",
        "label": "別の校舎・課程を探す",
        "result": "同じ内容を学べる場所がないか、もう一度案内を調べた。",
        "notifications": []
      }
    ]
  },
  {
    "reviewId": "E80",
    "eventId": "edu_later_life_retraining_after_displacement",
    "title": "大人になってからの机",
    "decision": "採用",
    "body": "久しぶりに机へ向かうと、鉛筆の握り方までよそよそしく感じた。前の仕事で覚えたことを、今度は別の暮らしに役立てられるかもしれない。",
    "choices": [
      {
        "letter": "A",
        "label": "仕事に結び付く講習を探す",
        "result": "募集の条件と授業の時間を確かめ、今の生活で通える場所を探した。",
        "notifications": []
      },
      {
        "letter": "B",
        "label": "今までの経験を書き出して学び直す",
        "result": "覚えている手順を紙に書き、知らない部分に印を付けた。",
        "notifications": []
      }
    ]
  }
];
  $terraData.EVENT_EFFECT_TYPES.string.push("educationMigrationAction");
  $terraData.EVENT_FIELD_META.educationMigrationAction={
    status:"S",valueType:"string",unit:"P17イベント・選択の操作識別子",
    meaning:"本人が選択した新イベントをP05-P12の実記録へ接続する",
    assumption:"S"
  };
  const activated=new Set(["E34","E35","E41","E43","E47","E48","E49","E50","E51","E52","E53","E54"]);
  window.TERRA_EDUCATION_P17_REVIEWED=reviewed;
  for(const entry of reviewed){
    if(!activated.has(entry.reviewId)||entry.decision==="保留")continue;
    const event={
      id:entry.eventId,conf:"S",
      references:["SRC_EDUCATION_ACCESS"],
      st:["児童","少年","青年","壮年","老年"],
      cd:2,w:0.6,
      show:s=>educationMigrationEligible(s,entry.eventId),
      t:entry.body
    };
    if(!entry.choices.length){
      event.fx={educationMigrationAction:entry.reviewId+":solo"};
    }else{
      event.c=entry.choices.map(choice=>
        $terraData.K(choice.label,{
          en:s=>educationMigrationEligible(s,entry.eventId,choice.letter),
          why:"対象となる本人の学籍・講師・学習条件が現在の記録と一致しない"
        },[1,choice.result,{
          educationMigrationAction:entry.reviewId+":"+choice.letter
        }]));
    }
    $terraData.EV.push(event);
  }
};
