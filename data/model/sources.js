// model/sources: ordered construction; fragments keep original append and patch order.
window.TERRA_DATA_BUILD.run("model/sources", function ($terraData, $define, $rules, $parts) {
  "use strict";
  $parts("model/sources/references");
  $parts("model/sources/context-and-access");
  $parts("model/sources/mechanic-parameters");
  $parts("model/sources/family-and-economy");
});
