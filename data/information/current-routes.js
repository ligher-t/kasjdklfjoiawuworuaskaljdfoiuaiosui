// information/current-routes: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("information/current-routes", function ($terraData, $define, $rules) {
  "use strict";
  $terraData.SETTING_SOURCES.SRC_DISCLOSURE_IMPACT_MODEL={
    title:'鉱石病の露見による社会的影響と生活改善',kind:'ゲーム用仮定',
    note:'2026-11-05の利用者指定。拒絶・確認済みの漏洩に範囲別の固定減点と正負の増減補正を適用する。守秘された診療、受容された告白、噂、第三者の感染は対象外。数値、漏洩遭遇と住居確認の頻度は原作の発生率ではない。'};
  const stages=['児童','少年','青年','壮年','老年'];
  const leak=(audience,recipientRef)=>({subject:'self',audience,certainty:'confirmed',
    source:'reported-leak',consent:'nonconsensual',subjectMatch:'confirmed',recipientRef});
  $terraData.EV.push(
    {id:'infection_workplace_confirmed_leak',conf:'S',references:['SRC_DISCLOSURE_IMPACT_MODEL'],st:stages,
      once:true,w:0.35,show:s=>disclosureLeakEligible(s,'work'),
      t:'休憩室へ入ると、話し声が途切れた。通院のため責任者にだけ伝えたはずの診断を、同僚があなたの名を挙げて口にした。誰が伝えたのかは分からない。昼の席を探しても、隣に置いた盆から椅子を引かれた。',
      fx:{infectionAwarenessAction:{...leak('workplace',null)}}},
    {id:'infection_school_confirmed_leak',conf:'S',references:['SRC_DISCLOSURE_IMPACT_MODEL'],st:stages,
      once:true,w:0.35,show:s=>disclosureLeakEligible(s,'school'),
      t:'教室へ戻ると、診療のため学校へ伝えた病名を、何人かがあなたの名前と一緒に囁いていた。誰から聞いたのか尋ねても答えはない。いつも机を寄せていた相手が、今日は離れた席へ鞄を移した。',
      fx:{infectionAwarenessAction:leak('school','current-school')}},
    {id:'infection_neighborhood_confirmed_leak',conf:'S',references:['SRC_DISCLOSURE_IMPACT_MODEL'],st:stages,
      once:true,w:0.30,show:s=>disclosureLeakEligible(s,'community'),
      t:'戸口で名前を呼び止められ、近所の人から鉱石病の診断を受けたのかと確かめられた。限られた相手にしか話していないと答えると、その人は口をつぐんだ。その日から水場で隣を空けられ、挨拶を交わしていた戸口も閉じたままになった。',
      fx:{infectionAwarenessAction:leak('community','current-residential-area')}},
    {id:'infection_publication_confirmed_spread',conf:'S',references:['SRC_DISCLOSURE_IMPACT_MODEL'],st:stages,
      once:true,w:0.30,show:s=>disclosureLeakEligible(s,'public'),
      t:'診療所に掲示した名前と病状を写した紙が、市場の掲示場にも貼られていた。店先で名を呼ばれ、病気のことを理由に出ていくよう言われた。診療所の外へも伝わったことを、帰り道で何度も向けられる視線が知らせていた。',
      fx:{infectionAwarenessAction:leak('public','current-market-notices')}},
    {id:'infection_social_housing_secured',conf:'S',references:['SRC_DISCLOSURE_IMPACT_MODEL'],st:['青年','壮年','老年'],
      once:true,w:0.5,show:s=>!!s.disclosureImpact&&s.residenceArrangement==='independent_rental'&&
        s.socialAftermath?.episodes?.some(x=>x.domain==='housing'&&x.status!=='ended'&&x.year<s.year&&x.regionKey===s.res.n&&!!x.localityKey&&x.localityKey===s.community?.key),
      t:'支援窓口の担当者と管理人の前で、今の部屋の契約を確かめた。診断だけを理由に退去を求めないことが書面に残り、控えを受け取った。帰宅して鍵を回すとき、今夜の寝床を失う心配が少し遠のいた。',
      fx:{socialAftermathAction:{type:'close',domain:'housing',currentPlace:true,note:'支援者立会いで診断を理由とする退去要求の撤回を書面確認'},p:2,rl:1}}
  );
  $terraData.EVENT_EFFECT_TYPES.object.push("closeKnowledgeAction");
  $terraData.EVENT_EFFECT_TYPES.object.push("infectionAwarenessAction");

  $terraData.EVENT_FIELD_META.infectionAwarenessAction = {
    valueType: "object",
    status: "S",
    unit: "鉱石病をめぐる個人別・範囲別の認知記録",
    meaning: "対象、認知範囲、確認度、情報源、本人の同意、発生地域を記録する。行政窓口の知識も個別通知・捜索の範囲で記録し、自動伝播させない"
  };
  $terraData.EVENT_FIELD_META.infectionAwarenessActions = {
    valueType: "objectArray",
    status: "S",
    unit: "同一出来事で別々に記録する感染認知",
    meaning: "家族内の認知と医療機関・地域など外部の認知を一括りにせず、それぞれの対象・範囲・根拠を保存する"
  };
  $terraData.EVENT_FIELD_META.closeKnowledgeAction = {
    valueType: "object",
    status: "S",
    unit: "特定近親者・友人への情報行動と援助の約束",
    meaning: "診断を聞いた相手本人のIDと年を記録し、返答と行為、付き添いの約束と実行を分ける。秘密保持の了承だけで将来の漏えいや伝達は推定しない"
  };

  $terraData.SETTING_SOURCES.SRC_V87_CLOSE_INFO = {
    title: "v87個別の情報開示と近親者の認知",
    kind: "ゲーム用仮定",
    note: "家族・友人への開示は特定の会話だけで記録し、その人の反応を本人の知識とは別に保存する。17-1の一感染者が家族の冷淡さを語る場面は個別事例であり、診断への疑い/保留/離反の発生率を定めない。本イベントの各反応確率はゲーム上の仮定である。医療上の義務や原作の全国一律制度も定めない。"
  };

  $terraData.SETTING_SOURCES.SRC_INFORMATION_CLAIM_ORGANIZATION_ROUTE = {
    title: "組織の会合における個人の未確認情報発言",
    kind: "ゲーム用仮定",
    note: "主人公が設立し現在も運営する地域組織の設立地区で会合があり、主人公が未確認情報に言及する経路を扱う。会員の出席・聴取・理解・賛否・行動、組織の方針変更、第三者への伝達は推定しない。既存セーブの組織に設立地区がない場合は後付けしない。"
  };

  $terraData.SETTING_SOURCES.SRC_V88_INFO_BOUNDARIES = {
    title: "テラの世論・情報環境と人生の終盤",
    file: "other/terra_public_opinion_end_of_life_detailed_report.pdf",
    pages: "PDF 4–10",
    kind: "ユーザー提供の二次整理資料・実装提案",
    note: "事件、発信、伝播、受け手の知識・信頼、行動を分ける情報モデルを提案する。国別の一律媒体普及や識字率、住民全体の信念は確定せず、本機能の情報経路と噂の未確認扱いはゲーム上の設計である。"
  };

  $terraData.SETTING_SOURCES.SRC_SR_STULTIFERA_NAVIS = {
    title: "『狂人号』SN-5「灯台制御室」",
    url: "https://shimadouma.github.io/astrhtml/events/act17side/stories/SN-5.html",
    kind: "日本語版シナリオ本文の非公式アーカイブ",
    note: "孤立した灯台の設備記録と、長期信号を送る船についてのジョディの推測が描かれる。一人の推測であり、一般住民の海上知識や灯台網全体の稼働・警告普及を示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_IBERIA_MARKET_WARNING_MODEL = {
    title: "イベリア市場で出所不明の警戒文を見かける経路",
    kind: "ゲーム用仮定",
    note: "市場の塩魚の包み紙に短い警戒文が一度添えられていた遭遇を扱う。発信源・対象・灯台・危険・頻度・住民の受信率を設定事実として示さない。"
  };
});
