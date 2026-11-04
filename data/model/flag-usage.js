// model/flag-usage: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("model/flag-usage", function ($terraData, $define, $rules) {
  "use strict";
  $define(
    "eventFlagValues",
    (node, id, out = []) => {
      if (!node || typeof node !== "object") return out;
      if (Array.isArray(node)) {
        node.forEach(x => $terraData.eventFlagValues(x, id, out));
        return out;
      }
      if (node.fl && Object.prototype.hasOwnProperty.call(node.fl, id)) out.push(node.fl[id]);
      if(id==="sch" && ["primary","case:commit","case:commit-grant","case:commit-loan"].includes(node.educationAction))out.push(1);
      (node.o || []).forEach(o => $terraData.eventFlagValues(o[2], id, out));
      return out;
    },
    false,
    true
  );

  $define("_flagAliasCount", -1, true);
  $define("_flagAliases", new Map(), true);

  $define(
    "eventFlagRefs",
    (node, out = new Set()) => {
      if (!node || typeof node !== "object") return out;
      if (Array.isArray(node)) {
        for (const item of node) $terraData.eventFlagRefs(item, out);
        return out;
      }
      const aliases = $terraData.flagAliases();
      for (const key of ["need", "any", "ban"]) {
        const list = Array.isArray(node[key]) ? node[key] : typeof node[key] === "string" ? [node[key]] : [];
        for (const word of list) {
          if (typeof word !== "string") continue;
          for (const id of aliases.get(word) || []) out.add(id);
        }
      }
      for (const value of Object.values(node)) $terraData.eventFlagRefs(value, out);
      return out;
    },
    false,
    true
  );

  $define("_eventRefsCache", new WeakMap(), false);

  $define(
    "cachedEventFlagRefs",
    event => {
      const count = Object.keys($terraData.FLAG_REGISTRY).length;
      const sig = JSON.stringify([event.need, event.any, event.ban]);
      const old = $terraData._eventRefsCache.get(event);
      if (old && old.count === count && old.sig === sig) return old.refs;
      const refs = $terraData.eventFlagRefs(event);
      $terraData._eventRefsCache.set(event, { count, sig, refs });
      return refs;
    },
    false,
    true
  );

  $define(
    "ENGINE_FLAG_CLEARERS",
    {
      sch: ["教育状態機械で修了・退学・休学などにより在籍を終える、または中断したとき"],
      debt_yakuza: ["年次家計で負債残高が0になったとき", "イベント結果で全債務を返済したとき"],
      parent_unemployed: ["本人が養育家計の管理年齢を終えたとき"],
      retired: ["職業を付与するイベントで就労へ戻ったとき"],
      tx: [
        "本人が治療を停止したとき",
        "治療費を家計・本人資産から支払えなくなったとき",
        "拘束開始時に外部診療を継続できなくなったとき"
      ],
      insured: ["クルビア国外へ転居したとき", "年次保険料を支払えないとき"],
      pet_care_outsourced: ["収容・隔離状態が終わったとき"],
      pet_care_extended: ["飼育動物を新しく迎えたとき", "飼育動物との別れを選んだとき"],
      seg_work: ["隔離状態が終わったとき", "拘束へ移ったとき"],
      custody_contact: ["再び拘束され、外部連絡をやり直す必要が生じたとき"],
      neighbor_contact: ["別地域へ転居したとき"],
      neighbor_welcome: ["別地域へ転居したとき"],
      neighbor_familiar: ["別地域へ転居したとき"],
      infection_community_rumor_current_area: ["住居を変更、または別地域へ転居したとき"],
      infection_housing_rumor_current_home: ["住居を変更、または別地域へ転居したとき"]
    },
    false
  );

  $terraData.refreshFlagUsage();

  Object.entries($terraData.FLAG_REGISTRY).forEach(([id, meta]) => {
    meta.type = "boolean";
    meta.valueDomain = "0=解除・なし、1=有効";
    meta.source = "EVの選択結果によるゲーム上の状態";
    meta.engineClearers = $terraData.ENGINE_FLAG_CLEARERS[id] || [];
    const releasePaths = [
      meta.clearers.length ? `イベント結果（${meta.clearers.join("・")}）` : "",
      meta.engineClearers.length ? `エンジン処理（${meta.engineClearers.join("・")}）` : ""
    ].filter(Boolean);
    meta.lifecycle = releasePaths.length
      ? `状態フラグ。${releasePaths.join("、")} で解除され、それ以外は解除条件まで保持。`
      : $terraData.FLAG_STATE_KEYS.has(id)
        ? "状態フラグ。現行イベント・エンジンに解除処理がなく、有効化後は人生終了まで保持。"
        : "経歴フラグ。一度記録されると人生終了まで保持。";
    if (id === "sch") meta.source="本人の入学選択と教育状態機械の在籍・修了・中断処理";
    if (id === "insured") meta.source = "EVの加入結果と年次家計処理によるゲーム上の状態";
    if (id === "pet_care_outsourced") {
      meta.source = "本人の選択と収容・隔離状態によるゲーム上の状態";
      meta.lifecycle = "収容・隔離中の飼育動物の預け先を示す。本人が制限状態を終えるとエンジンが解除する。";
    }
    if (id === "pet_care_extended") {
      meta.source = "EVの終末期治療結果によるゲーム上の状態";
      meta.lifecycle =
        "一匹の終末期治療で相談間隔が延びたことを示す。一匹との別れ、または次の個体を迎えた際に解除する。";
    }
    if (id === "seg_work")
      meta.lifecycle = "状態フラグ。隔離を終えるか収容へ移されたとき、エンジンが解除する。";
    if (id === "custody_contact")
      meta.lifecycle = "状態フラグ。再び収容されたとき、エンジンが解除して連絡の取り直しが必要となる。";
    if (["neighbor_contact", "neighbor_welcome", "neighbor_familiar"].includes(id))
      meta.lifecycle =
        "現在の居住先に結び付く状態フラグ。転居時にエンジンが解除する。後日談の未決着状態と返礼記録は、後日談でも解除する。";
  });
});
