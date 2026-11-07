/* ===== UI ===== */
// The year is a UI input only; its selection must never use the life RNG.
const birthYearSelect = $("birth-year");
const birthYearRange = $("birth-year-range");
function validBirthYear(value) {
  const text = String(value ?? "").trim();
  const year = Number(text);
  return text !== "" && Number.isInteger(year) && year >= BIRTH_YEAR_MIN && year <= BIRTH_YEAR_MAX ? year : null;
}
function syncBirthYearPreview() {
  if (!birthYearSelect) return;
  const year = validBirthYear(birthYearSelect.value);
  const preview = $("birth-start-year");
  if (preview) preview.textContent = year === null ? "出生年を確認" : year + "年";
  if (birthYearRange && year !== null) {
    birthYearRange.value = String(year);
    const progress = 100 * (year - BIRTH_YEAR_MIN) / (BIRTH_YEAR_MAX - BIRTH_YEAR_MIN);
    birthYearRange.style?.setProperty?.("--birth-year-progress", progress + "%");
    birthYearRange.setAttribute?.("aria-valuetext", "テラ暦" + year + "年");
  }
  birthYearSelect.setAttribute?.("aria-invalid", String(year === null));
  $("birth-year-error").textContent = "";
}
function setSelectedBirthYear(year) {
  const normalized = Math.min(BIRTH_YEAR_MAX, Math.max(BIRTH_YEAR_MIN, Math.round(Number(year))));
  if (!Number.isFinite(normalized) || !birthYearSelect) return;
  birthYearSelect.value = String(normalized);
  syncBirthYearPreview();
}
function stepBirthYear(delta) {
  setSelectedBirthYear((validBirthYear(birthYearSelect?.value) ?? START) + delta);
}
if (birthYearSelect) {
  birthYearSelect.min = String(BIRTH_YEAR_MIN);
  birthYearSelect.max = String(BIRTH_YEAR_MAX);
  birthYearSelect.value = String(START);
  birthYearSelect.oninput = syncBirthYearPreview;
  birthYearSelect.onchange = syncBirthYearPreview;
}
if (birthYearRange) {
  birthYearRange.min = String(BIRTH_YEAR_MIN);
  birthYearRange.max = String(BIRTH_YEAR_MAX);
  birthYearRange.value = String(START);
  birthYearRange.oninput = () => setSelectedBirthYear(birthYearRange.value);
}
syncBirthYearPreview();
function beginLifeAtSelectedYear() {
  const year = validBirthYear(birthYearSelect?.value);
  if (year === null) {
    $("birth-year-error").textContent = `テラ暦${BIRTH_YEAR_MIN}〜${BIRTH_YEAR_MAX}年から選んでください。`;
    birthYearSelect?.focus();
    return;
  }
  const seedInput = $("birth-seed")?.value?.trim();
  const birthOptions = { by: year };
  if (seedInput) {
    const numericSeed = Number(seedInput);
    if (Number.isSafeInteger(numericSeed) && numericSeed >= 0) {
      birthOptions.seed = numericSeed >>> 0;
    } else {
      let hash = 0;
      for (let i = 0; i < seedInput.length; i++) {
        hash = (Math.imul(31, hash) + seedInput.charCodeAt(i)) >>> 0;
      }
      birthOptions.seed = hash;
    }
  }
  born(birthOptions);
  // A zoomed/narrow title needs scrolling to reach its start button. That
  // title position must not hide the new life's journal heading.
  if (typeof window !== "undefined" && typeof window.scrollTo === "function") window.scrollTo(0, 0);
}
FC.forEach((n, i) => {
  const b = document.createElement("button");
  b.textContent = n;
  b.title = [
    "肩の力を抜き、日々の流れに身を任せて過ごす",
    "本や人の話から学び、知識と学歴を伸ばす（少し疲れがたまる）",
    "仕事に精を出して稼ぎを増やす（体と心に負担がかかり、怪我や労災の危険も増す）",
    "周囲の人々と言葉を交わし、身近な縁を深める",
    "無理をせず体を休め、体調と気持ちを立て直す（稼ぎは少し減る）",
    "仕事や学びで得た技能を磨く（病状の進行や賃金は、この選択だけでは変わらない）",
    "日々の出費を切り詰めて手元の金を残す（暮らしのゆとりは少し減る）",
    "家のことや家族と過ごす時間を大切にする（稼ぎは減るが、家族との出来事が起きやすくなる）",
    "身の危険を顧みず荒稼ぎに出る（収入は大きく増えるが、体を壊しやすく、深い傷を負う危険がある）"
  ][i];
  b.onclick = () => {
    if (S && !S.dead && !S.ev) {
      S.f = i;
      rd();
    }
  };
  $("fc").append(b);
});
$("tx").onchange = e => {
  if (S?.ev) { e.target.checked = !!S.fl.tx; return; }
  if (S) {
    if (S.fl.detained && !S.fl.tx && e.target.checked) {
      e.target.checked = false;
      return;
    }
    S.fl.tx = e.target.checked ? 1 : 0;
    rd();
  }
};
$("au").onchange = e => {
  if (S?.ev) { e.target.value = AU; return; }
  AU = e.target.value;
};
[
  ["全て", ""],
  ["良い", "f-gd"],
  ["悪い", "f-bad"],
  ["日常", "f-n"]
].forEach(([t, c]) => {
  const b = document.createElement("button");
  b.textContent = t;
  b.setAttribute?.("aria-pressed", String(c === ""));
  b.className = c === "" ? "on" : "";
  b.onclick = () => {
    $("lg").className = c;
    if (typeof decorateLifeLogYears === "function") decorateLifeLogYears();
    [...$("lf").children].forEach(x => {
      const active = x === b;
      x.className = active ? "on" : "";
      x.setAttribute?.("aria-pressed", String(active));
    });
  };
  $("lf").append(b);
});
