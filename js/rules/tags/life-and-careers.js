// life-and-careers: original rule order and preparation timing are preserved.
function appendLifeAndCareersTags(s, services, T, on) {
  const life = services.preparation.ensureLifeRecord(s),
    hasCurrentAffiliation = row => ["active", "crisis"].includes(row.status);
  on(
    life.goals.some(x => x.status === "active" || x.status === "compromised"),
    "継続中の人生目標"
  );
  on(
    life.goals.some(x => x.status === "paused"),
    "保留中の人生目標"
  );
  on(life.affiliations.some(hasCurrentAffiliation), "継続中の所属");
  on(s.age >= 18 && !life.affiliations.some(hasCurrentAffiliation), "所属なし");
  on(
    life.affiliations.some(x => x.id === "local-mutual-aid" && hasCurrentAffiliation(x)),
    "地域互助の担い手"
  );
  on(
    life.skills.some(x => x.practiceCount > 0),
    "技能を練習した経験"
  );
  on(
    life.skills.some(x => x.level >= 60),
    "実務に熟達"
  );
  on(
    s.job === 18 && life.skills.some(x => x.id === "job-18" && x.level >= 60),
    "レム・ビリトン整備職で技能記録あり"
  );
  on(
    life.workRelationships.some(
      row => row.kind === "workplace-mentorship" && row.status === "active" && row.consent === true
    ),
    "受け入れた整備指導相手"
  );
  on(
    life.regionalImpacts.some(row => row.kind === "personal-work-notes" && row.region === "レム・ビリトン"),
    "整備手順を手帳に記録"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-care" && x.status === "contacted"),
    "ロドスへ療養相談を申し込み中"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-care" && hasCurrentAffiliation(x)),
    "ロドスと継続連絡中"
  );
  const rhodesCare = life.affiliations.find(x => x.id === "rhodes-care" && hasCurrentAffiliation(x));
  on(
    rhodesCare?.role === "巡回診療の予約あり" && rhodesCare.lastChangedYear < s.year &&
      (!rhodesCare.appointment || rhodesCare.appointment.localityKey === localityKey(s)),
    "ロドス巡回診療の予約あり"
  );
  on(
    rhodesCare?.role === "巡回受診を延期中" && rhodesCare.lastChangedYear < s.year,
    "ロドス巡回受診を延期中"
  );
  on(
    ["巡回診療を受診済み", "巡回診療後、療養を選択", "巡回診療後、療養を休止"].includes(rhodesCare?.role) &&
      rhodesCare.lastChangedYear < s.year,
    "ロドス巡回診療後の療養確認"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-staff" && hasCurrentAffiliation(x)),
    "ロドス職員として活動中"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-employment" && x.status === "contacted"),
    "ロドスの採用照会中"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-staff" && x.status === "left"),
    "ロドスでの勤務経験あり"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-staff" && x.status === "suspended"),
    "ロドス勤務を休止中"
  );
  on(
    hasCurrentAffiliation(life.affiliations.find(x => x.id === "rhodes-staff") || {}) &&
      [28, 29, 30, 31, 33, 34].includes(s.job),
    "ロドスの職務配置と雇用が一致"
  );
  on(isRhodesLandshipResident(s), "ロドス本艦居住");
  on(isRhodesLandshipResident(s), "ロドス本艦");
  on(
    life.affiliations.some(x => x.id === "rhodes-research" && hasCurrentAffiliation(x)),
    "ロドス研究班に協力中"
  );
  on(
    life.affiliations.some(x => x.id === "rhodes-research" && x.status === "left"),
    "ロドス研究から離脱済み"
  );
  on(
    life.affiliations.some(x => x.id === "reunion-1096" && hasCurrentAffiliation(x)),
    "1096年のレユニオン地域網"
  );
  on(
    life.affiliations.some(x => x.id === "reunion-reorg" && hasCurrentAffiliation(x)),
    "1097年以後の再編レユニオン互助網に連絡中"
  );
  on(
    life.affiliations.some(x => x.id === "reunion-reorg" && x.status === "crisis"),
    "再編レユニオン連絡網の内部危機"
  );
  on(
    life.affiliations.some(x => x.id === "reunion-reorg" && x.status === "left"),
    "再編レユニオン互助網から離脱済み"
  );
  on(
    life.affiliations.some(x => x.id === "londinium-mutual-aid" && hasCurrentAffiliation(x)),
    "ロンディニウムの地域互助に協力中"
  );
  on(
    life.affiliations.some(x => x.id === "infected-exclusion" && hasCurrentAffiliation(x)),
    "感染者排除運動の主催"
  );
  on(
    life.affiliations.some(x => x.id === "infected-mutual-aid" && hasCurrentAffiliation(x)),
    "感染者互助組織の主催"
  );
  on(
    life.affiliations.some(x => x.id === "infected-exclusion" && hasCurrentAffiliation(x)),
    "感染者排除団体に所属中"
  );
  on(
    life.affiliations.some(x => x.id === "infected-mutual-aid" && hasCurrentAffiliation(x)),
    "感染者互助組織に所属中"
  );
  on(
    life.affiliations.some(x => x.id === "infected-exclusion" && x.status === "left"),
    "感染者排除団体から退出済み"
  );
  on(
    life.affiliations.some(x => x.id === "infected-mutual-aid" && x.status === "left"),
    "感染者互助組織から退出済み"
  );
  on(
    life.affiliations.some(x => x.id === "ursus-school-aid" && hasCurrentAffiliation(x)),
    "ウルサス学校の避難支援"
  );
  if (services.helpers.hasActiveCraftKnowledgeGoal(life)) T.add("手仕事知識共有の目標を継続中");
  on(s.fl?.chernobog_resident_displaced === 1, "チェルノボーグから避難した");
  on(s.fl?.chernobog_resident_stayed === 1, "チェルノボーグに留まった");
  on(s.fl?.londinium_civilian_route === 1, "ロンディニウム戦争期の生活を経験");
  on(
    life.bodyChanges.some(
      x =>
        ["recovering", "ongoing"].includes(x.status) &&
        Number.isInteger(x.reviewYear) &&
        x.reviewYear <= s.year
    ),
    "身体機能の見直し時期"
  );
  on(
    life.bodyChanges.some(x => x.status === "adapted") && s.job > 0 && s.k >= 20,
    "身体に合わせた職務変更を考えられる"
  );
  on(!!services.helpers.formerSpouseDeathNoticeTarget(s), "離婚した相手の訃報");
  on(!!services.helpers.formerSpouseMoveNoticeTarget(s), "離婚した相手の転居知らせ");
  on(!!services.helpers.siblingDeathNoticeTarget(s), "きょうだいの訃報");
  on(s.age >= services.helpers.householdEndAge(s) && !s.fl.household_separated, "家計分離の時期");
  on(s.age >= 13 && s.age >= (s.familyBudgetTalkAge || 15) && !s.sn?.family_launch, "家計相談の時期");
  on(!!s.fl?.reduced_work, "勤務縮小済み");
  on(
    s.age >= 60 &&
      s.job > 0 &&
      Number.isInteger(s.sn?.elder_work_opportunity) &&
      s.year > s.sn.elder_work_opportunity,
    "高齢期の再就職後"
  );
  on(
    s.age >= 60 &&
      s.job > 0 &&
      !s.fl?.reduced_work &&
      Number.isInteger(s.sn?.old_followup) &&
      s.year > s.sn.old_followup,
    "勤務再開後の見直し時期"
  );
  on(s.illness?.stage >= 2 && !s.illness.reviewed, "病状悪化");
  on(s.illness?.stage >= 2 && s.illness.reviewed && !s.illness.treated, "病状要再診");
}
