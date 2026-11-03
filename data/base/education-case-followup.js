// P06/P16: one bounded follow-up for a real, student-visible education case.
window.TERRA_DATA_BUILD.run("base/education-case-followup", function ($terraData) {
  "use strict";
  $terraData.EV.push({
    id:"education_case_review",conf:"S",references:["SRC_EDUCATION_ACCESS"],
    cd:0,pri:true,who:"self",inConfinement:true,
    show:s=>educationCaseNeedsReview(s),
    t:"学校の案内と家の事情を確かめながら、今年の進路についてもう一度考えた。募集先の知らせが届いても、通い続ける算段と入学の手続は別に残っている。",
    c:[
      $terraData.K("確認した第一候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,0),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,0)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"確認した募集先に、進学の意思を伝えて選考を申し込んだ。学校からの返事を待つことになった。",
        {educationAction:"case:select:0"}]),
      $terraData.K("確認した第二候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,1),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,1)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"別の地区で確認した募集先へ願書を出した。どこで学ぶかは、まだ受入れの返事によって変わりうる。",
        {educationAction:"case:select:1"}]),
      $terraData.K("確認した第三候補へ申し込む",{
        show:s=>educationActiveCase(s)?.phase==="planning" && !!educationCaseCandidate(s,2),
        en:s=>educationCasePreflight(s,educationCaseCandidate(s,2)).allowed,
        why:"この募集先の応募資格、交通、保護者または受験費用の条件が整っていない"
      },[1,"調べた中のもう一つの募集先を選び、申込みの手続を始めた。",
        {educationAction:"case:select:2"}]),
      $terraData.K("隣の地区の募集先も調べる",{
        show:s=>educationActiveCase(s)?.phase==="planning" &&
          educationActiveCase(s).stepsUsed<2 &&
          educationNeighborAreaIds(s,s.local?.educationAreaId).length>0
      },[1,"近くの地区まで足を延ばし、募集案内のある学校を一つずつ訪ねて回った。探した範囲と時期を記録した。",
        {educationAction:"case:search-adjacent"}]),
      $terraData.K("学校外で読み書きや手仕事を学ぶ",{
        show:s=>educationActiveCase(s)?.phase==="planning"
      },[1,"今年は学校へ通う手続を置き、家や仕事場で学べることから始めると決めた。学校の免状を得たことにはならない。",
        {educationAction:"case:nonformal",k:2}]),
      $terraData.K("今年の進学は見送る",{
        show:s=>educationActiveCase(s)?.phase==="planning"
      },[1,"調べた学校の案内を手元に残し、今年は申込みをしないことにした。また考える余地は残してある。",
        {educationAction:"case:defer"}]),
      $terraData.K("入学の条件を確かめて正式に手続する",{
        show:s=>educationActiveCase(s)?.phase==="contract",
        en:s=>educationCaseCommitEligibility(s).allowed,
        why:"受入通知、校地、通学手段または入学時の費用を整えられていない"
      },[1,"合格の知らせを受けて、学費と通学の手続きをそろえた。入学の届けを出し、学校で学ぶ暮らしが始まる。",
        {educationAction:"case:commit"}]),
      $terraData.K("合格・受入後の入学を辞退する",{
        show:s=>educationActiveCase(s)?.phase==="contract"
      },[1,"受け入れるという学校の返事を手元に残し、今回は入学を見送った。受験をした事実は消えない。",
        {educationAction:"case:decline-offer"}]),
      $terraData.K("元の学籍の継続について相談する",{
        show:s=>educationActiveCase(s)?.phase==="continuity",
        en:s=>educationOccupied(s),
        why:"継続できる学籍が残っていない"
      },[1,"学校の窓口に現在の学籍を照会し、今年の扱いを確認した。",
        {educationAction:"case:keep-current"}]),
      $terraData.K("在籍中の課程をいったん休む",{
        show:s=>educationActiveCase(s)?.phase==="continuity"&&educationLive(s)
      },[1,"学びを続けるための時間を得ようと、学校に休学の意思を伝えた。",
        {educationAction:"case:pause"}]),
      $terraData.K("いったん退学して別の学び方を考える",{
        show:s=>educationActiveCase(s)?.phase==="continuity"
      },[1,"これまでの履修記録を残し、今の学校を離れる判断を下した。",
        {educationAction:"case:withdraw"}])
    ]
  });
});
