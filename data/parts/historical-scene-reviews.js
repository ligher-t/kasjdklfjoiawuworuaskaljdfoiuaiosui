// Authored scene reviews. Source history stays in HIST; civilian scenes are S assumptions.
window.TERRA_HISTORY_SCENE_REVIEWS=function(d){
  const choice=(label,text,fx={})=>d.K(label,fx.cash<0?{en:{affordableCash:-fx.cash},why:"この支出を賄える資金がない"}:{},[1,text,fx.cash<0?{...fx,pm:1}:fx]);
  const revisions={
    timeline_columbia_independence:["クルビア", "独立の知らせが暮らす地区にも届いた。商いの書類や土地の扱いを今後どこへ尋ねるか、隣人たちの話題が変わり始めた。",[
      ["土地の手元書類を集め、新しい窓口への照会を準備する","古い控えと境界の覚え書きをまとめた。照会の準備はできたが、所有権の認定を受けたわけではない。",{k:2,p:1}],
      ["独立を祝う近隣の集まりへ差し入れをする","祝いの席で、これからの暮らしについて話した。遠い式典の様子は、届いた知らせで知るほかなかった。",{cash:-20000,rl:4,p:3}],
      ["政治の行方を見ながら、普段の商いを続ける","取引相手と納期を確かめ、急な契約変更を避けて一日を終えた。",{p:1}]]],
    timeline_four_emperors_war:[null,"四皇会戦の知らせを読んだ。遠い戦場の全容は分からない。こちらの暮らしにも及び得る取引や往来の変化を、手元で確かめることにした。",[
      ["複数の報道を読み比べる","断片を帳面に並べ、分かっていない部分を空欄のまま残した。遠い砲声を思い浮かべながら、帳面を閉じた。",{k:3,p:-2}],
      ["関係する取引の納期を確認する","届く予定の荷と未確定の便を分けて書き留めた。返事のない便には印を付け、次の連絡を待った。",{k:1,p:1}],
      ["当面の出費を抑える","戦況の噂だけで転居を決めず、手元の暮らしを維持した。",{p:-1}]]],
    timeline_kazdel_commission:["カズデル","軍事委員会の成立を伝える知らせが地区へ届いた。兵站の求人や物資の照会が増え、人々は新しい力との距離を測っていた。",[
      ["地区で募られた物資仕分けの短期仕事を引き受ける","指定された荷を数えて引き渡し、その日の作業分だけ手当を受け取った。軍への次の用事を受けるかは、その都度決めることにした。",{cash:60000,h:-3,p:-2}],
      ["地区の負担について要望書をまとめる","集めた意見を文書にした。提出してから、返事が来るまで落ち着かない日々が続いた。",{k:2,rl:3,p:-1}],
      ["新しい組織と契約せず、今の仕事を続ける","委員会の噂を聞きながらも、暮らしの段取りを変えずに過ごした。",{p:1}]]],
    timeline_great_silence:["イベリア","海の異変について、港から来る便りと荷が途切れがちになった。この地区に何が届かなくなるのか、まだ誰も確かな見通しを持てずにいた。",[
      ["手元の食料と入荷の予定を点検する","在庫と未着の荷を分けて数え直した。食卓に並ぶものが減るかもしれないと、気が重くなった。",{k:2,p:-2}],
      ["地域で受け取った不足物資の募集に応じる","届け先を確かめて物資を渡した。受取人の礼を聞き、残った荷を持って家へ戻った。",{cash:-40000,rl:5,p:2}],
      ["危険な話に近づかず、日々の仕事を守る","帰ってこない便を気にかけながら、暮らしを続けた。",{p:-2}]]],
    timeline_siracusa_unification:["シラクーザ","新しい秩序を伝える話が、地区の取引先にも回ってきた。口にする言葉や、誰と約束を交わすかが以前より重く感じられた。",[
      ["不用意な口約束を避け、取引の条件を書き留める","相手と条件を確かめ直し、余計な噂を広げずに取引を終えた。",{k:2,p:1}],
      ["掟に従う姿勢を地元の相手へ示す","今後の振る舞いについて自分の言葉で約束した。遠いファミリーへの加入や保護を得たわけではない。",{fl:{omerta_sworn:1},rl:3,p:1}],
      ["抗争との取引を増やさず、生活を続ける","自分が引き受ける用事を絞り、その日の仕事へ戻った。",{p:2}]]],
    timeline_tenth_ursus_kazimierz_war:[null,"ウルサスとカジミエーシュの戦争についての報道を読んだ。国境にいるわけではない。仕事や親族との往来に影響があるか、分かる範囲から確かめた。",[
      ["軍関係の仕事へ応募する前に条件を照会する","配属先も任務も未確定のまま、募集条件を書き留めた。返事を待つ間、戦争の仕事を引き受ける重みを考えた。",{k:2,p:-1}],
      ["負傷者向けの物資募集へ寄付する","受取先を確認して寄付した。送られる荷を見送り、受け取る人々のことを思った。",{cash:-30000,rl:3,p:2}],
      ["仕事と往来の予定を見直す","未確認の道を安全と決めつけず、当面の予定を減らした。",{p:-1}]]],
    timeline_sarcophagus_discovery:[null,"チェルノボーグの研究を巡る風聞を耳にした。どの話が確かなのかは分からず、封鎖された施設の中を自分が見たわけでもない。",[
      ["分かっている記述だけを控える","聞いた経路と不明点を一緒に書き留めた。肝心な部分は空欄のままで、落ち着かない気持ちが残った。",{k:2,p:-1}],
      ["噂の詮索をやめる","話題を切り上げ、普段の用事へ戻った。",{p:1}],
      ["公開された情報があるか調べる","公開情報と酒場の噂を分けた。期待していたほどの答えはなく、資料を閉じて席を立った。",{k:1}]]],
    timeline_bloodpeak_and_victorian_crown:[null,"王位を巡る流血と政変の知らせが届いた。遠い王宮の様子は情報を通して知るほかなく、誰の説明を信じるかでも人々の見方が分かれていた。",[
      ["複数の報道の食い違いを調べる","日付と伝達元を比べ、確かめられない話は未確認のまま残した。",{k:3,p:-2}],
      ["取引先へ今後の連絡方法を尋ねる","連絡の取れる相手と未返信の相手を区別した。返事を待つ間、遠い政変が仕事の話にも影を落としていると感じた。",{rl:2,k:1}],
      ["政変への関与を控える","見知らぬ人物の依頼は引き受けず、自分の暮らしを続けた。",{p:1}]]],
    timeline_ursus_great_rebellion:["ウルサス","反乱と鎮圧の知らせが地区へも流れ込んだ。目の前の街路が戦場になったとは限らないが、職場では賃金や待遇について話す声が低くなっていた。",[
      ["職場の待遇について自分の意見を文書にする","要求をまとめ、誰に伝えるかを考えた。言葉にした途端、その要求の重さが身に迫った。",{k:2,p:2}],
      ["近隣の備蓄品を点検する仕事を手伝う","引き受けた点検を終え、実作業分の手当を受け取った。",{cash:40000,h:-2,rl:2}],
      ["騒乱の噂から距離を置く","話の出所を確かめるまで、参加や転居を決めずに過ごした。",{p:-1}]]],
    timeline_rim_billiton_independence:["レム・ビリトン","自治独立の知らせに地区の人々が沸いた。各鉱区で今後の契約を確かめる動きが広がっている。祝いの声の中にも、次の契約を案じる話が混じっていた。",[
      ["今の仕事の契約条件を読み直す","変わると聞いた項目と、まだ確認できない項目を分けた。これからの働き方を、鉱区の仲間と話すことにした。",{k:3,p:1}],
      ["近隣の祝席へ酒を差し入れる","顔見知りと自治の先行きについて語り、同じ地区で一晩を過ごした。",{cash:-30000,rl:5,p:3}],
      ["帳簿整理の短期仕事を引き受ける","渡された帳票を整理し、作業の報酬を受け取った。一日分の手当をしまい、いつもの仕事へ戻った。",{cash:60000,k:1}]]],
    timeline_sandsoldier_incident:[null,"砂漠の市場で起きた争いの噂を聞いた。交戦した者や被害の規模について話が食い違い、隊商の予定をどう扱うかで商人たちが迷っていた。",[
      ["伝達元と分かっていない点を記録する","噂の断片を並べた。話し手ごとの食い違いが、かえって強く印象に残った。",{k:2,p:-1}],
      ["予定していた取引の安全を問い合わせる","返信のあった便だけを予定表に残した。連絡のない商人が気に掛かり、しばらく待つことにした。",{k:1,p:1}],
      ["不確かな儲け話を断る","争いの跡へ品物を拾いに行く話には乗らず、自分の仕事へ戻った。",{p:1}]]],
    timeline_leith_revolution:["リターニア","政変の知らせを受け、地区でも新たな支配の行方が話題になった。王城の戦いはここから見えない。芸術の仕事や学びを、これから誰のもとで続けるか考えた。",[
      ["仕事や学びの条件変更を照会する","相手先の回答と未定の部分を分けて控えた。返事のなかった項目には印を残し、次の相談を待った。",{k:2,p:1}],
      ["新しい時代への賛意を知人へ表す","自分の意見を伝えた。賛成する者も口を閉ざす者もおり、知人同士でも見方が分かれた。",{rl:3,p:2}],
      ["政治的な表明を控え、今の練習を続ける","外の話を気にかけながらも、手元の仕事に集中した。",{k:1,p:1}]]],
    timeline_tarra_kidnap:[null,"少女を巡る事件の風聞を耳にした。話には複数の都市名が出てくるが、起きた順序も、その場にいた者も確かめられていない。",[
      ["都市名と日付を混ぜずに書き留める","別の土地で聞かれた話を一つの街角の出来事へまとめず、未確認の記録として残した。",{k:3,p:-1}],
      ["当事者を探す噂には加わらない","知らない少女や家族について憶測を重ねず、話題から離れた。",{p:1}],
      ["公開情報が出るまで判断を保留する","詳しい知らせを待つことにして、その日の用事へ戻った。",{p:1}]]],
    timeline_vanya_assassination:[null,"暗殺事件と捜査についての知らせが届いた。現場の交差点に居合わせたわけではなく、報じられた情報と身近な噂を分けて聞いた。",[
      ["確認できる報道を読み比べる","伝達元を記した。人々の推測の強さに息苦しくなり、紙面から目を上げた。",{k:2,p:-1}],
      ["不確かな犯人の噂を広めない","確かな話がないことを知人へ伝え、憶測の輪から離れた。",{rl:2,p:1}],
      ["普段の用事を続ける","事件現場へ行く予定は立てず、手元の暮らしを守った。",{p:1}]]],
    timeline_victoria_leak:[null,"採掘地区の汚染を巡る知らせを読んだ。問題の区画へ入ったことはなく、流通する品や仕事の条件にどんな影響があるかを確かめた。",[
      ["仕入先に品物の由来を照会する","回答と未確認の品を分けた。答えの曖昧な品は、受け入れる前にもう一度確かめることにした。",{k:2,p:1}],
      ["公表された検査情報を調べる","資料を読み、分からない数値は未確認のまま残した。",{k:3,p:-1}],
      ["現地へ向かわず、仕事の予定を調整する","未確定の便を予定から外した。遅れた仕事の段取りを考えながら、その日の作業へ戻った。",{p:1}]]],
    timeline_kazdel_conflict_started:["カズデル","内戦開始の知らせは届いたが、この地区がその日に戦場になったとは限らない。近隣では荷と連絡の遅れを確かめ、今後の備えを話し合っている。",[
      ["家の備蓄と連絡先を確かめる","今ある物と連絡できる相手を整理した。連絡の取れた相手の声に少し安堵したが、先の不安は消えなかった。",{k:2,p:-2}],
      ["地区の物資整理を短期で引き受ける","預かった荷を整理し、その作業分の手当を受け取った。",{cash:50000,h:-3,rl:2}],
      ["旅と避難の候補を調べる","行先と運賃を帳面に並べ、荷物をどこまで持てるか考えた。",{k:1,p:-1}]]],
    timeline_kazdel_war_declared:["カズデル","戦争宣言の知らせが地区にも届いた。物資や働き手を求める声と、関わりを避ける声が交錯していた。",[
      ["兵站の仕事の条件を照会する","配属先と期間を問い合わせた。返事を待ちながら、引き受けられる仕事か考えた。",{k:2,p:-1}],
      ["手元でできる修理の短期仕事を引き受ける","渡された道具を直し、仕上げた分だけ報酬を得た。手当を受け取り、くたびれた道具を片付けた。",{cash:60000,h:-2}],
      ["軍との契約を増やさずに暮らす","誘いを断り、今ある用事を続けた。",{p:1}]]],
    timeline_kazdel_civil_war:["カズデル","焦土戦の知らせと物資の遅れが地区にも及んだ。届かない荷が増え、隣人たちの話にも疲れがにじんでいた。ここで暮らしを続けるか、実際に移動を始めるかを考えた。",[
      ["避難先と経路の案内を調べる","行先の候補を整理した。家族と候補を見比べた。荷造りを始めるかどうか、もう一度話すことにした。",{k:2,p:-2}],
      ["受取先を確認し、避難者用の物資へ支出する","渡した物資の記録を残した。受取人からの短い礼を聞き、残った物でどう暮らすかを考えた。",{cash:-40000,rl:4,p:1}],
      ["地区の物資点検を引き受ける","実際に数えた荷を引き渡し、その日の手当を得た。",{cash:40000,h:-2,p:-2}]]],
    timeline_kazdel_border_battle:[null,"国境地帯の会戦を伝える知らせを受け取った。どの道を通れるかについては別の確認が必要で、知らせの地名を地図でたどると、往来の先行きが気に掛かった。",[
      ["予定している移動の経路を問い合わせる","現在の道と未確認の迂回案を分けて控えた。回答のない道を避け、返事のあった便の出発日を尋ねた。",{k:2,p:-1}],
      ["補給品募集の受取先を確かめて寄付する","受取が確認された募集へ支出した。荷が届くことを願い、受付を後にした。",{cash:-30000,rl:3,p:1}],
      ["新しい移動を控える","戦場の噂だけを頼りに出発せず、今いる場所で暮らした。",{p:1}]]],
    timeline_siesta_disaster_local:["シエスタ","火山活動と避難の案内が届いた。旧市街、港、移転先の話を混ぜず、今いる地区で必要なことを確認した。連絡を待つ人々の間で、次に乗れる便の話を聞いた。",[
      ["現在地の避難案内と交通を確認する","案内の出所と行先を控えた。船への乗船や旅立つ日を決める前に、もう一度連絡を取ることにした。",{k:2,p:-2}],
      ["地区の荷物整理を手伝う","引き受けた荷を整理し、その作業分だけ手当を受け取った。疲れた腕を休め、今夜の寝床へ戻った。",{cash:40000,h:-3,rl:2}],
      ["手元の食料と連絡方法を点検する","家族と分かっている情報を共有した。未確認の港の被害を確かめられないまま、その夜を過ごした。",{p:-1,k:1}]]],
    timeline_world_1101:[null,"海辺や北方から届く不穏な知らせを読んだ。海の哨所と北の防壁を一つの場所とは考えず、届いた情報の地域と日付を分けて整理した。",[
      ["イベリアの海辺について届いた報道を読む","海からの知らせを記録した。伝わってくる海辺の気配に、しばらく黙り込んだ。",{k:2,p:-1}],
      ["ウルサス北方の連絡状況について調べる","北方の報告と未返信の便を区別した。連絡の途切れた場所を地図に探し、冷えた指先を握り直した。",{k:2,p:-1}],
      ["現地への依頼は引き受けず、暮らしを続ける","未確認の警戒線へ向かう予定は立てず、その日の用事を終えた。",{p:1}]]],
    timeline_sui_1102:[null,"司歳台と歳を巡る知らせを読んだ。場所や経緯には不確かな部分があり、封印碑や天師の働きを自分が目撃したわけではない。",[
      ["分かっている公表情報だけを書き留める","伝達元と未確認の点を一緒に残した。伝承のどこまでが確かなのか、考えながら筆を置いた。",{k:2,p:-1}],
      ["静かな場所で、身近な人々の無事を祈る","騒ぎから少し離れ、身近な人々の無事を祈った。遠い場所の行く末は分からないまま、帰り支度を整えた。",{p:2}],
      ["詳しい知らせが出るまで判断を保留する","分からないことを分からないまま残し、いつもの暮らしへ戻った。",{p:1}]]]
  };
  const dormant={timeline_sarcophagus_purge:"封鎖研究施設への当事者の立入証拠が未確立",
    timeline_babel_split:"陸艦の時点付き所在と本人の関係が未確立",
    timeline_talulah_kills:"邸宅の所在と関係者への直接接触が未確立",
    timeline_talulah_leave:"特定集落への滞在・知己が未確立",
    timeline_texas_family_purge:"事件都市・街区と本人の関与を確定できない"};
  const ends={timeline_daily_londinium_siege:[1098,9],timeline_daily_londinium_martial:[1097,12],
    timeline_daily_chernobog_alarm:[1097,1],timeline_daily_bolivar_barricade:[1052,12],
    timeline_daily_great_silence_sea:[1040,12],timeline_chernobog_incident_local:[1097,1]};
  for(const e of d.EV.filter(x=>x.id.startsWith("timeline_"))){
    const h=d.HIST.find(x=>x.flag===e.timelineFlag),scene=e.historicalScene;
    scene.from=[h.y,h.availableFromMonth||1];scene.through=ends[e.id]||[h.y,12];
    scene.sourceGrade=h.conf;scene.role=scene.delivery==="direct"?"present-civilian":"resident";
    if(e.c)e.once=true;
    if(dormant[e.id]){scene.delivery="suspended";scene.reason=dormant[e.id];continue;}
    if(revisions[e.id]){
      const [region,text,choices]=revisions[e.id];e.conf="S";e.t=text;e.c=choices.map(x=>choice(...x));
      e.historicalScene={delivery:region?"area-impact":"report-response",dateMode:"event-year",
        from:scene.from,through:scene.through,...(region?{region}:{}),
        role:region?"local-civilian":"informed-listener",sourceGrade:h.conf,
        sceneBasis:"S:authored-civilian-response",reason:"特定現場への瞬間移動と結果の先取りを除去"};
      delete e.need;delete e.or;e.show=s=>!!s.world?.events?.[h.flag];
    }
  }
  for(const flag of ["kazdel_left","kazdel_displaced","kazdel_displaced_life","silence_survivor","volcano_evacuee","chernobog_refugee"]){
    d.FLAG_REGISTRY[flag].engineProducers=["travelArrivalConsequences"];
    d.FLAG_REGISTRY[flag].source="本人の出発・経路・到着を照合した旅程の成立結果";
  }
  d.FLAG_REGISTRY.kazdel_stayed.engineClearers.push("travelArrivalConsequences:カズデルからの実到着");
  d.FLAG_REGISTRY.kazdel_displaced.label="内戦後、元の住まいを離れて暮らしを組み直した";
  d.FLAG_REGISTRY.chernobog_refugee.label="チェルノボーグ事変後、実際に避難の旅をした";
  const sui=d.HIST.find(h=>h.flag==="sui_1102");
  delete sui.localCities;sui.localText="司歳台と歳を巡る知らせには未確定の部分がある。自分がその現場を見た記録はない。";
  const vic=d.EV.find(e=>e.id==="vic_war");
  vic.historicalScene={delivery:"direct",dateMode:"ongoing",region:"ヴィクトリア",city:"ロンディニウム",
    from:[1098,7],through:[1098,9],role:"present-civilian",sourceGrade:"B"};
  const bol=d.EV.find(e=>e.id==="bol_war");
  bol.historicalScene={delivery:"area-impact",dateMode:"ongoing",region:"ボリバル",
    from:[1048,1],through:[1052,12],role:"local-civilian",sourceGrade:"C"};
  bol.t="内戦の影響で、この地区にも荷の遅れと仕事の不足が及んでいる。ここで生計を立て直すか、移動の準備をするか考えた。";
  bol.c=[choice("地区で引き受けられる修理仕事を探す","手元でできる補修を請け負い、仕上げた分の報酬を受け取った。",{cash:50000,h:-3}),
    choice("移動先の暮らしと経路を調べる","行先と費用を控え、出発の準備を始めた。",{k:2,p:-2}),
    choice("今の仕事を守り、家計を切り詰める","予定を減らし、当面の食料と仕事を確保した。",{p:-1})];
  const checkpointChoices=()=>[
    d.K("この検問に有効な通行証を提示する",{en:s=>travelCheckpointCan(s,"pass"),why:"通行証または再開の確認がない"},[1,"この検問を通り、次の乗継先へ向かった。",{travelAction:"checkpoint:pass"}]),
    d.K("登録された迂回路へ切り替える",{en:s=>travelCheckpointCan(s,"detour"),why:"迂回路・案内人または資金が不足している"},[1,"案内人と別の道へ入り、次の停留地へ向かった。",{travelAction:"checkpoint:detour"}]),
    d.K("滞在先で待ち、通行条件を照会する",{en:s=>travelCheckpointCan(s,"wait"),why:"待てる滞在先が確認できない"},[1,"検問のそばの滞在先へ向かい、照会の返事を待った。",{travelAction:"checkpoint:wait"}])];
  d.EV.push({id:"journey_decision_review",conf:"S",st:["児童","少年","青年","壮年","老年"],cd:0,who:"self",
    show:s=>!!travelCheckpointDefinition(s)&&["at-checkpoint","blocked"].includes(travelCurrentJourney(s)?.status),
    t:"検問の前で足止めされている。届いた通行条件と旅費を確かめ、先へ進むか、滞在先で待つかを考えた。",
    c:checkpointChoices()});
  // Continuing civic/political commitments remain actual life paths, not merely inquiries.
  const commitments=[
    ["timeline_columbia_independence",0,"開拓地区の自治活動","開拓地の自治の仕事を引き受ける","地区の帳簿や境界の覚え書きを整理する役目を引き受けた。顔を合わせて意見を交わす仲間ができ、自治の仕事が暮らしの一部になった。"],
    ["timeline_kazdel_commission",0,"地元の補給組織","地元の補給班で継続して働く","荷を数える仕事を終え、その分の手当を受け取った。次の仕事も引き受けると伝え、補給班の名簿に名を載せた。"],
    ["timeline_siracusa_unification",1,"地区の掟を担うつながり","地区の掟を担う人々との約束に加わる","取引と沈黙についての約束を、自分の言葉で引き受けた。頼み事と義理が増え、暮らしの中でその重みを感じ始めた。"],
    ["timeline_ursus_great_rebellion",0,"地区の労働者の要求活動","待遇改善を求める地区の活動に加わる","要求書をまとめる役目を引き受け、仲間と会う約束を交わした。暮らしを賭けて何を求めるのか、これからも問われることになった。"],
    ["timeline_rim_billiton_independence",0,"鉱区の自治運営","鉱区の自治を支える仕事に加わる","働く条件を確かめながら、帳簿と意見を取りまとめる役目を引き受けた。祝いの日の先にも、地道な仕事が続いている。"],
    ["timeline_leith_revolution",1,"地区の新政権支持活動","地区で新しい体制を支持する活動に加わる","自分の考えを表し、地区の仲間と活動を続けることにした。以前の知人と意見が分かれることも、引き受ける必要があった。"],
    ["timeline_kazdel_war_declared",0,"地区の後方補給班","地区の後方補給班へ加わる","地元の補給所で任務と期間を確認し、荷の仕分けを引き受けた。前線とは違う場所でも、戦争に手を貸していることを意識した。"],
    ["timeline_kazdel_civil_war",0,"避難者の生活再建活動","地区に留まり、避難者の生活再建に関わる","顔を合わせた人々と物資や仕事を取りまとめる役目を引き受けた。自分の暮らしを続けながら、終わりの見えない仕事と付き合っていく。"]
  ];
  for(let [eventId,index,title,label,result] of commitments){
    const e=d.EV.find(x=>x.id===eventId),id="hist-"+e.timelineFlag,goal=id+"-path",region=e.historicalScene.region;
    const fx={...e.c[index].o[0][2],lifeAffiliation:{id,title,kind:"local-civic-commitment",action:"join",role:"地区の活動を担う"},
      lifeGoal:{id:goal,title:title+"と自分の暮らしを両立する",priority:"仕事と社会",action:"start"},
      regionalImpact:{region,entity:title,kind:"personal-participation",description:"本人が地区の活動に加わると決めた"}};
    if(e.timelineFlag==="columbia_independence"){fx.fl={columbia_pioneer:1};label="登記申請を提出し、地区の自治の仕事を手伝う";result="手元の土地資料を添えて申請を提出し、返事を待つことにした。地区の帳簿を取りまとめる役目も引き受け、顔を合わせる仲間ができた。";}
    e.c[index]=choice(label,result,fx);
    d.EV.push({id:"history_path_review_"+e.timelineFlag,conf:"S",st:["少年","青年","壮年","老年"],cd:3,
      after:{id:eventId,min:2},show:s=>(s.lifeRecord?.affiliations||[]).some(x=>x.id===id&&["active","crisis"].includes(x.status)),
      t:title+"に関わってから時が過ぎた。役目を続けることで得たつながりも、暮らしに増えた負担もある。これからどこまで引き受けるか、改めて考えた。",
      c:[choice("暮らしと両立できる役目を続ける","仲間と分担を話し合い、引き受けられる用事を確かめた。今後もこの活動に関わっていく。",{
        p:1,rl:2,lifeAffiliation:{id,action:"continue",role:"分担を決めて活動を続ける"},lifeGoal:{id:goal,action:"continue"}}),
      choice("自分の役目に区切りをつけ、記録を残して退く","引き受けていた仕事を整理し、仲間に別れを告げた。関わった日々は、自分の経歴に残っている。",{
        p:2,lifeAffiliation:{id,action:"leave"},lifeGoal:{id:goal,action:"complete"}}),
      choice("負担が大きくなった活動から離れる","続けられないと伝え、役目から退いた。残った人々の行く末は気になるが、自分の暮らしを立て直すことにした。",{
        p:-1,lifeAffiliation:{id,action:"leave"},lifeGoal:{id:goal,action:"abandon"}})]});
  }
  // Evacuation intent hands the actual destination and fare to the journey desk.
  const exile=d.EV.find(e=>e.id==="kaz_exile");exile.conf="S";
  exile.t="内戦が続き、仕事と往来の先行きが見えなくなった。暮らす地区に残るか、行先と運賃を確かめて避難の旅を始めるか、身近な人々と考えた。";
  exile.c=[choice("国外へ向かう避難の行程を準備する","荷物と連絡先をまとめ、行先の候補を調べ始めた。出発前に、家族の都合と運賃を確かめる必要がある。",{travelAction:"intent:flight",p:-2}),
    choice("この地区で暮らしを続ける","身近な人々と当面の仕事と食料を確かめ、ここに残ることにした。",{p:-2,fl:{kazdel_stayed:1}})];
  const after=d.EV.find(e=>e.id==="kazdel_afterfall");
  after.t="戦争の後、この土地で暮らしを立て直す方法を考えた。残っている仕事も、連絡の取れない人もいる。次に住む場所をどう選ぶか、身近な人々と話し合った。";
  after.c=[choice("別の土地へ向かう行程を準備する","わずかな荷と連絡先をまとめ、行先と交通を確かめ始めた。",{travelAction:"intent:flight",p:-2}),
    choice("同じ地域の仮住まいを探す行程を準備する","頼れそうな滞在先の案内を集め、荷を運ぶ方法を考えた。",{travelAction:"intent:local-flight",p:-1})];
  const cherno=d.EV.find(e=>e.id==="timeline_chernobog_incident_local");
  cherno.c[0].l="駅舎で避難便の乗車条件を確かめる";
  cherno.c[0].o[0]=[0.8,"群衆を押し分け、乗車口の受付で行先と運賃を聞いた。持ち出す荷をまとめ、出発を急ぐことにした。",{travelAction:"intent:flight",p:-8}];
  cherno.c[2].o[0]=[0.7,"取り残された人々と裏路地の安全を確かめた。荷と連絡先をまとめ、次の避難便に間に合うよう準備した。",{p:4,rl:12,travelAction:"intent:flight"}];
  vic.c[1]=choice("街を離れる行程と手配条件を調べる","人づてに便の案内を集め、行先と運賃を控えた。家族の都合を確かめ、出発の準備を始めた。",{travelAction:"intent:flight",p:-3});
  const siesta=d.EV.find(e=>e.id==="timeline_siesta_disaster_local");
  siesta.c[0]=choice("避難便の条件を確かめ、出発の準備をする","案内を読み、持ち出す荷物をまとめた。連絡船を選ぶか、別の行先を探すか、運賃と家族の都合を確かめることにした。",{travelAction:"intent:local-flight",k:2,p:-2});
  const contest=d.EV.find(e=>e.id==="timeline_kazimierz_major");
  contest.t="カヴァレリエルキの街には大会の知らせと中継があふれている。大通りの画面を見上げる人も、会場へ急ぐ人もいる。どこで、どんな立場で関わるかを考えた。";
  contest.c[0]=choice("大会の周辺試合に賭ける","選んだ試合の賭けが当たり、換金した金を財布へ戻した。",{cash:200000,p:3});
  contest.c[0].o.push([1,"賭けは外れた。会場の歓声を背に、軽くなった財布をしまった。",{cash:-100000,pm:1,p:-3}]);contest.c[0].o[0][0]=0.55;
  contest.c[0].en={affordableCash:100000};contest.c[0].why="賭け金を用意できない";
  contest.c[2].o[0][1]="隣に集まった人々と肩を並べ、画面を追って声を上げた。";
  contest.c[1].show=s=>s.job===7||s.job===11||s.job===19;
  contest.c[1].o[0][1]="市内で請け負った大会関連表示の保守を終え、実作業分の手当を受け取った。手当を受け取ると、街の中継画面を見上げて一息ついた。";
  const katorga=d.EV.find(e=>e.id==="timeline_katorga_incident");
  katorga.historicalScene.siteId="model:katorga-university-square";
  katorga.historicalScene.reason="大学前広場への本人の時点付き所在証拠が必要";
  katorga.c[0].o[1]=[1,"捜索で学生を匿ったことが発覚し、その場で拘束された。審査の行方を知らされないまま、連行先で長い夜を迎えた。",{fl:{detained:1},p:-8}];
  // Exact public windows. A city-wide alarm is not replayed for the whole following year.
  const london=d.EV.find(e=>e.id==="timeline_daily_londinium_siege");london.historicalScene.through=[1098,9];
  const checkpoint=d.EV.find(e=>e.id==="timeline_world_1099");
  checkpoint.t="旅程上で実際に到達した検問所が、通行の審査を始めている。運行側から届いた通行条件を読み、先へ進む方法を考えた。";
  checkpoint.c=[
    d.K("この検問に有効な通行証を提示する",{en:s=>travelCheckpointCan(s,"pass"),why:"本人・この区間・有効期間が一致する通行証または費用が不足している"},[1,"通行証を照合し、この検問を抜けて次の区間へ進んだ。乗継先まではもうしばらく掛かりそうだ。",{travelAction:"checkpoint:pass"}]),
    d.K("登録された迂回路へ切り替える",{en:s=>travelCheckpointCan(s,"detour"),why:"利用できる迂回路・案内人または追加費用が確認できない"},[1,"案内人の示した別の道を選び、追加費用を払って移動を再開した。背後に検問の列が遠ざかっていった。",{travelAction:"checkpoint:detour"}]),
    d.K("指定の滞在先で待ち、通行条件を照会する",{en:s=>travelCheckpointCan(s,"wait"),why:"この区間で待てる滞在先が確認できない"},[1,"検問の近くで待機を始めた。照会の返事と、再出発や帰路を選ぶ機会を待つことにした。",{travelAction:"checkpoint:wait"}])];
  // Physical historical location is owned by the shared scene proof. Keeping
  // residence-country tags here would wrongly exclude a traveler at that site.
  for(const e of d.EV.filter(x=>x.timelineFlag))for(const key of ["need","or"]){
    if(Array.isArray(e[key])){e[key]=e[key].filter(x=>!/^国:|^都市:/.test(x));if(!e[key].length)delete e[key];}
  }
};

