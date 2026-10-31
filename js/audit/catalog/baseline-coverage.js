function validateBaselineCoverage(W_, services) {
  const hobbyStrain = services.EV.find(e => e.id === "hobby_strain");
  if (hobbyStrain && ["収容中", "隔離中"].some(tag => !(hobbyStrain.ban || []).includes(tag)))
    W_.push("hobby_strain: 趣味費が停止する収容・隔離中を発生対象から除外する必要がある");
  services.STG.forEach(k => {
    const n = services.EV.filter(e => !e.c && e.st && e.st.includes(k) && services.tone(e.fx) === "").length;
    if (n < 3) W_.push(`日常イベントが少ない: ${k}(${n}件)`);
  });
  services.REG.forEach(
    g => g.modelStatus === "S" || W_.push(g.n + ": 地域パラメータがゲーム仮定として宣言されていない")
  );
  services.RACE.forEach(
    r => r.modelStatus === "S" || W_.push(r.n + ": 種族パラメータがゲーム仮定として宣言されていない")
  );
}
