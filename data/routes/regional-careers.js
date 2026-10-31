// routes/regional-careers: ordered construction of regional career routes across 19 regions.
window.TERRA_DATA_BUILD.run("routes/regional-careers", function ($terraData, $define, $rules, $parts) {
  "use strict";
  $parts("routes/regional-careers/setup");
  $parts("routes/regional-careers/entry-east");
  $parts("routes/regional-careers/entry-west");
  $parts("routes/regional-careers/entry-central");
  $parts("routes/regional-careers/entry-frontier");
  $parts("routes/regional-careers/events-east");
  $parts("routes/regional-careers/events-west");
  $parts("routes/regional-careers/events-central");
  $parts("routes/regional-careers/events-frontier");

  for (const event of $terraData.EV) {
    if (!event.id.startsWith("car_")) continue;
    event.references = [...new Set([...(event.references || []), "SRC_REGIONAL_CAREERS"])];
  }
});
