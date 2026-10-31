// js/life/annual/relations-and-access.js: ordered annual phase; see ANNUAL.md.
function advanceAnnualRelationsAndAccess(s, services) {
  services.reconcileCareerPlacements(s);
  services.advanceHobbyJourneys(s);
  services.advanceParentWorkLives(s);
  services.advanceSpouseHealth(s);
  services.advanceSpouseLife(s);
  services.advanceFormerSpouseParenting(s);
  services.advanceSpouseWorkLife(s);
  services.advanceSpouseSeparateLife(s);
  services.advanceSpouseIndependentMove(s);
  services.deliverSpouseMoveNotice(s);
  services.advanceSeparatedParentWorkLives(s);
  services.advanceRelativeMilestones(s);
  services.advanceIndependentChildLives(s);
  services.advanceIndependentChildBudgets(s);
  services.advanceSiblingLives(s);
  services.advanceIndependentSiblingMoves(s);
  services.advanceIndependentSiblingFamilies(s);
  services.advanceIndependentSiblingEconomy(s);
  services.advanceIndependentSiblingHealth(s);
  services.advanceSiblingReconnectionInvites(s);
  services.advanceSeparatedParentHousehold(s);
  services.advanceCareNetwork(s);
  services.advanceIndependentCareNetworkMembers(s);
  services.advanceCareNetworkMemberLives(s);
  services.advanceCareNetworkMemberMissing(s);
  services.deliverCareNetworkMoveNotice(s);
  services.advanceSocialContactMissing(s);
  services.advanceSocialContactRecontact(s);
  services.deliverSocialContactNotices(s);
  s.priceIndex = (s.priceIndex || 1) * (1 + services.P("economy.costInflationAnnual"));
  services.refreshMobileCityEcology(s);
  services.settleSiblingParentTreatmentContribution(s);
  if (s.study) {
    if (services.restricted(s)) {
      s.study.suspended = true;
      s.study.nextDue = Math.max(s.study.nextDue, s.year + 1);
    } else if (s.study.suspended) {
      s.study.suspended = false;
      s.study.nextDue = s.year;
    }
  }
  if (s.fl.insured && s.res.n !== "クルビア") {
    s.fl.insured = 0;
    s.insurancePaidYear = null;
  }
  if (s.familyCare && (!s.par?.[s.familyCare.target] || s.par[s.familyCare.target].d)) s.familyCare = null;
}
