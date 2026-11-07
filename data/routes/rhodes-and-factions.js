// routes/rhodes-and-factions: ordered construction; fragments keep original append and patch order.
window.TERRA_DATA_BUILD.run("routes/rhodes-and-factions", function ($terraData, $define, $rules, $parts) {
  "use strict";
  $parts("routes/rhodes-and-factions/staff-setup");
  $parts("routes/rhodes-and-factions/staff-routes");
  $parts("routes/rhodes-and-factions/rhodes-landship-daily");
  $parts("routes/rhodes-and-factions/arena-work");
  $parts("routes/rhodes-and-factions/staff-job-catalog");
  $parts("routes/rhodes-and-factions/aftercare-and-eligibility");
  $parts("routes/rhodes-and-factions/reunion-lifepath");
  $parts("routes/rhodes-and-factions/bsw-and-rhine-setup");
  $parts("routes/rhodes-and-factions/cross-faction-routes");
  $parts("routes/rhodes-and-factions/bsw-routes");
  $parts("routes/rhodes-and-factions/rhine-routes");
  $parts("routes/rhodes-and-factions/rhodes-additional-events");
  $parts("routes/rhodes-and-factions/reunion-additional-events");
  // Run after every Rhodes route event, including referral and reapplication followups.
  for (const event of $terraData.EV) {
    if (!event.id.startsWith("sr_rhodes_")) continue;
    event.ge = { ...(event.ge || {}), year: Math.max(event.ge?.year || 0, 1095) };
    event.references = [...new Set([...(event.references || []), "SRC_RHODES_FOUNDATION"] )];
  }
});
