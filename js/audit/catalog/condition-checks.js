function createCatalogFieldChecks(W_, services) {
  const okT = t => {
    if (/^[a-z][a-z0-9_]*$/.test(t)) return !!services.FLAG_REGISTRY[t];
    if (services.BT.has(t)) return true;
    const i = t.indexOf(":");
    if (i < 0) return false;
    if (!services.PF.includes(t.slice(0, i + 1))) return false;
    const p = t.slice(0, i + 1),
      v = t.slice(i + 1);
    if (p == "事件:") return services.WFLAGS.has(v);
    if (p == "国:" || p == "出身:") return services.REG.some(g => g.n == v);
    if (p == "種族:") return services.RACE.some(r => r.n == v);
    if (p == "職:") return services.J.some(j => j.n == v);
    if (p == "気質:") return services.TR.some(r => r.n == v);
    if (p == "性別:") return ["男", "女"].includes(v);
    if (p == "方針:") return services.FC.includes(v);
    if (p == "住環境:")
      return [...services.SIM_TABLES.locality.mobile, ...services.SIM_TABLES.locality.fixed].some(
        x => x.n === v
      );
    if (p == "地勢:")
      return Object.values(services.SIM_TABLES.environments)
        .flat()
        .some(x => x.n === v);
    if (p == "都市:") return Object.values(services.SIM_TABLES.namedCities).flat().includes(v);
    return true;
  };
  const conditionKeys = new Set([
    "need", "any", "ban", "ge", "le", "or", "lang", "affordableRoute", "affordableCash",
    "affordableCashAfterReserve", "affordableMedicalCash", "affordableParentHouseholdCash",
    "affordableSiblingCareSupport"
  ]);
  const eventKeys = new Set([
    ...conditionKeys, "id", "conf", "references", "w", "cd", "once", "pri", "st", "months",
    "after", "excl", "inConfinement", "show", "t", "c", "fx", "who", "groundOnly"
  ]);
  const cc = (c, w, event = false) => {
    if (!c) return;
    if (typeof c === "function") return;
    if (typeof c == "string") c = [c];
    if (Array.isArray(c)) c = { need: c };
    if (typeof c !== "object") {
      W_.push(`${w}: 条件がタグ・配列・関数・条件オブジェクトではない`);
      return;
    }
    for (const key of Object.keys(c)) if (!(event ? eventKeys : conditionKeys).has(key))
      W_.push(`${w}: 未知の${event ? "イベント" : "条件"}キー「${key}」`);
    for (const k of ["need", "any", "ban"])
      (c[k] || []).forEach(t => okT(t) || W_.push(`${w}: 未知のタグ「${t}」`));
    for (const k of ["ge", "le"])
      Object.keys(c[k] || {}).forEach(
        x => services.VK.includes(x) || W_.push(`${w}: 未知の数値条件「${x}」`)
      );
    if (
      c.affordableRoute != null &&
      typeof c.affordableRoute !== "boolean" &&
      (typeof c.affordableRoute !== "number" || !Number.isFinite(c.affordableRoute) || c.affordableRoute < 0)
    )
      W_.push(`${w}: affordableRouteは真偽値または0以上の有限な運賃上乗せ額ではない`);
    if (
      c.affordableCash != null &&
      (typeof c.affordableCash !== "number" || !Number.isFinite(c.affordableCash) || c.affordableCash < 0)
    )
      W_.push(`${w}: affordableCashは0以上の有限な現金額ではない`);
    if (
      c.affordableCashAfterReserve != null &&
      (typeof c.affordableCashAfterReserve !== "number" ||
        !Number.isFinite(c.affordableCashAfterReserve) ||
        c.affordableCashAfterReserve < 0)
    )
      W_.push(`${w}: affordableCashAfterReserveは0以上の有限な現金額ではない`);
    if (
      c.affordableMedicalCash != null &&
      (typeof c.affordableMedicalCash !== "number" ||
        !Number.isFinite(c.affordableMedicalCash) ||
        c.affordableMedicalCash < 0)
    )
      W_.push(`${w}: affordableMedicalCashは0以上の有限な医療費基準額ではない`);
    if (c.affordableSiblingCareSupport != null && typeof c.affordableSiblingCareSupport !== "boolean")
      W_.push(`${w}: affordableSiblingCareSupportは真偽値ではない`);
    (c.or || []).forEach(x => cc(x, w));
  };
  const weight = (v, w) => {
    const a = Array.isArray(v),
      base = a ? v[0] : v;
    if (typeof base !== "number" || !Number.isFinite(base) || base <= 0)
      W_.push(`${w}: 抽選重みの基準値が正の有限数ではない`);
    if (a) {
      if (!v.length) W_.push(`${w}: 条件付き抽選重みが空`);
      v.slice(1).forEach((m, i) => {
        if (!m || typeof m !== "object" || typeof m.x !== "number" || !Number.isFinite(m.x) || m.x <= 0)
          W_.push(`${w}: 条件付き抽選重み#${i + 1}が正の有限数ではない`);
        if (m?.when) cc(m.when, w);
      });
    }
  };
  const fx = (f, w) =>
    Object.keys(f || {}).forEach(k => {
      if (!services.FXK.includes(k)) {
        W_.push(`${w}: 未知の効果「${k}」`);
        return;
      }
      const meta = services.EVENT_FIELD_META[k],
        type = meta?.valueType;
      if (!meta || !meta.unit || !meta.meaning || !type)
        W_.push(`${w}: 効果「${k}」の型・単位・説明台帳がない`);
      if(type === "object" && (!f[k] || typeof f[k] !== "object" || Array.isArray(f[k])))
        W_.push(`${w}: 効果「${k}」がオブジェクトではない`);
      if(type === "objectOrArray" && (!f[k] || typeof f[k] !== "object" ||
        (Array.isArray(f[k]) && f[k].some(x=>!x || typeof x !== "object" || Array.isArray(x)))))
        W_.push(`${w}: 効果「${k}」がオブジェクトまたはその配列ではない`);
      if(type === "text" && (typeof f[k] !== "string" || !f[k].trim()))
        W_.push(`${w}: 効果「${k}」が空でない文字列ではない`);
      if(k === "infectionRoute" && !["dust","wound","deep-wound","mixed"].includes(f[k]))
        W_.push(`${w}: 感染経路が不正`);
      if(k === "debtPlan" && !["frugal","maintain"].includes(f[k]))W_.push(`${w}: 家計再建方針が不正`);
      if (type === "number" && (typeof f[k] !== "number" || !Number.isFinite(f[k])))
        W_.push(`${w}: 効果「${k}」が有限な数値ではない`);
      if (
        type === "numberOrFunction" &&
        typeof f[k] !== "function" &&
        (typeof f[k] !== "number" || !Number.isFinite(f[k]))
      )
        W_.push(`${w}: 効果「${k}」が有限な数値または関数ではない`);
      if (
        type === "objectArray" &&
        (!Array.isArray(f[k]) || f[k].some(item => !item || typeof item !== "object" || Array.isArray(item)))
      )
        W_.push(`${w}: 効果「${k}」がオブジェクト配列ではない`);
      if (k === "familyTransfer" && (f[k] < 0 || f[k] > 1))
        W_.push(`${w}: familyTransferは0から1までの比率ではない`);
      if (k === "familyContribution" && (f[k] < 0 || f[k] > 1))
        W_.push(`${w}: familyContributionは0から1までの比率ではない`);
      if (type === "marker" && f[k] !== 0 && f[k] !== 1) W_.push(`${w}: 効果「${k}」が0/1マーカーではない`);
      if (k === "resFareCovered" && !f.res) W_.push(`${w}: 移送側の運賃負担には地域間移動が必要`);
      if (
        k === "localKind" &&
        (!f.home ||
          !services.SIM_TABLES.locality[f.home === "移動都市" ? "mobile" : "fixed"].some(
            x => x.n === f.localKind
          ))
      )
        W_.push(`${w}: 転居先の居住形態と地区指定が不一致`);
      if (
        k === "localCity" &&
        (f.home !== "移動都市" ||
          !Object.values(services.SIM_TABLES.namedCities).flat().includes(f.localCity))
      )
        W_.push(`${w}: 転居先の都市名と居住形態が不一致`);
      if (k === "fl" && f.fl?.detained === 1 && f.fl?.segregated === 1)
        W_.push(`${w}: 同時に収容と隔離へ入る結果になっている`);
      if (
        type === "deathResult" &&
        (!Array.isArray(f[k]) || f[k].length !== 2 || f[k].some(x => typeof x !== "string" || !x.trim()))
      )
        W_.push(`${w}: 効果「${k}」が死因・本文の文字列ペアではない`);
      if (type === "text" && (typeof f[k] !== "string" || !f[k].trim()))
        W_.push(`${w}: 効果「${k}」が空でない文字列ではない`);
      if (k === "spouseEmploymentSupport" && !["training", "search", "wait"].includes(f[k]))
        W_.push(`${w}: 配偶者の求職支援方法が不正`);
      if (k === "spouseWorkPreference" && !["income", "low_hazard", "stay", "open"].includes(f[k]))
        W_.push(`${w}: 配偶者の仕事希望が不正`);
      if (k === "spouseResidenceAction" && !["follow", "stay"].includes(f[k]))
        W_.push(`${w}: 配偶者の転居判断が不正`);
      if (k === "spouseSeparateSupportPlan" && !["none", "living", "medical"].includes(f[k]))
        W_.push(`${w}: 別居配偶者の支援方法が不正`);
      if (k === "spouseSeparateContact" && !["regular", "letters", "paused"].includes(f[k]))
        W_.push(`${w}: 別居配偶者の連絡方法が不正`);
      if (k === "home" && !["移動都市", "固定集落"].includes(f[k]))
        W_.push(`${w}: 移住後の居住形態が移動都市・固定集落のいずれでもない`);
      if (type === "flagMap" && (!f[k] || typeof f[k] !== "object" || Array.isArray(f[k])))
        W_.push(`${w}: 効果「${k}」がフラグ値オブジェクトではない`);
      if (k === "fl")
        Object.entries(f.fl || {}).forEach(([flag, value]) => {
          if (!services.FLAG_REGISTRY[flag]) W_.push(`${w}: 未宣言のフラグ「${flag}」`);
          if (value !== 0 && value !== 1) W_.push(`${w}: フラグ「${flag}」の値は0/1ではない`);
        });
    });
  return { cc, weight, fx };
}
