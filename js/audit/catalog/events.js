function validateEvents(W_, services, ids, cc, weight, fx, checkAffordableCashEffect, checkCashGateEffect) {
  services.EV.forEach(e => {
    const w = e.id;
    if (!w || ids.has(w)) W_.push(`重複または空のid: ${w}`);
    ids.add(w);
    if (e.conf && !services.DATA_GUIDE.confidence[e.conf]) W_.push(`${w}: 未知の確度ラベル「${e.conf}」`);
    (e.references || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${w}: 未定義の資料ID「${ref}」`);
    });
    if (e.crisisPolicy != null && (e.crisisPolicy !== "nonessential-leisure" || e.c))
      W_.push(`${w}: crisisPolicyは選択肢のない日常イベントのnonessential-leisureだけを許可`);
    if (e.timelineFlag != null &&
      (typeof e.timelineFlag !== "string" ||
        !services.HIST.some(entry => entry.flag === e.timelineFlag)))
      W_.push(`${w}: timelineFlagに対応する年表IDがない`);
    if(e.timelineFlag&&!e.historicalScene)W_.push(`${w}: 年表場面の分類がない`);
    if (e.historicalScene != null) {
      const scene = e.historicalScene;
      if (!e.timelineFlag || !["suspended","direct","area-impact","report-response","journey"].includes(scene.delivery) ||
          !["event-year","ongoing"].includes(scene.dateMode))
        W_.push(`${w}: 歴史場面の分類・年代契約が不正`);
      if (scene.delivery === "direct" &&
          (!scene.city || !scene.region || !services.REG.some(g => g.n === scene.region) ||
           !(services.SIM_TABLES.namedCities[scene.region] || []).includes(scene.city)))
        W_.push(`${w}: 直接体験の都市と地域が未登録`);
      if (scene.delivery === "area-impact" &&
          !services.REG.some(g => g.n === scene.region))
        W_.push(`${w}: 地域影響の地域が未登録`);
      const validDate=x=>Array.isArray(x)&&Number.isInteger(x[0])&&Number.isInteger(x[1])&&x[1]>=1&&x[1]<=12;
      if(!validDate(scene.from)||!validDate(scene.through)||
        scene.from[0]*12+scene.from[1]>scene.through[0]*12+scene.through[1])W_.push(`${w}: 歴史場面の期間が不正`);
      if(scene.delivery==="suspended"&&!scene.reason)W_.push(`${w}: 休眠場面の根拠がない`);
      if(["area-impact","report-response","journey"].includes(scene.delivery)&&
        e.c?.some(c=>c.o.some(o=>o[2]?.d)))W_.push(`${w}: 現場外の歴史場面に死亡結果がある`);
    }
    if (e.w != null) weight(e.w, w);
    if (e.cd != null && (!Number.isFinite(e.cd) || e.cd < 0)) W_.push(`${w}: 再発待機期間が不正`);
    if (e.inConfinement != null && typeof e.inConfinement !== "boolean")
      W_.push(`${w}: 収容・隔離中の発生可否が真偽値でない`);
    if (
      e.months &&
      (!Array.isArray(e.months) ||
        !e.months.length ||
        e.months.some(m => !Number.isInteger(m) || m < 1 || m > services.CALENDAR_MONTHS))
    )
      W_.push(`${w}: 発生月の指定が不正`);
    if (!e.st && (!e.ge || e.ge.age == null) && (!e.le || e.le.age == null))
      W_.push(`${w}: 時期(st)も年齢条件もなく、全年齢で発生する`);
    (e.st || []).forEach(x => services.STG.includes(x) || W_.push(`${w}: 未知の時期「${x}」`));
    cc(e, w, true);
    cc(e.show, w + " show");
    if (e.groundOnly != null && typeof e.groundOnly !== "boolean")
      W_.push(`${w}: groundOnlyは真偽値ではない`);
    if (!e.t) W_.push(`${w}: 本文がない`);
    if (e.displayTone != null && !["good", "bad"].includes(e.displayTone))
      W_.push(`${w}: displayToneはgood/badのいずれでもない`);
    if (Array.isArray(e.t)) {
      e.t.forEach(v => cc(v.when, w));
      if (e.t.every(v => v.when)) W_.push(`${w}: 条件なしの既定文がない`);
    }
    if (e.c) {
      if (!e.c.length) W_.push(`${w}: 選択肢がない`);
      e.c.forEach((c, i) => {
        const x = `${w}#${i + 1}`;
        const choiceKeys = new Set(["l", "t", "o", "intent", "ethics", "en", "show", "why", "pw"]);
        for (const key of Object.keys(c)) if (!choiceKeys.has(key))
          W_.push(`${x}: 未知の選択肢キー「${key}」`);
        if (!c.l) W_.push(`${x}: ラベルがない`);
        if (!c.o || !c.o.length) W_.push(`${x}: 結果がない`);
        else {
          let prev = 0;
          c.o.forEach((o, j) => {
            const y = `${x} 結果#${j + 1}`;
            if (!Array.isArray(o) || (o.length !== 3 && o.length !== 4)) {
              W_.push(`${y}: 結果は[累積確率,本文,効果,(displayTone)]でない`);
              return;
            }
            if (typeof o[0] !== "number" || !Number.isFinite(o[0]) || o[0] <= prev || o[0] > 1)
              W_.push(`${y}: 累積確率が0〜1の範囲で単調増加していない`);
            else prev = o[0];
            if (typeof o[1] !== "string" || !o[1].trim()) W_.push(`${y}: 結果本文がない`);
            if (o.length === 4 && !["good", "bad"].includes(o[3]))
              W_.push(`${y}: displayToneはgood/badのいずれでもない`);
            fx(o[2], x);
            checkAffordableCashEffect(c.en, o[2], y);
            checkCashGateEffect([e, c.en, c.show], o[2], y);
          });
          if (c.o[c.o.length - 1]?.[0] !== 1) W_.push(`${x}: 最後の結果の確率が1でない`);
        }
        if (c.pw != null) weight(c.pw, `${x} 親判断重み`);
        cc(c.show, x);
        cc(c.en, x);
        if (c.en && !c.why) W_.push(`${x}: 選べない理由(why)がない`);
      });
    } else {
      fx(e.fx, w);
      checkAffordableCashEffect(e, e.fx, w);
      checkCashGateEffect([e], e.fx, w);
    }
    if (e.who && typeof e.who != "function" && !["parent", "self"].includes(e.who))
      W_.push(`${w}: whoが不正`);
  });
  services.EV.forEach(e =>
    (e.c || []).forEach((choice, index) => {
      const value = choice.en?.affordableParentHouseholdCash;
      if (value != null && (typeof value !== "number" || !Number.isFinite(value) || value < 0))
        W_.push(`${e.id}#${index + 1}: affordableParentHouseholdCashは0以上の有限な金額ではない`);
    })
  );
  services.EV.forEach(e => {
    if (e.after && !ids.has(e.after.id)) W_.push(`${e.id}: afterの参照先「${e.after.id}」がない`);
    (e.excl || []).forEach(x => ids.has(x) || W_.push(`${e.id}: exclの参照先「${x}」がない`));
  });
}
