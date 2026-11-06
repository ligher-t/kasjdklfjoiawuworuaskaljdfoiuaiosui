// extensions/education-and-later-life: ordered construction; fragments keep original append and patch order.
window.TERRA_DATA_BUILD.run(
  "extensions/education-and-later-life",
  function ($terraData, $define, $rules, $parts) {
    "use strict";
    $parts("extensions/education-and-later-life/training");
    $parts("extensions/arts-and-life/arts-training");
    $parts("extensions/education-and-later-life/relationships");
    $parts("extensions/education-and-later-life/family-care");
    $parts("extensions/education-and-later-life/ursus-student-life");
    $parts("extensions/education-and-later-life/leithanian-political-life");
    $parts("extensions/education-and-later-life/leithanian-noble-household");
    $parts("extensions/education-and-later-life/elder-life");
    $parts("extensions/education-and-later-life/assets-and-property");
  }
);
