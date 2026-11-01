// class-and-education: original rule order and preparation timing are preserved.
function appendClassAndEducationTags(s, services, a, el, sc, on) {
  const social = services.preparation.initializeSocialClass(s);
  on(social.originGroup === "landed", "旧家・領主層に縁がある生家");
  on(social.originGroup === "professional", "専門職・行政職に縁がある生家");
  on(social.originGroup === "merchant", "商いや交易に縁がある生家");
  on(social.originGroup === "labor", "労働・生業を中心とする生家");
  on(social.originGroup === "displaced", "流入・避難の経験を持つ生家");
  on(["precarious", "low_income"].includes(social.currentBand), "現在の家計に余裕がない");
  on(["secure", "wealthy"].includes(social.currentBand), "現在の家計に余裕がある");
  on(
    s.local?.kind === "移動都市の周縁区" || s.local?.kind === "移動都市の避難・労働区画",
    "都市の周縁部で暮らす"
  );
  on(social.mobilityHistory.length > 0, "生活階層が変化した経験");
  const community = services.helpers.communitySignals(s);
  on(community.minority, "地域で少数派");
  on(community.mixed, "多種族の交流圏");
  on(community.mixedFamily, "異種族の家族");
  on(s.legal?.citizenshipCountry === "ラテラーノ" && s.legal?.status === "recorded", "ラテラーノ市民");
  on(a < services.helpers.P("life.adultStartAge"), "未成年");
  on(a >= services.helpers.P("life.adultStartAge"), "成人");
  on(sc, "就学中");
  on(s.fl.retired, "退職後");
  on(
    a >= services.helpers.P("life.workStartAge") &&
      ((s.job > 0 && !services.helpers.restricted(s)) || (s.fl.segregated && s.fl.seg_work)),
    "就労中"
  );
  on(
    a >= services.helpers.P("life.workStartAge") &&
      !s.job &&
      !sc &&
      !s.fl.retired &&
      !services.helpers.restricted(s),
    "無職"
  );
  on(
    a >= services.helpers.P("economy.employmentAgeLimit") && !s.job && !services.helpers.restricted(s),
    "高齢期の非就労"
  );
  // Proficiency tags never certify graduation or an occupation.
  on(el >= 1, "初等学習相当");
  on(el >= 2, "中等学習相当");
  on(el >= 3, "高等学習相当");
  on(el >= 4, "専門的学習相当");
  on(educationCredential(s, "university"), "大学課程修了");
  on(educationCredential(s, "vocational"), "職業課程修了");
  on(educationCredential(s, "arts"), "アーツ学院修了");
}
