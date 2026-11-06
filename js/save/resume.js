function cont(savedInput = null) {
  try {
    const raw = savedInput == null ? localStorage.getItem("terra2") : savedInput,
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw,
      snapshot = normalizeResumeImport(parsed);
    cancelEndingPeerComparison();
    replaceCurrentLife(snapshot.S);
    replaceWorldKnowledge(snapshot.W);
    S.known = W;
    restoreLifeRandom(S);
    ensureResidenceIdentity(S);
    ensureEducationWorldForResidence(S);
    educationCreateMobilityState(S);
    educationReconcileWorldAt(S,S.year,S.mo??0);
    acc = snapshot.acc;
    sp = snapshot.sp;
    AU = snapshot.AU;
    $("au").value = AU;
    $("s0").hidden = 1;
    $("s1").hidden = 0;
    $("rs").hidden = 1;
    $("ctl").hidden = 0;
    restoreResumeLog(snapshot.log);
    tab("c");
    play(sp);
    if (!restorePendingChoice()) rd();
    return true;
  } catch (error) {
    console.error(error);
    alert(error.message || "中断データを読み込めませんでした。");
    return false;
  }
}
