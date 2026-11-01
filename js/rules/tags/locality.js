// locality: original rule order and preparation timing are preserved.
function appendLocalityTags(s, services, T) {
  const area = services.preparation.localityStateView(s);
  if (area) {
    const clinic = services.preparation.activeFacility(s, "clinic"),
      school = services.preparation.activeFacility(s, "school"),
      work = services.preparation.activeFacility(s, "workplace");
    if (clinic?.status === "limited") T.add("近隣の診療拠点が利用制限中");
    if (s.fl?.sch && school?.status === "limited") T.add("学び舎の通常授業が制限中");
    if (s.fl?.sch && school?.transition === "restored" && school.transitionYear >= s.year - 1)
      T.add("学び舎の授業が再開した");
    if (work?.status === "limited") T.add("仕事場の業務が縮小中");
    if (work?.transition === "restored" && work.transitionYear >= s.year - 1) T.add("仕事場の業務が再開した");
    if (clinic?.contacts.some(x => ["referral", "care_plan", "renew"].includes(x.action)))
      T.add("以前この地区の診療拠点を調べた");
    if (s.world?.localityVisits?.length) T.add("別の生活圏へ転居した経験");
    if (area.food < 0.71) T.add("地域の供給が不安定");
    if (area.jobs < 0.69) T.add("地域の働き口が減少");
    if (area.housing < 0.7) T.add("地域で住居を確保しにくい");
    if (area.medical < 0.69) T.add("地域の診療が逼迫");
    if (area.transport < 0.69) T.add("地域の移動や物流が滞る");
    if (
      s.community.history.some(
        x =>
          x.types.some(t =>
            ["chernobog-direct", "londinium-direct", "kazdel-war", "siesta-transition"].includes(t)
          ) && x.year >= s.year - 6
      )
    )
      T.add("地域で復旧作業が続く");
    if (s.community.actions.some(x => x.kind === "food" && x.action === "aid")) T.add("地域で誰かを手伝った");
    if (s.community.actions.some(x => x.kind === "medical" && x.action === "information"))
      T.add("地域の医療相談を調べた");
  }
}
