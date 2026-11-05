// base/career-entry: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("base/career-entry", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.EVENT_EFFECT_TYPES.object.push("employmentAction");
  $terraData.EVENT_FIELD_META.employmentAction = {
    unit: "求人・就業案件への本人の意思決定",
    meaning: "実在する求人枠、資格、本人の承諾から採用案件と実勤務期間を開始・終了する。職業IDのみでは雇用しない",
    status: "S",
    valueType: "object"
  };
  $terraData.EV.push(
    {
      id: "car",
      show: s => !educationSchoolOrDecision(s) && (s.job === 0 || s.job == null) && !s.fl?.frontier_contract && !s.fl?.rhodes_landship,
      conf: "S",
      references: [
        "SRC_INDUSTRIAL_LIFE",
        "SRC_URSUS_INFECTED",
        "SRC_URSUS_EP16",
        "SRC_RIM_WORK",
        "SRC_LEONHARDT_ARCHIVE",
        "SRC_CATASTROPHE_TRANSPORTER_OFFICIAL",
        "SRC_PENGUIN_LOGISTICS_CB1",
        "SRC_COURIER_LOGISTICS_RECORD",
        "SRC_TRANSPORTER_LIFE_MODEL",
        "SRC_TERRA_INDUSTRY_POLICY",
        "SRC_SARGON_WD1_WD5",
        "SRC_SARGON_CONTRACT_LIFE_MODEL"
      ],
      ge: { age: 17 },
      le: { age: 21 },
      pri: true,
      once: true,
      t: [
        {
          when: "感染診断済",
          t: "鉱石病の診断を受けてから、働き口を探すたび通院の日取りと薬代が先に頭をよぎるようになった。街角の求人板の前で足を止め、診療所の開く日と勤務が重ならないか指でたどった。"
        },
        {
          t: "街角の求人板や顔見知りから、働き口や見習いの話がいくつか舞い込んだ。通える距離と手元の路銀を比べながら、どの話に身を預けるか思案した。"
        }
      ],
      c: [
        $terraData.K(
          "軍務に志願する",
          { show: { "any": ["国:ウルサス", "国:ヴィクトリア"] } },
          [
            0.6,
            "補助部隊に採用され、泥にまみれる訓練と哨戒任務の日々が始まった。給金は決まった日に出たが、故郷の土を踏める休暇はほとんどなかった。",
            { job: 14, fl: { veteran: 1 }, h: -8, cr: 7, p: -1, payBonus: 0.05 }
          ],
          [
            1,
            "初陣で深い傷を負い、隊に留まれなくなった。野戦病院を出て除隊となったものの、痛む体では元の暮らしにもすぐには戻れなかった。",
            { job: 0, fl: { veteran: 1, trauma_war: 1 }, h: -30, p: -10, cr: -5 }
          ]
        ),
        $terraData.K(
          "傭兵団に加わる",
          { show: { need: ["国:カズデル"] } },
          [
            0.6,
            "短期契約の前金を懐に収め、荒野の見張り任務に就いた。手渡された報酬で当座の暮らしは息をついた。仕事が明けたあとも、武具の手入れをしながら次の依頼を待つ暮らしに入った。",
            { employmentAction: { action: "complete-gig", kind: "short-sentry", sourceEventId: "car", nominalCash: 120000 }, fl: { veteran: 1 }, h: -14, cr: -3, p: -2, cash: 120000 }
          ],
          [
            1,
            "最初の任務で深手を負い、契約は途中で打ち切られた。買い揃えた装備や路銀も回収できないまま、傷を抱えて戦場を離れた。",
            { job: 0, fl: { veteran: 1 }, h: -30, p: -10, cash: -80000 }
          ]
        ),
        $terraData.K(
          "アーツ学院を目指す",
          {
            show: {
              any: ["国:リターニア", "国:クルビア", "国:炎国"],
              ban: ["voc", "voc_enrolled", "uni_enrolled"]
            },
            en: { ge: { ar: 40, cash: 3e5 } },
            why: "学院が求めるアーツの適性か、入学金30万龍門幣が足りない"
          },
          [
            0.7,
            "学院の選抜を通り、入学金と当面の学費として30万龍門幣を納めた。真新しい教本と杖を手に取り、アーツの訓練が始まった。",
            { ar: 15, ep: 8, k: 4, cr: 8, cash: -3e5, fl: { arts_enrolled: 1, voc_enrolled: 1 }, study: "voc_start" }
          ],
          [
            1,
            "実技と筆記に挑んだが、合格者の貼り紙に自分の番号はなかった。旅費と受験料の3万龍門幣だけが消え、重い足取りで別の働き口を探し始めた。",
            { p: -8, cash: -3e4 }
          ]
        ),
        $terraData.K("工場労働者として働く", { show: s => !!employmentOpeningForChoice(s, 2) }, [
          1,
          "製造工場の働き口を得た。交代のベルが鳴り響くたび、機械油で黒ずんだ手を布で拭い、熱気のこもる持ち場へと向かった。",
          { employmentAction: { action: "accept-local-opening", jobId: 2 } }
        ]),
        $terraData.K(
          "ウルサスの鉱山で働く",
          { show: { need: ["国:ウルサス"], or: [{ ban: ["感染診断済"] }, { need: ["隠蔽"] }] }, en: s => !!employmentOpeningForChoice(s, 3), why: "この地域では採掘班の募集を確認できない" },
          [
            1,
            "軍需を支える鉱山の募集に応じ、採掘班に組み込まれた。渡された防塵具だけで坑道の黒い粉塵をしのげるのか、確かめる術もないまま暗い坑口へ入った。",
            { employmentAction: { action: "accept-local-opening", jobId: 3 }, fl: { workplace_hazard: 1 } }
          ]
        ),
        $terraData.K(
          "トランスポーターの仕事を請ける",
          { show: { any: ["国:龍門", "国:クルビア", "国:ヴィクトリア", "国:シラクーザ", "国:ボリバル", "国:レム・ビリトン"] } },
          [
            1,
            "荷札の宛先を確かめ、鞄を肩に食い込ませて街区から街区へ荷物や書状を運んだ。抜け道を覚えるほど足は速くなったが、夜更けの急な呼び出しも増えていった。",
            {
              job: 16,
              cr: 2,
              rl: 2,
              lifeAffiliation: {
                id: "terra-general-transporter",
                title: "トランスポーターとしての仕事",
                kind: "occupation",
                action: "join",
                role: "荷物・書状の個人配達",
                note: "一つの地域で本人が請けた仕事。各地共通の雇用制度や契約条件は未確認"
              },
              lifeGoal: {
                id: "transporter-work",
                title: "トランスポーターとして仕事を続ける",
                priority: "生計と安全",
                action: "start"
              },
              lifeSkill: {
                id: "transporter-route-work",
                title: "荷札の照合と街区間の配達",
                delta: 1,
                context: "トランスポーターの仕事を始めた"
              }
            }
          ]
        ),
        $terraData.K(
          "山間の集落へ荷を運ぶ便に応募する",
          { show: { need: ["国:イェラグ"] } },
          [
            0.65,
            "雪深い山道の集落へ荷を届ける仕事に採用された。荷札の村名を確かめ、受け入れが決まった集落の戸口へ日用品や手紙を背負い上げる。雪崩やぬかるみで道が荒れるたび、歩を進める予定はその場で変わっていった。",
            {
              job: 16,
              cr: 2,
              h: -2,
              lifeAffiliation: {
                id: "kjerag-village-transporter",
                title: "イェラグの集落を結ぶ荷運び",
                kind: "individual-career",
                action: "join",
                role: "受け入れが決まった荷受け場所への配達",
                note: "クーリエの個人物流構想を参照した架空の仕事。全域の路線網や各集落の参加を示さない"
              },
              lifeGoal: {
                id: "kjerag-transporter-route",
                title: "山道の荷運びを続ける",
                priority: "生計と安全",
                action: "start"
              },
              lifeSkill: {
                id: "kjerag-route-logistics",
                title: "山道の荷受けと受け渡し",
                delta: 2,
                context: "イェラグの山間集落へ荷を運び始めた"
              }
            }
          ],
          [
            1,
            "集落間の便はまだ話がまとまっておらず、人手は要らないと断られた。山風の中で踵を返し、しばらくは別の働き口を探すことにした。",
            { p: -2 }
          ]
        ),
        $terraData.K("飲食店や宿の仕事を探す", { show: s => !!employmentOpeningForChoice(s, 17) }, [
          1,
          "湯気と脂の匂いが満ちる食堂で、皿洗いと配膳を任された。旅慣れた客の雑談から遠い土地の噂を聞く一方、混み合う夜は自分の賄いをかき込む暇もなかった。",
          { employmentAction: { action: "accept-local-opening", jobId: 17 }, rl: 3 }
        ]),
        $terraData.K(
          "修理工房で技術を習う",
          { show: s => ["クルビア", "ヴィクトリア", "龍門", "レム・ビリトン", "炎国"].includes(s.res?.n) && !!employmentOpeningForChoice(s, 18) },
          [
            0.8,
            "鉄と機械油の匂う工房で、工具の呼び名と部品の型から叩き込まれた。見習いの給金はわずかだったが、壊れた装置が息を吹き返す感触が指先に残った。",
            { employmentAction: { action: "accept-local-opening", jobId: 18 }, k: 3, cr: 2 }
          ],
          [1, "自前の工具代も親方への紹介状も揃わず、見習いの枠は別の若者に埋まった。", { p: -2 }]
        ),
        $terraData.K(
          "医療補助や薬局の手伝いをする",
          { show: s => s.k >= 15 && literacyValue(s) >= 28 && !!employmentOpeningForChoice(s, 20) },
          [
            0.75,
            "消毒薬の匂う棚で薬瓶の数を揃え、青い顔をした患者を診察室へ案内した。病を治す知識はなくても、長い順番を待つ人の不安な声に耳を傾ける時間はあった。",
            { employmentAction: { action: "accept-local-opening", jobId: 20 }, k: 2, rl: 3 }
          ],
          [1, "読み書きのできる応募者が多く、薬局の働き口は経験のある人に決まった。", { p: -2 }]
        ),
        $terraData.K(
          "事務・記録の仕事を探す",
          { show: s => s.k >= 20 && literacyValue(s) >= 40 && !!employmentOpeningForChoice(s, 21) },
          [
            0.8,
            "インクの匂う机で帳簿を書き写し、窓口を訪れた人の事情を取り次いだ。自分が整える一行の数字が、誰かの住まいや暮らしを左右するのだと肌で知った。",
            { employmentAction: { action: "accept-local-opening", jobId: 21 }, k: 3, cr: 3 }
          ],
          [1, "実務の経験がないことを理由に断られ、採用には至らなかった。", { p: -2 }]
        ),
        $terraData.K(
          "応募・移動費 {colTechApplicationCost} を払って、クルビアの研究企業の技師職に挑む",
          {
            show: { need: ["国:クルビア"], ge: { k: 30, literacy: 35 } },
            en: (s, T) =>
              careerOpeningAssessment(s, { role: "technical" }).canApply &&
              ok({ affordableCashAfterReserve: 5e4 }, s, T),
            why: "実務経験か学校課程の修了に加え、応募・移動費と当面の生活費が要る"
          },
          [
            0.55,
            "研究企業の技師として迎えられ、唸りを上げる試験装置の点検と調整を任された。計器のクセを一つずつ体に覚え込ませ、いずれは大型設備を任される日を目指した。",
            {
              job: 7,
              cash: -5e4,
              pm: 1,
              k: 2,
              cr: 2,
              fl: { col_tech_employed: 1 },
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                kind: "technical-employment",
                action: "join",
                role: "装置の点検・調整",
                note: "個別企業の正史上の雇用制度を示さないゲーム上の職務経歴"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "start"
              },
              lifeSkill: {
                id: "equipment-maintenance",
                title: "装置の点検・調整",
                delta: 2,
                context: "クルビアの研究企業での技師職"
              }
            }
          ],
          [
            1,
            "実技の課題はこなせたものの、今期の採用枠はすでに埋まっていた。旅費と受験の費用は戻らないが、この腕を街の工房で活かせないか思案しながら帰路についた。",
            {
              job: 0,
              cash: -5e4,
              pm: 1,
              p: -3,
              lifeAffiliations: [
                {
                  id: "columbia-technical-work",
                  title: "クルビアの研究企業での技師職応募",
                  kind: "employment-application",
                  action: "contact",
                  role: "技師職へ応募"
                },
                {
                  id: "columbia-technical-work",
                  action: "decline",
                  note: "採用枠が埋まっており、今回の応募は不採用で終了"
                }
              ],
              lifeGoal: {
                id: "columbia-technical-next-step",
                title: "身につけた知識を活かせる次の働き口を探す",
                priority: "生計と技能",
                action: "start"
              },
              lifeSkill: {
                id: "equipment-maintenance",
                title: "装置の点検・調整",
                delta: 1,
                context: "採用試験の課題と装置知識を確認"
              }
            }
          ]
        ),
        $terraData.K(
          "応募費 {vicClerkApplicationCost} を払って、ヴィクトリアの保険仲介所で帳簿係を探す",
          {
            show: { need: ["国:ヴィクトリア"], ge: { k: 20, literacy: 40 } },
            en: { affordableCashAfterReserve: 3e4 },
            why: "応募費を払うと、当面の暮らしを支える蓄えが残らない"
          },
          [
            0.5,
            "読み書きと計算の速さを買われ、保険仲介所の補助係として机を与えられた。積み上がる契約書の不備や問い合わせ先を洗い出し、奥の給付担当へと引き継ぐ日々が始まった。",
            {
              job: 21,
              cash: -3e4,
              pm: 1,
              k: 2,
              cr: 2,
              fl: { vic_clerk_employed: 1 },
              lifeAffiliation: {
                id: "victoria-insurance-clerk",
                title: "ヴィクトリアの保険仲介所",
                kind: "clerical-employment",
                action: "join",
                role: "契約帳簿の補助係",
                note: "個別仲介所でのゲーム上の職務経歴。公的制度の決定権を持たない"
              },
              lifeGoal: {
                id: "victoria-clerk-livelihood",
                title: "帳簿の仕事で暮らしを立てながら、書類の行方を確かめる",
                priority: "生計と仕事",
                action: "start"
              },
              lifeSkill: {
                id: "clerical-records",
                title: "帳簿整理と事務",
                delta: 2,
                context: "保険仲介所で契約書類の照会先と不足欄を記録"
              }
            }
          ],
          [
            1,
            "紹介屋の口利きで面接までは進んだが、採用は実務経験のある応募者に決まった。手付金は戻らないまま、窓口で求められた書式の知識だけを胸に次の仕事を探し始めた。",
            {
              job: 0,
              cash: -3e4,
              pm: 1,
              p: -3,
              lifeAffiliations: [
                {
                  id: "victoria-insurance-clerk",
                  title: "ヴィクトリアの保険仲介所での帳簿係応募",
                  kind: "employment-application",
                  action: "contact",
                  role: "帳簿係へ応募"
                },
                {
                  id: "victoria-insurance-clerk",
                  action: "decline",
                  note: "別の応募者が採用され、今回の応募は不採用で終了"
                }
              ],
              lifeGoal: {
                id: "victoria-clerk-next-step",
                title: "読み書きと書類経験を活かせる次の働き口を探す",
                priority: "生計と技能",
                action: "start"
              },
              lifeSkill: {
                id: "clerical-records",
                title: "帳簿整理と事務",
                delta: 1,
                context: "求人票の読み書きと必要書類を確認"
              }
            }
          ]
        ),
        $terraData.K(
          "職人の工房で手仕事を覚える",
          { show: s => ["カジミエーシュ", "リターニア", "炎国", "極東", "イェラグ"].includes(s.res?.n) && !!employmentOpeningForChoice(s, 22) },
          [
            1,
            "工房の隅で布の裁断や金具の下ごしらえを任された。ようやく仕上がった品が表の棚に並んでも、売値の大半は材料代と親方の懐へ消えていった。",
            { employmentAction: { action: "accept-local-opening", jobId: 22 }, ar: 2, k: 1 }
          ]
        ),
        $terraData.K(
          "農漁業や採集の手伝いに入る",
          {
            show: { any: ["国:サルゴン", "国:イェラグ", "国:ミノス", "国:シエスタ", "国:サーミ", "国:炎国"] }
          },
          [
            1,
            "空模様と風向きを読みながら、夜明け前に畑や水辺へ出た。どれほど収穫があっても、買い叩く仲買人や悪路のせいで手元に残る金はわずかだった。",
            { job: 23, fl: { workplace_hazard: 1 } }
          ]
        ),
        $terraData.K(
          "露店や家族の小商いを手伝う",
          { show: { need: ["家計を担う親あり"] } },
          [
            0.75,
            "夜明けの市場から運んだ品を木箱に並べ、夕方には売れ残りを数えた。家の商いを肌で覚えるかわりに、大通りが静まるまで店を閉められなくなった。",
            { job: 24, rl: 3 }
          ],
          [1, "仕入れに回す元手がどうしても足りず、人手を増やす話は立ち消えになった。外で別の働き口を探すしかなかった。", { p: -2 }]
        ),
        $terraData.K("今は学び直し、進路を急がない", { show: { need: ["就学中"] } }, [
          1,
          "学び舎に残り、もう少し先まで進路を見極めることにした。学費や教本代の工面は続くが、まだ危険な現場へ身を投じずに済んだ。",
          { job: 0, k: 3, cash: -5e4, p: 2 }
        ]),
        $terraData.K("鉱区へ働きに出る", { show: s => s.res?.n === "レム・ビリトン" && !!employmentOpeningForChoice(s, 3) }, [
          1,
          "地元業者が仕切る鉱区で採掘班の働き口を得た。落盤や粉塵への対策は曖昧に濁されたまま、ツルハシを担いで薄暗い坑道へ入った。",
          { employmentAction: { action: "accept-local-opening", jobId: 3 }, fl: { workplace_hazard: 1 } }
        ]),
        $terraData.K(
          "天災後の鉱区調査隊で助手に応募する",
          { show: { need: ["国:レム・ビリトン"], ge: { k: 20 } } },
          [
            0.55,
            "鉱山隊に同行する天災トランスポーターの募集を聞きつけ、崩れた地形や源石の露出を測る助手として採用された。焦げた土の匂いが残る天災後の鉱区を歩き、観測の記録を取り始めた。",
            {
              job: 27,
              k: 4,
              cr: 2,
              h: -4,
              fl: { workplace_hazard: 1 },
              lifeAffiliation: {
                id: "rim-catastrophe-survey-assistant",
                title: "エウレカ自治州の鉱山調査同行",
                kind: "individual-career",
                action: "join",
                role: "天災トランスポーターに同行する調査助手",
                note: "レオンハルトの個人資料を手がかりにした架空の助手経路。独立した予報業務や資格制度は確認されていない"
              },
              lifeGoal: {
                id: "rim-catastrophe-fieldwork",
                title: "鉱山調査の助手として現場経験を積む",
                priority: "生計と技能",
                action: "start"
              },
              lifeSkill: {
                id: "rim-catastrophe-field-notes",
                title: "鉱区の地形・源石記録",
                delta: 2,
                context: "天災トランスポーターに同行する鉱山調査の助手を始めた"
              }
            }
          ],
          [
            1,
            "荒れた鉱区を歩ける経験者が優先され、今回は不採用となった。天災直後の現場の危うさを耳にし、街の中で別の働き口も探すことにした。",
            { p: -2 }
          ]
        ),
        $terraData.K(
          "ファミリーの下で働く",
          { show: { "any": ["国:シラクーザ", "国:龍門"] } },
          [
            0.7,
            "街の顔役を通じてファミリーの雑用を請け負った。渡された前金で急場はしのげたが、次に持ち込まれる頼みを断れる保証はどこにもない。",
            { employmentAction: { action: "complete-gig", kind: "local-errand", sourceEventId: "car", nominalCash: 300000 }, fl: { criminal_yakuza: 1 }, cash: 3e5, cr: -5, p: 2 }
          ],
          [
            1,
            "最初から危ない橋を渡る使い走りを押しつけられ、路地裏を逃げ惑う途中で深い傷を負った。",
            { job: 0, fl: { criminal_yakuza: 1, trauma_crime: 1 }, h: -15 }
          ]
        ),
        $terraData.K(
          "競技団体の裏方仕事を探す",
          { show: { need: ["国:カジミエーシュ"] } },
          [
            0.7,
            "競技場の柵の設営や武具運びの仕事を得た。歓声の中で騎士たちの名が華やかに呼ばれていく裏で、その日の汗の分だけ日当を受け取った。",
            { job: 1, cr: 2 }
          ],
          [1, "ツテがなく裏方の枠に入れなかった。次の競技会が開かれるまで、日雇いの口を探すしかなかった。", { p: -3 }]
        ),
        $terraData.K(
          "故郷を離れ、放浪する",
          {
            en: { ge: { routes: 1 }, affordableRoute: true },
            why: "外へ出る交通路がないか、片道の運賃すら工面できない"
          },
          [
            1,
            "手元の金で切符が買える行き先を選び、荷物を一つまとめて故郷を出た。帰る場所は遠ざかったが、見知らぬ土地でやり直す余地だけは広がった。",
            {
              res: 1,
              job: 0,
              rl: -15,
              p: 4,
              residenceArrangement: "independent_rental",
              fl: { household_separated: 1 }
            }
          ]
        ),
        $terraData.K(
          "移動バザール周辺で短い警戒任務を探す",
          { show: s => s.res?.n === "サルゴン" && s.local?.ecology === "乾燥地・オアシス" },
          [
            0.6,
            "移動バザールを行き来するトランスポーターの口利きで、隊商の荷を守る短期の警戒任務を請けた。手渡された前金で当座の暮らしは息をついたが、砂塵の旅が一往復終わると次の依頼は来なかった。",
            {
              cash: 80000,
              employmentAction: { action: "complete-gig", kind: "market-watch", sourceEventId: "car", nominalCash: 80000 },
              h: -5,
              lifeAffiliations: [
                {
                  id: "sargon-market-guard-contracts",
                  title: "移動バザール周辺の短期警戒請負",
                  kind: "individual-contract",
                  action: "join",
                  role: "単発の警戒任務",
                  note: "サルゴン中部の個別請負を記録。固有の傭兵団への加入ではない"
                },
                {
                  id: "sargon-market-guard-contracts",
                  action: "leave",
                  note: "一度の警戒任務を終えた。継続契約・次の仕事は未確認"
                }
              ],
              lifeGoal: {
                id: "sargon-market-guard-work",
                title: "短期警戒の請負を続けるか、別の仕事へ移るか考える",
                priority: "生計と安全",
                action: "start",
                note: "一度の警戒任務を経験。安定雇用や次の契約は未確認"
              }
            }
          ],
          [
            1,
            "教えられた天幕を訪ねたが護衛の枠はすでに埋まっており、往復の足代だけが消えた。砂風の中で踵を返し、別の稼ぎ口を探すことにした。",
            { job: 0, cash: -20000, p: -2 }
          ]
        )
      ]
    },
    {
      id: "life_columbia_failed_application_followup",
      conf: "B",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      ge: { age: 18 },
      le: { age: 80 },
      after: { id: "car", min: 1 },
      cd: 2,
      w: 0.34,
      show: s => s.lifeRecord?.goals?.some(g =>
        g.id === "columbia-technical-next-step" && ["active", "paused", "compromised"].includes(g.status)
      ),
      t: s => s.job > 0 ? "研究企業の技師職に採用されなかったあと、別の職場で働くようになった。選考で覚えた装置の仕組みは手元に残っているが、今の仕事を続けるか、改めて技術職を探すか考えた。" : "研究企業への応募が実らなかったあとも、職探しは続いている。採用試験で覚えた手順を忘れないようにしながら、求人の条件と今の暮らしを見比べた。",
      c: [
        $terraData.K("装置の点検や修理を扱う今の仕事を次の一歩として記録する", { show: s => [7, 18].includes(s.job) }, [
          1, "別の職場で装置の点検や修理を担当することになった。最初の研究企業とは別の持ち場だが、以前に覚えたことを仕事へつなげられた。",
          { lifeGoal: { id: "columbia-technical-next-step", action: "complete", note: "別の職場で装置の点検・修理の仕事に就いた" }, p: 1 }
        ]),
        $terraData.K("今の職場で働きながら、技術職への希望を持ち続ける", { show: s => s.job > 0 && !([7, 18].includes(s.job)) }, [
          1, "当面の収入は今の仕事で確保することにした。装置を扱う仕事への希望も捨てず、条件の合う募集があれば改めて考えるつもりだ。",
          { lifeGoal: { id: "columbia-technical-next-step", action: "compromise", note: "別の職業で暮らしを支え、技術職への希望は留保した" }, p: 1 }
        ]),
        $terraData.K("今の仕事を暮らしの軸に据え、技術職探しを終える", { show: s => s.job > 0 && !([7, 18].includes(s.job)) }, [
          1, "以前の採用試験は一つの経験として手帳に残した。今は別の職業で働く道を選び、技師職への応募を続ける考えを終えた。",
          { lifeGoal: { id: "columbia-technical-next-step", action: "abandon", note: "別の職業を選び、技術職への求職目標を終了" }, p: 0 }
        ]),
        $terraData.K("身につけた装置の知識を復習し、求人を探し続ける", { show: s => s.job === 0 }, [
          1, "試験で触れた装置の手順を手帳に書き直し、工房や技術職の募集を探した。まだ採用の約束はない。",
          { lifeGoal: { id: "columbia-technical-next-step", action: "continue", note: "技術の知識を確かめながら求職を継続" }, p: 0 }
        ]),
        $terraData.K("いったん求職を休み、当面の生活を優先する", { show: s => s.job === 0 }, [
          1, "次の採用試験を急がず、手元の蓄えと生活の用事を確かめることにした。技術職の求人票は捨てずに残した。",
          { lifeGoal: { id: "columbia-technical-next-step", action: "pause", note: "次の技術職応募を保留し、生活を優先" }, p: 0 }
        ])
      ]
    },
    {
      id: "life_victoria_failed_application_followup",
      conf: "B",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      ge: { age: 18 },
      le: { age: 80 },
      after: { id: "car", min: 1 },
      cd: 2,
      w: 0.34,
      show: s => s.lifeRecord?.goals?.some(g =>
        g.id === "victoria-clerk-next-step" && ["active", "paused", "compromised"].includes(g.status)
      ),
      t: s => s.job > 0 ? "保険仲介所での帳簿係には採用されなかったが、その後に別の仕事に就いた。あのとき調べた書式や照会先は今も覚えている。新しい職場で使うか、別の生計を続けるか考えた。" : "保険仲介所の応募が実らなかったあとも、働き口を探している。書類を読み直し、窓口で求められた知識を使える仕事がないか確かめた。",
      c: [
        $terraData.K("帳簿や書類を扱う今の仕事を次の一歩として記録する", { show: s => s.job === 21 }, [
          1, "別の職場で帳簿と書類を扱う仕事に就いた。最初に応募した仲介所との縁はなかったが、以前に覚えた書式の扱い方が役に立った。",
          { lifeGoal: { id: "victoria-clerk-next-step", action: "complete", note: "別の職場で帳簿や書類を扱う仕事に就いた" }, p: 1 }
        ]),
        $terraData.K("今の職場で働きながら、事務職への希望を持ち続ける", { show: s => s.job > 0 && !(s.job === 21) }, [
          1, "今は別の仕事で暮らしを支えている。読み書きや記録に関わる職場への希望は残し、次の募集を待つことにした。",
          { lifeGoal: { id: "victoria-clerk-next-step", action: "compromise", note: "別の仕事で生計を支え、事務職の求職は留保" }, p: 1 }
        ]),
        $terraData.K("今の仕事を選び、事務職探しを終える", { show: s => s.job > 0 && !(s.job === 21) }, [
          1, "書類を扱う仕事への応募は、これまでに経験した選択の一つとして残した。今の職場で働く道を選び、帳簿係の募集を追うことを終えた。",
          { lifeGoal: { id: "victoria-clerk-next-step", action: "abandon", note: "別の職業を選び、帳簿係への求職目標を終了" }, p: 0 }
        ]),
        $terraData.K("書式の知識を確かめ、事務職の求人を探し続ける", { show: s => s.job === 0 }, [
          1, "応募先で求められた書類を改めて読み、今度はどの窓口へ足を運べるか探した。まだ採用の返事はない。",
          { lifeGoal: { id: "victoria-clerk-next-step", action: "continue", note: "書式の知識を確かめながら事務職を探した" }, p: 0 }
        ]),
        $terraData.K("いったん求職を休み、暮らしを整える", { show: s => s.job === 0 }, [
          1, "窓口へ出向くのをいったんやめ、手元のお金と家の用事を確かめた。必要な書類はひとまとめにして残した。",
          { lifeGoal: { id: "victoria-clerk-next-step", action: "pause", note: "事務職への応募を保留し、今の暮らしを優先" }, p: 0 }
        ])
      ]
    },
    {
      id: "transporter_contract_review",
      conf: "S",
      references: ["SRC_PENGUIN_LOGISTICS_CB1", "SRC_COURIER_LOGISTICS_RECORD", "SRC_TRANSPORTER_LIFE_MODEL"],
      st: ["青年", "壮年"],
      need: ["職:トランスポーター", "就労中"],
      show: s =>
        s.lifeRecord?.affiliations?.some(a => a.id === "terra-general-transporter" && a.status === "active") &&
        s.lifeRecord?.goals?.some(
          g =>
            g.id === "transporter-work" &&
            ["active", "compromised"].includes(g.status) &&
            Number.isInteger(g.startedYear) &&
            s.year >= g.startedYear + 2
        ),
      after: { id: "car", min: 2 },
      ge: { age: 19 },
      once: true,
      w: 0.62,
      t: "トランスポーターとして街を走り始めて二年が経った。靴底の減り方と裏通りの抜け道がすっかり体に染みついたころ、契約の節目がやってきた。このまま顔なじみの多い近場の便を回るか、実入りのいい遠方の臨時便に手を出すか、それとも足を洗うか迷った。",
      c: [
        $terraData.K("近場の便を中心に続ける", {}, [
          1,
          "これまで通り、近隣の街区を回る配達を続けた。顔なじみの店主から「次もあんたに頼むよ」と茶を振る舞われる日も増えた。",
          {
            cash: 70000,
            lifeAffiliation: {
              id: "terra-general-transporter",
              action: "continue",
              role: "近隣の荷物・書状の配達",
              note: "本人が近隣便の契約を更新"
            },
            lifeGoal: { id: "transporter-work", action: "continue", note: "近隣便を中心に仕事を続けた" },
            lifeSkill: {
              id: "transporter-route-work",
              title: "荷札の照合と街区間の配達",
              delta: 1,
              context: "近隣便を中心に契約を更新"
            }
          }
        ]),
        $terraData.K("遠回りの要る臨時便を一件請ける", {}, [
          1,
          "割増のつく臨時便を引き受け、悪路を抜けて夜更けに荷を届けきった。懐に入る金は増えたが、帰りの足代と泥のように眠る休日が丸一日消えた。",
          {
            cash: 90000,
            h: -2,
            lifeAffiliation: {
              id: "terra-general-transporter",
              action: "continue",
              role: "近隣便と臨時便の配達",
              note: "近隣の定期便に加えて臨時便を一件請けた"
            },
            lifeGoal: { id: "transporter-work", action: "continue", note: "臨時便を一件追加で請けた" },
            lifeSkill: {
              id: "transporter-route-work",
              title: "荷札の照合と街区間の配達",
              delta: 1,
              context: "臨時便の宛先と引き渡しを確認"
            }
          }
        ]),
        $terraData.K("契約を更新せず、別の働き口を探す", {}, [
          1,
          "使い込んだ配達鞄を置き、今回は契約を更新しなかった。毎日駆け抜けた通りを離れ、別の仕事を探すことにした。",
          {
            job: 0,
            lifeAffiliation: {
              id: "terra-general-transporter",
              action: "leave",
              note: "契約更新を見送り、トランスポーターの仕事を離れた"
            },
            lifeGoal: { id: "transporter-work", action: "abandon", note: "別の働き口を探すため仕事を終えた" }
          }
        ])
      ]
    },
    {
      id: "kjerag_transporter_route_review",
      conf: "S",
      references: ["SRC_COURIER_LOGISTICS_RECORD", "SRC_TRANSPORTER_LIFE_MODEL", "SRC_KJERAG_LIFE"],
      st: ["青年", "壮年"],
      need: ["国:イェラグ", "職:トランスポーター", "就労中"],
      show: s =>
        s.res?.n === "イェラグ" &&
        s.lifeRecord?.affiliations?.some(
          a => a.id === "kjerag-village-transporter" && a.status === "active"
        ) &&
        s.lifeRecord?.goals?.some(
          g =>
            g.id === "kjerag-transporter-route" &&
            g.status === "active" &&
            Number.isInteger(g.startedYear) &&
            s.year >= g.startedYear + 2
        ),
      after: { id: "car", min: 2 },
      ge: { age: 19 },
      once: true,
      w: 0.52,
      t: "雪の山道を荷を背負って登り始めて二年になる。新しい荷受け場所を設けたいと集落を回ると、温かい茶を出して歓迎してくれる村もあれば、よそ者の出入りを嫌って返事を渋る村もあった。便のまとめ役から、来季はどの区間を受け持つか尋ねられた。",
      c: [
        $terraData.K("受け入れが決まった集落間の便を続ける", {}, [
          1,
          "歓迎してくれる集落だけを結んで歩いた。軒先で荷を下ろして熱い湯をいただき、帰り荷の空き箱を背負い直して次の尾根へ向かった。",
          {
            lifeAffiliation: {
              id: "kjerag-village-transporter",
              action: "continue",
              role: "受け入れが決まった荷受け場所間の配達",
              note: "同意が確認できた区間の配達を継続"
            },
            lifeGoal: { id: "kjerag-transporter-route", action: "continue", note: "同意済みの集落間の便を続けた" },
            lifeSkill: {
              id: "kjerag-route-logistics",
              title: "山道の荷受けと受け渡し",
              delta: 1,
              context: "受け入れが決まった荷受け場所間の便を続けた"
            },
            cash: 50000
          }
        ]),
        $terraData.K("山麓の短距離便にしぼる", {}, [
          1,
          "気難しい奥地の区間を外し、山麓の集落だけを結ぶ短い道に絞った。実入りは少し減ったが、吹雪の前に屋根の下へ戻れるようになった。",
          {
            lifeAffiliation: {
              id: "kjerag-village-transporter",
              action: "continue",
              role: "山麓の荷受け場所間の短距離配達",
              note: "未決の区間を避け、既存の荷受け場所間の便へ範囲をしぼった"
            },
            lifeGoal: { id: "kjerag-transporter-route", action: "continue", note: "山麓の短距離便にしぼった" },
            lifeSkill: {
              id: "kjerag-route-logistics",
              title: "山道の荷受けと受け渡し",
              delta: 1,
              context: "山麓の荷受け場所間の短距離便を担当"
            },
            cash: 30000
          }
        ]),
        $terraData.K("計画から離れ、別の仕事を探す", {}, [
          1,
          "背負子を下ろし、山間の集落を回る便から手を引いた。雪の少ない街場で別の働き口を探すことにした。",
          {
            job: 0,
            lifeAffiliation: {
              id: "kjerag-village-transporter",
              action: "leave",
              note: "山間集落への荷運びを離れた"
            },
            lifeGoal: { id: "kjerag-transporter-route", action: "abandon", note: "山道の荷運びを終え、別の仕事を探した" }
          }
        ])
      ]
    },
    {
      id: "rim_catastrophe_transporter_review",
      conf: "S",
      references: [
        "SRC_LEONHARDT_ARCHIVE",
        "SRC_CATASTROPHE_TRANSPORTER_OFFICIAL",
        "SRC_RIM_LOCAL_LIFE_MODEL",
        "SRC_TRANSPORTER_LIFE_MODEL"
      ],
      st: ["青年", "壮年"],
      need: ["国:レム・ビリトン", "職:測量・天災後の復旧", "就労中"],
      show: s =>
        s.res?.n === "レム・ビリトン" &&
        s.lifeRecord?.affiliations?.some(
          a => a.id === "rim-catastrophe-survey-assistant" && a.status === "active"
        ) &&
        s.lifeRecord?.goals?.some(
          g =>
            g.id === "rim-catastrophe-fieldwork" &&
            g.status === "active" &&
            Number.isInteger(g.startedYear) &&
            s.year >= g.startedYear + 2
        ),
      after: { id: "car", min: 2 },
      ge: { age: 19 },
      once: true,
      w: 0.56,
      t: "天災が爪痕を残した坑道を調べる助手になって二年が過ぎた。崩落した岩肌や黒く光る源石の露出を図面に落とし込む隣で、同行する天災トランスポーターは絶えず風向きと計器を読んでいた。次の現場へ向かう前、鉱山隊のまとめ役からこれからの持ち場をどうするか聞かれた。",
      c: [
        $terraData.K("鉱山隊の調査記録を続ける", {}, [
          1,
          "これまで通り、崩落箇所と鉱床の位置を図面に起こす助手を続けた。出発前の慌ただしい天幕で、描き上げたばかりの地図をトランスポーターへ手渡した。",
          {
            lifeAffiliation: {
              id: "rim-catastrophe-survey-assistant",
              action: "continue",
              role: "鉱山隊の地形・源石調査助手",
              note: "記録作業を継続。予報と警報の判断は同行する天災トランスポーターが担う"
            },
            lifeGoal: { id: "rim-catastrophe-fieldwork", action: "continue", note: "鉱山調査助手を続けた" },
            lifeSkill: {
              id: "rim-catastrophe-field-notes",
              title: "鉱区の地形・源石記録",
              delta: 2,
              context: "崩落箇所と鉱床の記録を整理して渡した"
            },
            h: -2
          }
        ]),
        $terraData.K("観測に同行し、計測値の記録を手伝う", {}, [
          1,
          "天災トランスポーターのすぐ後ろにつき、乾いた風向きや地鳴りの変化を観測器から読み取って控えた。張り詰めた空気のなか、揃えた数値を予報役の同行者へ託した。",
          {
            lifeAffiliation: {
              id: "rim-catastrophe-survey-assistant",
              action: "continue",
              role: "天災トランスポーターに同行する観測助手",
              note: "計測の補助を担当。天災の予測・警報発信を独立して担う職務ではない"
            },
            lifeGoal: {
              id: "rim-catastrophe-fieldwork",
              action: "continue",
              note: "天災トランスポーターの観測を助手として支えた"
            },
            lifeSkill: {
              id: "rim-catastrophe-observation-notes",
              title: "風向き・地形の観測記録",
              delta: 2,
              context: "同行する天災トランスポーターの計測を補助"
            },
            h: -3,
            cash: 50000
          }
        ]),
        $terraData.K("鉱区を離れ、地域のトランスポーターとして働く", {}, [
          1,
          "粉塵の舞う調査現場を離れ、街と街を結んで荷や手紙を運ぶ地域のトランスポーターへ移った。荒野の道で培った足腰を頼りに、荷物を背負って次の届け先へと歩き出した。",
          {
            job: 16,
            lifeAffiliations: [
              {
                id: "rim-catastrophe-survey-assistant",
                action: "leave",
                note: "鉱山隊に同行する調査助手の仕事を終えた"
              },
              {
                id: "terra-general-transporter",
                title: "トランスポーターとしての仕事",
                kind: "occupation",
                action: "join",
                role: "地域の荷物・書状の配達",
                note: "鉱山調査助手を離れ、地域の荷物・書状の配達へ移った"
              }
            ],
            lifeGoals: [
              {
                id: "rim-catastrophe-fieldwork",
                action: "abandon",
                note: "鉱山調査の助手経路を離れた"
              },
              {
                id: "transporter-work",
                title: "トランスポーターとして仕事を続ける",
                priority: "生計と技能",
                action: "start"
              }
            ],
            lifeSkill: {
              id: "transporter-route-work",
              title: "荷札の照合と街区間の配達",
              delta: 1,
              context: "鉱山調査助手を離れ、地域の配達を始めた"
            }
          }
        ])
      ]
    },
    {
      id: "sargon_market_contract_review",
      conf: "S",
      references: ["SRC_SARGON_WD1_WD5", "SRC_SARGON_CONTRACT_LIFE_MODEL", "SRC_TERRA_LIFECOURSE"],
      st: ["青年", "壮年", "老年"],
      need: ["国:サルゴン"],
      show: s =>
        s.res?.n === "サルゴン" &&
        s.local?.ecology === "乾燥地・オアシス" &&
        s.lifeRecord?.goals?.some(
          g =>
            g.id === "sargon-market-guard-work" &&
            g.status === "active" &&
            Number.isInteger(g.startedYear) &&
            s.year >= g.startedYear + 2
        ) &&
        s.lifeRecord?.affiliations?.some(
          a => a.id === "sargon-market-guard-contracts" && a.status === "left"
        ),
      after: { id: "car", min: 1 },
      once: true,
      w: 0.38,
      t: "移動バザールの護衛を請けてから二年が経った。砂風が吹く天幕の間を歩いて次の口を探したが、前の雇い主からは音沙汰がない。このまま単発の警戒任務を追い続けるか、別の商売へ鞍替えするか迷った。",
      c: [
        $terraData.K(
          "別の短期警戒任務に応募する",
          {},
          [
            0.6,
            "別の隊商から声がかかり、荷車の脇を固める短い警戒任務に就いた。手渡された銅貨は前回より少なく、砂塵の旅が終わるとまた次の当ては途切れた。",
            {
              cash: 80000,
              employmentAction: {
                action: "complete-gig", kind: "market-watch",
                sourceEventId: "sargon_market_contract_review", nominalCash: 80000
              },
              h: -5,
              lifeAffiliations: [
                { id: "sargon-market-guard-contracts", action: "return", role: "単発の警戒任務" },
                {
                  id: "sargon-market-guard-contracts",
                  action: "leave",
                  note: "二度目の個別任務を終えた。以後の契約は未確認"
                }
              ],
              lifeGoal: {
                id: "sargon-market-guard-work",
                action: "continue",
                note: "別の一件を請けたが、継続雇用や次の契約は未確認"
              }
            }
          ],
          [
            1,
            "バザールを回っても護衛の口は見つからず、水代と移動費だけが減った。用心棒で食いつなぐ考えはいったん引っ込め、別の働き口を探すことにした。",
            {
              cash: -20000,
              lifeGoal: {
                id: "sargon-market-guard-work",
                action: "pause",
                note: "契約が成立せず、別の仕事を探すため一時保留"
              }
            }
          ]
        ),
        $terraData.K("荷札や行き先を扱うトランスポーターの仕事を探す", {}, [
          1,
          "武器の代わりに荷袋を担ぎ、移動バザールの天幕から天幕へ品物を届けるトランスポーターの仕事へ移った。",
          {
            job: 16,
            rl: 2,
            lifeAffiliation: {
              id: "terra-general-transporter",
              title: "トランスポーターとしての仕事",
              kind: "occupation",
              action: "join",
              role: "移動バザール周辺の荷物配達",
              note: "短期警戒請負から移った本人の仕事。バザール全体の物流を担うものではない"
            },
            lifeGoal: {
              id: "sargon-market-guard-work",
              action: "compromise",
              note: "警戒請負だけを追わず、トランスポーターの仕事へ移った"
            },
            lifeGoals: [
              {
                id: "transporter-work",
                title: "トランスポーターとして仕事を続ける",
                priority: "生計と安全",
                action: "start"
              }
            ]
          }
        ]),
        $terraData.K("次の警戒任務は断り、家の用事を優先する", {}, [
          1,
          "紹介屋に断りを入れ、不安定な護衛の請負から足を洗った。しばらくは家の用事と足元の暮らしを立て直すことにした。",
          {
            lifeGoal: {
              id: "sargon-market-guard-work",
              action: "abandon",
              note: "短期警戒の請負を追う目標を終えた"
            }
          }
        ])
      ]
    },
    {
      id: "ursus_mine_assignment_offer",
      conf: "S",
      references: ["SRC_URSUS_MINE_LIFE", "SRC_URSUS_EP16", "SRC_URSUS_INFECTED"],
      need: ["国:ウルサス", "感染診断済", "住環境:工業・採掘地域"],
      ban: ["隠蔽"],
      after: { id: "car", min: 1 },
      st: ["青年", "壮年"],
      once: true,
      w: 0.45,
      t: "採掘現場で働いていると、鉱区の監督官に呼び出された。鉱石病の診断記録を理由に、北方の鉱区へ移れという。拒めばどうなるかは口にされないまま、冷たい机の上に移動命令書が突き出された。",
      c: [
        $terraData.K("命令に従い、監視付き採掘班へ移る", {}, [
          1,
          "翌朝、武装した監視員に追い立てられて北方の鉱区へ送られた。凍てつく切羽の入り口にも見張りが立っていた。",
          {
            job: 3,
            home: "固定集落",
            localKind: "工業・採掘地域",
            fl: { workplace_hazard: 1 },
            lifeAffiliation: {
              id: "ursus-kleini-sever-mine",
              title: "北方鉱区の監視付き採掘班",
              kind: "coercive-mine-assignment",
              action: "assign",
              bindAt: "destination",
              role: "採掘労働者",
              note: "本人の希望によらない、この鉱区の個別経路上の配属。地域・時代を通じた一律制度を意味しない"
            },
            lifeGoal: {
              id: "ursus-kleini-sever-survival",
              title: "監視下の鉱区で身を守り、先の選択肢を探す",
              priority: "生存と生計",
              action: "start"
            }
          }
        ]),
        $terraData.K(
          "移送を拒み、身近な人に先に相談する",
          {},
          [
            0.35,
            "顔なじみが納屋の奥に一晩身を隠す場所を作ってくれた。その夜のうちに、北へ向かう移送列車の道筋から外れた。",
            { rl: 2, p: -1 }
          ],
          [
            1,
            "匿ってくれる当てはどこにも見つからなかった。翌朝、監視員に腕を掴まれ、命令どおり北方の鉱区へ送り込まれた。",
            {
              job: 3,
              home: "固定集落",
              localKind: "工業・採掘地域",
              h: -5,
              p: -4,
              fl: { workplace_hazard: 1 },
              lifeAffiliation: {
                id: "ursus-kleini-sever-mine",
                title: "北方鉱区の監視付き採掘班",
                kind: "coercive-mine-assignment",
                action: "assign",
                bindAt: "destination",
                role: "採掘労働者",
                note: "相談を試みたが移送された個別経路。本人の希望によらない配属"
              },
              lifeGoal: {
                id: "ursus-kleini-sever-survival",
                title: "監視下の鉱区で身を守り、先の選択肢を探す",
                priority: "生存と生計",
                action: "start"
              }
            }
          ]
        )
      ]
    },
    {
      id: "ursus_mine_assignment_review",
      conf: "S",
      references: ["SRC_URSUS_MINE_LIFE", "SRC_URSUS_EP16", "SRC_TERRA_LIFECOURSE"],
      show: s => {
        const a = s.lifeRecord?.affiliations?.find(x => x.id === "ursus-kleini-sever-mine");
        return (
          !!a &&
          ["active", "crisis", "suspended"].includes(a.status) &&
          Number.isInteger(a.startedYear) &&
          s.year >= a.startedYear + 2
        );
      },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.5,
      t: "監視付きの採掘班に送り込まれて二年が過ぎた。皮下に埋め込まれた位置特定チップを抜き取ろうと、密かに外の医療班とつなぎを取る坑夫もいる。信号が途絶えれば爆発するぞという監視隊の脅しが耳にこびりつき、見回りの軍靴が近づくたび皮膚の下が疼く気がした。",
      c: [
        $terraData.K(
          "外部の医療班へ検査と摘出を頼む",
          {},
          [
            0.6,
            "薄暗い仮設天幕で、外の医療班が皮下のチップを摘出してくれた。監視の網を抜けて鉱区を脱出し、教えられた診療所を頼りに別の土地で生きる道を探し始めた。",
            {
              job: 0,
              fl: { workplace_hazard: 0 },
              lifeAffiliation: {
                id: "ursus-kleini-sever-mine",
                action: "leave",
                note: "個別の摘出処置後、監視付き採掘班での就労を終えた。移動先や長期的な安全は未確認"
              },
              lifeGoal: {
                id: "ursus-kleini-sever-survival",
                action: "compromise",
                note: "鉱区での生存を優先する目標を、鉱区を離れた後の暮らし探しへ改めた"
              },
              regionalImpact: {
                region: "ウルサス",
                entity: "北方鉱区の一作業班",
                kind: "individual-labor-exit",
                description:
                  "一人の作業員が個別の医療支援を経て監視付きの採掘班を離れた。鉱区の制度や同僚の状態は変わったと推定しない。"
              },
              p: -2,
              h: -4
            }
          ],
          [
            1,
            "信号が途切れた瞬間の危険を拭いきれず、医療班はメスを置いた。傷口を押さえて暗い宿舎へ戻り、監視の目をやり過ごしながら生き延びる道を探った。",
            {
              lifeAffiliation: {
                id: "ursus-kleini-sever-mine",
                action: "role",
                role: "摘出を中止し、経過観察中の採掘労働者",
              onlyIfActiveOrCrisis: true,
                note: "個別の摘出試行は中止。チップ除去や安全確保は未確認"
              },
              p: -5,
              h: -12
            }
          ]
        ),
        $terraData.K("一部の同僚と出発準備を進め、武力での報復は避ける", {}, [
          1,
          "気の置けない数人の仲間と、持ち出せる保存食や吹雪の夜に抜ける山道を確かめ合った。見回りの靴音が近づくと素早く口をつぐみ、ツルハシを握り直した。",
          {
            lifeAffiliation: {
              id: "ursus-kleini-sever-mine",
              action: "role",
              role: "採掘を続けながら、少人数の出発準備を進める",
            onlyIfActiveOrCrisis: true,
              note: "一部の同僚との準備。集団全体の合意や出発は未確認"
            },
            lifeGoal: {
              id: "ursus-kleini-sever-survival",
              action: "continue",
              note: "危険を見極めながら、同僚との準備と日々の就労を続ける"
            },
            groupStanding: {
              id: "ursus-north-miners",
              title: "北方鉱区の同僚坑夫",
              delta: 1,
              reason: "個人として少人数の出発準備に加わった。全体の賛同は未確認"
            },
            p: -2,
            rl: 1
          }
        ]),
        $terraData.K("計画から距離を取り、今の仕事と身近な人への連絡を優先する", {}, [
          1,
          "危険な脱出話には首を突っ込まず、坑道から上がると故郷の家族へ短い手紙を書いた。廊下を渡る見回りの足音を聞きながら、遠い返事を待った。",
          {
            lifeGoal: {
              id: "ursus-kleini-sever-survival",
              action: "pause",
              note: "家族との連絡と当面の生活を優先し、鉱区を離れる計画は保留"
            },
            p: 1,
            rl: 1
          }
        ])
      ]
    },
    {
      id: "vic_clerk_contract_review",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "victoria-insurance-clerk"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      need: ["vic_clerk_employed"],
      after: { id: "car", min: 1 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.7,
      t: "保険仲介所の机に就いてから、番地の書き違いや診断書の抜けた申請がひっきりなしに回ってきた。ペン先で不備を拾い出し、奥の机へ書類を回す間も、窓口の格子向こうには順番を待つ人々の疲れた顔が並んでいた。",
      c: [
        $terraData.K("不足書類を帳面に記し、提出者へ確認を頼む", {}, [
          1,
          "番地の食い違いと足りない証明を丁寧に書き出し、窓口の依頼者へどこで書類を取れるか伝えた。返事待ちの束が木箱の端に積み上がるなか、背後ではもう次の番号札が呼ばれていた。",
          {
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              title: "ヴィクトリアの保険仲介所",
              action: "role",
              role: "提出書類の照合補助",
              note: "不足欄と照会先を帳面に残した"
            },
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 2,
              context: "契約書類の不足欄・提出日・照会先を照合"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              title: "帳簿の仕事で暮らしを立てながら、書類の行方を確かめる",
              priority: "記録と生計",
              action: "continue",
              note: "不足書類と照会先を記録した"
            },
            p: 1,
            cr: 1
          }
        ]),
        $terraData.K("契約を決める窓口と不足書類を案内する", {}, [
          1,
          "支払いの可否を決めるのは奥の査定係だと説明し、足りない証明書の控えを手渡した。焦る依頼者に頭を下げた瞬間、隣の席から次の番号を呼ぶ声が響いた。",
          {
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              title: "ヴィクトリアの保険仲介所",
              action: "role",
              role: "窓口で書類と手続きの範囲を案内",
              note: "給付を決める権限はないと説明した"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              title: "帳簿の仕事で暮らしを立てながら、書類の行方を確かめる",
              priority: "窓口と生計",
              action: "continue",
              note: "決定権の範囲を説明した"
            },
            rl: 1,
            p: -1
          }
        ]),
        $terraData.K("列を止めないことを優先し、次の窓口へ回す", {}, [
          1,
          "不備のある申請書に印だけをつけ、立ち止まる間も与えず別窓口へ回した。戸惑う依頼者の問いかけを背中で受け流しながら、すぐに次の紙束を引き寄せた。",
          {
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              title: "ヴィクトリアの保険仲介所",
              action: "role",
              role: "受付書類の振り分け",
              note: "列を進めるため不足書類の依頼を別窓口へ回した"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              title: "帳簿の仕事で暮らしを立てながら、書類の行方を確かめる",
              priority: "雇用維持",
              action: "compromise",
              note: "受付量を優先し、照会の追跡は後回しにした"
            },
            p: -2,
            cr: -1
          }
        ])
      ]
    },
    {
      id: "col_tech_safety_review",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE", "SRC_COLUMBIA_TECH_SAFETY_MODEL"],
      need: ["col_tech_employed"],
      after: { id: "car", min: 1 },
      ban: ["技師職の安全案件"],
      st: ["青年", "壮年"],
      cd: 8,
      once: true,
      w: 0.42,
      t: "試作装置の点検表と、現場監督から渡された稼働手順の数値が食い違っていた。監督は試験の日程を一日たりとも動かさないと言う。始業のベルが作業場に鳴り響くなか、ペンを握ったまま点検表の署名欄を見つめた。",
      c: [
        $terraData.K(
          "食い違いを点検表に記し、責任者へ確認を求める",
          {},
          [
            0.7,
            "機械の電源を入れる前に手を止め、どちらの数値で動かすのか監督に詰め寄った。監督は舌打ちしながらも訂正印を押し、気まずい沈黙のあとで面談の日取りだけを告げて去った。",
            {
              fl: { col_tech_safety_case: 1, col_tech_reported: 1 },
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                action: "role",
                role: "点検記録を残す技師",
                note: "安全手順の食い違いを点検表に記し、責任者へ確認"
              },
              lifeSkill: {
                id: "equipment-maintenance",
                title: "装置の点検・調整",
                delta: 2,
                context: "安全手順の照合と作業記録"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "作業手順の確認を求めた"
              },
              groupStanding: {
                id: "columbia-workshop-colleagues",
                title: "同じ設備を扱う同僚",
                delta: 1,
                reason: "手順の確認を記録に残した"
              },
              p: -2,
              cr: 2
            }
          ],
          [
            1,
            "手順の確認を求めた翌週から、監督との面談が繰り返され、次の試験では窓のない別棟の班へ回された。数値の誤りは直ったが、使い慣れた工具箱を新しい作業台へ運ぶ足は重かった。",
            {
              fl: { col_tech_safety_case: 1, col_tech_reported: 1 },
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                action: "role",
                role: "別班へ配置された技師",
                note: "手順確認後に担当班が変わった"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "担当班が変更された"
              },
              p: -5,
              cr: -2
            }
          ]
        ),
        $terraData.K("私用の手帳に手順と日時を書き、先輩にだけ相談する", {}, [
          1,
          "自分の作業着のポケットにある手帳に数値と時刻を控え、口の堅い先輩にだけ耳打ちした。試験は予定どおり始まったが、先輩はさりげなく防護具の留め具を確かめるよう班の仲間に声をかけて回った。",
          {
            fl: { col_tech_safety_case: 1, col_tech_kept_note: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "装置調整を続ける技師",
              note: "安全上の懸念を私的に記録"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 2,
              context: "現場の手順を照合"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "懸念を私的な記録に残した"
            },
            p: -1,
            rl: 1
          }
        ]),
        $terraData.K("契約更新や家計を考え、今は指示どおりに作業する", {}, [
          1,
          "波風を立てぬよう口をつぐみ、監督の指示どおりにレバーを引いた。その日は事故もなく終わったが、昼の食堂で同僚が防護具の傷みをぼやいたとき、何も言えずに目を伏せた。",
          {
            fl: { col_tech_safety_case: 1, col_tech_silent: 1 },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "雇用と家計を優先し、懸念の報告を保留した"
            },
            p: -2
          }
        ])
      ]
    },
    {
      id: "col_tech_safety_aftermath",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE", "SRC_COLUMBIA_TECH_SAFETY_MODEL"],
      need: ["技師職の安全案件"],
      after: { id: "col_tech_safety_review", min: 2 },
      ban: ["技師職の安全案件を終えた"],
      st: ["青年", "壮年", "老年"],
      once: true,
      pri: true,
      w: 1,
      t: [
        {
          when: "技師職で安全懸念を報告",
          t: "あの試作試験から二年が過ぎた。訂正印が押された点検表は今もロッカーの奥に眠っているが、現場ではまたしても安全手順を省くよう急かす声が飛び交い始めた。もう一度声を上げるか、給料のために見過ごすか迷った。"
        },
        {
          when: "技師職の安全メモ",
          t: "あの試作試験から二年が経った。作業着のポケットに忍ばせたメモは、ついぞ会社の公式記録には載らなかった。隣の班でも保護具が足りないと耳にし、あの時飲み込んだ言葉が苦く蘇った。"
        },
        {
          t: "二年前の試験では、手順の危うさを知りながら口をつぐんだ。似た装置の前に立つたび、あの時の息苦しさがぶり返す。今の暮らしを守りながら、どこまで自分の良心に折り合いをつけるか迷っていた。"
        }
      ],
      c: [
        $terraData.K(
          "手元の記録を持ち、地域の労務相談窓口で手続きを尋ねる",
          { show: { any: ["技師職で安全懸念を報告", "技師職の安全メモ", "技師職の安全懸念を保留"] } },
          [
            0.55,
            "休日に街の労務相談所を訪ね、書き溜めた現場の数値と手順のズレを相談員に見せた。すぐに会社へ立ち入りが入るわけではないが、いざという時に身を守る手順を教わり、少しだけ肩の荷が下りた。",
            {
              fl: { col_tech_safety_case: 0, col_tech_safety_closed: 1 },
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                action: "role",
                role: "安全手順を記録する技師",
                note: "地域の労務相談窓口で相談。調査や保護は確約されていない"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "地域窓口で手続きと記録の扱いを相談"
              },
              regionalImpact: {
                region: "クルビア",
                entity: "地域の労務相談",
                kind: "individual-inquiry",
                description:
                  "一人の技師が安全手順の記録を持ち込み、相談可能な手続きと記録の限界を尋ねた。企業全体の調査や政策変更を示さない。"
              },
              groupStanding: {
                id: "columbia-workshop-colleagues",
                title: "同じ設備を扱う同僚",
                delta: 1,
                reason: "手順確認の記録を保管し続けた"
              },
              p: -2,
              cr: 1
            }
          ],
          [
            1,
            "相談所の担当者はうなずいて聞いてくれたものの、企業内部の試験には口を出せないと申し訳なさそうに言った。夕暮れの街を歩きながら、結局は現場の仲間同士で身を守るしかないのだと痛感した。",
            {
              fl: { col_tech_safety_case: 0, col_tech_safety_closed: 1 },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "相談窓口で受付範囲を確認。正式調査には至らず"
              },
              p: -4,
              cr: -1
            }
          ]
        ),
        $terraData.K("担当替えを願い出て、点検・記録の仕事を続ける", {}, [
          1,
          "上司に頭を下げて試作の現場から外してもらい、定期点検と整備記録をまとめる後方部門へ移った。月の手取りは変わらず、焦げ臭い試験室の代わりに静かな机が自分の持ち場になった。",
          {
            job: 7,
            fl: { col_tech_safety_case: 0, col_tech_safety_closed: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "点検・記録担当",
              note: "試作現場から担当替えを願い出た"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 2,
              context: "点検記録の読み合わせと保管"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "担当替えで職場に残った"
            },
            cr: 2,
            p: 1
          }
        ]),
        $terraData.K("仕事を辞め、別の工房や職場を探す", { show: { need: ["就労中"] } }, [
          1,
          "退職届を机に置き、油の染みた作業服をロッカーに返した。定期的な給料袋は途切れたが、翌朝からは久しぶりに胸のつかえない空気を吸って、別の工房を探しに街へ出た。",
          {
            job: 0,
            fl: { col_tech_safety_case: 0, col_tech_safety_closed: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "leave",
              note: "安全手順の食い違いを経験し、別の働き口を探すため退職"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "abandon",
              note: "現職を離れ、別の働き口を探す"
            },
            p: -5,
            cr: -2
          }
        ])
      ]
    },
    {
      id: "col_tech_role_review",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE", "SRC_COLUMBIA_TECH_SAFETY_MODEL"],
      need: ["クルビア企業技術職経験", "技師職の安全案件を終えた", "就労中"],
      ban: ["技師職で次の役割を選んだ"],
      after: { id: "col_tech_safety_aftermath", min: 2 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.72,
      t: "試作現場の一件からさらに数年が経ち、職場では中堅と呼ばれる年回りになった。上司から配置替えと手当の話を持ちかけられ、増える責任と家の暮らしを天秤にかけながら、これからの立ち位置を考えた。",
      c: [
        $terraData.K(
          "班の点検責任者を引き受ける（基準給金に8%加算）",
          { en: { ge: { payBonusRoom: 0.08 } }, why: "基準給金への8%加算を受ける余地がない" },
          [
            1,
            "小班の点検責任者を引き受け、交代時の安全確認を取り仕切るようになった。給料袋が8%分ほど厚くなったぶん、機械が異音を立てるたびに真っ先に名を呼ばれるようになった。",
            {
              fl: { col_tech_role_reviewed: 1, col_tech_supervisor: 1 },
              payBonus: 0.08,
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                action: "role",
                role: "小さな作業班の点検責任者",
                note: "限られた設備の点検と引き継ぎを担当。基準給金への8%加算はゲーム用仮定"
              },
              lifeSkill: {
                id: "equipment-maintenance",
                title: "装置の点検・調整",
                delta: 2,
                context: "班の点検と交代時の引き継ぎ"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "班単位の点検責任者を引き受けた"
              },
              groupStanding: {
                id: "columbia-workshop-colleagues",
                title: "同じ設備を扱う同僚",
                delta: 1,
                reason: "引き継ぎ記録を整えた"
              },
              cr: 1
            }
          ]
        ),
        $terraData.K("新人に点検手順と、分からない時の尋ね方を教える", {}, [
          1,
          "入ったばかりの若い技師を連れ、熱を持つ配管や計器の見方を一から教えて回った。疑問を飲み込まずに聞くよう諭しながら、自分の仕事も遅くまで片づけた。",
          {
            fl: { col_tech_role_reviewed: 1, col_tech_mentor: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "後輩を教える技師",
              note: "点検手順と記録の読み方を新人に伝える"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 2,
              context: "新人と点検手順を確認"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "後輩の指導を仕事の一部にした"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 2,
              reason: "新人への手順共有を続けた"
            },
            p: 1
          }
        ]),
        $terraData.K(
          "納期調整の連絡役を引き受ける（基準給金に5%加算）",
          { en: { ge: { payBonusRoom: 0.05 } }, why: "基準給金への5%加算を受ける余地がない" },
          [
            1,
            "部品の納入と試験日程をすり合わせる連絡役を引き受け、給料に5%の手当がついた。現場の疲れを知りながら予定表に次の試験を書き込むたび、同僚たちの視線が少し冷たくなった。",
            {
              fl: { col_tech_role_reviewed: 1, col_tech_shortcut: 1 },
              payBonus: 0.05,
              lifeAffiliation: {
                id: "columbia-technical-work",
                title: "クルビアの研究企業での技師職",
                action: "role",
                role: "試験日程の連絡役",
                note: "納期と現場日程を調整。基準給金への5%加算はゲーム用仮定"
              },
              lifeSkill: {
                id: "equipment-maintenance",
                title: "装置の点検・調整",
                delta: 1,
                context: "試験日程と部品記録の照合"
              },
              lifeGoal: {
                id: "columbia-technical-work",
                title: "技術職を続け、暮らしと安全を両立させる",
                priority: "生計と仕事",
                action: "continue",
                note: "納期調整の連絡役を引き受けた"
              },
              groupStanding: {
                id: "columbia-workshop-colleagues",
                title: "同じ設備を扱う同僚",
                delta: -1,
                reason: "納期調整の連絡役となった"
              },
              cr: 2
            }
          ]
        )
      ]
    },
    {
      id: "col_tech_supplier_exception",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE"],
      need: ["クルビア企業技術職経験", "技師職で次の役割を選んだ", "就労中"],
      ban: ["技師職の内部確認待ち", "仕入れ記録の内部確認を終えた"],
      after: { id: "col_tech_role_review", min: 2 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.52,
      t: "搬入口に届いた交換部品の木箱を開けると、中に入っているはずの検査合格証が見当たらなかった。仕入れ担当が業者へ問い合わせている間にも、試験開始の時刻は刻々と迫ってくる。作業台の端に置かれた木箱を前に、どう裁くか決断を迫られた。",
      c: [
        $terraData.K("一回分の例外に署名し、臨時手当2万龍門幣を受け取る", {}, [
          1,
          "特例受入れの欄に自分の名を書き、箱の番号だけ控えて現場へ回した。試験は滞りなく始まり、急場しのぎの礼として2万龍門幣の手当が懐に入ったが、後味の悪さは消えなかった。",
          {
            fl: { col_tech_waiver_pending: 1, col_tech_waiver_signed: 1 },
            cash: 20000,
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "点検・納期調整を担う技師",
              note: "一回分の部品受入れ例外に署名し、照合待ち。臨時手当20,000龍門幣はゲーム用仮定"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "臨時手当を受け取り試験日程を優先した一回分の例外判断。後日の照合待ち"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: -1,
              reason: "検査票の未着を残したまま一回分の受入れを認めた"
            },
            cr: 1
          }
        ]),
        $terraData.K("検査票が届くまで一箱分を分けて保留する", {}, [
          1,
          "検査証のない部品は使えないと突っぱね、木箱に赤い保留札を下げて倉庫の隅へ隔離した。試験日程は後ろ倒しになり、上の機嫌は損ねたが、現場の安全だけは守った。",
          {
            fl: { col_tech_waiver_pending: 1, col_tech_waiver_refused: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "点検・記録を担う技師",
              note: "検査票の届くまで一箱分の部品を保留"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 1,
              context: "部品の追跡番号と保留理由を記録"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "検査票の照合を優先し、試験日程を組み直した"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 1,
              reason: "保留理由と追跡番号を残した"
            },
            p: -1
          }
        ]),
        $terraData.K("納入品を分けて仮受けし、未確認と帳面に残す", {}, [
          1,
          "木箱を通常在庫とは別の棚へ移し、仮受けの札を貼って試験への使用を止めた。業者からの検査証が届くのを待ちながら、黒板の試験予定を書き直した。",
          {
            fl: { col_tech_waiver_pending: 1, col_tech_waiver_note: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "部品の仮受けと記録を担う技師",
              note: "未確認品を区分し、仕入れ担当と照合中"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 1,
              context: "在庫記録と検査票の照合"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "未確認品を区分し、記録上も仮受けとした"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 1,
              reason: "未確認品を分けて記録した"
            }
          }
        ])
      ]
    },
    {
      id: "col_tech_internal_review",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE"],
      need: ["技師職の内部確認待ち", "就労中"],
      after: { id: "col_tech_supplier_exception", min: 2 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.68,
      t: [
        {
          when: "書類未確認の部品を例外扱いした",
          t: "検査証のない交換部品を特例で通した件について、監査室の聞き取りに呼ばれた。冷たい蛍光灯の下で、調査員は署名欄を指差し、誰の指示で受け入れたのかと問い詰めてきた。"
        },
        {
          when: "書類未確認の部品を保留した",
          t: "検査証のない交換部品を止めて試験を遅らせた件で、監査室の聞き取りに呼ばれた。仕入れ担当とのやり取りを机に並べ、なぜあの時すぐに判断したのかを問われた。"
        },
        {
          t: "仮受けにした交換部品の扱いについて、監査室から呼び出しを受けた。木箱を開けた時刻と仕入れ担当へ連絡した経緯を、静まり返った小部屋で一つずつ説明した。"
        }
      ],
      c: [
        $terraData.K("自分が見たことと記録だけを提出する", {}, [
          1,
          "誰かをかばうことも責めることもせず、自分が目で見た箱の状態と時刻だけを淡々と伝えた。調査員は無表情に受領印を押し、分厚いファイルを脇へ積んだ。",
          {
            fl: { col_tech_waiver_pending: 0, col_tech_review_completed: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "設備の点検・記録を担う技師",
              note: "一回分の納入記録について、本人が確認した事実を提出"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "内部確認では自分が直接見た事実と記録に限って回答"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 1,
              reason: "一箱分の記録を分けて提出した"
            },
            cr: 1
          }
        ]),
        $terraData.K("帳面の範囲だけ答え、推測はしない", {}, [
          1,
          "誘導するような問いかけには乗らず、手元の作業日誌に書いた事実だけを答えた。調査員はペンを置いてファイルを閉じ、重苦しい聞き取りはようやく終わった。",
          {
            fl: { col_tech_waiver_pending: 0, col_tech_review_completed: 1 },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "内部確認では帳面の範囲に限って回答"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 0,
              reason: "未確認の事柄を推測で語らなかった"
            },
            p: 1
          }
        ]),
        $terraData.K("確認が続く間、担当を離れて別の職場を探す", {}, [
          1,
          "責任の押しつけ合いが続く社内に嫌気がさし、聞き取りの記録を出したその足で退職を申し出た。私物をまとめて社屋を出ると、翌週から別の街の工房を探し始めた。",
          {
            fl: { col_tech_waiver_pending: 0, col_tech_review_completed: 1 },
            job: 0,
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "leave",
              note: "一回分の部品記録を提出後、内部確認の結論を待たずに退職"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "abandon",
              note: "内部確認の結論を待たず現職を離れた"
            },
            p: -2,
            cr: -1
          }
        ])
      ]
    },
    {
      id: "col_tech_workplace_consequence",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE"],
      need: ["仕入れ記録の内部確認を終えた", "就労中"],
      after: { id: "col_tech_internal_review", min: 3 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.48,
      t: [
        {
          when: "小さな作業班の点検役",
          t: "監査の一件から三年が経ち、部品受入れの決裁権は上の部署へ吸い上げられた。現場の点検と引き継ぎだけを守る日々が続く中、上司から今後の持ち場について声をかけられた。"
        },
        {
          when: "後輩技師を教えた",
          t: "監査の一件のあと、手塩にかけて教えた後輩は別の建屋へ異動になった。装置のクセは一通り伝えたが、会社の裏事情までは語れないまま、静かになった作業台で今後の身の振り方を考えた。"
        },
        {
          when: "納期優先の試験調整を担った",
          t: "監査の一件のあと、日程調整の役目は外され、黙々と点検記録を照合する席へ回された。次の大型試験が近づくなか、現場の遅れをどう上に伝えるか思案した。"
        },
        {
          t: "交換部品の監査騒動から三年が過ぎた。今の作業班では、トラブルが起きた時の連絡順を根本から見直すことになった。かつての苦い経験をどこまで言葉にするか迷った。"
        }
      ],
      c: [
        $terraData.K("承認権限は戻らなくても、点検記録の整備を続ける", {}, [
          1,
          "華やかな決裁権はなくても、現場の機械が止まらないよう日々の点検と引き継ぎを地道に整えた。後から来る若い技師が迷わないよう、工具箱の脇に分かりやすい手順書を残した。",
          {
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "点検記録の整備を担う技師",
              note: "一件の内部確認後、受入れ承認とは別に班の記録整備を続けた"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 1,
              context: "交代記録と点検表の整備"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "限られた担当範囲で記録整備を続けた"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 1,
              reason: "照会先と保留理由を追えるようにした"
            },
            regionalImpact: {
              region: "クルビア",
              entity: "研究企業の一つの作業班",
              kind: "local-recordkeeping",
              description: "一人の技師が、特定の班で点検表と交代記録を整えた。会社全体の制度変更ではない。"
            },
            p: 1
          }
        ]),
        $terraData.K("別の班への配置換えを願い出る", {}, [
          1,
          "空気の淀んだ元の班を離れ、別棟の設備点検班へ異動を願い出た。見知らぬ顔ぶれの中で工具の置き場所から覚え直し、静かに給料日を待つ暮らしを選んだ。",
          {
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "別班の設備点検を担う技師",
              note: "一件の内部確認後、別の班へ配置換えを願い出た"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "担当を変え、同じ企業で働き続けることを選んだ"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 0,
              reason: "別班へ移り、以前の同僚との日常的な接触が減った"
            },
            p: 0
          }
        ]),
        $terraData.K("今の職場を離れ、別の働き口を探す", { show: { need: ["就労中"] } }, [
          1,
          "潮時だと見切りをつけ、後任に装置のクセを引き継いで退職した。長年通った工業区の門を出て、これまで培った腕を活かせる別の職場を探し始めた。",
          {
            job: 0,
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "leave",
              note: "一件の内部確認後、班の記録を引き継いで退職"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "abandon",
              note: "同じ職場での継続を断念し、別の働き口を探す"
            },
            p: -2,
            cr: -1
          }
        ])
      ]
    },
    {
      id: "col_tech_later_years",
      conf: "S",
      show: s => $rules.careers.currentCareerPlacement(s, "columbia-technical-work"),
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_INDUSTRIAL_LIFE", "SRC_TERRA_LIFECOURSE"],
      need: ["クルビア企業技術職経験", "就労中"],
      ban: ["技師職の後年の働き方を決めた"],
      after: { id: "col_tech_workplace_consequence", min: 5 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.42,
      t: "機械油と金属音の中で働き続けて長い年月が過ぎた。夕方には腰や指先の痛みが残るようになり、このまま騒音の激しい現場に立ち続けるか、少し荷の軽い役回りへ退くか考える時期が来ていた。",
      c: [
        $terraData.K("点検と新人指導を続け、経験を次の人へ渡す", {}, [
          1,
          "無理のない日数に勤務を減らしてもらい、若い技師たちに計器の読み方や異音の聞き分け方を教える役に回った。直接スパナを握る日は減ったが、現場の相談役として頼りにされた。",
          {
            fl: { col_tech_later_years: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "勤務を調整しながら点検と指導を続ける技師",
              note: "体調や暮らしに合わせて勤務を調整"
            },
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 1,
              context: "点検と新人への引き継ぎを継続"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "生計と仕事",
              action: "continue",
              note: "勤務量を調整して技師職を続けた"
            },
            groupStanding: {
              id: "columbia-workshop-colleagues",
              title: "同じ設備を扱う同僚",
              delta: 1,
              reason: "点検経験を次の人へ引き継いだ"
            },
            p: 1
          }
        ]),
        $terraData.K("同じ会社で役割を軽くし、記録の照会だけ受け持つ", {}, [
          1,
          "重労働の現場から退き、資料室で過去の整備記録を照会する静かな席へ移った。給料の見直しは次の契約期まで持ち越されたが、夜は泥のように眠り込まずに済むようになった。",
          {
            fl: { col_tech_later_years: 1 },
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "role",
              role: "過去の点検記録を照会する技師",
              note: "現場作業を減らし、記録の照会に対応"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "健康と生計",
              action: "continue",
              note: "現場作業を減らして記録の照会を担った"
            },
            p: 1
          }
        ]),
        $terraData.K("職場を離れ、別の暮らしへ移る", { show: { need: ["就労中"] } }, [
          1,
          "長年着慣れた作業着を畳んで会社に返し、技師としての勤めに区切りをつけた。最後の夕暮れに工場の門を振り返り、明日からは穏やかな仕事で食いつなぐことにした。",
          {
            fl: { col_tech_later_years: 1 },
            job: 0,
            lifeAffiliation: {
              id: "columbia-technical-work",
              title: "クルビアの研究企業での技師職",
              action: "leave",
              note: "後年に職場を離れ、技能を持って次の暮らしへ移った"
            },
            lifeGoal: {
              id: "columbia-technical-work",
              title: "技術職を続け、暮らしと安全を両立させる",
              priority: "暮らしの再構成",
              action: "abandon",
              note: "同じ職場での勤務を終えた"
            },
            p: 0
          }
        ])
      ]
    },
    {
      id: "vic_clerk_role_review",
      conf: "S",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      show: s => $rules.careers.currentCareerPlacement(s, "victoria-insurance-clerk"),
      after: { id: "vic_clerk_contract_review", min: 3 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.7,
      t: "保険仲介所の月末締めを一人で回せるようになったころ、先輩から次の役回りを打診された。照合係の束ね役になればわずかな手当がつき、窓口に残れば顔なじみの依頼者の相談に乗り続けられる。家の暮らしと給金を思い合わせ、どちらへ進むか考えた。",
      c: [
        $terraData.K("照合係をまとめる（今の基準給金に4%の手当）", {}, [
          1,
          "照合班を束ねる役を引き受けた。給料に4%の手当がついたかわりに、若い係員たちの書き損じや苦情まで自分の机に集まるようになった。それでも給付の最終決裁だけは、相変わらず奥の席で決められていた。",
          {
            payBonus: 0.04,
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              action: "role",
              role: "契約書類の照合班の取りまとめ"
            },
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 3,
              context: "照合順と問い合わせの引継ぎを担当"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "continue",
              note: "照合班をまとめ、手当を家計へ回す"
            }
          }
        ]),
        $terraData.K("窓口と帳簿の仕事を続ける", {}, [
          1,
          "束ね役は丁重に断り、これまで通り窓口と帳簿の実務を続けた。以前追い返されそうになった依頼者が書類を揃えて戻ってきた日には、小さな礼の言葉に胸が温かくなった。",
          {
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              action: "role",
              role: "窓口と帳簿照合の実務係"
            },
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 2,
              context: "窓口照会と契約書類の照合を継続"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "continue",
              note: "取りまとめ役には就かず実務を続ける"
            },
            p: 2
          }
        ]),
        $terraData.K("帳面を引き継ぎ、この職場を離れる", {}, [
          1,
          "返事待ちの案件を後任へ細かく引き継ぎ、仲介所を辞めた。最終日の夕方、使い込んだペンと窓口の鍵を返し、もっと納得して働ける場所を探し始めた。",
          {
            job: 0,
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              action: "leave",
              note: "未返答の照会を後任へ引き継ぎ退職"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "abandon",
              note: "この仲介所での勤務を終えた"
            },
            p: -1
          }
        ])
      ]
    },
    {
      id: "vic_clerk_later_years",
      conf: "S",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      show: s => $rules.careers.currentCareerPlacement(s, "victoria-insurance-clerk"),
      after: { id: "vic_clerk_role_review", min: 6 },
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.6,
      t: "自分が閉じた帳簿が壁の棚を一段埋め尽くすほど、仲介所で長い年月を過ごした。手ほどきをしてくれた先輩はとっくに去り、今では若い係員があなたの机へ尋ねに来る。変わりゆく書式と老いていく目をいたわりながら、これからの働き方を考えた。",
      c: [
        $terraData.K("今の担当を続け、新しい手順を学ぶ", {}, [
          1,
          "老眼鏡をかけ直し、新しく変わった書式を若い係員から教わって机に残り続けた。古い台帳の連絡先へ手紙を出すと、思いがけず感謝の返事が届く日もあれば、宛先不明で戻ってくる日もあった。",
          {
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 2,
              context: "新書式と旧帳簿の照会を学び直した"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "continue",
              note: "新しい手順を学び直して勤務を継続"
            },
            p: 1
          }
        ]),
        $terraData.K("照会の引継ぎと新人の案内を担当する", {}, [
          1,
          "表の窓口から一歩退き、古い案件の掘り起こしと新人の手ほどきを引き受けた。緊張した新人と契約書を読み合わせていると、若かったころに先輩から掛けられた言葉がふと蘇った。",
          {
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              action: "role",
              role: "照会履歴の引継ぎと新人の案内"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "continue",
              note: "照会の引継ぎを担う持ち場へ移った"
            },
            p: 2
          }
        ]),
        $terraData.K("仕事を引き継いで離れる", {}, [
          1,
          "気がかりだった未解決の案件を後任へ託し、長年座った椅子を立った。石畳の帰り道をゆっくり歩きながら、これからの穏やかな暮らしをどう支えるか考えた。",
          {
            job: 0,
            lifeAffiliation: {
              id: "victoria-insurance-clerk",
              action: "leave",
              note: "後年に担当書類を引き継いで離職"
            },
            lifeGoal: {
              id: "victoria-clerk-livelihood",
              action: "complete",
              note: "担当の引継ぎを終えて勤務を閉じた"
            },
            p: 1
          }
        ])
      ]
    },
    {
      id: "vic_clerk_after_departure",
      conf: "S",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      need: ["vic_clerk_employed"],
      show: s =>
        s.lifeRecord?.affiliations?.some(
          row => row.id === "victoria-insurance-clerk" && row.status === "left" && s.year - row.endedYear >= 3
        ),
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.6,
      t: "保険仲介所を辞めてから数年が経った。近所の知人から店先の帳面のつけ方を相談され、インクの匂いに満ちていたあの事務所の日々を思い出した。昔身につけた整理のコツなら、今も誰かの役に立ちそうだった。",
      c: [
        $terraData.K("個人の話を伏せ、帳面の付け方を伝える", {}, [
          1,
          "かつて扱った客の身の上話は一切口にせず、日付と入出金をすっきり分けて書くコツだけを教えた。知人が嬉しそうに帳面へ線を引くのを見て、少しだけ誇らしい気持ちになった。",
          {
            lifeSkill: {
              id: "clerical-records",
              title: "帳簿整理と事務",
              delta: 1,
              context: "退職後、個人情報を伏せて帳面の手順を説明"
            },
            p: 1
          }
        ]),
        $terraData.K("職歴だけ伝え、詳しい話はしない", {}, [
          1,
          "昔ちょっと書類仕事を手伝っていただけだと笑ってかわした。窓口で涙ぐんでいた依頼者たちの顔が一瞬よぎったが、胸の奥にしまったまま別の世間話へ移った。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "col_tech_after_departure",
      conf: "S",
      references: ["SRC_TERRA_INDUSTRY_POLICY", "SRC_TERRA_LIFECOURSE"],
      need: ["col_tech_employed"],
      show: s =>
        s.lifeRecord?.affiliations?.some(
          row => row.id === "columbia-technical-work" && row.status === "left" && s.year - row.endedYear >= 3
        ),
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.6,
      t: "クルビアの研究企業を離れてから数年が過ぎた。今の仕事場で工具を握ると、試作装置の前で計器の針を睨んでいたころの手つきが自然と蘇る。機械を動かす前にもう一度だけ留め具を確かめる癖は、今も抜けていなかった。",
      c: [
        $terraData.K("自分の経験を整理し、今の設備で確かめ直す", {}, [
          1,
          "昔のやり方をそのまま押しつけるのではなく、今の現場の機械に合わせて安全確認の手順を整え直した。作業を終えて工具を拭うとき、若いころより少しだけ自分の腕に納得できた。",
          {
            lifeSkill: {
              id: "equipment-maintenance",
              title: "装置の点検・調整",
              delta: 1,
              context: "退職後、設備ごとに確認すべき点を整理"
            },
            p: 1
          }
        ]),
        $terraData.K("前の会社の話題を切り上げ、今の作業に戻る", {}, [
          1,
          "前の職場の昔話を振られたが、軽く受け流して目の前の作業に集中した。終業のベルが鳴ると、今の仲間と笑い合いながら明日の段取りを確かめた。",
          { p: 1 }
        ])
      ]
    },
    {
      id: "work_unemployed_reentry",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY"],
      st: ["青年", "壮年"],
      need: ["成人"],
      show: s => (s.job === 0 || s.job == null) && s.age >= 18 && s.age <= 60,
      cd: 2,
      w: 2.2,
      t: "無職のまま月日が流れ、手元の路銀も心許なくなってきた。街角の求人板や市場の詰め所を回り、今日明日のパンと家賃を稼ぎ出すための新しい働き口を探して思案した。",
      c: [
        $terraData.K(
          "市場や貨物駅の荷揚げ場で、日雇い・荷運びの仕事に就く",
          {},
          [
            1,
            "人手不足の荷揚げ場で荷車引きの仕事を得た。重い荷に腰がきしむが、その日のうちに日当を受け取り、暮らしの足場を固め直した。",
            { employmentAction: { action: "complete-gig", kind: "cargo-handling", sourceEventId: "work_unemployed_reentry", nominalCash: 50000 }, cash: 50000, p: 2, h: -2 }
          ]
        ),
        $terraData.K(
          "街外れの町工場や工房で、製造工として雇ってもらう",
          { show: s => !!employmentOpeningForChoice(s, 2) },
          [
            1,
            "油の匂いが立ち込める町工場で採用された。機械の轟音の中で交代勤務に入り、再び毎月の安定した給金を得られるようになった。",
            { employmentAction: { action: "accept-local-opening", jobId: 2 }, p: 3, rl: 2 }
          ]
        ),
        $terraData.K(
          "大通りや裏路地の一角で、細々と露店・小商いを始める",
          { en: { affordableCash: 30000 }, why: "仕入れに必要な3万龍門幣が足りない" },
          [
            1,
            "手持ちの小銭で古道具や日用品を仕入れ、木箱を並べて露店を開いた。呼び込みの声に足を止める客も現れ、自活の第一歩を踏み出した。",
            { job: 24, cash: -30000, pm: 1, p: 3, cr: 2 }
          ]
        ),
        $terraData.K(
          "荒野の隊商や商会の護衛・警備の契約に応募する",
          { en: { ge: { h: 40 } }, why: "護衛任務に耐えうる体力が足りない" },
          [
            1,
            "隊商の警備員として雇われた。移動都市の外縁を巡回する過酷な任務だが、危険手当を含めた給金で生活の立て直しに目処がついた。",
            { job: 4, cash: 80000, p: 1, h: -5 }
          ]
        ),
        $terraData.K(
          "今は焦らず、手元の蓄えを切り崩しながらより良い求人を待つ",
          {},
          [
            1,
            "無理に合わない仕事に飛びつくのはやめ、節約しながら次の機会を待つことにした。図書館や広場で情報を集め、次の求人動向を注視した。",
            { p: -2, k: 1 }
          ]
        )
      ]
    },
    {
      id: "work_elder_reentry",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY"],
      st: ["老年"],
      show: s => (s.job === 0 || s.job == null) && s.age > 60 && s.age <= 80,
      cd: 3,
      w: 1.8,
      t: "仕事を退いてから時間が経ったが、じっとしているのも性に合わず、路銀の減りも気になってきた。年老いた体でも引き受けられるささやかな仕事がないか、近所の長屋や市場で声をかけた。",
      c: [
        $terraData.K(
          "路地裏の露店で、古着や手細工の小商いを始める",
          {},
          [
            1,
            "軒先に小さな敷物を広げ、繕った布や小物を並べた。近所の住人と言葉を交わしながら、自分のペースで小銭を稼ぐ穏やかな日々が始まった。",
            { job: 24, p: 3, rl: 3 }
          ]
        ),
        $terraData.K(
          "集会所や長屋の掃除・管理人見習いとして手伝う",
          {},
          [
            1,
            "近隣の顔役から共同便所や広場の清掃を頼まれ、日当をもらうことになった。若い頃のような無理は利かないが、地域に居場所を取り戻した。",
            { job: 1, p: 2, rl: 4 }
          ]
        ),
        $terraData.K(
          "無理に働かず、蓄えと周囲の支えに甘えて余生を過ごす",
          {},
          [
            1,
            "体を休めることを第一にし、日向ぼっこをしながら静かに過ごした。贅沢はできないが、平穏な一日に感謝した。",
            { p: 1, h: 1 }
          ]
        )
      ]
    }
  );
});
