function validateRegionalModels(W_, services) {
  Object.entries(services.REGIONAL_LIFE_PROFILES || {}).forEach(([region, profile]) => {
    if (
      !services.REG.some(item => item.n === region) ||
      !profile.evidence ||
      !profile.scope ||
      !Array.isArray(profile.sourceRefs) ||
      !profile.sourceRefs.length ||
      !Array.isArray(profile.implementedPaths)
    )
      W_.push(`${region}: 地域制度プロファイルの対象・根拠・範囲・経路が不完全`);
    (profile.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${region}: 未定義の制度資料ID「${ref}」`);
    });
  });
  Object.entries(services.REGIONAL_SERVICE_PROFILES || {}).forEach(([region, profile]) => {
    if (
      !services.REG.some(item => item.n === region) ||
      !profile.evidence ||
      !profile.scope ||
      !profile.path ||
      !profile.kind ||
      profile.temporalStatus !== "unverified" ||
      profile.validFromYear !== null ||
      profile.validToYear !== null ||
      !Array.isArray(profile.eventIds) ||
      (!profile.eventIds.length && !profile.informationalOnly) ||
      !Array.isArray(profile.sourceRefs) ||
      !profile.sourceRefs.length ||
      (profile.informationalOnly && (!Number.isInteger(profile.anchorYear) || profile.eventIds.length))
    )
      W_.push(`${region}: 地域サービスプロファイルの範囲・年代・経路・資料が不完全`);
    (profile.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${region}: 未定義の地域サービス資料ID「${ref}」`);
    });
    (profile.eventIds || []).forEach(id => {
      if (!services.EV.some(event => event.id === id))
        W_.push(`${region}: 未定義の地域サービス経路イベント「${id}」`);
    });
  });
  Object.entries(services.REGIONAL_EMPLOYMENT_PROFILES || {}).forEach(([region, profile]) => {
    if (
      !services.REG.some(item => item.n === region) ||
      !profile.evidence ||
      !profile.scope ||
      profile.temporalStatus !== "unverified" ||
      profile.validFromYear !== null ||
      profile.validToYear !== null ||
      !profile.weights ||
      !Object.keys(profile.weights).length ||
      !Array.isArray(profile.sourceRefs) ||
      !profile.sourceRefs.length
    )
      W_.push(region + ": 地域別仕事機会プロファイルが不完全");
    (profile.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(region + ": 未定義の雇用資料ID「" + ref + "」");
    });
    Object.entries(profile.weights || {}).forEach(([jobId, weight]) => {
      if (
        !services.SIM_TABLES.parentJobs.some(job => job.jobId === Number(jobId)) ||
        !Number.isFinite(weight) ||
        weight <= 0 ||
        weight > 2
      )
        W_.push(region + ": 地域別仕事候補の重みが不正");
    });
  });
  Object.entries(services.REGIONAL_ENTITY_CONTEXT || {}).forEach(([region, entity]) => {
    if (
      !services.REG.some(item => item.n === region) ||
      !entity.unitType ||
      !entity.parentRelation ||
      !["secondary_report", "primary_confirmed", "unverified"].includes(entity.parentRelationStatus) ||
      entity.temporalStatus !== "unverified" ||
      entity.validFromYear !== null ||
      entity.validToYear !== null ||
      !Array.isArray(entity.sourceRefs) ||
      !entity.sourceRefs.length ||
      !entity.note
    )
      W_.push(`${region}: 地域階層記録の対象・種類・根拠・年代範囲・親関係が不完全`);
    if (entity.parentRegion && !services.REG.some(item => item.n === entity.parentRegion))
      W_.push(`${region}: 未定義の親地域「${entity.parentRegion}」`);
    if (entity.parentRegion === region) W_.push(`${region}: 自分自身を親地域としている`);
    if (entity.policyInheritance !== "none")
      W_.push(`${region}: 明示されていない親地域から制度係数を継承している`);
    (entity.sourceRefs || []).forEach(ref => {
      if (!services.SETTING_SOURCES[ref]) W_.push(`${region}: 未定義の地理資料ID「${ref}」`);
    });
  });
  Object.entries(services.REGIONAL_HISTORICAL_LOCALITIES || {}).forEach(([region, items]) => {
    if (!services.REG.some(item => item.n === region) || !Array.isArray(items))
      W_.push(`${region}: 地域史参考記録の親地域または配列が不正`);
    (items || []).forEach(item => {
      if (
        !item.name ||
        item.personalAssignment !== "unassigned" ||
        !Array.isArray(item.transitions) ||
        !item.transitions.length ||
        !item.note ||
        !Array.isArray(item.sourceRefs) ||
        !item.sourceRefs.length
      )
        W_.push(`${region}: 個人へ誤割当てされうる、または不完全な地域史記録`);
      (item.transitions || []).forEach(transition => {
        if (
          !transition.relationship ||
          transition.status !== "secondary_report" ||
          transition.validFromYear !== null ||
          transition.validToYear !== null
        )
          W_.push(`${region}/${item.name}: 根拠区分または不明年代の記録が不正`);
      });
      (item.sourceRefs || []).forEach(ref => {
        if (!services.SETTING_SOURCES[ref]) W_.push(`${region}/${item.name}: 未定義の地域史資料ID「${ref}」`);
      });
    });
  });
}
