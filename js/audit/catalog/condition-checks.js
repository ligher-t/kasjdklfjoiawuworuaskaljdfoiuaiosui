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
    "after", "excl", "inConfinement", "show", "t", "c", "fx", "who", "groundOnly", "displayTone", "timelineFlag", "crisisPolicy", "historicalScene", "regionCooldowns", "interactionScope", "lifeSystemFamily", "socialConstraint", "scheduledAt"
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
    if (event && c.scheduledAt != null && typeof c.scheduledAt !== "function")
      W_.push(`${w}: scheduledAtは年月を返す関数でなければならない`);
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
      if (k === "siracusaFamilyAction") {
        const input = f[k], action = typeof input === "string" ? input : input?.action;
        if (
          !["active", "distant", "left", "declined"].includes(action) ||
          (typeof input === "object" &&
            (!input || Array.isArray(input) ||
              Object.keys(input).some(key => !["action", "onlyIfMember"].includes(key)) ||
              (input.onlyIfMember != null && typeof input.onlyIfMember !== "boolean")))
        )
          W_.push(`${w}: 効果「siracusaFamilyAction」は有効な関係状態または条件付き関係状態ではない`);
      }
      if (k === "artsAction") {
        const action = f[k],
          allowedKeys = new Set(["action", "disciplineId", "techniqueId", "outcome", "response", "alternativeTaskId", "equipmentId", "result"]),
          disciplines = new Set(["thermal", "kinetic", "acoustic", "material", "medical-support", "ritual-local"]),
          outcomes = new Set(["guided-success", "observed", "theory", "attempt-not-achieved"]),
          responses = new Set(["alternative-task-shown", "stopped-for-day"]),
          equipmentActions = new Set(["borrow-equipment", "return-equipment", "inspect-equipment",
            "request-equipment-repair", "record-repair-parts", "complete-equipment-repair"]),
          invalidCommon = !action || typeof action !== "object" || Array.isArray(action) ||
            Object.keys(action).some(key => !allowedKeys.has(key)),
          invalidPractice = action?.action === "record-practice" &&
            (!disciplines.has(action.disciplineId) || typeof action.techniqueId !== "string" || !action.techniqueId.trim() ||
              !outcomes.has(action.outcome) || (action.response != null && !responses.has(action.response)) ||
              (action.alternativeTaskId != null && (typeof action.alternativeTaskId !== "string" || !action.alternativeTaskId.trim())) ||
              (action.response === "alternative-task-shown" && !action.alternativeTaskId) ||
              (action.response === "stopped-for-day" && action.alternativeTaskId != null) ||
              (action.response != null && action.outcome !== "attempt-not-achieved")),
          invalidEquipment = action && equipmentActions.has(action.action) &&
            ((action.action !== "borrow-equipment" &&
              (typeof action.equipmentId !== "string" || !["$current-course-unit", "$oldest-school-loan", "$oldest-due-school-loan", "$oldest-unsafe-school-loan", "$oldest-school-repair"].includes(action.equipmentId))) ||
             (action.action === "borrow-equipment" && action.equipmentId != null) ||
             (action.action === "inspect-equipment" && !["serviceable", "repair-required"].includes(action.result)) ||
             (action.action !== "inspect-equipment" && action.result != null)),
          validPractice = action?.action === "record-practice" && !invalidPractice,
          validEquipment = equipmentActions.has(action?.action) && !invalidEquipment,
          invalid = invalidCommon || (!validPractice && !validEquipment);
        if (invalid) W_.push(w + ": 効果「artsAction」の実技記録契約が不正");
      }
      if (k === "lifeSystemAction") {
        const action = f[k],
          domains = new Set(["warning", "infrastructure", "shipment", "contract", "research", "community-project", "culture", "information", "arts"]),
          allowedKeys = new Set(["domain", "action", "mode", "targetId", "learningPathId", "providerId", "siteRef",
            "disciplineId", "techniqueId", "purpose", "equipmentId", "result", "techSkillId", "minimumSkill",
            "skillId", "enrollmentId", "year", "menteeId", "organizationId", "recipientId", "routeId",
            "helperCount", "claimId", "languageId", "languageMode", "workplaceUse", "requireEquipment", "amount"]),
          actions = {
            warning: ["receive", "respond", "review", "feedback"], infrastructure: ["acknowledge", "respond", "request-repair", "verify-repair"],
            shipment: ["take-custody", "confirm-recipient", "return", "receive-medicine", "resolve-address", "record-delay-response"],
            contract: ["contact", "offer", "decline", "accept", "prepare", "defer-preparation", "depart", "handoff", "survey", "continue-work",
              "query-cargo", "support-equity", "query-screening", "verify-receipt", "dispute-payment", "mark-payment-missing",
              "settle", "family-notice", "return", "cancel", "end-contact", "defer-payment-claim"],
            research: ["attend-briefing", "consent", "defer", "refuse", "procedure", "withdraw", "followup"],
            "community-project": ["propose", "donate", "mark-parts-received", "record-helpers", "complete-work"],
            culture: ["record-music-performance", "record-oral-tradition", "record-mentoring", "sign-up-festival",
              "decline-festival", "settle-festival"],
            information: ["receive-situated", "record-local-correction", "defer-local-correction"],
            arts: ["open-path", "record-practice", "record-use", "assess-course", "record-tech-skill",
              "borrow-equipment", "return-equipment", "inspect-equipment", "request-equipment-repair",
              "record-repair-parts", "complete-equipment-repair", "pay-late-fee", "defer-late-fee", "request-assessment", "followup"]
          },
          invalid = !action || typeof action !== "object" || Array.isArray(action) ||
            Object.keys(action).some(key => !allowedKeys.has(key)) || !domains.has(action.domain) ||
            typeof action.action !== "string" || !(actions[action.domain] || []).includes(action.action) ||
            (action.mode != null && typeof action.mode !== "string") ||
            (action.year != null && !Number.isInteger(action.year)) ||
            (["workplaceUse", "requireEquipment"].some(key => action[key] != null && typeof action[key] !== "boolean")) ||
            (action.helperCount != null && ![1, 2].includes(action.helperCount)) ||
            (action.amount != null && (!Number.isSafeInteger(action.amount) || action.amount <= 0 || action.amount > 1000000)) ||
            (["targetId", "learningPathId", "providerId", "siteRef", "disciplineId", "techniqueId", "purpose",
              "equipmentId", "result", "techSkillId", "skillId", "enrollmentId", "menteeId", "organizationId",
              "recipientId", "routeId", "claimId", "languageId", "languageMode"]
              .some(key => action[key] != null && (typeof action[key] !== "string" || !action[key].trim())));
        if (invalid) W_.push(w + ": 効果「lifeSystemAction」の状態遷移契約が不正");
      }
      if(type === "object" && (!f[k] || typeof f[k] !== "object" || Array.isArray(f[k])))
        W_.push(`${w}: 効果「${k}」がオブジェクトではない`);
      if(type === "objectOrArray" && (!f[k] || typeof f[k] !== "object" ||
        (Array.isArray(f[k]) && f[k].some(x=>!x || typeof x !== "object" || Array.isArray(x)))))
        W_.push(`${w}: 効果「${k}」がオブジェクトまたはその配列ではない`);
      if(type === "text" && (typeof f[k] !== "string" || !f[k].trim()))
        W_.push(`${w}: 効果「${k}」が空でない文字列ではない`);
      if(k === "infectionRoute" && !["dust","wound","deep-wound","mixed"].includes(f[k]))
        W_.push(`${w}: 感染経路が不正`);
      if(k === "catastropheInfectionChance" && (f[k] < 0 || f[k] > 0.05))
        W_.push(`${w}: 天災後の感染確率は0から5%の範囲ではない`);
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
