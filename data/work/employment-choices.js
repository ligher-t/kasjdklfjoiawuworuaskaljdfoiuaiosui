// A job selected from the person's information desk remains a normal, saveable
// choice event. Looking up the board never silently accepts employment.
window.TERRA_DATA_BUILD.run("work/employment-choices", function ($terraData) {
  "use strict";
  $terraData.EV.push({
    id: "work_known_opening_review", conf: "S", references: ["SRC_V76_EMPLOYMENT"],
    cd: 0, w: 0.01, ge: { age: 16 },
    show: s => !!employmentPendingOpening(s),
    t: s => {
      const opening = employmentPendingOpening(s);
      return opening ? "問い合わせた先から、" + opening.jobLabel + "の働き口について返事が届いた。勤めに出るなら、今の暮らしの時間をその仕事へ割くことになる。返事をする前に、手元の案内をもう一度読み返した。" : "";
    },
    c: [
      $terraData.K(s => s.job > 0 || currentPlayerEmployment(s)
        ? "今の仕事を終え、この働き口を引き受ける" : "条件を確かめ、この働き口を引き受ける", {
        en: s => {
          const row = employmentPendingOpening(s);
          return !!row && !!employmentOpeningForChoice(s, row.jobId, row.openingId, true);
        }, why: "募集が終わったか、今の生活や資格では勤務を始められない"
      }, [1, "案内の条件にうなずき、引き受けると返事をした。初めて持ち場に立つと、道具の置き場所と一日の手順を教わった。", { employmentAction: { action: "accept-known-opening" } }]),
      $terraData.K("今回は見送り、今の暮らしを続ける", {},
        [1, "案内を畳み、今回は引き受けないと伝えた。仕事を始める約束はせず、手元の予定を組み直した。", { employmentAction: { action: "decline-known-opening" } }])
    ]
  });
  $terraData.EV.push({
    id: "work_w11_community_bowl", conf: "S", references: ["SRC_V76_EMPLOYMENT"],
    st: ["青年", "壮年", "老年"], cd: 1, w: 0.12, ge: { age: 18 },
    show: s => employmentMealAvailable(s, "work_w11_community_bowl"),
    t: "夕餉の前、火のそばに空いた椀が一つあった。鍋をかき混ぜていた人が、空になった薪籠をこちらへ押した。",
    c: [
      $terraData.K("薪を運んで、夕餉を分けてもらう", {},
        [1, "薪籠をいっぱいにして戻ると、鍋から汁をよそってくれた。火のそばに腰を下ろし、湯気の立つ椀を両手で受け取った。",
          { employmentAction: { action: "receive-work-meal", sourceEventId: "work_w11_community_bowl" } }]),
      $terraData.K("椀を並べるのを手伝い、家で食べる", {},
        [1, "椀を火のそばに並べ、食事に来た人たちに声をかけてから帰った。", {}])
    ]
  });
  $terraData.EV.push({
    id: "work_family_shop_in_kind", conf: "S", references: ["SRC_V76_EMPLOYMENT"],
    st: ["青年", "壮年"], cd: 1, w: 0.12, ge: { age: 18 },
    show: s => employmentMealAvailable(s, "work_family_shop_in_kind"),
    t: "棚卸しが済む頃、親が帳場の奥から、包みを二つ持ってきた。片方を開けると、まだ温かいパンが入っていた。",
    c: [
      $terraData.K("一包みもらい、帳場で食べる", {},
        [1, "帳面を脇に寄せて座ると、親が一包み渡してくれた。店じまいの鐘が鳴るまで、二人でパンをかじった。",
          { employmentAction: { action: "receive-work-meal", sourceEventId: "work_family_shop_in_kind" } }]),
      $terraData.K("包みを残し、棚の札を片付ける", {},
        [1, "親の手元に包みを置いた。棚の札を一枚ずつ集め、束ねたところで店を出た。", {}])
    ]
  });
});
