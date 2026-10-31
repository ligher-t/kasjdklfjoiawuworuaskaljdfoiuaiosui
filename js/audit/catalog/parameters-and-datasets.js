function validateParametersAndDatasets(W_, services) {
  const petLifeMin = services.P("economy.petLifeReviewMinYears"),
    petLifeMax = services.P("economy.petLifeReviewMaxYears"),
    petLifeExtension = services.P("economy.petLifeReviewExtensionYears");
  if (
    !Number.isInteger(petLifeMin) ||
    petLifeMin < 1 ||
    !Number.isInteger(petLifeMax) ||
    petLifeMax < petLifeMin ||
    !Number.isInteger(petLifeExtension) ||
    petLifeExtension < 1
  )
    W_.push("飼育動物の終末期相談期間または治療延長年数が不正");
  const careReviewWindow = services.P("family.parentCareReviewWindowYears");
  if (!Number.isInteger(careReviewWindow) || careReviewWindow < 1 || careReviewWindow > 5)
    W_.push("親族ケア終了後の再相談期間が1〜5年の範囲外");
  const paramIds = new Set();
  services.SIM_PARAMS.forEach(p => {
    if (!p.id || paramIds.has(p.id)) W_.push(`重複または空のパラメータID: ${p.id}`);
    paramIds.add(p.id);
    if (
      !p.label ||
      !p.unit ||
      !p.scope ||
      !p.description ||
      !p.source ||
      !Array.isArray(p.usedBy) ||
      !p.usedBy.length
    )
      W_.push(`${p.id || "(不明)"}: パラメータ台帳の説明項目が不足`);
    (p.references || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${p.id}: 未定義の資料ID「${ref}」`);
    });
    if (p.status !== "S") W_.push(`${p.id}: ゲーム用パラメータの区分がSではない`);
    const values = Array.isArray(p.value) ? p.value : [p.value];
    if (p.valueType === "positiveInteger") {
      if (!Number.isInteger(p.value) || p.value < 1) W_.push(`${p.id}: 1以上の整数ではない`);
    } else if (p.valueType === "thresholds") {
      if (
        !Array.isArray(p.value) ||
        p.value.length !== services.EL.length ||
        p.value.some((v, i) => !Number.isFinite(v) || (i > 0 && v <= p.value[i - 1]))
      )
        W_.push(`${p.id}: 閾値配列が段階数と一致しないか、単調増加していない`);
    } else if (p.valueType === "table") {
      if (
        !Array.isArray(p.value) ||
        !p.value.length ||
        p.value.some(
          v =>
            !v.n ||
            !Number.isFinite(v.w) ||
            v.w <= 0 ||
            Object.values(v).some(x => typeof x === "number" && !Number.isFinite(x))
        )
      )
        W_.push(`${p.id}: 台帳テーブルの名称、正の重み、または数値項目が不正`);
      if (
        p.id === "context.parentJobs" &&
        p.value.some(v => !Number.isInteger(v.jobId) || !services.J[v.jobId])
      )
        W_.push(`${p.id}: 親の職業IDが職業データ表に存在しない`);
    } else if (!values.every(v => typeof v === "number" && Number.isFinite(v)))
      W_.push(`${p.id}: 数値または数値配列として解釈できない`);
  });
  const datasets = {
    REG: services.REG,
    RX: services.RX,
    RACE: services.RACE,
    RACE_AFF: services.RACE_AFF,
    WEALTH: services.WEALTH,
    TR: services.TR,
    J: services.J,
    EXP_VALUES: services.EXP_VALUES.map(value => ({ value })),
    WORLD_PRESSURES: services.WORLD_PRESSURES,
    MIGRATION_ROUTES: services.MIGRATION_ROUTES
  };
  Object.entries(services.DATASET_META).forEach(([name, meta]) => {
    if (!datasets[name]) {
      W_.push(`${name}: 数値データ表が見つからない`);
      return;
    }
    if (meta.status !== "S" || !meta.source || !meta.fields)
      W_.push(`${name}: データ表の出典・区分メタデータが不足`);
    const records = Array.isArray(datasets[name]) ? datasets[name] : Object.values(datasets[name]);
    records.forEach((row, i) => {
      if (name === "RACE_AFF") {
        Object.entries(row).forEach(([field, value]) => {
          if (typeof value === "number" && (!meta.fields["*"] || !Number.isFinite(value)))
            W_.push(`${name}[${i}].${field}: 台帳未登録または数値不正`);
        });
        return;
      }
      Object.entries(row).forEach(([field, value]) => {
        if (typeof value === "number" && field !== "i" && (!meta.fields[field] || !Number.isFinite(value)))
          W_.push(`${name}[${i}].${field}: 単位・説明台帳がないか値が不正`);
        if (field === "dm" && value && typeof value === "object")
          Object.entries(value).forEach(([cause, multiplier]) => {
            if (typeof multiplier !== "number" || !Number.isFinite(multiplier))
              W_.push(`${name}[${i}].dm.${cause}: 死因補正値が不正`);
          });
      });
    });
    Object.entries(meta.fields).forEach(([field, definition]) => {
      if (!Array.isArray(definition) || definition.length !== 2)
        W_.push(`${name}.${field}: 項目名・単位の定義が不正`);
    });
  });
}
