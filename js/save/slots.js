const RESUME_SLOTS_KEY = "terra2-resume-slots-v1",
  RESUME_BACKUP_KEY = "terra2-resume-slots-v1-backup",
  RESUME_SLOT_COUNT = 3;
function resumeLogEntries() {
  return [...document.querySelectorAll("#lg li")].map(li => {
    const age = li.querySelector("b")?.textContent || "",
      text = li.textContent.slice(age.length),
      tone = li.querySelector(".gd,.bad")?.className || "";
    return { age, text, tone };
  });
}
function restoreResumeLog(entries) {
  const list = $("lg");
  list.replaceChildren();
  for (const entry of entries) {
    const li = document.createElement("li"),
      age = document.createElement("b");
    age.className = "ui-log-date";
    age.textContent = String(entry.age || "");
    li.append(age);
    const tone = ["gd", "bad"].find(name =>
      String(entry.tone || "")
        .split(/\s+/)
        .includes(name)
    );
    if (tone) {
      const span = document.createElement("span");
      span.className = tone;
      span.textContent = String(entry.text || "");
      li.append(span);
    } else li.append(document.createTextNode(String(entry.text || "")));
    list.append(li);
  }
  if (typeof decorateLifeLogYears === "function" && typeof list.querySelectorAll === "function")
    decorateLifeLogYears();
}
function makeResumeSnapshot() {
  if (!S) throw new Error("保存する人生がありません。");
  return {
    format: "terra-resume-save",
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    S: JSON.parse(JSON.stringify(S)),
    W: JSON.parse(JSON.stringify(S.known || W || {})),
    acc: Number.isFinite(acc) ? acc : 0,
    sp: Number.isInteger(sp) ? sp : 0,
    AU: AU || "",
    log: resumeLogEntries()
  };
}
function parseResumeSlotStore(raw) {
  const store = JSON.parse(raw);
  if (store?.version !== 1 || !Array.isArray(store.slots)) throw new Error("保存枠の形式を読み取れません。");
  const slots = Array.from({ length: RESUME_SLOT_COUNT }, (_, i) => store.slots[i] ?? null);
  if (
    slots.some(
      slot =>
        slot !== null &&
        (!slot ||
          typeof slot !== "object" ||
          !slot.snapshot ||
          typeof slot.snapshot !== "object" ||
          !slot.snapshot.S)
    )
  )
    throw new Error("保存枠に読み取れないデータがあります。");
  return { version: 1, slots };
}
function readResumeSlots() {
  const raw = localStorage.getItem(RESUME_SLOTS_KEY);
  if (!raw) return { version: 1, slots: Array(RESUME_SLOT_COUNT).fill(null), recoveredFromBackup: false };
  try {
    return { ...parseResumeSlotStore(raw), recoveredFromBackup: false };
  } catch (primaryError) {
    const backup = localStorage.getItem(RESUME_BACKUP_KEY);
    if (backup) {
      try {
        return { ...parseResumeSlotStore(backup), recoveredFromBackup: true };
      } catch {}
    }
    throw new Error("保存枠と復旧用コピーを読み取れません。破損データは上書きせず残しました。");
  }
}
function writeResumeSlot(index, record) {
  if (!Number.isInteger(index) || index < 0 || index >= RESUME_SLOT_COUNT)
    throw new Error("保存枠を選び直してください。");
  const store = readResumeSlots(),
    raw = localStorage.getItem(RESUME_SLOTS_KEY);
  store.slots[index] = record;
  const next = JSON.stringify({ version: 1, slots: store.slots });
  // A deliberate deletion must also remove the life from the recovery copy.
  // Write recovery first: a failed write never reports a successful deletion.
  if (record === null) localStorage.setItem(RESUME_BACKUP_KEY, next);
  else if (raw && !store.recoveredFromBackup) localStorage.setItem(RESUME_BACKUP_KEY, raw);
  localStorage.setItem(RESUME_SLOTS_KEY, next);
  return store;
}
function resumeStatus(message) {
  const el = $("resume-status");
  if (el) el.textContent = message;
}
function renderResumeSlots() {
  const host = $("resume-slots");
  if (!host) return;
  try {
    const store = readResumeSlots(),
      slots = store.slots;
    if (store.recoveredFromBackup)
      resumeStatus(
        "通常の保存データを開けなかったため、バックアップを表示しています。内容を確認してから保存し直してください。"
      );
    host.innerHTML = slots
      .map((slot, i) => {
        const snapshot = slot?.snapshot,
          state = snapshot?.S,
          occupied = !!state,
          name = occupied ? esc(state.nm || "名前未記録") : "空き",
          stamp = slot?.savedAt ? new Date(slot.savedAt).toLocaleString() : "",
          position = occupied ? `${Math.max(0, state.age || 0)}歳・${state.year || "年不明"}年` : "",
          pending = state?.ev?.id ? `・選択待ち: ${esc(state.ev.id)}` : "";
        return (
          `<article class="resume-slot"><strong>枠${i + 1}: ${name}</strong><span class="nt">${occupied ? `${position}${pending}・保存 ${esc(stamp)}` : "空き"}` +
          `</span><div class="resume-actions">` +
          `<button type="button" data-resume-action="save" data-resume-index="${i}" ${S ? "" : "disabled"}>${occupied ? "上書き保存" : "ここへ保存"}</button>` +
          `<button type="button" data-resume-action="load" data-resume-index="${i}" ${occupied ? "" : "disabled"}>読み込む</button>` +
          `<button type="button" data-resume-action="export" data-resume-index="${i}" ${occupied ? "" : "disabled"}>JSONを書き出す</button>` +
          `<button type="button" data-resume-action="clear" data-resume-index="${i}" ${occupied ? "" : "disabled"}>消去</button></div></article>`
        );
      })
      .join("");
  } catch (error) {
    host.textContent = "保存枠を読み込めません: " + (error.message || String(error));
    resumeStatus(host.textContent);
  }
}
function saveResumeSlot(index) {
  try {
    if (!S) throw new Error("生まれた後に保存できます。");
    const slots = readResumeSlots().slots;
    if (slots[index] && !confirm(`枠${index + 1}を上書きしますか？`)) return;
    const snapshot = makeResumeSnapshot();
    writeResumeSlot(index, { savedAt: snapshot.savedAt, snapshot });
    resumeStatus(
      `枠${index + 1}に${S.nm}の${S.age}歳・${S.year}年の状態を保存しました。選択待ちも含まれます。`
    );
    renderResumeSlots();
  } catch (error) {
    resumeStatus("保存できませんでした: " + (error.message || String(error)));
  }
}
function clearResumeSlot(index) {
  try {
    if (!confirm(`枠${index + 1}の中断データを消去しますか？`)) return;
    writeResumeSlot(index, null);
    resumeStatus(`枠${index + 1}を消去しました。`);
    renderResumeSlots();
  } catch (error) {
    resumeStatus("消去できませんでした: " + (error.message || String(error)));
  }
}
function loadResumeSlot(index) {
  try {
    const slot = readResumeSlots().slots[index];
    if (!slot?.snapshot) throw new Error("この枠には中断データがありません。");
    if (S && !confirm("現在の人生を離れて、この保存枠を読み込みますか？")) return;
    if (cont(slot.snapshot)) {
      SV();
      closeUIDialog("resume-manager");
      resumeStatus(`枠${index + 1}を読み込みました。`);
    }
  } catch (error) {
    resumeStatus("読み込めませんでした: " + (error.message || String(error)));
  }
}
function exportResumeSlot(index) {
  try {
    const slot = readResumeSlots().slots[index];
    if (!slot?.snapshot) throw new Error("書き出すデータがありません。");
    const blob = new Blob([JSON.stringify(slot.snapshot, null, 2)], {
        type: "application/json;charset=utf-8"
      }),
      url = URL.createObjectURL(blob),
      link = document.createElement("a");
    link.href = url;
    link.download = `terra-resume-${slot.snapshot.S?.by || "unknown"}-${slot.snapshot.S?.age || 0}-${index + 1}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    resumeStatus(`枠${index + 1}を中断データJSONとして書き出しました。`);
  } catch (error) {
    resumeStatus("書き出せませんでした: " + (error.message || String(error)));
  }
}
function isValidPersonName(name) {
  return typeof name === "string" && name.trim().length > 0 && name.length <= 50 && !/[<>]/.test(name);
}
function isValidResumeEventReviews(reviews, currentYear) {
  if (reviews == null) return true;
  if (typeof reviews !== "object" || Array.isArray(reviews)) return false;
  return Object.entries(reviews).every(([id, review]) =>
    id.length > 0 && id.length <= 128 &&
    review && typeof review === "object" && !Array.isArray(review) &&
    Number.isInteger(review.year) && review.year <= currentYear &&
    typeof review.signature === "string" && review.signature.length <= 4096 &&
    typeof review.choice === "string" && review.choice.trim().length > 0 &&
    review.choice.length <= 200 && !/[<>]/.test(review.choice)
  );
}
function normalizeResumeImport(data) {
  if (data?.format !== "terra-resume-save" || data.version !== SAVE_VERSION)
    throw new Error("この中断データは現在のゲームと同じ保存版ではありません。");
  const state = data.S && typeof data.S === "object" && !Array.isArray(data.S)
      ? JSON.parse(JSON.stringify(data.S)) : data.S,
    knowledge = data.W;
  // Same-version snapshots created before the race/arts/life-system ledgers
  // were added have no fields for them. Backfill only empty current-version
  // ledgers; never infer traits, practical skill, licenses, consent, or history.
  if (state && typeof state === "object" && !Array.isArray(state) &&
      Number.isInteger(state.year) && Number.isFinite(state.ar)) {
    if (!Object.hasOwn(state, "raceProfile")) state.raceProfile = createRaceProfile(state.r);
    if (!Object.hasOwn(state, "artsProfile")) state.artsProfile = createArtsProfile(state.ar);
    if (!Object.hasOwn(state, "artsEquipment")) state.artsEquipment = createArtsEquipmentState();
    if (state.world && typeof state.world === "object") {
      state.world.events ||= {};
      initializeLifeSystems(state);
    }
  }
  if (
    !state || typeof state !== "object" || Array.isArray(state) ||
    !knowledge || typeof knowledge !== "object" || Array.isArray(knowledge) ||
    !Number.isFinite(data.acc) || !Number.isInteger(data.sp) || data.sp < 0 || data.sp >= SPD.length ||
    typeof data.AU !== "string" || !Array.isArray(data.log) ||
    !Number.isInteger(state.by) || !Number.isInteger(state.year) || !Number.isInteger(state.age) ||
    !isValidRaceProfileState(state.raceProfile, state.r, state.year) ||
    !isValidArtsProfileState(state.artsProfile, state.year) ||
    !isValidArtsEquipmentState(state.artsEquipment, state.year) ||
    !isValidLifeSystemsState(state) ||
    !isValidEventMonthMarker(state.majorEventMonth, state.year) ||
    !isValidEventMonthMarker(state.minorEventMonth, state.year) ||
    !isValidResumeEventReviews(state.eventReviews, state.year) ||
    !Number.isInteger(state.randomSeed) || !Number.isInteger(state.rngState) ||
    state.randomAlgorithm !== RANDOM_ALGORITHM ||
    !state.world || typeof state.world !== "object" || !state.world.events || typeof state.world.events !== "object" ||
    (state.languageState && (state.languageState.version !== 1 || !state.languageState.skills || typeof state.languageState.skills !== "object" || !Array.isArray(state.languageState.homeLanguageIds))) ||
    !state.lifeRecord || state.lifeRecord.version !== 4 || !state.known || typeof state.known !== "object" ||
    !Array.isArray(state.informationClaims) || !Array.isArray(state.informationResponses) ||
    !Array.isArray(state.infoLog) || !Array.isArray(state.trace) ||
    !state.sn || typeof state.sn !== "object" || !state.fl || typeof state.fl !== "object" ||
    !Array.isArray(state.siblings) || !state.par || typeof state.par !== "object" ||
    !isValidPersonName(state.nm) ||
    (state.sp && (typeof state.sp !== "object" || !isValidPersonName(state.sp.nm))) ||
    (Array.isArray(state.kids) && state.kids.some(k => !k || typeof k !== "object" || (k.nm != null && !isValidPersonName(k.nm)))) ||
    (Array.isArray(state.siblings) && state.siblings.some(sib => !sib || typeof sib !== "object" || (sib.nm != null && !isValidPersonName(sib.nm)))) ||
    (state.par.fa && (typeof state.par.fa !== "object" || !isValidPersonName(state.par.fa.nm))) ||
    (state.par.mo && (typeof state.par.mo !== "object" || !isValidPersonName(state.par.mo.nm))) ||
    (state.friendContact && (typeof state.friendContact !== "object" || !isValidPersonName(state.friendContact.nm))) ||
    (state.neighborContact && (typeof state.neighborContact !== "object" || !isValidPersonName(state.neighborContact.nm))) ||
    (state.romance?.name != null && !isValidPersonName(state.romance.name)) ||
    (Array.isArray(state.relationshipHistory) && state.relationshipHistory.some(r => r && (r.nm != null && !isValidPersonName(r.nm)))) ||
    (Array.isArray(state.care?.supportNetwork?.members) && state.care.supportNetwork.members.some(m => m && (m.nm != null && !isValidPersonName(m.nm))))
  )
    throw new Error("現行版の中断データとして必要な状態が揃っていません。");
  if (JSON.stringify(knowledge) !== JSON.stringify(state.known))
    throw new Error("保存済みの年表知識が人生状態と一致しません。");
  if (!isValidSocialConstraintState(state.socialConstraints))
    throw new Error("社会的制約の記録が現行版の形式と一致しません。");
  let stateProblems;
  try {
    stateProblems = auditLifeState(state);
  } catch {
    throw new Error("保存状態を現行版として監査できません。");
  }
  if (stateProblems.length)
    throw new Error(`保存状態が現行版の監査に通りません: ${stateProblems.slice(0, 3).join("、")}`);
  return {
    ...data,
    S: JSON.parse(JSON.stringify(state)),
    W: JSON.parse(JSON.stringify(knowledge)),
    log: data.log.map(entry => ({
      age: String(entry?.age || ""),
      text: String(entry?.text || ""),
      tone: ["gd", "bad"].find(name => String(entry?.tone || "").split(/\s+/).includes(name)) || ""
    }))
  };
}
async function importResumeFile(file, index) {
  try {
    if (!file) throw new Error("JSONファイルを選択してください。");
    if (file.size > 16 * 1024 * 1024) throw new Error("ファイルが大きすぎます（上限16MB）。");
    const snapshot = normalizeResumeImport(JSON.parse(await file.text()));
    const slots = readResumeSlots().slots;
    if (slots[index] && !confirm(`枠${index + 1}を読み込んだ中断データで上書きしますか？`)) return;
    writeResumeSlot(index, { savedAt: new Date().toISOString(), snapshot });
    resumeStatus(`中断データを枠${index + 1}へ読み込みました。ゲーム内の状態はまだ切り替わっていません。`);
    renderResumeSlots();
  } catch (error) {
    resumeStatus("ファイルを読み込めませんでした: " + (error.message || String(error)));
  }
}
function openResumeManager() {
  renderResumeSlots();
  openUIDialog("resume-manager", $("resume-close"));
}
const SV = () => {
  if (HL) return;
  try {
    if (S && !S.dead && !S.ev)
      localStorage.setItem("terra2", JSON.stringify(makeResumeSnapshot()));
  } catch (e) {
    resumeStatus(
      "自動保存できませんでした: " + (e.message || String(e)) + "。中断保存から手動で別枠へ保存してください。"
    );
  }
};
