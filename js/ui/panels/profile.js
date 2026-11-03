function getAffiliationBadgeData(s) {
  const job = s.job ?? s.j;
  if (s.fl?.rhodes === 1 || (job >= 28 && job <= 34)) {
    return { code: "rhodes", label: "ロドス・アイランド", eng: "RHODES ISLAND" };
  }
  if ((job >= 35 && job <= 37) || s.lifeRecord?.affiliations?.some(a => a.id?.includes("bsw"))) {
    return { code: "bsw", label: "ブラックスチール", eng: "BLACKSTEEL" };
  }
  if ((job >= 38 && job <= 40) || s.fl?.rhine_whistleblower) {
    return { code: "rhine", label: "ライン生命", eng: "RHINE LAB" };
  }
  if (job === 44 || (s.fl?.guard === 1 && s.res?.n === "龍門")) {
    return { code: "lgd", label: "龍門近衛局", eng: "L.G.D." };
  }
  if (job === 60 || job === 61) {
    return { code: "laterano", label: "ラテラーノ公証人役場", eng: "NOTARIAL APPARATUS" };
  }
  if (job === 63 || job === 64 || job === 32) {
    return { code: "kazimierz", label: "カジミエーシュ企業騎士", eng: "KAZIMIERZ" };
  }
  if (job === 65 || s.fl?.siracusa_feud === 1) {
    return { code: "siracusa", label: "シラクーザ・ファミリー", eng: "SIRACUSA" };
  }
  if (job === 50) {
    return { code: "higashi", label: "東方重工工廠", eng: "HIGASHI IND." };
  }
  if (job === 51 || job === 52) {
    return { code: "ursus", label: "ウルサス帝国軍", eng: "URSUS ARMY" };
  }
  if (job === 54 || job === 55) {
    return { code: "victoria", label: "ヴィクトリア軍", eng: "ROYAL GUARD" };
  }
  if (s.fl?.reunion === 1) {
    return { code: "reunion", label: "レユニオン", eng: "REUNION" };
  }
  if ((s.investment >= 1000000 || s.fl?.workshop_opened) && (job === 0 || !job)) {
    return { code: "workshop", label: "自営工房・店舗主", eng: "WORKSHOP" };
  }
  return null;
}

function renderProfilePanel(s, services, st) {
  const badge = getAffiliationBadgeData(s);
  const badgeHtml = badge
    ? `<span class="ui-affiliation-badge ui-badge-${badge.code}" title="${badge.label} / ${badge.eng}"><span class="badge-tag">${badge.eng}</span><span class="badge-text">${badge.label}</span></span>`
    : "";
  services.$("tn").innerHTML = `${esc(s.nm)} ${badgeHtml}`;
  services.$("ty").textContent = `${s.age}歳 ・ テラ暦${s.year}年`;
  services.$("pf").innerHTML = [
    ["名前", esc(s.nm)],
    ["所属・身分", badge ? `${badge.label} (${badge.eng})` : "市井の生活者（特定組織への所属なし）"],
    ["性別", s.sx],
    ["生年月日", `テラ暦${s.by}年${s.bd === "月日未記録" ? "（月日未記録）" : s.bd}`],
    [
      "出生地",
      `${s.g.n}${s.birthLocality?.city ? `・${s.birthLocality.city}` : s.birthLocality ? "・都市名未特定" : "・旧記録では都市名未記録"}`
    ],
    [
      "居住地",
      s.residenceBase?.label || `${s.res.n}${s.local.city ? `・${s.local.city}` : ""}・${s.local.kind} (${s.home === "移動都市" ? "移動都市" : "定住地"})`
    ],
    ["地域の情報の届きやすさ（推計）", Math.round(s.local.info * 100) + "/100"],
    ["種族", s.r.n],
    ["使用言語・母語", typeof services.formatLanguageSummaryForProfile === "function" ? services.formatLanguageSummaryForProfile(s, services) : (typeof formatLanguageSummaryForProfile === "function" ? formatLanguageSummaryForProfile(s, services) : "未記録")],
    [
      "生家の立場",
      `${s.socialClass?.origin || s.socialPosition || "未記録"}`
    ],
    [
      "現在の暮らしの階層",
      `${services.CLASS_BAND_NAMES[s.socialClass?.currentBand] || "未確認"}`
    ],
    ["階層への考え", `${s.socialClass?.view || "未確認"}（体験と選択の履歴）`],
    [
      "世帯と家計",
      {
        family_home_shared_budget: "家族と同居・家計を共同管理",
        family_home_separate_budget: "家族と同居・個人の収支を別管理",
        independent_rental: "別の住居を借りて独立",
        independent_owned: "自分の住居で独立",
        spouse_shared: "配偶者と同居",
        spouse_parent_home: "配偶者の親族宅で同居（他の同居者は未記録）"
      }[s.residenceArrangement] || "家族と同居・養育家計"
    ],
    ["職業", services.occupationLabel(s)],
    ["学歴・就学", services.educationStandingLabel(s)],
    ["現在の正規履修記録", s.educationPath?.offeringId ?
      (()=>{
        const id=s.educationPath.currentEnrollmentId,
          rows=Object.values(s.educationCredits?.items||{})
            .filter(x=>x.enrollmentId===id).sort((a,b)=>b.academicYear-a.academicYear),
          last=rows[0];
        return last ? `認定済み学年：${rows.filter(x=>x.credited).length}／${s.educationPath.duration}・直近${last.academicYear}年 ${last.equivalent}/12相当（${last.credited?"認定":"未認定"}）` :
          "年度履修の認定待ち";
      })() : "正規学籍の詳細記録なし"],
    ["気質", s.t.n],
    ["再現用seed", String(s.randomSeed ?? "未記録")],
    ["地域で見られる信仰", s.res.fa || "資料なし"]
  ]
    .map(x => `<dt>${x[0]}</dt><dd>${x[1]}</dd>`)
    .join("");
}
