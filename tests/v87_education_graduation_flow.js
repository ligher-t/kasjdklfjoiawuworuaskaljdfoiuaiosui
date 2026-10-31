'use strict';
const path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { context, setup, cases } = require('./support/annual-cases.cjs');

const { ctx } = context(root);
setup(ctx, { seed: 905003, region: 'クルビア', age: 17 });

ctx.assert = assert;

vm.runInContext(`
(() => {
  console.log("Starting verification in engine-backed context...");

  // 1. 高校在籍ステートの準備
  S.age = 17;
  S.year = 1094;
  S.job = 0;
  S.fl = S.fl || {};
  S.fl.sch = 1;
  S.fl.uni = 0;
  S.fl.voc = 0;
  S.fl.arts_grad = 0;
  S.k = 80;
  S.ar = 80;
  socialModel(S).literacy = 80;

  // 後期中等（高校）に2年在籍中
  educationStart(S, 'upper');
  S.educationPath.yearsCompleted = 2;
  S.educationPath.yearsInStage = 2;

  // 2. 年次進行：17歳 -> 18歳（高校3年目修了）
  S.year = 1095;
  S.age = 18;
  educationAdvanceYear(S);

  // 検証1: 高校修了時に educationDecision が 'higher-path' になっていること
  assert(S.educationDecision && S.educationDecision.kind === 'higher-path',
    "高校修了時に higher-path 進路判断がセットされていません: " + JSON.stringify(S.educationDecision));
  assert.equal(S.educationPath.status, 'completed');
  assert.equal(S.educationPath.yearsCompleted, 3);

  // 検証2: 18歳になった時点で勝手に自動就職していないこと (job === 0 のままであること)
  prepareAnnualPersonalBudget(S, ANNUAL_SERVICES, S.age, S.t, S.f);
  assert.equal(S.job, 0, "就活前に勝手に自動就職してしまいました: job=" + S.job);

  // 検証3: higher_ed イベントが最優先（pri: true）で eligible になっていること
  const events = typeof EV !== 'undefined' ? EV : window.GAME_DATA.EV;
  const higherEd = events.find(e => e.id === 'higher_ed');
  assert(higherEd, "higher_ed イベントが見つかりません");
  assert(higherEd.show(S), "higher_ed イベントが show 条件を満たしていません");
  assert.equal(higherEd.pri, true, "higher_ed イベントは pri: true でなければなりません");

  // 検証4: higher_ed に自立就職（leave-higher）選択肢が存在し、選択肢数が9個であること
  assert.equal(higherEd.c.length, 9, "higher_ed の選択肢数が9個ではありません: " + higherEd.c.length);
  const leaveChoice = higherEd.c.find(c => c.l.includes("進学はせず") || c.l.includes("働き口を探して自立"));
  assert(leaveChoice, "自立就職選択肢が見つかりません");

  // 自立就職（leave-higher）を選択して適用
  educationApplyAction(S, 'leave-higher');

  // 検証5: 進路判断が完了し、educationDecision が null にクリアされていること
  assert.equal(S.educationDecision, null, "leave-higher 後に educationDecision がクリアされていません");

  // 検証6: 未就職（job === 0）の状態で夜学（life_night_study）は発火しないこと
  const nightStudy = events.find(e => e.id === 'life_night_study');
  assert(nightStudy, "life_night_study イベントが見つかりません");
  assert.equal(nightStudy.show(S), false, "未就職（job === 0）なのに夜学が発火可能になっています");

  // 検証7: 就職イベント（car）で就職する
  const car = events.find(e => e.id === 'car');
  assert(car, "car イベントが見つかりません");
  assert(car.show(S), "高校卒業・自立選択後に求人 car イベントが発火しません");
  // 一般就職（例: 一般労働）を適用
  S.job = 1;

  // 検証8: 新卒1年目（18歳、転職歴なし）で夜学（life_night_study）が即座に発火しないこと
  assert.equal(nightStudy.show(S), false, "高校新卒直後の18歳に夜学講習が発火してしまいました");

  // 検証9: 20歳以降の就労中であれば夜学講習が発火可能になること
  S.age = 20;
  assert(nightStudy.show(S), "20歳就労中に夜学講習が発火可能になりません");

  // 検証10: 監査（auditLifeState）で問題が検出されないこと
  const problems = auditLifeState(S);
  assert.deepEqual(problems, [], "ステート監査で問題が検出されました: " + JSON.stringify(problems));

  console.log("=== ALL GRADUATION & CAREER FLOW VERIFICATIONS PASSED! ===");
})()
`, ctx);
