// 所属ごとの活動範囲。scopeは現地での仕事を制限し、便りや過去の在籍を消さない。
// sourceは判断を照合する実装入口、reasonは地域・職場・移動隊・個人的接点の区別。
// sourceの値はイベントID。監査軸は加入/配属、実務と職、居住地/任地、移転/一時任務/航行、休止/復帰/終了/後年。
// contact/personal/network/projectは雇用を意味しない。既存の危険・信念・債務・身体履歴を所属変更だけで消さない。
// 移転による休止を個人的な休止と分け、帰還だけで休止前の危機が解消したことにしない。
const affiliationRule = (scope, region, jobs, goal, source, reason) => ({scope, region, jobs, goal, source, reason});
const AFFILIATION_RULES = Object.freeze({
  "terra-general-transporter": affiliationRule("occupation", null, [16], "transporter-work", "car/transporter_contract_review", "各地で続ける職業。転居だけでは終わらず、転職・退職で現役を終える"),
  "kjerag-village-transporter": affiliationRule("region", "イェラグ", [16], "kjerag-transporter-route", "car/kjerag_transporter_route_review", "複数集落を結ぶ便。村一つに固定せず国外転居・転職で終了"),
  "columbia-technical-work": affiliationRule("workplace", "クルビア", [7], "columbia-technical-work", "col_tech_*", "同じ企業の設備・調達案件。別の街区・職場へ持ち越さず、退職後の技能は残す"),
  "victoria-insurance-clerk": affiliationRule("workplace", "ヴィクトリア", [21], "victoria-clerk-livelihood", "vic_clerk_*", "特定仲介所の帳簿係。職場を離れた後は勤務経験の後日談へ移る"),
  "rim-catastrophe-survey-assistant": affiliationRule("region", "レム・ビリトン", [27], "rim-catastrophe-fieldwork", "rim_catastrophe_transporter_review", "鉱山調査班への同行。地区の転居とは分離し、国外・転職で班の勤務を終える"),
  "sargon-market-guard-contracts": affiliationRule("contract", "サルゴン", null, "sargon-market-guard-work", "car/sargon_market_contract_review", "一件ごとの短期請負。受注・終了を各在籍期間に分け、次の依頼は別契約"),
  "ursus-kleini-sever-mine": affiliationRule("workplace", "ウルサス", [3], "ursus-kleini-sever-survival", "ursus_mine_assignment_*", "監視付き鉱区の強制配属。実際の脱出・転居・職務終了と期間を対応させる"),
  "lei-music-patronage": affiliationRule("personal", null, null, "lei-music-practice", "lei_noble/lei_noble_after/lei_noble_later", "後援者一人との接点。国外でも便りは可能で、貴族家への所属や常勤雇用ではない"),
  "lei-music-casual-work": affiliationRule("personal", null, null, "lei-music-livelihood", "lei_noble/lei_noble_after/lei_noble_later", "短期仕事の紹介先とのつながり。年間雇用とは扱わず、その都度の仕事だけ記録"),
  "siracusa-familia": affiliationRule("network", "シラクーザ", null, "siracusa-family-livelihood", "sir_family_*", "ファミリーとの関係・借りは転居で消さない。地区の用事と遠隔の債務確認は分離"),
  "siracusa-post-family-work": affiliationRule("workplace", "シラクーザ", [16,24], "siracusa-post-family-work", "sir_family_afterwork/sir_family_later_work", "離脱後の地区の配達・露店。転職・転居でその職場を終え、以前のファミリーへ戻さない"),
  "iberia-coastal-recovery-contract": affiliationRule("contract", "イベリア", null, "iberia-coastal-recovery-work", "ibe_rebuild/ibe_rebuild_contract_review", "倉庫ごとの短期復旧。別の現場の再契約と、期間外の生活を区別"),
  "higashi-service": affiliationRule("region", "極東", [14], "higashi-service", "hig_tension/hig_service_*", "任地は変わり得る軍務・兵站。任期更新・転職・退役と現職を一致させる"),
  "reunion-reorg": affiliationRule("mobile-network", null, null, "reunion-relief", "life_reunion_reorg_*/sr_reunion_*", "地域連絡、国境野営地、移動隊を配属として分離。組織の連絡は転居後も継続可能。国境拠点をウルサス側の匿名集落へ接続するのは居住モデル上の近似で、村名・座標は推定しない"),
  "kazimierz-competition-career": affiliationRule("region", "カジミエーシュ", [10], "kazimierz-competition-career", "kazimierz_knight_entry/kaz_knight_*", "会場を巡る競技騎士。単一会場に固定せず、負傷転職・引退・国外転居で現役を終了"),
  "kazimierz-arena-staff": affiliationRule("workplace", "カジミエーシュ", [32], "kazimierz-arena-work", "sr_kazimierz_arena_*/kaz_knight_later_career_review", "特定会場の運営雇用。試しの一日手伝いと区別し、会場を離れたら勤務終了"),
  "local-mutual-aid": affiliationRule("district", null, null, "neighborhood-mutual-aid", "life_local_mutual_aid*", "元の近所の当番。転居後の引継ぎ・休止と、同じ生活圏への帰還後の復帰を分離"),
  "rhodes-care": affiliationRule("contact", null, null, "rhodes-care", "life_rhodes_referral*/life_rhodes_clinic*/life_rhodes_care_review", "紹介・予約・受診の連絡先。職員資格ではなく、転居後は巡回予約を再調整する"),
  "rhodes-employment": affiliationRule("contact", null, null, "rhodes-job-search", "sr_rhodes_recruitment_contact/sr_rhodes_hiring_review/sr_rhodes_reapplication", "応募照会。採用・不採用で照会を閉じ、採用後の職員在籍を別に始める"),
  "bsw-contract": affiliationRule("organization", "クルビア", [35, 36, 37], "bsw-work", "sr_bsw_*", "クルビアの民間軍事会社BSWでの警備契約・戦術任務雇用。契約更新・派遣・退職を管理"),
  "rhine-lab": affiliationRule("organization", "クルビア", [38, 39, 40], "rhine-research", "sr_rhine_*", "クルビア・トリマウンツのライン生命研究所における研究雇用・特許契約。専門科配属と研究倫理を管理"),
  "rhodes-staff": affiliationRule("organization", null, [28,29,30,31,33,34], "rhodes-work", "sr_rhodes_*", "本艦・地域支部・外勤の雇用。船の航行や一時任務を転居とせず、支部異動は配属を更新"),
  "reunion-1096": affiliationRule("mobile-network", null, null, "protect-neighbours", "life_reunion_early_*/life_reunion_chernobog_*", "初期移動野営地、チェルノボーグ臨時拠点、散開後の連絡を分離。壊滅後の旧拠点勤務を続けない"),
  "ursus-school-aid": affiliationRule("network", null, null, null, "life_ursus_school_aid*", "同級生と避難先の連絡網。卒業・転居後も便りを続けられ、学校在籍や同居を意味しない"),
  "infected-exclusion": affiliationRule("district", null, null, "order-through-exclusion", "life_infected_association*/life_infected_organization*/v87_exclusion_organizer_infected", "地域の住民会。現地会合と主催者の罹患・思想・過去の排斥行為を分け、転居で加害履歴を消さない"),
  "infected-mutual-aid": affiliationRule("district", null, null, "infected-mutual-aid", "life_infected_org*", "共同購入と診療連絡の会。元の地区の配給・名簿を別の地区の仕事として扱わない"),
  "rhodes-research": affiliationRule("project", null, null, "oripathy-research", "life_rhodes_research_*", "共同研究への協力。職員雇用とは別で、遠隔の記録協力、休止、研究離脱を維持"),
  "chernobog-neighbourhood": affiliationRule("network", null, null, "chernobog-household-continuity", "life_chernobog_resident_*", "避難先からも便りを待てる近隣連絡。加入元は出発前の都市で、転居先への加入と混同しない"),
  "londinium-mutual-aid": affiliationRule("district", null, null, "londinium-civilian-continuity", "life_londinium_*", "配給・寝床案内の現地当番。原生活圏への帰還が復帰条件で、紹介元の組織とは別所属"),
  "ursus-student-assembly": affiliationRule("city-network", "ウルサス", null, "ursus-student-assembly", "life_ursus_student_assembly_*", "学生連合との接点。会合・抗議は元の都市、転居・卒業後の旧友への便りは維持"),
  "leithanian-district-petition": affiliationRule("district", "リターニア", null, "leithanian-district-petition", "life_leithanian_civic_*", "地区の要望書・橋の議論。転居先へ旧地区の代表権を持ち越さず、離脱後の経験を残す"),
  "leithanian-noble-household": affiliationRule("district", "リターニア", null, "leithanian-noble-household", "life_leithanian_noble_household_*", "家名・血縁と、屋敷の帳簿・器具を預かる現地役目を分ける。転居後は担当を休止・終了"),
  "siracusa-independent-trade": affiliationRule("district", "シラクーザ", null, "siracusa-independent-livelihood", "sr_siracusa_trade_*", "地区市場の仕入れと帳簿。元の市場の条件を新しい町へ持ち越さない"),
  "ursus-zelgrad-factory": affiliationRule("workplace", "ウルサス", [2], "ursus-zelgrad-work", "life_ursus_zelgrad_*", "採用と転居の後のゼルグラード工場に結ぶ。避難時に在籍を終え、避難先の工房とは別職場"),
  "ursus-displaced-repair-workshop": affiliationRule("workplace", null, [2], "ursus-zelgrad-after-crisis", "life_ursus_zelgrad_displaced_work*", "避難先で新しく雇われる工房。再転居・転職後に旧工房勤務を続けない"),
  // --- 全19地域 国特有の専門組織・職種 ---
  // 東方
  "yan-court-bureaucracy": affiliationRule("organization", "炎国", [41], "yan-governance", "car/yan_court_*", "炎国三省六部の朝廷官吏。科挙合格と律令行政"),
  "yan-suis-inquisition": affiliationRule("organization", "炎国", [42], "yan-suis-investigation", "car/yan_suis_*", "炎国司歳台・大理寺の監察特務。巨獣と朝廷腐敗の監視"),
  "yan-tianshi-academy": affiliationRule("organization", "炎国", [43], "yan-tianshi-arts", "car/yan_tianshi_*", "炎国天師府のアーツ官僚。土木・農業・気象のアーツ運用"),
  "lungmen-guard-bureau": affiliationRule("organization", "龍門", [44], "lmd-law-enforcement", "car/lmd_guard_*", "龍門近衛局（L.G.D.）の正規警官。移動都市の治安維持と対テロ警備"),
  "lungmen-black-market": affiliationRule("network", "龍門", [45], "lmd-underground-deals", "car/lmd_black_*", "龍門スラム・裏社会の情報ブローカー。水面下の密取引"),
  "higashi-samurai-household": affiliationRule("organization", "極東", [46], "higashi-samurai-duty", "car/hig_samurai_*", "極東武家の家臣・侍。主君への忠誠と武士道"),
  "higashi-ninja-clan": affiliationRule("network", "極東", [47], "higashi-ninja-mission", "car/hig_ninja_*", "極東の隠密・忍者。影の任務遂行。脱走時は抜け忍として追われる"),
  "higashi-cyber-intelligence": affiliationRule("organization", "極東", [48], "higashi-cyber-defense", "car/hig_cyber_*", "極東の国家電脳防諜機関。1088年鎖川サイバー攻撃の系譜を引く暗号諜報"),
  "higashi-shinto-temple": affiliationRule("organization", "極東", [49], "higashi-shinto-devotion", "car/hig_shinto_*", "極東の神社神官・寺院僧侶。神仏習合の儀礼と穢れの鎮魂"),
  "higashi-touhou-heavy": affiliationRule("organization", "極東", [50], "higashi-touhou-manufacturing", "car/hig_touhou_*", "東方重工の工場・兵器開発。手裏剣・刀剣・サイバー武装製造"),
  // 北西大国
  "ursus-imperial-officer": affiliationRule("organization", "ウルサス", [51], "ursus-imperial-command", "car/urs_officer_*", "ウルサス帝国軍・近衛軍の貴族将校。軍国主義の指揮官"),
  "ursus-border-mine-guard": affiliationRule("organization", "ウルサス", [52], "ursus-border-mine-patrol", "car/urs_guard_*", "ウルサス国境警備および感染者炭鉱監視兵。過酷な最前線肉壁"),
  "ursus-imperial-academy-science": affiliationRule("organization", "ウルサス", [53], "ursus-science-engineering", "car/urs_academy_*", "ウルサス帝国科学院の重工業技師。装甲列車と軍用都市設計"),
  "victoria-regular-infantry": affiliationRule("organization", "ヴィクトリア", [54], "victoria-infantry-service", "car/vic_infantry_*", "ヴィクトリア正規陸軍の平民歩兵。泥にまみれる使い捨て兵士"),
  "victoria-royal-officer": affiliationRule("organization", "ヴィクトリア", [55], "victoria-officer-career", "car/vic_royal_*", "王立前衛学校卒のエリート将校。公爵派閥の権力闘争"),
  "victoria-parliament-scribe": affiliationRule("organization", "ヴィクトリア", [56], "victoria-parliament-governance", "car/vic_scribe_*", "ヴィクトリア帝国議会・貴族院の書記官。官僚機構の実務"),
  "victoria-locomotive-works": affiliationRule("organization", "ヴィクトリア", [57], "victoria-locomotive-engineering", "car/vic_works_*", "ヴィクトリア鉄道工廠・製鋼工場の重工業技師。蒸気動力の心臓部"),
  "leithania-golden-law": affiliationRule("organization", "リターニア", [58], "leithania-golden-law-enforce", "car/lei_golden_*", "リターニア金律法衛。女帝直属の音律法典執行部隊"),
  "leithania-court-musician": affiliationRule("personal", "リターニア", [59], "leithania-court-music", "car/lei_court_*", "選帝侯領の宮廷音楽家・アーツ演奏家。貴族パトロンへの奉仕"),
  "laterano-notarial-executor": affiliationRule("organization", "ラテラーノ", [60], "laterano-notarial-execution", "car/lat_executor_*", "ラテラーノ公証人役場の執行人。サンクタ法典の履行と守護銃"),
  "laterano-landen-monastery": affiliationRule("organization", "ラテラーノ", [61], "laterano-landen-devotion", "car/lat_landen_*", "ランデン修道院の修道銃士。伝統銃器と信仰の護持"),
  // 企業・商業・自治
  "columbia-frontier-pioneer": affiliationRule("region", "クルビア", [62], "columbia-frontier-survival", "car/col_pioneer_*", "クルビアのフロンティア開拓者。自己責任の荒野農場経営"),
  "kazimierz-competition-knight": affiliationRule("organization", "カジミエーシュ", [63], "kazimierz-arena-glory", "car/kaz_comp_knight_*", "商業連合会公認の企業騎士。アリーナでの競技とスポンサー契約"),
  "kazimierz-armorless-union": affiliationRule("network", "カジミエーシュ", [64], "kazimierz-armorless-elimination", "car/kaz_armorless_*", "無冑盟の暗殺部隊員。商業連合会の裏の汚れ仕事と脱出不可の掟"),
  "siracusa-mafia-soldier": affiliationRule("network", "シラクーザ", [65], "siracusa-mafia-loyalty", "car/sir_soldier_*", "シラクーザ12ファミリーの構成員。オメルタの沈黙の掟と血の抗争"),
  "siracusa-court-police": affiliationRule("organization", "シラクーザ", [66], "siracusa-court-justice", "car/sir_police_*", "ヌオバ・ウォルシーニ裁判所・都市警察官。マフィア支配からの脱却"),
  "siesta-observatory-research": affiliationRule("organization", "シエスタ", [67], "siesta-volcano-monitoring", "car/sie_obs_*", "シエスタ火山観測所の研究員。黒曜石火山と天災警報"),
  // 辺境・自然・海洋・特異
  "sargon-padishah-guard": affiliationRule("organization", "サルゴン", [68], "sargon-padishah-service", "car/sar_guard_*", "パーディシャー直属の宮廷親衛隊員。領主への忠誠と砂漠警備"),
  "sargon-acahualla-warrior": affiliationRule("region", "サルゴン", [69], "sargon-acahualla-might", "car/sar_warrior_*", "アカフラ密林の大勇士。大祭での決闘と部族の結束"),
  "sami-snow-priest": affiliationRule("organization", "サーミ", [70], "sami-nature-communion", "car/sam_priest_*", "サーミの雪祀。原始林と巨獣の代弁者。幻視と精神の試練"),
  "sami-scar-warrior": affiliationRule("region", "サーミ", [71], "sami-scar-demon-defense", "car/sam_warrior_*", "氷原境界の哨戒戦士（樹痕の戦士）。北方悪魔・崩壊体との死闘"),
  "kjerag-karlan-commercial": affiliationRule("organization", "イェラグ", [72], "kjerag-karlan-trade", "car/kje_karlan_*", "カランド貿易の武装社員。近代化推進と三大家族の対立"),
  "kjerag-vine-court-monk": affiliationRule("organization", "イェラグ", [73], "kjerag-vine-guard", "car/kje_monk_*", "曼珠院の聖山護衛僧。カランドの女神信仰と伝統護持"),
  "kazdel-military-commission": affiliationRule("organization", "カズデル", [74], "kazdel-commission-conquest", "car/kazdel_mil_*", "カズデル軍事委員会の正規サルカズ兵。テレシス派の遠征部隊"),
  "kazdel-bone-smith": affiliationRule("organization", "カズデル", [75], "kazdel-bonesmith-craft", "car/kazdel_bone_*", "カズデル伝統の骨鍛冶。源石呪術と遺骨加工の工芸"),
  "iberia-inquisition-officer": affiliationRule("organization", "イベリア", [76], "iberia-inquisition-crusade", "car/ibe_inq_*", "イベリア審問所の見習い審問官。海の怪物・深海教会の徹底粛清"),
  "iberia-lantern-tuner": affiliationRule("organization", "イベリア", [77], "iberia-lantern-tuning", "car/ibe_tuner_*", "イベリア沿岸灯台調律師。大静謐を照らすアーツランタン維持"),
  "bolivar-coalition-soldier": affiliationRule("organization", "ボリバル", [78], "bolivar-coalition-war", "car/bol_soldier_*", "ボリバル正規・真正連合軍兵士。三つ巴の内戦での消耗品"),
  "bolivar-dossoles-police": affiliationRule("organization", "ボリバル", [79], "bolivar-dossoles-security", "car/bol_dossoles_*", "ドッソレス特区市警。カンディード市長の元での観光都市防衛"),
  "rim-mining-lead-engineer": affiliationRule("organization", "レム・ビリトン", [80], "rim-mining-platform-engineering", "car/rim_eng_*", "レム・ビリトン鉱山会社の主任技師。採掘プラットフォーム運用"),
  "minos-temple-champion": affiliationRule("organization", "ミノス", [81], "minos-temple-glory", "car/min_champ_*", "ミノス英雄神殿の競技勇士。ポリスの自由と名誉を賭けた競技"),
  "minos-agora-orator": affiliationRule("organization", "ミノス", [82], "minos-agora-debates", "car/min_orator_*", "ミノス市民集会・法廷弁論官。アゴラでの民主的法治弁論")
});

