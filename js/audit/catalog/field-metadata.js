function validateFieldMetadata(W_, services) {
  Object.entries(services.REGIONAL_RESIDENCE_PROFILES || {}).forEach(([region, profile]) => {
    if (
      !services.REG.some(item => item.n === region) ||
      !Array.isArray(profile.allowedHomes) ||
      !profile.allowedHomes.length ||
      profile.allowedHomes.some(home => !["移動都市", "固定集落"].includes(home)) ||
      !profile.evidence ||
      !profile.scope ||
      !Array.isArray(profile.sourceRefs) ||
      (!profile.sourceRefs.length && profile.basis !== "game-assumption") ||
      (profile.mobileCityShare != null && (!Number.isFinite(profile.mobileCityShare) || profile.mobileCityShare < 0 || profile.mobileCityShare > 1))
    )
      W_.push(`${region}: 地域居住許可プロファイルが不正`);
    (profile.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${region}: 未定義の地域居住資料ID「${ref}」`);
    });
  });
  services.FXK.forEach(k => {
    const m = services.EVENT_FIELD_META[k];
    if (!m || !m.unit || !m.meaning || !m.valueType || m.status !== "S")
      W_.push(`イベント効果「${k}」の型・単位・意味・区分台帳が不足`);
  });
  Object.entries(services.EVENT_FIELD_META).forEach(([k, m]) => {
    if (!m.unit || !m.meaning || !m.valueType || m.status !== "S")
      W_.push(`イベント項目「${k}」の型・単位・意味・区分台帳が不足`);
  });
  const parameterIds = new Set();
  services.SIM_PARAMS.forEach(parameter => {
    const id = parameter?.id || "（IDなし）";
    if (!parameter?.id || parameterIds.has(parameter.id))
      W_.push(`シミュレーション設定値「${id}」のIDが空または重複`);
    parameterIds.add(parameter?.id);
    for (const field of ["label", "unit", "scope", "description", "source"])
      if (typeof parameter?.[field] !== "string" || !parameter[field].trim())
        W_.push(`シミュレーション設定値「${id}」の${field}説明が不足`);
    if (!services.DATA_GUIDE.confidence[parameter?.status])
      W_.push(`シミュレーション設定値「${id}」の確度区分が未定義`);
    if (
      !Array.isArray(parameter?.usedBy) ||
      !parameter.usedBy.length ||
      parameter.usedBy.some(item => typeof item !== "string" || !item.trim())
    )
      W_.push(`シミュレーション設定値「${id}」の使用先が不足`);
    if (parameter?.references != null && !Array.isArray(parameter.references))
      W_.push(`シミュレーション設定値「${id}」の資料参照が配列でない`);
    (parameter?.references || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`シミュレーション設定値「${id}」の未定義資料ID「${ref}」`);
    });
  });
}
