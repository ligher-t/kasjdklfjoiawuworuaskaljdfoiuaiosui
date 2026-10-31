function renderSocialPanel(s, services) {
  const cultural = services.ensureIdentity(s),
    conflict = services.conflictState(s);
  const social = services.document.getElementById("social-learning-note");
  if (social) {
    const m = services.repairSocialLearning(s),
      actCoverage =
        conflict.actTotalsBasis === "retained-lower-bound"
          ? "（旧記録に残る範囲）"
          : "（累計、詳細は直近40件）",
      exposureCoverage =
        m.exclusionHistoryCountBasis === "retained-lower-bound" ? "以上（旧記録に残る範囲）" : "（累計）",
      experienceCoverage =
        conflict.experienceTotalsBasis === "retained-lower-bound"
          ? "以上（旧記録に残る範囲）"
          : "（累計、詳細は直近30件）";
    social.textContent =
      `読み書き ${services.literacyValue(s).toFixed(0)}/100（${m.literacy === null ? "旧記録から推定" : "習得記録"}） ・就学年数 ${m.schoolAccessYears || 0}` +
      `年 ・排斥経験 ${m.exclusionHistoryCount || 0}件${exposureCoverage}` +
      (` ・現在の姿勢「${services.socialStance(s)}」 ・差別に関する行為記録 ${services.socialConflictActionCount(conflict)}件${actCoverage} ・本人が記録した被害 ${services.socialConflictRecordCount(conflict, "experienceTotals")}` +
        `件${experienceCoverage}`) +
      `。身の上の拠りどころは${cultural.affiliation || "未確認"}、家で交わしてきた言葉は${cultural.homeLanguage || "未確認"}。${services.socialConflictFamilyBreachSummary(s) ? services.socialConflictFamilyBreachSummary(s) + "。" : ""}` +
      `ものの見方は生まれだけで決まるものではなく、歩んできた日々の中で変わっていく。`;
  }
  const harmBox = services.document.getElementById("social-learning-note");
  if (harmBox && (s.socialAftermath?.episodes?.length || s.socialAftermath?.episodeCount)) {
    const all = s.socialAftermath?.episodes || [],
      recent = all
        .slice(-3)
        .map(row => `${row.year}年・${services.socialIncidentLocationLabel(row)}`)
        .join("／"),
      active = all.filter(x => x.status === "active"),
      assisted = all.filter(x => x.status === "supported"),
      harm = services.socialAftermath(s),
      coverage = harm.episodeCountBasis === "retained-lower-bound" ? "以上（旧記録に残る範囲）" : "（累計）";
    harmBox.textContent +=
      ` ・差別・排斥の具体的経験 ${harm.episodeCount || all.length}件${coverage}（保持詳細内の現在の影響 ${active.length}件、支援後 ${assisted.length}` +
      `件） ・記録された所在地: ${recent || "旧記録では未記録"}`;
  }
}
