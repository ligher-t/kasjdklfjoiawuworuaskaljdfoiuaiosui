// A job selected from the person's information desk remains a normal, saveable
// choice event. Looking up the board never silently accepts employment.
window.TERRA_DATA_BUILD.run("work/employment-choices", function ($terraData) {
  "use strict";
  $terraData.EV.push({
    id: "work_known_opening_review", conf: "S", references: ["SRC_V76_EMPLOYMENT"],
    cd: 0, w: 0,
    show: s => !!employmentPendingOpening(s),
    t: s => {
      const opening = employmentPendingOpening(s);
      return opening ? "問い合わせた先から、" + opening.jobLabel + "の働き口について返事が届いた。勤めに出るなら、今の暮らしの時間をその仕事へ割くことになる。返事をする前に、手元の案内をもう一度読み返した。" : "";
    },
    c: [
      $terraData.K("条件を確かめ、この働き口を引き受ける", {
        en: s => {
          const row = employmentPendingOpening(s);
          return !!row && !!employmentOpeningForChoice(s, row.jobId, row.openingId);
        }, why: "募集が終わったか、今の生活や資格では勤務を始められない"
      }, [1, "案内の条件にうなずき、引き受けると返事をした。初めて持ち場に立つと、道具の置き場所と一日の手順を教わった。", { employmentAction: { action: "accept-known-opening" } }]),
      $terraData.K("今回は見送り、今の暮らしを続ける", {},
        [1, "案内を畳み、今回は引き受けないと伝えた。仕事を始める約束はせず、手元の予定を組み直した。", { employmentAction: { action: "decline-known-opening" } }])
    ]
  });
});
