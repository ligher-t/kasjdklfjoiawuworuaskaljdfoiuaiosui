// All timeline scenes must have an explicit spatial and temporal contract.
// Unclassified or unverified reenactments remain unavailable until rewritten.
function historicalSceneEligibility(event, state) {
  const scene = event?.historicalScene;
  if (!scene) return { eligible: false, reason: "scene-unclassified" };
  if (scene.delivery === "suspended") return { eligible: false, reason: "scene-unverified" };
  const entry = HIST.find(row => row.flag === event.timelineFlag);
  if (!entry) return { eligible: false, reason: "history-flag-unregistered" };
  if (!state?.world?.events?.[entry.flag] || !historyAvailabilityReached(entry, state))
    return { eligible: false, reason: "history-not-active" };
  if (scene.dateMode === "event-year" && state.year !== entry.y)
    return { eligible: false, reason: "scene-window-closed" };
  if (scene.delivery === "direct") {
    const presence = travelPresence(state);
    if (presence.mode !== "residence" || presence.region !== scene.region ||
        !scene.city || presence.city !== scene.city)
      return { eligible: false, reason: "outside-scene" };
    return { eligible: true, delivery: "direct", placeEvidence: presence };
  }
  if (scene.delivery === "area-impact") {
    const presence = travelPresence(state);
    if (presence.mode !== "residence" || presence.region !== scene.region)
      return { eligible: false, reason: "outside-impact-area" };
    return { eligible: true, delivery: "area-impact", placeEvidence: presence };
  }
  if (scene.delivery === "report-response") {
    if (entry.infoScope === "sealed" || !state.infoLog?.some(row => row.id === entry.flag))
      return { eligible: false, reason: "report-not-known" };
    return { eligible: true, delivery: "report-response" };
  }
  if (scene.delivery === "journey") {
    const presence = travelPresence(state);
    const journey = travelCurrentJourney(state);
    if (!journey || !["wandering", "flight"].includes(journey.purpose) ||
        presence.mode !== "checkpoint" || journey.status !== "at-checkpoint")
      return { eligible: false, reason: "journey-inactive" };
    if (!presence.checkpointId || !presence.legId ||
        !journey.legs?.some(leg => leg.id === presence.legId &&
          leg.checkpointId === presence.checkpointId))
      return { eligible: false, reason: "checkpoint-not-established" };
    return { eligible: true, delivery: "journey", placeEvidence: presence };
  }
  return { eligible: false, reason: "scene-class-unknown" };
}
