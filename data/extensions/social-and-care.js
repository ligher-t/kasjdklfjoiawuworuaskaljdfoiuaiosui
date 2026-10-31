// extensions/social-and-care: ordered construction; fragments keep original append and patch order.
window.TERRA_DATA_BUILD.run("extensions/social-and-care", function ($terraData, $define, $rules, $parts) {
  "use strict";
  $parts("extensions/social-and-care/attitudes-family-knights");
  $parts("extensions/social-and-care/goals-craft-family");
  $parts("extensions/social-and-care/local-support-referrals");
  $parts("extensions/social-and-care/infected-organizations");
  $parts("extensions/social-and-care/infected-organization-operations");
  $parts("extensions/social-and-care/kazdel-displaced-life");
  $parts("extensions/social-and-care/research-reunion");
  $parts("extensions/social-and-care/civilian-response");
  $parts("extensions/social-and-care/affiliation-places");
  $parts("extensions/social-and-care/sources-and-flags");
  $parts("extensions/social-and-care/local-discrimination");
});
