// identity-and-social: original rule order and preparation timing are preserved.
function appendIdentityAndSocialTags(s, services, on) {
  const identity = services.preparation.ensureIdentity(s);
  const infectionAttitude = infectionAwarenessAttitude(s);
  on(identity.affiliation === "ターラー系", "ターラー系の家の記録");
  on(identity.affiliation === "イベリアのエーギル系", "イベリアのエーギル系の家の記録");
  on(identity.homeLanguage != null, "家庭で使われた言語を記録済み");
  on(identity.documentationStatus === "照会中", "法的記録を照会中");
  on(services.helpers.hardlineBias(s, "infected"), "感染者排除の思想が強固");
  on(services.helpers.hardlineBias(s, "sarkaz"), "サルカズ排斥の思想が強固");
  on(
    !!services.preparation.conflictState(s).infectionShock &&
      (services.preparation.conflictState(s).infectionShock.priorBias >= 55 ||
        services.preparation.conflictState(s).infectionShock.priorActions > 0 ||
        services.preparation.conflictState(s).infectionShock.priorAvoids > 0 ||
        services.preparation.conflictState(s).infectionShock.priorPresence > 0 ||
        services.preparation.conflictState(s).infectionShock.priorEndorsement > 0) &&
      !!s.fl.dg,
    "感染前の偏見・行為と診断の衝突"
  );
  on(!!services.preparation.conflictState(s).familyBreach, "感染後に家庭の支援を失った");
  on(services.preparation.literacyValue(s) < 28, "読み書きに不安がある");
  on(!s.fl?.sch && s.f === 1, "学校外で学ぶ");
  on(services.preparation.barrierRecently(s), "身近で排斥を経験");
  on(services.preparation.socialModel(s, true).equityCommitment >= 34, "差別への異議を実践");
  on((s.biasInfected || 0) >= 60, "感染者への強い偏見");
  on((s.biasSarkaz || 0) >= 60, "サルカズへの強い偏見");
  on(infectionAttitude === "protective", "感染者への偏見に疑問");
  on((s.biasSarkaz || 0) <= 12 && s.age >= 14, "サルカズへの偏見に疑問");
  on(
    services.helpers.discriminationEncounterRisk(s) >=
      services.helpers.P("condition.raceDiscriminationScale"),
    "種族差別"
  );
  on(s.res.st >= services.helpers.P("condition.institutionalDiscriminationThreshold"), "制度差別");
  on(infectionAttitude === "exclusionary", "感染者偏見");
  on((s.biasSarkaz || 0) >= 35, "サルカズ偏見");
}
