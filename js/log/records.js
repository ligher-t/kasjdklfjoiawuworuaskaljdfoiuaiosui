function recordTrace(kind, id, details = {}, before = null) {
  const services = LOG_SERVICES;
  if ((services.HL && !services.CAPTURE_TRACE) || !services.S) return;
  (services.S.trace || (services.S.trace = [])).push({
    version: services.TRACE_VERSION,
    kind,
    id,
    year: services.S.year,
    age: services.S.age,
    month: services.S.mo || 0,
    details,
    before,
    after: services.traceState(services.S)
  });
}
function flushPendingDeathTrace() {
  const services = LOG_SERVICES;
  if (!services.PENDING_DEATH_TRACE) return;
  const entry = services.PENDING_DEATH_TRACE;
  services.PENDING_DEATH_TRACE = null;
  if ((services.HL && !services.CAPTURE_TRACE) || !services.S) return;
  (services.S.trace || (services.S.trace = [])).push(entry);
}
