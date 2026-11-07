// Arts lessons attach to the current formal course and confirmed attendance.
window.TERRA_DATA_BUILD.fragment(
  "extensions/education-and-later-life",
  "extensions/arts-and-life/arts-training"
)(function ($terraData) {
  "use strict";

  $terraData.EV.push(
    {
      id: "life_arts_training_first_lesson",
      conf: "S",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ARTS_ARCHIVE", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      once: true,
      w: 0.45,
      show: s => artsHasAttendedCurrentCourse(s),
      t: "教室の木箱には、小さな金属片がいくつも並んでいた。教師は「まずは同じ動きを繰り返して」と言った。隣の生徒が器具を動かすあいだ、自分の箱はかすかな音も立てなかった。",
      c: [
        $terraData.K("教師に握り方を確かめてもらう", {}, [
          1,
          "教師は手元の角度を直し、もう一度ゆっくり試すよう促した。しばらくして金属片がかすかに揺れ、箱の底を小さく鳴らした。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "guided-success" } }
        ]),
        $terraData.K("隣の生徒の手元を見直す", {}, [
          1,
          "隣の生徒は実演のたびに指の位置を少し変えていた。自分の番が終わるまで、その違いを何度も目で追った。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "observed" } }
        ]),
        $terraData.K("今日は理論のノートをまとめる", {}, [
          1,
          "教師の説明を聞き、箱の横に書かれた注意事項を写した。授業が終わるころ、ノートの端は消し跡で黒ずんでいた。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "theory" } }
        ])
      ]
    },
    {
      id: "life_arts_lowaptitude_class",
      conf: "S",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ARTS_ARCHIVE", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 3,
      w: 0.3,
      show: s => lifeSystemEventEligible(s, "life_arts_lowaptitude_class"),
      t: "授業の終わりを告げる鐘が鳴っても、練習台の印はほとんど動かなかった。教師が器具を調べたあと、背後で誰かの椅子が床を擦った。机の上には、やり直した線が何本も残っている。",
      c: [
        $terraData.K("別の方法で試せないか尋ねる", {}, [
          1,
          "教師は練習台の課題を小さな手順に分け、扱いやすい方法を一つ示した。机の上で、新しい線を引き直した。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "attempt-not-achieved", response: "alternative-task-shown", alternativeTaskId: "kinetic-small-object-basic" } }
        ]),
        $terraData.K("今日はここで切り上げる", {}, [
          1,
          "印を消して器具を返した。廊下に出ると、窓から午後の光が差し込んでいた。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "attempt-not-achieved", response: "stopped-for-day" } }
        ])
      ]
    },
    {
      id: "life_arts_training_repeat",
      conf: "S",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ARTS_ARCHIVE", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 2,
      w: 0.38,
      show: s => {
        const enrollment = artsCurrentFormalEnrollment(s);
        return artsHasAttendedCurrentCourse(s, enrollment) &&
          s.artsProfile.practiceHistory.some(row => row.enrollmentId === enrollment.id &&
            row.year === s.year && row.sourceEventId !== "life_arts_training_repeat") &&
          !s.artsProfile.practiceHistory.some(row => row.enrollmentId === enrollment.id &&
            row.sourceEventId === "life_arts_training_repeat" && row.year === s.year && row.month === s.mo);
      },
      t: "前に書いた線を、同じ練習台でもう一度なぞった。教師はすぐ答えを示さず、手首の角度だけを指で示す。最初の印はかすれたが、二度目には道具がわずかに応えた。",
      c: [
        $terraData.K("手元を直して、もう一度試す", {}, [
          1,
          "教師の示した角度を確かめ、手順を分けてやり直した。道具は前より小さく揺れ、線の終わりに短い印が残った。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "guided-success" } }
        ]),
        $terraData.K("動きを見て、違いを書き留める", {}, [
          1,
          "ほかの生徒の手元を見て、動かす前後の違いをノートに写した。自分の道具は片づけたが、線の形は頭に残った。",
          { artsAction: { action: "record-practice", disciplineId: "kinetic", techniqueId: "kinetic-small-object", outcome: "observed" } }
        ])
      ]
    },
    {
      id: "life_arts_unit_borrow",
      conf: "S",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ARTS_ARCHIVE", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 1,
      w: 0.22,
      show: s => {
        const enrollment = artsCurrentFormalEnrollment(s),
          institutionId = s.educationPath?.institutionId || enrollment?.id;
        return artsHasAttendedCurrentCourse(s, enrollment) &&
          s.artsEquipment.items.length < 64 &&
          !s.artsEquipment.items.some(item => item.ownerType === "school" &&
            item.holderId === "protagonist" && item.condition !== "returned" && item.condition !== "lost");
      },
      t: "授業のあと、保管庫の係が練習用の小型器具を机に置いた。貸出票には返却日と、授業の監督下で使うことが記されている。",
      c: [
        $terraData.K("貸出票を確かめて、器具を借りる", {}, [
          1,
          "返却日と使用場所を確かめてから署名した。器具は授業用の袋に収まり、貸出票の控えが手元に残った。",
          { artsAction: { action: "borrow-equipment" } }
        ]),
        $terraData.K("今日は借りず、保管庫へ戻す", {}, [1, "器具を係へ戻し、貸出票には何も書かなかった。"])
      ]
    },
    {
      id: "life_arts_unit_return",
      conf: "S",
      references: ["SRC_LEITHANIEN_ARTS", "SRC_LEITHANIEN_ARTS_ARCHIVE", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 1,
      w: 0.3,
      show: s => s.artsEquipment.items.some(item => item.ownerType === "school" &&
        item.holderId === "protagonist" && item.condition === "serviceable" && item.dueAt &&
        (item.dueAt.year < s.year || item.dueAt.year === s.year && item.dueAt.month <= s.mo)),
      t: "返却日が近づき、授業用の器具を袋から取り出した。金具に練習の跡が残っている。貸出票の控えには、返却窓口の場所が書かれていた。",
      c: [
        $terraData.K("窓口で器具を返し、控えを受け取る", {}, [
          1,
          "係は器具の状態を確かめ、返却欄に日付を記した。控えを受け取ると、袋の中は空になった。",
          { artsAction: { action: "return-equipment", equipmentId: "$oldest-due-school-loan" } }
        ]),
        $terraData.K("授業後に返しに来る", {}, [1, "器具を袋へ戻し、窓口の場所をもう一度確かめた。"])
      ]
    },
    {
      id: "life_arts_unit_inspection",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 2,
      w: 0.18,
      show: s => {
        const enrollment = artsCurrentFormalEnrollment(s),
          institutionId = s.educationPath?.institutionId || enrollment?.id;
        return artsHasAttendedCurrentCourse(s, enrollment) &&
          s.artsEquipment.items.some(item => item.ownerId === institutionId && item.holderId === "protagonist" &&
            item.condition === "serviceable" && item.dueAt &&
            (item.dueAt.year < s.year || item.dueAt.year === s.year && item.dueAt.month <= s.mo));
      },
      t: "練習用の器具を返す前に、授業担当者が接続部を確かめるよう言った。金具の縁に黒い跡がある。汚れなのか、熱で変色したのかは、まだ分からない。",
      c: [
        $terraData.K("拭き取って点検し、異常なしと記す", {}, [
          1,
          "布で跡を拭き、担当者と接続部を確かめた。変形も緩みもなく、次の点検時期を貸出票に書き足した。",
          { artsAction: { action: "inspect-equipment", equipmentId: "$current-course-unit", result: "serviceable" } }
        ]),
        $terraData.K("跡を報告し、使用を止めて点検に回す", {}, [
          1,
          "跡の位置を担当者に示し、器具の使用を止めた。貸出票には点検が必要だと記され、授業担当者へ修理を相談することになった。",
          { artsAction: { action: "inspect-equipment", equipmentId: "$current-course-unit", result: "repair-required" } }
        ])
      ]
    },
    {
      id: "life_arts_unit_repair",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 2,
      w: 0.12,
      show: s => {
        const enrollment = artsCurrentFormalEnrollment(s),
          institutionId = s.educationPath?.institutionId || enrollment?.id;
        return artsHasAttendedCurrentCourse(s, enrollment) &&
          s.artsEquipment.items.some(item => item.ownerId === institutionId && item.holderId === "protagonist" &&
            item.condition === "unsafe" && artsLatestEquipmentRecord(s, item.id)?.result === "repair-required");
      },
      t: "点検担当者は、接続部の焼け跡を見て使用を止めた。授業で使う予備器具は今すぐには出せないという。修理票には部品の型番と、預かり先を書く欄がある。",
      c: [
        $terraData.K("修理票を出し、器具を預ける", {}, [
          1,
          "器具を担当者へ渡し、修理票の控えを受け取った。担当者は、修理が済むまでは同じ器具を使う練習に戻れないと告げた。",
          { artsAction: { action: "request-equipment-repair", equipmentId: "$current-course-unit" } }
        ]),
        $terraData.K("修理を頼まず、貸与元へ返す", {}, [
          1,
          "担当者は器具を保管庫へ戻し、貸与の終了を記した。練習では、しばらく実演を見ることになった。",
          { artsAction: { action: "return-equipment", equipmentId: "$oldest-unsafe-school-loan" } }
        ])
      ]
    },
    {
      id: "life_arts_unit_repair_parts",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 1,
      w: 0.1,
      show: s => s.artsEquipment.items.some(item => item.ownerType === "school" && item.condition === "in-repair" &&
        artsEquipmentFollowupDue(s, item, "repair-requested")),
      t: "保管庫から、修理に必要な交換部品が届いたという知らせがあった。受取確認が済むまでは器具に使えず、担当者は組み直しと動作確認にも日を置きたいと言う。",
      c: [
        $terraData.K("部品の受領を確認し、修理台へ回す", {}, [
          1,
          "届いた部品の型番を修理票と照合し、担当者が受領欄に記入した。器具は作業台に移された。",
          { artsAction: { action: "record-repair-parts", equipmentId: "$oldest-school-repair" } }
        ]),
        $terraData.K("修理票をしまい、受取確認は次回に回す", {}, [1, "部品の番号はまだ確かめず、修理票をしまった。受取の返事は次の授業で出すことにした。"])
      ]
    },
    {
      id: "life_arts_unit_repair_complete",
      conf: "S",
      references: ["SRC_INDUSTRIAL_LIFE", "SRC_TERRA_INDUSTRY_POLICY", "SRC_EDUCATION_ACCESS"],
      interactionScope: "minor",
      lifeSystemFamily: "arts",
      cd: 1,
      w: 0.1,
      show: s => s.artsEquipment.items.some(item => item.ownerType === "school" && item.condition === "in-repair" &&
        artsEquipmentFollowupDue(s, item, "parts-available")),
      t: "担当者から、器具の接続部を組み直したと連絡があった。受け渡しの前に、修理票と照らしながら状態を確かめる必要があるという。",
      c: [
        $terraData.K("点検済みの器具を受け取り、貸出票を更新する", {}, [
          1,
          "係と一緒に接続部を確かめ、貸出票の修理欄に日付を記した。器具は監督下で使える状態に戻った。",
          { artsAction: { action: "complete-equipment-repair", equipmentId: "$oldest-school-repair" } }
        ]),
        $terraData.K("確認を次の授業まで待つ", {}, [1, "器具は保管庫に置いたままにし、次の授業で担当者と確かめることにした。"])
      ]
    }
  );
});