function bindAffiliationPlace(s, affiliation, input, phase = "origin") {
  const rule = AFFILIATION_RULES[affiliation.id];
  // 場所を持たない部分記録から住所を創作しない。通常進行のSには居住地が揃う。
  if (!rule || !s?.res?.n || !s.local?.kind || !s.home) return;
  ensureLocalityState(s);
  affiliation.scope = rule.scope;
  affiliation.origin ||= { region:s.res.n, placeId:s.local.placeId, localityKey:localityKey(s) };
  if (input.bindAt === "destination" && phase !== "destination") return;
  const oldPost = affiliation.posting ? { ...affiliation.posting } : null;
  updateAffiliationResidence(s, affiliation, input);
  if (affiliation.id === "rhodes-care" && ["join", "role", "return"].includes(input.action || "join")) {
    if (affiliation.role === "巡回診療の予約あり")
      affiliation.appointment = { region: s.res.n, localityKey: localityKey(s) };
    else if (affiliation.role !== "転居先の巡回先を照会中") delete affiliation.appointment;
  }
  if (["join", "assign"].includes(input.action || "join") ||
      (input.action === "return" && input.newEpisode)) {
    affiliation.anchor = { region:s.res.n, placeId:s.local.placeId, localityKey:localityKey(s) };
    if (["district", "workplace", "city-network"].includes(rule.scope) || affiliation.id === "siracusa-familia") affiliation.localityKey = localityKey(s);
    if (affiliation.episodes.at(-1)) affiliation.episodes.at(-1).anchor={...affiliation.anchor};
  }
  if (affiliation.id === "rhodes-staff" && /^(本艦|地域支部)/.test(affiliation.role || "")) {
    const kind = affiliation.role.startsWith("本艦") ? "ship" : "branch";
    if (kind !== affiliation.posting?.kind || input.rebindPosting)
      affiliation.posting = { kind, region:s.res.n, localityKey:localityKey(s) };
  }
  if (["reunion-1096", "reunion-reorg"].includes(affiliation.id) &&
      /^(初期移動野営地|チェルノボーグ臨時拠点|国境野営地|移動隊)/.test(affiliation.role || "")) {
    const kind = affiliation.role.split("・")[0];
    if (kind !== affiliation.posting?.kind || input.rebindPosting)
      affiliation.posting = { kind, region:s.res.n, localityKey:localityKey(s) };
  }
  if (affiliation.id === "rhodes-staff" && oldPost &&
      (oldPost.kind !== affiliation.posting?.kind || oldPost.localityKey !== affiliation.posting?.localityKey)) {
    for (const person of s.personTies?.rhodesColleagues || (s.personTies?.rhodesColleague ? [s.personTies.rhodesColleague] : []))
      if (person.actualStatus === "working") person.actualStatus="former";
    if (s.personTies?.rhodesColleague?.actualStatus === "working") s.personTies.rhodesColleague.actualStatus="former";
  }
  const entry=affiliation.history.at(-1);
  if (entry && entry.year===s.year) {
    entry.anchor=affiliation.anchor?{...affiliation.anchor}:null;
    entry.posting=affiliation.posting?{...affiliation.posting}:null;
  }
}
function affiliationWorkAvailable(s, id) {
  const a = s.lifeRecord?.affiliations?.find(row => row.id === id), rule = AFFILIATION_RULES[id];
  if (!a || !["active", "crisis"].includes(a.status)) return false;
  if (rule?.region && s.res?.n !== rule.region) return false;
  if (rule?.jobs && (!rule.jobs.includes(s.job) || s.fl?.retired || restricted(s))) return false;
  if (["district", "workplace"].includes(rule?.scope) && a.anchor && a.anchor.localityKey !== localityKey(s)) return false;
  if (a.posting?.kind === "branch" && a.posting.localityKey !== localityKey(s)) return false;
  if (a.posting?.kind === "ship" && s.residenceBase?.id !== "rhodes-landship") return false;
  if (["初期移動野営地","チェルノボーグ臨時拠点","国境野営地","移動隊"].includes(a.posting?.kind) &&
      (a.role||"").startsWith(a.posting.kind+"・") && a.posting.localityKey !== localityKey(s)) return false;
  if (rule?.scope === "workplace" && a.anchor?.workplaceId && s.siteAffiliations?.workplace)
    return a.anchor.workplaceId === s.siteAffiliations.workplace.facilityId;
  return true;
}
function affiliationAppointmentHere(s, id) {
  const a=s.lifeRecord?.affiliations?.find(row=>row.id===id);
  return !!a?.appointment && a.appointment.localityKey===localityKey(s);
}
// Residence is a current relationship, never a permanent benefit of a past posting.
function isRhodesLandshipResident(s) {
  const staff = s.lifeRecord?.affiliations?.find(a => a.id === "rhodes-staff");
  return s.residenceBase?.id === "rhodes-landship" &&
    s.residenceBase.affiliationId === "rhodes-staff" &&
    ["active", "crisis", "suspended"].includes(staff?.status) &&
    (staff.role || "").startsWith("本艦");
}
function updateAffiliationResidence(s, a, input) {
  let base = null;
  if (a.id === "rhodes-staff" && (a.role || "").startsWith("本艦"))
    base = {id:"rhodes-landship",kind:"landship",label:"ロドス本艦",affiliationId:a.id};
  if (["reunion-1096","reunion-reorg"].includes(a.id)) {
    const prefix=(a.role||"").split("・")[0];
    if (["初期移動野営地","国境野営地","移動隊"].includes(prefix))
      base={id:a.id+":"+prefix,kind:prefix==="移動隊"?"column":"camp",label:"レユニオンの"+prefix,affiliationId:a.id};
  }
  if (!["active","crisis","suspended"].includes(a.status)) base=null;
  if (base && ["join","role","return","continue"].includes(input.action||"join")) {
    if (s.residenceBase?.id !== base.id) {
      clearLocalContacts(s);
      s.residenceBase=base; s.local={...s.local,city:null}; ensureLocalityState(s);
    }
  } else if (s.residenceBase?.affiliationId===a.id &&
    (a.status==="left" || (a.id==="rhodes-staff" && (a.role||"").startsWith("地域支部")) ||
     (["reunion-1096","reunion-reorg"].includes(a.id) && !base))) {
    clearLocalContacts(s);
    s.residenceBase=null; s.local={...s.local}; delete s.local.districtId; ensureLocalityState(s);
  }
  if (a.id === "rhodes-staff") {
    s.fl ||= {};
    s.fl.rhodes_landship = isRhodesLandshipResident(s) ? 1 : 0;
    s.fl.rhodes = ["active", "crisis", "suspended"].includes(a.status) ? 1 : 0;
  }
}
function affiliationChoiceAvailable(choice, s) {
  for (const outcome of choice.o || []) {
    const e = outcome?.[2];
    if (!e || typeof e !== "object") continue;
    const mine=s.lifeRecord?.affiliations?.find(row=>row.id==="ursus-kleini-sever-mine");
    if (mine && ["active","crisis","suspended"].includes(mine.status) && mine.anchor?.localityKey===localityKey(s)) {
      const exit=[e.lifeAffiliation,...(e.lifeAffiliations||[])].some(a=>a?.id===mine.id && a.action==="leave");
      if (!exit && (e.res || e.resTo || e.home || e.returnToLocality || (e.job!=null && e.job!==3) || e.siteAction?.kind==="workplace")) return false;
    }
    if (e.resTo && e.resTo !== s.res?.n && !moveDestinations(s).some(row=>row.n===e.resTo)) return false;
    if (e.returnToLocality && !canReturnToResidence(s,e.returnToLocality==="previous"?previousResidenceKey(s):e.returnToLocality)) return false;
    for (const input of [e.lifeAffiliation, ...(e.lifeAffiliations || [])].filter(Boolean)) {
      const a = s.lifeRecord?.affiliations?.find(row => row.id === input.id);
      if ((input.action || "join") === "join" && a && !["outside", "contacted", "left"].includes(a.status)) return false;
      if (input.action === "contact" && a && ["active", "crisis", "suspended", "contacted"].includes(a.status)) return false;
    }
  }
  return true;
}
const AFFILIATION_LOCAL_EVENTS = [
    ["infected-mutual-aid", /^life_infected_org_(records|rotation|recipients|finance|privacy|reentry)$/],
    ["infected-exclusion", /^life_infected_(association_review|organization_dues)$/],
    ["infected-exclusion", /^life_infected_(exclusion_consequence|exclusion_pause_review)$/],
    ["infected-mutual-aid", /^life_infected_(association_review|organization_dues)$/],
    ["infected-mutual-aid", /^life_infected_mutual_aid_shortage$/],
    ["leithanian-noble-household", /^life_leithanian_noble_household_(routine|review|later_active|later_suspended)$/],
    ["ursus-student-assembly", /^life_ursus_student_assembly_(meeting|protest)$/],
    ["siracusa-familia", /^sir_family_(review|duty)$/],
    ["siracusa-post-family-work", /^sir_family_later_work$/],
    ["ursus-displaced-repair-workshop", /^life_ursus_zelgrad_displaced_work_review$/],
    ["ursus-zelgrad-factory", /^life_ursus_zelgrad_work_review$/]
];
function affiliationEventAvailable(e, s) {
  const local = AFFILIATION_LOCAL_EVENTS.filter(([id, pattern]) => pattern.test(e.id) && s.lifeRecord?.affiliations?.some(a => a.id === id));
  if (local.length && !local.some(([id]) => {
    const a = s.lifeRecord.affiliations.find(row => row.id === id);
    return a.anchor ? (AFFILIATION_RULES[id].scope === "city-network"
      ? a.anchor.placeId === s.local?.placeId && a.anchor.region === s.res?.n
      : a.anchor.localityKey === localityKey(s)) : true;
  })) return false;
  return true;
}
function reconcileAffiliationWork(s, preserveCurrentJob = false) {
  if (s !== S) return;
  for (const a of s.lifeRecord?.affiliations || []) {
    const rule = AFFILIATION_RULES[a.id];
    if (a.id==="ursus-kleini-sever-mine" && a.anchor?.localityKey===localityKey(s)) {
      if (preserveCurrentJob && a.status==="suspended" && s.job===3 && !s.fl?.retired && !restricted(s))
        applyLifeAffiliation({id:a.id,action:"return",resumePriorStatus:true,note:"鉱区内で採掘作業を再開した"});
      if (["active","crisis"].includes(a.status) && (s.job!==3 || s.fl?.retired || restricted(s))) {
        applyLifeAffiliation({id:a.id,action:"suspend",pauseContext:"work-interruption",note:"作業を中断。鉱区を離れた記録はない"});
        continue;
      }
    }
    if (!rule?.jobs || !["active", "crisis"].includes(a.status)) continue;
    const matches = rule.jobs.includes(s.job) && !s.fl?.retired && !restricted(s) &&
      (!rule.region || s.res.n === rule.region) &&
      (rule.scope !== "workplace" || !a.anchor || a.anchor.localityKey === localityKey(s)) &&
      (!a.anchor?.workplaceId || !s.siteAffiliations?.workplace || a.anchor.workplaceId === s.siteAffiliations.workplace.facilityId) &&
      (a.posting?.kind !== "branch" || a.posting.localityKey === localityKey(s));
    const posted = a.posting?.kind !== "ship" || s.residenceBase?.id === "rhodes-landship";
    if (matches && posted) continue;
    const priorJob = rule.jobs.includes(s.job);
    applyLifeAffiliation({ id:a.id, action:"leave", note:"転居・転職・勤務終了により、この職場や任地での仕事を終えた" });
    const goal = s.lifeRecord.goals.find(row => row.id === rule.goal);
    if (goal && ["active", "paused", "compromised"].includes(goal.status))
      applyLifeGoal({id:goal.id, action:"compromise", note:"この職場・任地を離れ、次の生計を考える"});
    // Regional career IDs 41–82 have no transferable employment contract.
    // A personal, regional or network affiliation can close without a workplace scope.
    if (!preserveCurrentJob && priorJob && (
      ["workplace", "organization"].includes(rule.scope) ||
      ["higashi-service", "kazimierz-competition-career", "rim-catastrophe-survey-assistant"].includes(a.id) ||
      (s.job >= 41 && s.job <= 82)
    )) {
      const before = s.job; s.job=0; s.workPayBonus=0; s.fl.workplace_hazard=0;
      recordCareerChange(s,before,0);
    }
    if (a.id === "higashi-service") s.fl.higashi_service=0;
    if (a.id === "kazimierz-competition-career") s.fl.knight=0;
  }
}
function finishAffiliationPlaces(e, s) {
  if (e.res || e.home || e.resTo || e.returnToLocality) ensureLocalityState(s);
  for (const input of [e.lifeAffiliation, ...(e.lifeAffiliations || [])].filter(Boolean)) {
    const a = s.lifeRecord?.affiliations?.find(row => row.id === input.id);
    if (!a || !["active", "crisis", "suspended"].includes(a.status)) continue;
    if (input.bindAt === "destination") bindAffiliationPlace(s, a, input, "destination");
    if (["join", "return", "assign"].includes(input.action || "join") && AFFILIATION_RULES[a.id]?.scope === "workplace") {
      const site = activeFacility(s,"workplace");
      if (site) a.anchor.workplaceId=site.id;
      if (a.episodes.at(-1)) a.episodes.at(-1).anchor={...a.anchor};
    }
  }
}
