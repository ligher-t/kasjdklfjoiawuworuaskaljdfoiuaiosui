function repairAttitudeHistory(s) {
  if (!Array.isArray(s.attitudeHistory)) s.attitudeHistory = [];
  else s.attitudeHistory = s.attitudeHistory.slice(-40);
  return s;
}
