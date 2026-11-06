"use strict";
// An isolated runtime for expensive end-of-life comparisons.
// The static script list is read from the same index.html as the visible game.
self.window = self;
const UI_ELEMENT = () => ({
  hidden: false, value: "", textContent: "", innerHTML: "", children: [],
  style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {} },
  setAttribute() {}, addEventListener() {}, append() {}, appendChild() {}
});
const UI_NODES = new Map();
self.document = {
  getElementById(id) {
    if (!UI_NODES.has(id)) UI_NODES.set(id, UI_ELEMENT());
    return UI_NODES.get(id);
  },
  createElement: UI_ELEMENT,
  querySelectorAll: () => [],
  documentElement: { style: { setProperty() {} }, setAttribute() {} }
};
const MEMORY_STORAGE = new Map();
self.localStorage = {
  getItem: key => MEMORY_STORAGE.get(key) ?? null,
  setItem: (key, value) => MEMORY_STORAGE.set(key, String(value)),
  removeItem: key => MEMORY_STORAGE.delete(key)
};
self.scrollTo = () => {};
self.alert = () => {};
self.confirm = () => false;
async function loadEndingPeerRuntime() {
  const base = new URL("../../", self.location.href);
  const response = await fetch(new URL("index.html", base));
  if (!response.ok) throw new Error("Unable to load the comparison runtime manifest");
  const html = await response.text();
  const sources = [...html.matchAll(/<script\b[^>]*\bsrc="((?:[\w-]+\/)*[\w-]+\.js)"[^>]*><\/script>/g)]
    .map(match => match[1]).filter(path => path !== "js/ui/bootstrap.js");
  if (!sources.includes("js/ui/ending.js") || !sources.includes("js/version.js"))
    throw new Error("Incomplete comparison runtime manifest");
  importScripts(...sources.map(path => new URL(path, base).href));
}
const ENDING_PEER_RUNTIME_READY = loadEndingPeerRuntime();
self.onmessage = async ({ data }) => {
  if (data?.type !== "run") return;
  try {
    await ENDING_PEER_RUNTIME_READY;
    if (data.revision !== ENGINE_REVISION) throw new Error("Comparison runtime revision mismatch");
    if (!Number.isSafeInteger(data.count) || data.count < 1 || data.count > 6 ||
        !Number.isSafeInteger(data.by) || data.by < BIRTH_YEAR_MIN || data.by > BIRTH_YEAR_MAX)
      throw new Error("Invalid comparison request");
    for (let index = 0; index < data.count; index++) {
      try {
        const person = simPeer(
          endingPeerSeed(data.seed, index + data.retryAttempt * data.count),
          { by: data.by, bd: data.bd }
        );
        self.postMessage({ type: "peer", index, person });
      } catch (error) {
        self.postMessage({ type: "peer", index, error: error.message || String(error) });
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    self.postMessage({ type: "done" });
  } catch (error) {
    self.postMessage({ type: "fatal", error: error.message || String(error) });
  }
};
