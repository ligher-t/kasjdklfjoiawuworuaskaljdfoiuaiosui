// Modal presentation only: no event selection, effects, random calls or life repair.
const UI_FOCUS_RETURNS = new Map();
let UI_SELECT_ESCAPE_PRIMED = null;
function topUIDialog() {
  return ["resume-manager", "ui-settings", "md"].map(id => $(id)).find(el => el && !el.hidden) || null;
}
function uiFocusable(dialog) {
  return [...dialog.querySelectorAll('button, select, input, textarea, a[href], [tabindex]')]
    .filter(el => !el.disabled && el.tabIndex >= 0 && !el.closest("[hidden], [inert]") && el.getClientRects().length);
}
function syncUIDialogs() {
  if (HL) return;
  const top = topUIDialog();
  for (const id of ["md", "resume-manager", "ui-settings"]) {
    const el = $(id);
    if (!el) continue;
    el.inert = !!top && el !== top;
    if (!el.hidden && el === top) el.setAttribute("aria-modal", "true");
    else el.removeAttribute("aria-modal");
  }
  for (const el of [$("s0"), document.querySelector("main"), $("tb"), $("cols"), $("ft"), $("tabs")]) {
    if (el) el.inert = !!top;
  }
  document.body.classList.toggle("ui-modal-open", !!top);
}
function openUIDialog(id, focusTarget) {
  UI_SELECT_ESCAPE_PRIMED = null;
  const dialog = $(id);
  if (dialog.hidden) UI_FOCUS_RETURNS.set(id, document.activeElement);
  dialog.hidden = false;
  syncUIDialogs();
  (focusTarget || uiFocusable(dialog)[0] || dialog).focus();
}
function closeUIDialog(id) {
  UI_SELECT_ESCAPE_PRIMED = null;
  $(id).hidden = true;
  syncUIDialogs();
  const top = topUIDialog(), previous = UI_FOCUS_RETURNS.get(id);
  UI_FOCUS_RETURNS.delete(id);
  if (previous?.isConnected && !previous.closest("[hidden], [inert]") && !previous.disabled && (!top || top.contains(previous))) previous.focus();
  else if (top) (uiFocusable(top)[0] || top).focus();
  else $("stt")?.focus();
}
function openUISettings() { openUIDialog("ui-settings", $("ui-theme")); }
function syncChoiceControls() {
  if (HL) return;
  const pending = !!S?.ev;
  document.querySelectorAll("#ctl button, #s0 .sg button").forEach(b => { b.disabled = pending; });
  if ($("au")) $("au").disabled = pending;
  // The collapsed choice still owns the simulation. Its policy editor is
  // not a secondary way to change the pending decision.
  if ($("policy-toggle")) $("policy-toggle").disabled = pending;
  if (pending) {
    document.querySelectorAll("#fc button").forEach(b => { b.disabled = true; });
    if ($("tx")) $("tx").disabled = true;
  }
}
function showChoiceSheet() {
  $("resumeChoice").hidden = true;
  openUIDialog("md", $("mt"));
  const sheet = $("md").querySelector(".ui-choice-sheet");
  if (sheet) sheet.scrollTop = 0;
  syncChoiceControls();
}
function collapseChoiceSheet() {
  if (!S?.ev) return;
  // Preserve the first return speed even after repeated collapse/reopen cycles.
  if (!Number.isInteger(S.choiceReturnSpeed)) S.choiceReturnSpeed = sp;
  play(0);
  $("md").hidden = true;
  $("resumeChoice").hidden = false;
  syncUIDialogs();
  syncChoiceControls();
  $("resumeChoice").focus();
}
function handleUIDialogKey(event) {
  if (event.defaultPrevented || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
  const active = document.activeElement;
  const editing = !!active?.closest('input, select, textarea, [contenteditable]:not([contenteditable="false"])');
  const dialog = topUIDialog();
  if (dialog && event.key === "Tab") {
    const nodes = uiFocusable(dialog);
    const index = nodes.indexOf(active);
    event.preventDefault();
    const next = index < 0 ? (event.shiftKey ? nodes.length - 1 : 0) :
      (index + (event.shiftKey ? -1 : 1) + nodes.length) % nodes.length;
    (nodes[next] || dialog).focus();
    return;
  }
  // Give a native select popup its first Escape. A second Escape on
  // the same focused control closes the surrounding dialog, so keyboard
  // users are never trapped on a dropdown.
  if (event.key !== "Escape") UI_SELECT_ESCAPE_PRIMED = null;
  if (dialog && editing && active?.tagName === "SELECT" && event.key === "Escape") {
    if (UI_SELECT_ESCAPE_PRIMED !== active) {
      UI_SELECT_ESCAPE_PRIMED = active;
      return;
    }
    UI_SELECT_ESCAPE_PRIMED = null;
  }
  if (dialog && event.key === "Escape") {
    event.preventDefault();
    if (dialog.id === "md") collapseChoiceSheet();
    else closeUIDialog(dialog.id);
    return;
  }
  if (editing) return;
  if (dialog?.id === "md" && /^[1-9]$/.test(event.key)) {
    const button = $("mc").children[Number(event.key) - 1];
    event.preventDefault();
    if (button && button.getAttribute("aria-disabled") !== "true") button.click();
    return;
  }
  // Never turn Space or a number into a speed command while the user is
  // operating a link, disclosure, listbox, button or other control.
  const interactive = !!active?.closest?.('button, a[href], summary, [role="button"], [role="switch"], [role="slider"], [role="tab"], [role="menuitem"]');
  if (dialog || S?.ev || editing || interactive || !S || S.dead || $("s1").hidden) return;
  if (event.code === "Space" && active?.tagName !== "BUTTON") {
    event.preventDefault();
    play(sp ? 0 : 1);
  } else if (/^[0-5]$/.test(event.key)) play(Number(event.key));
}
