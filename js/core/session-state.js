// Current life and known-world slot ownership. No cloning, repair or RNG changes.
let S,
  W = {};
function currentLifeState() {
  return S;
}
function replaceCurrentLife(next) {
  return (S = next);
}
function replaceWorldKnowledge(next) {
  return (W = next);
}
