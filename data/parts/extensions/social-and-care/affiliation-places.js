window.TERRA_DATA_BUILD.fragment("extensions/social-and-care", "extensions/social-and-care/affiliation-places")(
  function ($terraData, $define, $rules) {
    "use strict";
    const reviewed = (choice, intent) => Object.assign(choice, { ethics:{intent, target:null, reviewed:true, policyVersion:87} });
    for (const [id, goal, title, text, resumeLabel, resumeText] of [
      ["infected-exclusion", "order-through-exclusion", "住民会の役目", "以前暮らしていた街区の住民会から便りが届いた。会合に顔を出せない日が続き、預かっていた名簿や帳面を返してほしいという。感染者を街から締め出す申し合わせを自分も広めてきたが、離れた今、どうけじめをつけるか考えた。", "住民会の会合に再び顔を出す", "かつての街区を訪ね、住民会の仲間から近況を聞いた。また会合に顔を出すと伝えて席に戻った。"],
      ["infected-mutual-aid", "infected-mutual-aid", "共同購入と診療連絡の役目", "以前暮らしていた地区の互助会から便りが届いた。今の住まいからでは、巡回診療の知らせを配るのも共同購入した薬や物資を受け渡すのも難しい。これからの関わり方をどうするか考えた。", "共同購入と診療連絡の手伝いに戻る", "互助会の仲間と顔を合わせ、診療日と物資の受け渡しを手伝える日を伝えた。再び世話役の一人として動き始めた。"],
      ["leithanian-noble-household", "leithanian-noble-household", "屋敷の帳簿と目録の担当", "かつて出入りしていた貴族の屋敷から、蔵書や楽譜の目録整理を頼む書簡が届いた。今の住まいからではおいそれと通える距離ではない。このまま役目を辞するか、返事を書く前に迷った。", "屋敷の目録整理の仕事に戻る", "再び屋敷の門をくぐり、執事と顔を合わせて蔵書と楽譜の目録を確かめた。通える日取りを決め、また仕事を引き受けた。"],
      ["siracusa-familia", "siracusa-family-livelihood", "ファミリーからの用事", "以前いた街のファミリーの顔なじみから便りが届いた。離れた土地でも向こうの用事を引き受け続けるか、今の暮らしを優先して足を洗うか。封を切りながら腹を決めることにした。", "ファミリーの仕事に戻る", "古い顔なじみに会いに行き、またファミリーの用事を引き受けると伝えた。次の段取りと顔を出す日取りを確かめ合った。"]
    ]) {
      const record = s => s.lifeRecord?.affiliations?.find(row => row.id === id);
      const goalEffect = action => ({id:goal, action, note:"転居後に現地の役目を見直した"});
      const leave = {
        lifeAffiliation:{id, action:"leave", note:"転居後に現地の役目を終了"},
        lifeGoal:goalEffect("abandon"),
        ...(id === "siracusa-familia" ? {siracusaFamilyAction:"left",p:-2} : {}),
        ...(id.startsWith("infected-") ? {lifeOrganization:{id, action:"handover", note:"転居に伴い本人の運営担当を終了。後任の意思や会の方針変更は記録していない"}} : {})
      };
      const pause={lifeAffiliation:{id,action:"suspend",pauseContext:"relocation",note:"転居に伴い現地の担当を休止"},lifeGoal:goalEffect("pause"),...(id==="siracusa-familia"?{siracusaFamilyAction:"distant"}:{})};
      const resume={lifeAffiliation:{id,action:"return",resumePriorStatus:true,note:"元の生活圏へ帰還して担当を再開"},lifeGoal:goalEffect("continue"),...(id==="siracusa-familia"?{siracusaFamilyAction:"active"}:{})};
      $terraData.EV.push({
        id:"life_"+id.replaceAll("-", "_")+"_relocation", conf:"S",
        references:["SRC_TERRA_LIFECOURSE"], st:["青年","壮年","老年"], cd:3, w:0.25,
        show:s => ["active","crisis"].includes(record(s)?.status) && $rules.affiliations.awayFromRecordedLocality(s,id),
        t:text,
        c:[
          reviewed($terraData.K(title+"を退き、預かっていた物を送り返す",{},[1,"これからは手を引くと便りを添え、預かっていた品や引き継ぎの品を荷造りして送り返した。",leave]),"withdrawal"),
          reviewed($terraData.K("しばらく役目を休み、元の街へ戻った時に考え直す",{},[1,"今の住まいからは通いきれないと事情を伝え、しばらく役目を休ませてもらうことにした。いつか元の街へ戻ることがあれば、その時にまた考える。",pause]),"defer")
        ]
      },{
        id:"life_"+id.replaceAll("-", "_")+"_absence_review", conf:"S",
        references:["SRC_TERRA_LIFECOURSE"], st:["青年","壮年","老年"], cd:3, w:0.18,
        show:s => record(s)?.status === "suspended" && record(s).pauseContext === "relocation" && s.year-(record(s).lastChangedYear??s.year)>=3,
        t:"転居を機に役目を休んでから数年が過ぎ、以前の仲間から近況を尋ねる便りが届いた。"+title+"に戻るか、今の暮らしとの折り合いを考えた。",
        c:[
          reviewed($terraData.K(resumeLabel,{show:s=>$rules.affiliations.atRecordedLocality(s,id)},[1,resumeText,resume]),"procedure"),
          reviewed($terraData.K("今はまだ戻れないと伝え、休止を続ける",{},[1,"今の暮らしが手いっぱいでまだ戻れないと返事を書いた。また季節が変わって余裕ができれば、その時に考えることにした。",{lifeAffiliation:{id,action:"review",note:"本人が休止継続を選択"},lifeGoal:goalEffect("pause")}]),"defer"),
          reviewed($terraData.K("きっぱりと役目を降り、今の暮らしに専念する",{},[1,"これからはもう加われないと詫びの便りを出し、昔からのしがらみに区切りをつけて目の前の暮らしへ戻った。",leave]),"withdrawal")
        ]
      });
    }
    $terraData.EV.push({
      id:"life_rhodes_care_relocation",conf:"S",references:["SRC_RHODES_FOUNDATION","SRC_RHODES_MEDICAL"],
      st:["青年","壮年","老年"],ge:{year:1095},cd:3,pri:true,w:0.25,
      show:s=>s.lifeRecord?.affiliations?.some(a=>a.id==="rhodes-care" && ["active","crisis"].includes(a.status) && (a.role==="転居先の巡回先を照会中" || (a.appointment && !$rules.affiliations.appointmentHere(s,a.id)))),
      t:[
        {when:s=>s.lifeRecord?.affiliations?.some(a=>a.id==="rhodes-care" && a.role==="転居先の巡回先を照会中"),t:"転居先でもロドスの巡回診療を受けられるか問い合わせていたが、まだはっきりした返事が届かない。薬の残りを確かめながら、もう一度連絡してみることにした。"},
        {t:"引っ越しの荷ほどきをしていると、前の街で受け取ったロドスの巡回診療の予約票が出てきた。今の住まいからではあの窓口へは通えない。こちらでも診てもらえる場所があるか、連絡先へ便りを出すことにした。"}
      ],
      c:[
        reviewed($terraData.K("今いる地域の巡回拠点で診てもらえるよう申し込む",{},
          [0.55,"折り返し届いた便りで、この地域に巡回班が立ち寄る日取りが分かった。新しい拠点までの道順を確かめ、胸をなでおろした。",{lifeAffiliation:{id:"rhodes-care",action:"role",role:"巡回診療の予約あり",note:"転居先で巡回予約を取り直した"}}],
          [1,"このあたりへ次に巡回班が回れる日はまだ未定だという返事だった。手元の薬を大事に使いながら、次の知らせを待つしかなかった。",{lifeAffiliation:{id:"rhodes-care",action:"role",role:"転居先の巡回先を照会中"}}]),"procedure"),
        reviewed($terraData.K("ロドスの巡回は諦め、この街で通える診療所を探す",{},[1,"いつ来るか分からない巡回を待つのはやめ、今の住まいの近くで鉱石病を診てくれそうな診療所を自分の足で探し始めた。",{lifeAffiliation:{id:"rhodes-care",action:"leave",note:"転居に伴い巡回診療の連絡を終了"},lifeGoal:{id:"rhodes-care",action:"abandon",onlyIfActive:true,note:"巡回診療への連絡を終え、転居先で別の通院先を探す"}}]),"withdrawal")
      ]
    },{
      id:"life_return_previous_residence",conf:"S",references:["SRC_TERRA_LIFECOURSE"],
      st:["青年","壮年","老年"],ge:{age:18},cd:4,w:0.08,
      show:s=>!!$rules.affiliations.previousResidence(s),
      t:"ふとした折に、以前暮らしていた街の空気や顔なじみのことを思い出した。荷物をまとめてあの土地へ戻るか、それとも今の街に根を下ろすか迷った。",
      c:[
        reviewed($terraData.K("以前暮らした土地へ引き返す",{en:{affordableCashAfterReserve:90000},why:"転居費用と生活予備費を用意できない"},[1,"家財道具をまとめ、かつて暮らした街へと戻った。見覚えのある通りを歩きながら、もう一度ここで暮らす支度を始めた。",{returnToLocality:"previous",cash:-90000,pm:1}]),"self-or-family-care"),
        reviewed($terraData.K("思い出は胸にしまい、今の土地で暮らし続ける",{},[1,"懐かしさを振り切って、今いる街の暮らしをそのまま続けることにした。",{p:0}]),"defer")
      ]
    });

    $terraData.EV.push({
      id:"life_work_project_setback",conf:"S",references:["SRC_TERRA_LIFECOURSE"],
      st:["青年","壮年","老年"],need:["就労中"],cd:4,w:0.8,
      show:s=>[2,7,18,19].includes(s.job) && s.workContract?.status==="active",
      t:[{when:"国:クルビア",t:"納品目前になって、届いた部品の寸法が仕様書と食い違っていることが発覚した。現場には古い図面と、納期を盾に急かせる発注者の怒鳴り声だけが残された。"},
         {when:"国:ヴィクトリア",t:"工場から回されてきた新しい部品が、現場の年季の入った蒸気設備にどうしても噛み合わなかった。作業を止めて原因を調べるか、納期に間に合わせるため無理やり削って合わせるか、作業台を囲んで怒号が飛び交った。"},
         {t:"現場に届いた部材が設備の寸法と合わず、一から組み直しになった。迫る納期と安全、そして自分たちの身体をどう守るか、現場で決断を迫られた。"}],
      c:[reviewed($terraData.K("急かされても手を止め、図面と実物の寸法を測り直す",{},[1,"発注者の小言を背中で聞き流しながら寸法を測り直し、仲間と知恵を絞って無理のない取り付け方を見つけた。納期は少し延びたが、機械は異音ひとつなく動き出した。",{k:2,lifeSkill:{id:"current-job",title:"current_job",delta:3}}]),"self-or-family-care"),
         reviewed($terraData.K("残業手当を目当てに、夜通しの突貫作業を引き受ける",{en:{ge:{h:25}},why:"長い追加作業に耐えられる体力がない"},[0.8,"深夜まで火花を散らして部材を加工し続け、約束通りの臨時手当を懐に入れた。翌朝は鉛のように肩が重く、寝床から起き上がるのにひどく時間がかかった。",{cash:18000,pm:1,h:-4,p:-2,lifeSkill:{id:"current-job",title:"current_job",delta:3}}],[1,"疲れで手元が狂い、工具で指先を深く痛めて突貫作業から外された。臨時手当はふいになり、腫れた手を抱えて残りの工程を仲間に引き継いだ。",{h:-7,p:-2}]),"procedure"),
         reviewed($terraData.K("無理な残業は断り、勤務を短くして後任へ引き継ぐ",{show:s=>s.workContract?.hours!=="short"},[1,"身体を壊しては元も子もないと短時間勤務への切り替えを申し入れ、やりかけの箇所の寸法を次の番の仲間に伝えて現場を上がった。稼ぎは減るが、深く息をつける夜が戻った。",{workContractAction:{action:"hours"},h:2,p:1}]),"self-or-family-care")]
    },{
      id:"life_debt_budget_review",conf:"S",references:["SRC_TERRA_LIFECOURSE"],st:["青年","壮年","老年"],
      ge:{age:18},cd:4,w:0.75,show:s=>s.debt>Math.max(s.inc||0,s.exp||0,1) && !s.fl?.detained,
      t:"テーブルの上に給金袋と借金の督促状を並べ、ため息をついた。今の稼ぎだけではとても一度には返しきれず、腹をくくって日々の食い扶持を削るか、身体を壊さない程度に少しずつ返すか考えた。",
      c:[reviewed($terraData.K("嗜好品や外食を断ち、切り詰めた分を返済に回す",{},[1,"酒や甘いもの、ちょっとした買い物をすべて我慢することにした。最低限の食事と薬代だけを残し、浮いた小銭をかき集めて返済へ回す日々が始まった。",{debtPlan:"frugal",p:-1}]),"self-or-family-care"),
         reviewed($terraData.K("食事や通院は削らず、手元に余りが出た月だけ返す",{},[1,"無理に切り詰めて倒れてしまっては働けなくなると考え、普段の食事と治療費だけは守ることにした。借金の減りは遅いが、まずは生き延びることを優先した。",{debtPlan:"maintain"}]),"defer")]
    });
  }
);
