// extensions/social-and-care/sources-and-flags: construction fragment; evaluation order is declared by data/extensions/social-and-care.js.
window.TERRA_DATA_BUILD.fragment(
  "extensions/social-and-care",
  "extensions/social-and-care/sources-and-flags"
)(function ($terraData, $define, $rules, $parts) {
  "use strict";
  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_CALADON = {
    title: "『闇散らす火花』ST-1・カレドンの労働と賃金券",
    url: "https://shimadouma.github.io/astrhtml/events/act10mini/stories/ST-1.html",
    kind: "非公式日本語版本文アーカイブ（ゲーム本文の再掲）",
    note: "感染者労働者への不利な待遇・賃金券・法案は個別都市の場面と発言として確認。法案の成立、労働者の全国平均賃金、求人差別の標準確率は未確定。新規イベントはこの社会構造を参考にした仮想ケース。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_WOLMOND = {
    title: "『ウォルモンドの薄暮』配給・難民・葬送",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    kind: "非公式日本語版本文アーカイブ（ゲーム本文の再掲）",
    note: "被災地の配給優先、難民、物流の途絶、共同体の対立。全国共通の住民登録法や一般の配給権を示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_URSUS = {
    title: "メインテーマ6-4におけるウルサスの感染者と地方行政",
    url: "https://shimadouma.github.io/astrhtml/main/chapter_06/stories/6-4.html",
    kind: "非公式日本語版本文アーカイブ（ゲーム本文の再掲）",
    note: "地方行政と宣伝・配給・感染者の扱いが住民生活を変える回想例。学校の一般的な出来事はゲーム用仮想ケース。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_SARKAZ = {
    title: "『バベル』・カズデル関連の民族史と排斥",
    file: "terra_sidestory.pdf",
    pages: "サルカズ関連の分冊",
    kind: "ユーザー提供の日本語版物語整理（二次研究）",
    note: "サルカズ史における流浪・歴史的排斥・傭兵への依存を扱う。個人への雇用・宿泊拒否は新規ゲーム仮想ケースであり、全国家の公式法ではない。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_IBERIA = {
    title: "『狂人号』『生存航路』における陸上エーギル人",
    url: "https://shimadouma.github.io/astrhtml/events/act34side/stories/BP-ST-2.html",
    kind: "非公式日本語版本文アーカイブ（ゲーム本文の再掲）",
    note: "イベリアに暮らすエーギル人の出自への不安・歴史的な猜疑。港の手続きにおける差別は架空の一場面であり、制度の存在自体を示さない。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_TARA = {
    title: "『この炎が照らす先』のターラー人・言語と政治的帰属",
    url: "https://shimadouma.github.io/astrhtml/events/act22side/stories/FC-8.html",
    kind: "非公式日本語版本文アーカイブ（ゲーム本文の再掲）",
    note: "ターラーの歴史・民族的帰属・追放と生活の圧迫。個別職場の言語に関する衝突はゲーム用仮定。民族と生物種族の分類を混同しない。"
  };

  $terraData.SETTING_SOURCES.SRC_TERRA_DISCR_MEDIC = {
    title: "『学習帳』『精鋭医師』と医療アクセス",
    file: "terra_lifeways_volume03.pdf",
    pages: "4–5",
    kind: "Timo's Reader本文を再読した追加調査（二次研究）",
    note: "診療の入口、人手不足、識字と説明の問題。新規受付差別イベントは当事者が体験し得る局所的な仮想例で、公式統一制度ではない。"
  };

  $terraData.FLAG_REGISTRY["ed_clinic_deferred_again"] = {
    label: "医療窓口へ戻るのを再び見送った",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_clinic_delayed"] = {
    label: "診療を後日に延ばした",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_clinic_guide"] = {
    label: "医療窓口の手順を聞いた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_clinic_support"] = {
    label: "診療の相談を誰かに頼んだ",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_family_belonging_discussed"] = {
    label: "家族との帰属について話した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_housing_docs"] = {
    label: "住居更新の控えを保管した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_housing_options"] = {
    label: "次の住まいの候補を整理した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_housing_stay"] = {
    label: "住居を変えず暮らした",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_iberia_port_screen"] = {
    label: "港の手続きで出自を問われた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_relief_neighbors"] = {
    label: "避難先で物資を分け合った",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_relief_registration"] = {
    label: "配給所で条件を尋ね、必要事項を手帳に記した",
    description: "本人がその場で聞いた条件の記憶。配給資格の確定、別の生活圏への行政記録の共有、次回の受給を意味しない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_relief_unserved"] = {
    label: "配給の列から離れた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_sarkaz_lodging_refused"] = {
    label: "宿で出自による拒否を経験した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_sarkaz_mutual_job"] = {
    label: "求職者と情報を交換した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_sarkaz_terms_recorded"] = {
    label: "職場の条件を比較した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_sarkaz_work_bias"] = {
    label: "サルカズ出自を理由に求人の説明が変わった",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_school_silent"] = {
    label: "学校での排斥を見て距離を置いた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_school_witness"] = {
    label: "同級生への噂と排斥を見聞きした",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_tara_language_tension"] = {
    label: "職場で故郷の言葉を巡り衝突した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_appealed"] = {
    label: "求人について説明を求めた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_archived"] = {
    label: "求人記録を保管した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_collective"] = {
    label: "求職者の経験を照合した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_continued"] = {
    label: "不利な仕事の後も働き方を続けた",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_disadvantage"] = {
    label: "不利な求人条件を示された",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_family_talk"] = {
    label: "家族と就労条件を話した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_jobsearch"] = {
    label: "差別を感じた求人を辞退した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_new_terms"] = {
    label: "新しい職場で条件を確認した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };

  $terraData.FLAG_REGISTRY["ed_work_record"] = {
    label: "求人条件の説明を記録した",
    description: "個別の仮想イベントに関する本人の経験。地域全体・時代全体の公的制度や必然的な結果ではない。",
    engine: "テラの大地で起こる差別・追跡イベント",
    source: "SIM:DiscriminationPack",
    lifecycle: "本人の人生に継続。後続イベントの明示的な解消時のみ解除。"
  };
});
