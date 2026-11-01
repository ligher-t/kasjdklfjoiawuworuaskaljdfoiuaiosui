// Read-only inspection uses an isolated state snapshot. Gameplay keeps tags(s).
function cloneEligibilityInput(value, seen = new Map()) {
  if (!value || typeof value !== "object") return value;
  if (seen.has(value)) return seen.get(value);
  const copy = Array.isArray(value) ? [] : {};
  seen.set(value, copy);
  for (const key of Object.keys(value)) {
    Object.defineProperty(copy, key, {
      value: cloneEligibilityInput(value[key], seen),
      enumerable: true,
      writable: true,
      configurable: true
    });
  }
  return copy;
}
function inspectEligibilityTags(s) {
  return collectEligibilityTags(cloneEligibilityInput(s), TAG_RULE_SERVICES);
}
