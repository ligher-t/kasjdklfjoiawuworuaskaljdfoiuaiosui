// Display preferences never belong to a life or its random stream.
const UI_PREFERENCES_KEY = "terra-ui-preferences-v1";
const UI_DEFAULTS = Object.freeze({ version: 1, theme: "auto", spacing: "compact", motion: "auto", activeTab: "c", pauseInLedger: true,choiceResume:"legacy",pauseImportant:false,educationNotices:"compact" });
let UI_PREFERENCES = { ...UI_DEFAULTS };
function readUIPreferences() {
  let value = {};
  try { value = JSON.parse(localStorage.getItem(UI_PREFERENCES_KEY) || "{}") || {}; } catch {}
  let oldTheme;
  try { oldTheme = localStorage.getItem("terra-theme"); } catch {}
  return {
    choiceResume:["legacy","resume","pause"].includes(value.choiceResume)?value.choiceResume:"legacy",
    pauseImportant:typeof value.pauseImportant==="boolean"?value.pauseImportant:false,
    educationNotices:["compact","detailed"].includes(value.educationNotices)?value.educationNotices:"compact",
    version: 1,
    theme: ["auto", "light", "dark"].includes(value.theme) ? value.theme :
      ["auto", "light", "dark"].includes(oldTheme) ? oldTheme : "auto",
    spacing: ["compact", "standard"].includes(value.spacing) ? value.spacing : "compact",
    motion: ["auto", "full", "reduced"].includes(value.motion) ? value.motion : "auto",
    activeTab: ["l", "c", "r"].includes(value.activeTab) ? value.activeTab : "c",
    pauseInLedger: typeof value.pauseInLedger === "boolean" ? value.pauseInLedger : true
  };
}
function setUIPreference(key, value) {
  const allowed = { theme: ["auto", "light", "dark"], spacing: ["compact", "standard"], motion: ["auto", "full", "reduced"], activeTab: ["l", "c", "r"], pauseInLedger: [true, false],choiceResume:["legacy","resume","pause"],pauseImportant:[true,false],educationNotices:["compact","detailed"] };
  if (!allowed[key]?.includes(value)) return;
  if (UI_PREFERENCES[key] === value) return;
  UI_PREFERENCES = { ...UI_PREFERENCES, [key]: value };
  try { localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(UI_PREFERENCES)); } catch {}
  applyUIPreferences();
  if (key === "pauseInLedger" && typeof syncLedgerAutoPause === "function")
    syncLedgerAutoPause();
}
function applyUIPreferences() {
  const root = document.documentElement;
  if (UI_PREFERENCES.theme === "auto") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", UI_PREFERENCES.theme);
  root.setAttribute("data-ui-spacing", UI_PREFERENCES.spacing);
  root.setAttribute("data-ui-motion", UI_PREFERENCES.motion);
  document.querySelectorAll(".th").forEach(b => {
    b.textContent = { auto: "テーマ:自動", light: "テーマ:ライト", dark: "テーマ:ダーク" }[UI_PREFERENCES.theme];
  });
  document.querySelectorAll("[data-ui-preference]").forEach(select => {
    select.value = UI_PREFERENCES[select.dataset.uiPreference];
  });
  const autoPause = document.getElementById("ui-ledger-auto-pause");
  if (autoPause) autoPause.checked = UI_PREFERENCES.pauseInLedger;
}
function theme(next) {
  if (next != null) {
    const themes = ["auto", "light", "dark"];
    setUIPreference("theme", themes[(themes.indexOf(UI_PREFERENCES.theme) + 1) % themes.length]);
  } else applyUIPreferences();
}
function initializeUIPreferences() {
  UI_PREFERENCES = readUIPreferences();
  applyUIPreferences();
  document.querySelectorAll("[data-ui-preference]").forEach(select => {
    select.addEventListener("change", () => setUIPreference(select.dataset.uiPreference, select.value));
  });
  document.getElementById("ui-ledger-auto-pause")?.addEventListener("change", event =>
    setUIPreference("pauseInLedger", !!event.target.checked));
  tab(UI_PREFERENCES.activeTab);
}
