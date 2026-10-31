// review/choice-policy: ordered game data; see DATA_MODULES.md.
window.TERRA_DATA_BUILD.run("review/choice-policy", function ($terraData, $define, $rules) {
  "use strict";
  $define("v81src", ["SRC_V81_AFTERMATH", "SRC_V81_WOLMONDE", "SRC_V81_FIRELIGHT"], false);

  $terraData.EV.push(
    {
      id: "v81_job_silence",
      conf: "S",
      references: $terraData.v81src,
      st: ["青年", "壮年", "老年"],
      cd: 6,
      w: 0.82,
      show: s =>
        s.age >= 18 &&
        s.job > 0 &&
        s.socialAftermath?.episodes?.some(
          x => x.domain === "work" && x.status === "active" && s.year - x.year <= 4
        ),
      t: "勤務表には仕事があるのに、申し送りの紙からあなたの名前だけが抜けていた。仕事の振り分けを尋ねても、同僚は話を途中で切り上げる。異議を申し立てるか、話を聞いてくれる人に伝えるか、今日は帰るか考えた。",
      c: [
        $terraData.K("記録を取り、労務相談先へ状況を伝える", {}, [
          1,
          "仕事の割当てと説明された理由を分けて書き、労務相談先へ渡した。返事を待つ間も、申し送りから名前は抜けたままだった。",
          {
            socialAftermathAction: { type: "document", domain: "work", note: "勤務上の対応を記録" },
            k: 1,
            p: -1
          }
        ]),
        $terraData.K(
          "話を聞いてくれる同僚にだけ事情を打ち明ける",
          { en: { ge: { rl: 16 } }, why: "近況を話せる相手がまだいない。" },
          [
            0.65,
            "同僚は勤務後まで残り、休憩室で話を聞いた。申し送りの欄は空いたままだったが、帰りは途中まで一緒に歩いた。",
            {
              socialAftermathAction: { type: "support", domain: "work", note: "同僚との短い支援の接点" },
              rl: 2,
              p: 1
            }
          ],
          [
            1,
            "同僚は「今は関わりたくない」と言った。書きかけの申立書を持ち帰り、次に話す相手を考えた。",
            { socialAftermathAction: { type: "review", domain: "work", note: "協力の申し出は保留" }, p: -3 }
          ]
        ),
        $terraData.K("今日は仕事だけを終え、返事を急がない", {}, [
          1,
          "必要な作業だけ終え、いつもより早く持ち場を出た。翌日の勤務予定を確かめた。",
          { socialAftermathAction: { type: "review", domain: "work", note: "対応を先延ばし" } }
        ])
      ]
    },
    {
      id: "v81_housing_account",
      conf: "S",
      references: $terraData.v81src,
      st: ["青年", "壮年", "老年"],
      cd: 7,
      w: 0.65,
      show: s =>
        s.age >= 18 &&
        s.socialAftermath?.episodes?.some(
          x => x.domain === "housing" && x.status === "active" && s.year - x.year <= 4
        ),
      t: "申請の控えを出すたび、窓口では別の書類を求められた。近所では事情を知らない人が噂をしている。今月の家賃を払う前に、どこへ相談するか決めた。",
      c: [
        $terraData.K(
          "必要な書類を集め、説明の食い違いを記録する",
          { en: { ge: { literacy: 24 } }, why: "書式の内容を確認するための読み書きが不足している。" },
          [
            1,
            "日付、担当者の説明、提出したものを控えた。帰宅後、次に出すよう言われた書類を帳面の端に書き足した。",
            { socialAftermathAction: { type: "document", domain: "housing", note: "住居手続きを記録" }, k: 1 }
          ]
        ),
        $terraData.K(
          "近隣の互助窓口へ相談する",
          {},
          [
            0.55,
            "相談窓口の人と申請書を確かめ、家主へ説明する手順を聞いた。",
            {
              socialAftermathAction: { type: "support", domain: "housing", note: "互助窓口からの手続き支援" },
              p: 2,
              rl: 2
            }
          ],
          [
            1,
            "相談窓口の人は担当が足りないと話し、申請書はそのまま返された。書き留めた住所だけを鞄へしまった。",
            { socialAftermathAction: { type: "review", domain: "housing", note: "手続き支援は保留" }, p: -1 }
          ]
        ),
        $terraData.K("今は距離を取り、当面の寝場所を確かめる", {}, [
          1,
          "まず今日眠る場所と荷物を守った。申請書は鞄にしまい、明日また窓口へ行くことにした。",
          { socialAftermathAction: { type: "review", domain: "housing", note: "当面の住まいを優先" } }
        ])
      ]
    },
    {
      id: "v81_family_boundary",
      conf: "S",
      references: $terraData.v81src,
      st: ["少年", "青年", "壮年", "老年"],
      cd: 9,
      w: 0.7,
      show: s =>
        !!s.socialConflict?.familyBreach &&
        s.socialAftermath?.episodes?.some(
          x => x.domain === "family" && x.status === "active" && s.year - x.year >= 1
        ),
      t: "家族から拒絶された日から年月が過ぎた。食事の前に電話をかけ、呼び出し音が続くのを待った。受話器を置いても、あの日の言葉が残っていた。",
      c: [
        $terraData.K(
          "返事を強いずに必要な連絡だけ送る",
          {},
          [
            0.5,
            "短い返事が届いた。近況を尋ねる言葉のあと、緊急時に使う連絡先だけを伝えられた。",
            {
              socialAftermathAction: { type: "support", domain: "family", note: "家族と限定的な連絡を確認" },
              p: 1
            }
          ],
          [
            1,
            "返事は届かなかった。あなたは新しい連絡先を探すことにした。",
            { socialAftermathAction: { type: "review", domain: "family", note: "家族から返事なし" }, p: -2 }
          ]
        ),
        $terraData.K("家族とは距離を置き、別の暮らしを守る", {}, [
          1,
          "関係を元に戻そうとするのを一旦やめ、別の人と食事をする時間を増やした。",
          {
            socialAftermathAction: {
              type: "close",
              domain: "family",
              note: "家族との直接の接触はひとまず終えた"
            },
            p: 1
          }
        ]),
        $terraData.K("過去の言葉を記録し、今は判断を保留する", {}, [
          1,
          "あの日に言われた言葉を、忘れないうちに紙へ書いた。書き終えても、連絡先は開かなかった。",
          {
            socialAftermathAction: {
              type: "document",
              domain: "family",
              note: "家族からの拒絶を自分の言葉で記録"
            }
          }
        ])
      ]
    },
    {
      id: "v81_aftermath_mutualaid",
      conf: "S",
      references: $terraData.v81src,
      st: ["児童", "少年", "青年", "壮年", "老年"],
      cd: 5,
      w: 0.52,
      show: s =>
        s.age >= 8 && s.socialAftermath?.episodes?.some(x => x.status === "active" && s.year - x.year <= 4),
      t: "近隣の集まりで、大人も子どもも住まいや学び、仕事の困りごとを持ち寄った。配給の知らせを探す人もいれば、働き口を探す人、ただ話を聞いてほしい人もいた。",
      c: [
        $terraData.K(
          "相手の事情を聞いて、できる範囲で連絡を続ける",
          {
            en: { le: { biasInfected: 74 } },
            why: "感染者への排斥思想が強く、今は対等な交流に踏み出せない。"
          },
          [
            0.55,
            "話せる範囲で事情を分け合い、次に顔を合わせる日を決めた。",
            { socialAftermathAction: { type: "support", note: "共同体で交流と互助の接点を作った" }, rl: 3 }
          ],
          [
            1,
            "今日は話を聞いてもらえただけだった。明日も誰かが集まれるかは分からない。",
            { socialAftermathAction: { type: "review", note: "共同体で相談した" }, p: 1 }
          ]
        ),
        $terraData.K("当面は自分の用件だけを伝える", {}, [
          1,
            "自分の用件だけ伝え、必要な手続き先を手帳に控えた。それ以上の話はせず、その場を離れた。",
          { socialAftermathAction: { type: "document", note: "共同体の案内を確認" } }
        ]),
        $terraData.K("集まりから離れ、別の相談方法を探す", {}, [
          1,
          "集まりを後にし、別の相談先を探した。掲示にあった窓口の住所を手帳に控えた。",
          { socialAftermathAction: { type: "review", note: "別の相談先を検討" } }
        ])
      ]
    },
    {
      id: "v81_memory_without_penalty",
      conf: "S",
      references: $terraData.v81src,
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.5,
      show: s => s.age >= 22 && s.socialAftermath?.episodes?.some(x => s.year - x.year >= 5),
      t: "昔受けた不当な扱いを、帰り道にふと思い出した。周りの顔ぶれは変わったが、あの時の言葉はまだ耳に残っている。今日は誰にも話さず、家へ戻った。",
      c: [
        $terraData.K("当時の経緯を自分の記録として残す", {}, [
          1,
          "覚えている順に、相手の言葉と自分がしたことを書いた。日付が曖昧なところは空欄にし、帳面を閉じた。",
          { k: 1 }
        ]),
        $terraData.K("帰宅して、明日の支度をする", {}, [
          1,
          "湯を沸かし、食器を片づけた。あの日のことは、今日は誰にも話さなかった。",
          { p: 1 }
        ]),
        $terraData.K("以前の土地や職場の消息だけ調べる", {}, [
          1,
          "以前の土地や職場のことを人づてに尋ねた。聞いた話のうち、確かめられたことだけを手帳に書き留めた。",
          { k: 1 }
        ])
      ]
    },
    {
      id: "v87_medical_access_aftermath",
      conf: "S",
      references: ["SRC_TERRA_DISCR_MEDIC", "SRC_ORIPATHY_SOCIAL", "SRC_V81_AFTERMATH"],
      st: ["青年", "壮年", "老年"],
      once: true,
      w: 0.52,
      show: s =>
        s.age >= 18 &&
        s.socialAftermath?.episodes?.some(
          x => x.domain === "medical" && x.status === "active" && x.year <= s.year - 1 && x.year >= s.year - 4
        ),
      t: "以前、診療を先送りした経験がある。今回は受付時間を調べ、付き添いを頼めるか考えた。薬を受け取るところまで辿り着くには、段取りが要る。",
      c: [
        $terraData.K("別の診療先へ連絡し、受け入れ条件を確かめる", {}, [
          1,
          "必要な持ち物と受付時間を控えた。診察日は、窓口の返事を受け取ってから決めることになった。",
          {
            socialAftermathAction: { type: "document", domain: "medical", note: "別の診療先の条件を照会" },
            k: 1
          }
        ]),
        $terraData.K(
          "事情を話せる人に、道順や付き添いを頼む",
          {},
          [
            0.55,
            "知人が受付まで付き添ってくれた。二人で窓口の説明を確かめ、次に訪ねる日を決めた。",
            {
              socialAftermathAction: {
                type: "support",
                domain: "medical",
                note: "受診経路の確認に付き添いを得た"
              },
              rl: 2,
              p: 1
            }
          ],
          [
            1,
            "知人は同行できなかった。受付票を鞄へ戻し、次の休みを勤務表で探した。",
            {
              socialAftermathAction: { type: "review", domain: "medical", note: "付き添いの相談は保留" },
              p: -1
            }
          ]
        ),
        $terraData.K("費用と仕事の予定を見直し、受診日を決め直す", {}, [
          1,
          "予約の電話を切り、帳面の端に交通費と休める日を書き込んだ。",
          { socialAftermathAction: { type: "review", domain: "medical", note: "費用と日程を再確認" }, p: -1 }
        ])
      ]
    }
  );

  $define(
    "V79_CHOICE_MATRIX",
    {
      v79_parent_public_rejection: "x~I,h~I,w~I",
      v79_parent_defends_infected: "i~I,h~I,r~I",
      v79_parent_views_diverge: "i~I,h~I,w~I",
      bias_family_model: "h~I,x~I",
      bias_family_infected_parent_solidarity: "i~I,x~I",
      bias_family_support: "i~I,o~I",
      minos_hero_spirit_stigma: "h~I,i~I,c~I",
      bias_family_sarkaz_model: "h~K,x~K",
      bias_peer_mockery: "h~I,x~I",
      bias_teacher_lesson: "h~I,x~I",
      attitude_counterexample: "r~I,c~I,w~I",
      dst: "a~I,w~I,p~I",
      fam_infected: "s~I,s~I,s~I,s~I,s~I",
      parent_treatment_review: "s~I,s~I",
      fam_care_followup: "s~I,s~I,s~I,w~I",
      fam_care_capacity_review: "s~I,s~I,s~I",
      fam_child_inf: "s~I,s~I,s~I",
      infected_neighbor: "a~I,a~I,a~I,a~I,w~I,h~I",
      urs_sweep: "a~I,w~I,w~I,h~I,w~I",
      col_quarantine_offer: "s~I,s~I",
      lei_isolation: "s~I,w~I",
      lat_exile: "s~I,s~I",
      ibe_inquisition: "p~A,w~A,h~A",
      ibe_followup: "p~A,m~A,w~A",
      ibe_sea: "i~A,p~A,w~A",
      ibe_famine: "s,s,a",
      ibe_rebuild: "d,i,w",
      kaz_reunion: "i~I,i~I,w~I",
      wld_rhodes: "s~I,i~I,a~I,i~I,w~I",
      attitude_infected_child: "h~I,x~I",
      attitude_sarkaz_child: "h~K,x~K",
      family_spouse_oripathy_disclosure: "a~I,w~I,w~I",
      family_spouse_sarkaz: "x~K,w~K,w~K",
      family_player_infection_reaction: "s~I,s~I,s~I,s~I,r~I,s~I,s~I,s~I,s~I",
      family_spouse_infection_care: "s~I,s~I,s~I,s~I",
      family_spouse_treatment_review: "s~I,s~I,s~I,s~I,s~I,s~I",
      family_spouse_disclosure_followup: "s~I,s~I",
      life_reunion_local_entry: "a~I,a~I,w~I",
      life_reunion_order_conflict: "a~I,h~I,w~I",
      life_infected_association_choice: "h~I,a~I,w~I",
      life_infected_association_review: "d~I,w~I,d~I",
      life_infected_exclusion_consequence: "h~I,h~I,x~I",
      life_infected_mutual_aid_shortage: "a~I,a~I,i~I",
      life_infected_organization_dues: "d~I,d~I,w~I",
      life_infected_organization_exit_legacy: "i~I,w~I,r~I",
      life_rhodes_research_offer: "d~I,a~I,f~I",
      life_rhodes_research_stall: "p~I,p~I,a~I,w~I,w~I",
      life_rhodes_research_ethics: "x~I,p~I,a~I",
      earth_discr_school_guardian: "a~I,x~I,w~I",
      earth_discr_school_later: "i~I,i~I,w~I",
      earth_discr_clinic_entry: "s~I,s~I,w~I",
      earth_discr_clinic_return: "s~I,s~I,w~I",
      earth_discr_sarkaz_application: "s~K,w~K,i~K",
      earth_discr_sarkaz_work_later: "s~K,i~K,m~K",
      earth_discr_sarkaz_lodging: "s~K,w~K,s~K",
      earth_discr_sarkaz_lodging_later: "s~K,s~K,w~K",
      earth_discr_iberia_aegir_port: "s~A,s~A,w~A",
      earth_discr_iberia_aegir_return: "s~A,s~A,w~A",
      earth_discr_tara_language: "x~T,i~T,m~T",
      earth_discr_tara_memory: "m~T,m~T,w~T",
      earth_discr_aid_internal_voice: "a~I,c~I,w~I",
      earth_discr_exclusion_redress: "r~I,x~I,w~I",
      family_sibling_infection: "a~I,i~I,a~I,c~I",
      infection_family_disclosure_choice: "s~I,s~I,s~I,s~I,s~I",
      infection_school_disclosure: "s~I,s~I,s~I",
      infection_visible_crystal_question: "s~I,s~I,s~I",
      infection_diagnosis_disclosure_scope: "s~I,s~I,s~I",
      infection_neighborhood_rumor_under_concealment: "s~I,s~I,s~I",
      infection_rumor_public_harassment: "s~I,s~I,w~I",
      infection_low_pressure_routine_service: "s~I,s~I,w~I",
      family_spouse_infected_housing_pressure: "s~I,s~I,s~I",
      life_medical_oripathy: "s~I,s~I,s~I",
      ori_everyday_contact_myth: "x~I,x~I,n,x~I,h~I",
      ori_sarkaz_noncausal: "i~K,s~K,o~K",
      ori_iberia_origin_doubt: "i~A,x~A,s~A",
      inter_sankta_sarkaz_work_v76: "a~K,c~K",
      inter_victoria_taran_speech_v76: "x~T,a~T",
      inter_laterano_sarkaz_opportunity_v76: "s~K,w~K",
      v77_family_rumor: "i~I,o~I,h~I",
      v77_family_solidarity_and_caution: "i~I,x~I,o~I",
      v77_prejudice_infected_workplace: "a~I,s~I,h~I",
      v77_sarkaz_historical_tension: "a~K,i~K,o~K,h~K,x~K",
      v77_social_stigma_family: "a~I,w~I,h~I",
      v77_bystander_response: "x~I,a~I,o~I",
      v78_hardline_infected_neighbor: "h~I,h~I,w~I",
      v78_hardline_sarkaz_employer: "h~K,w~K",
      v78_prejudice_to_patient: "r~I,r~I,s~I",
      v78_parent_rejection_diagnosis: "s~I,s~I,w~I",
      v87_family_contact_boundary_diagnosis: "i~I,i~I,w~I",
      v78_family_breach_recovery: "s~I,s~I,s~I,s~I,w~I",
      v78_mutual_aid_conflict: "x~I,a~I,w~I",
      v78_ideology_recruitment: "h~I,h~I,x~I",
      v78_opponent_cost: "x~I,a~I,w~I",
      v78_discriminated_victim_grief: "s~I,a~I,w~I",
      v78_sarkaz_self_protection: "s~K,w~K",
      v78_taran_office_language: "s~T,s~T,w~T",
      car: "d,d,d,d,d,d,d,d,d,d,d,d,d,d,d,f,d,d,d,d,d,w,p",
      race_identity: "i,r",
      sie_volcano: "s,s,s",
      discrimination_after: "p,s,f",
      discrimination_work_after: "p,s,f",
      family_parent_crystal_dust: "c,p,c,c",
      family_child_crystal_exposure: "s,s,c",
      family_child_exposure_followup: "s,s,s",
      family_marital_strain: "s,s,w",
      family_spouse_death: "s,s,s,p",
      infection_mine_crystal_contact: "c,d",
      infection_terror_crystal_shrapnel: "a,s",
      life_local_mutual_aid: "d,a,w",
      life_rhodes_referral: "s,i,w",
      life_rhodes_referral_response: "s,s,f",
      life_reunion_reorg_review: "a~I,c~I,w~I",
      life_reunion_reorg_tension: "p~I,c~I,w~I",
      life_reunion_reorg_crisis_review: "p~I,w~I,w~I",
      life_reunion_reorg_exit_legacy: "i~I,w~I,i~I",
      life_reunion_londinium_local_aid: "a~I,a~I,w~I",
      earth_discr_work_gate: "p,s,s",
      earth_discr_work_follow: "p,s,i",
      earth_discr_work_years: "p,s,s",
      earth_discr_housing_review: "p,s,s",
      earth_discr_housing_record_after: "a,a,w",
      earth_discr_family_identity: "r,w,s",
      earth_discr_family_identity_later: "i,w,i",
      earth_discr_relief_queue: "p,a,w",
      earth_discr_relief_follow: "p,m,i",
      romance_followup: "s,s,w",
      romance_future_talk: "s,f,w",
      romance_marriage_choice: "s,s,s,f,w",
      romance_cohabitation_review: "s,s,w",
      family_sibling_exposure: "s,p,s",
      family_sibling_exposure_followup: "s,s,s",
      infection_regional_housing_pressure: "p,s,s",
      family_child_bereavement: "s,s,s",
      family_spouse_separate_life: "s,s,s,s,s,w",
      life_violence_threat_safety: "s,p,s",
      life_harassment_threat_escalation: "s,p",
      life_harassment_threat_resolution: "s,p",
      ori_transport_dust: "c,c,p",
      ori_diagnosis_decision: "s,s,s,s",
      ori_diagnosed_workplace: "s,c,s",
      ori_ursus_mine_request: "p,s,s",
      sr_rhodes_hiring_review: "d,d,d,d,d,d,w",
      sr_rhodes_promotion_review: "p,d,s,w",
      sr_rhodes_cafeteria_flavors: "s,s,s",
      sr_rhodes_greenhouse_rest: "s,a,r",
      sr_rhodes_internal_bias_conflict: "h,o,i",
      sr_rhodes_bias_rescue_reconciliation: "a,m,r",
      sr_intersect_battlefield_mercy: "a,w,r",
      sr_intersect_hostage_sympathy: "m,p,h",
      sr_rhodes_to_reunion_turning_point: "d,s",
      sr_reunion_to_rhodes_sanctuary: "s,w",
      sr_reunion_turncoat_rehabilitation: "d,d,w",
      sr_bsw_recruitment_assessment: "d,w",
      sr_bsw_convoy_protection: "p,a,c",
      sr_bsw_promotion_tactical: "p,w",
      sr_bsw_vip_escort_ambush: "p,s,c",
      sr_bsw_rhodes_secondment: "d,w",
      sr_bsw_davistown_debt_conflict: "p,x,m",
      sr_bsw_infected_squad_policy: "p,s,d",
      sr_rhine_recruitment_exam: "d,w",
      sr_rhine_section_assignment: "d,d,d,d",
      sr_rhine_patent_breakthrough: "p,a,m",
      sr_rhine_promotion_chief: "p,w",
      sr_rhine_diabolic_ethical_crossroad: "x,h,a",
      sr_rhine_rhodes_asylum: "d,w",
      sr_rhine_359_transmitter_consent: "x,p,a",
      sr_rhine_lone_trail_sky_horizon: "r,p,a",
      sr_reunion_neighbour_contact: "a~I,i~I,w~I",
      sr_reunion_ordinary_followup: "a~I,a~I,w~I",
      cl_victoria_service_household: "p,i,w",
      cl_tara_language_gate: "a~T,x~T,w~T",
      cl_social_mobility_reflection: "a,s,i",
      inter_laterano_resident_sarkaz_review_v76: "p~K,s~K",
      inter_prior_contact_followup_v76: "p,w",
      v77_child_informal_study: "d,d,w",
      v77_written_application: "p,i,w",
      v77_exclusion_review: "p,i,f",
      v77_adult_literacy_path: "d,i,w",
      v78_identity_home_language: "d,i,w",
      v78_cultural_affiliation_claim: "r,r,c",
      v78_laterano_documents: "p,s,w",
      v78_id_document_victoria: "p,i,f"
    },
    false
  );

  $define(
    "V79_INTENTS",
    {
      a: "voluntary-aid",
      x: "oppose-exclusion",
      h: "exclusion",
      m: "mediate",
      p: "procedure",
      s: "self-or-family-care",
      w: "withdrawal",
      n: "neutral",
      c: "caution",
      i: "information",
      f: "defer",
      d: "organization-participation",
      o: "observe",
      r: "reflection"
    },
    false
  );

  $define("V79_TARGETS", { I: "infected", K: "sarkaz", T: "taran", A: "aegir" }, false);

  $define("V79_REVIEWED_EVENTS", 0, true);
  $define("V79_REVIEWED_CHOICES", 0, true);

  for (const e of $terraData.EV) {
    if (!e.c) continue;
    const raw = $terraData.V79_CHOICE_MATRIX[e.id],
      tokens = raw?.split(",");
    if (tokens && tokens.length !== e.c.length)
      throw Error("選択意図台帳の選択肢数不一致: " + e.id + " " + tokens.length + "/" + e.c.length);
    if (tokens) $terraData.V79_REVIEWED_EVENTS++;
    for (let i = 0; i < e.c.length; i++) {
      const [abbr, grp] = tokens ? tokens[i].split("~") : [];
      const intent = $terraData.V79_INTENTS[abbr],
        target = $terraData.V79_TARGETS[grp] || null;
      if (tokens && !intent) throw Error("選択意図台帳の分類が不正: " + e.id + " " + i);
      e.c[i].ethics = { intent: intent || "unreviewed", target, reviewed: !!tokens, policyVersion: 79 };
      if (tokens) $terraData.V79_REVIEWED_CHOICES++;
    }
  }

  $define(
    "V81_CHOICE_MATRIX",
    {
      v81_job_silence: "p,s,w",
      v81_housing_account: "p,s,w",
      v81_family_boundary: "s,w,r",
      v81_aftermath_mutualaid: "a,s,w",
      v81_memory_without_penalty: "r,s,i"
    },
    false
  );

  for (const e of $terraData.EV) {
    const line = $terraData.V81_CHOICE_MATRIX[e.id];
    if (!line) continue;
    const tags = line.split(",");
    if (tags.length !== e.c?.length) throw Error("v81分類の不整合: " + e.id);
    tags.forEach(
      (t, i) =>
        (e.c[i].ethics = {
          intent: $terraData.V79_INTENTS[t],
          target: null,
          reviewed: true,
          policyVersion: 81
        })
    );
  }

  $define(
    "V81_MORE_REVIEWED",
    {
      fever: "s,s",
      sch: "s,s,s",
      friend_fight: "a,p,w",
      war: "w,d,w",
      neighbor_move: "a,a,a,w",
      family_launch: "s,s,f,s,i",
      family_separation: "s,s,f",
      fam_child_care: "s,s,s,s,s",
      vic_war: "d,w,w",
      bol_war: "d,w,w",
      lon_housing: "s,w,a,w",
      friend_death_notice: "s,r,s",
      neighbor_death_notice: "a,r,a",
      friend_missing_news: "i,f,i",
      neighbor_missing_news: "i,i,c",
      study_to_work: "p,p,p,w",
      neighbor_followup: "a,w",
      family_divorce_parenting_review: "s,s,w",
      family_sibling_birth: "a,w,r",
      life_ursus_school_aid: "a,w,s",
      life_ursus_school_aid_followup: "i,s,r",
      life_family_remittance: "s,s,f",
      life_parent_visit: "s,s,w",
      life_neighbor_mutual_aid: "a,s,w",
      family_spouse_health_review: "s,s,f",
      family_spouse_unemployment_support: "s,s,s",
      life_medical_respiratory: "s,s,s",
      life_medical_circulation: "s,s",
      life_medical_nerve: "s,s",
      life_medical_occupational: "p,s,i",
      life_medical_injury: "s,s",
      life_medical_nutrition: "s,s",
      life_medical_urgent_review: "s,s,s",
      life_medical_followup: "s,s",
      life_disaster_recovery_care: "s,s",
      life_unexpected_rescue: "p,w",
      ori_work_safety_instruction: "p,p,c",
      ori_work_safety_followup: "p,p,c",
      ori_industrial_scrap: "w,p,w",
      ori_post_catastrophe_ground: "p,p,w",
      ori_school_fragment: "p,p,w",
      ori_followup_access: "s,p,p",
      ori_rhodes_examination_contact: "s,p,f",
      ori_waterway_cleaning: "p,p,w",
      ori_medical_record_followup: "i,p,s",
      ori_protection_after_displacement: "p,w,p",
      ori_prevention_peer_teaching: "p,a,c",
      ori_victoria_factory_shift: "p,p,f",
      ori_columbia_insurance_records: "p,p,s",
      ori_laterano_citizenship_record: "p,s,p",
      ori_rim_mine_inspection: "p,p,p",
      ori_sargon_sandstorm_check: "p,w,i",
      ori_crystal_wound_accident: "w,a,d",
      ori_dust_broken_ppe: "p,p,d",
      cl_child_school_supplies: "s,s,s",
      cl_household_work_entry: "d,s,s",
      cl_ursus_school_divide: "x,p,s"
    },
    false
  );

  $define("V81_SECOND_PASS_CHOICES", 0, true);

  for (const [id, line] of Object.entries($terraData.V81_MORE_REVIEWED)) {
    const e = $terraData.EV.find(e => e.id === id);
    if (!e?.c) throw Error("対象がない: " + id);
    const labels = line.split(",");
    if (labels.length !== e.c.length)
      throw Error("v81手動分類と選択肢数が違う: " + id + " " + labels.length + "/" + e.c.length);
    labels.forEach((tag, i) => {
      if (!$terraData.V79_INTENTS[tag]) throw Error("不正な意図タグ " + tag);
      e.c[i].ethics = {
        intent: $terraData.V79_INTENTS[tag],
        target: null,
        reviewed: true,
        policyVersion: 81
      };
      $terraData.V81_SECOND_PASS_CHOICES++;
    });
  }

  $terraData.SETTING_SOURCES.SRC_V82_CLOSURE = {
    title: "クロージャWiki／クロージャ人物資料",
    kind: "日本語版オペレーター資料参照サイト",
    url: "https://closure.wiki/ja/operators/closure",
    note: "人間関係、出自への葛藤、技術を学ぶ仲間の描写。ウェブの表示言語と公開状況に注意し、個別NPCの反応確率の公式根拠にはしない。"
  };

  $terraData.SETTING_SOURCES.SRC_V82_HUMUS = {
    title: "クロージャWiki／ヒューマス人物資料",
    kind: "日本語版オペレーター資料",
    url: "https://closure.wiki/ja/operators/humus",
    note: "労働環境と人物の習慣・技能、職場以外での関わりがつながる生活描写。"
  };

  $terraData.SETTING_SOURCES.SRC_V82_SUZURAN_MODULE = {
    title: "スズラン・モジュール『子供たち』",
    kind: "日本語版モジュールテキスト",
    url: "https://closure.wiki/ja/modules/uniequip_003_lisa",
    note: "源石危険物と子供の認識、周囲の医療者の対応。危険物への対応と人間への偏見を混同しない。"
  };

  $terraData.SETTING_SOURCES.SRC_V82_TW = {
    title: "ウォルモンドの薄暮 TW-S-1 本文",
    kind: "日本語版ストーリー本文",
    url: "https://shimadouma.github.io/astrhtml/events/act11d0/stories/TW-S-1.html",
    note: "災害後の部外者への疑いと関係回復、感染者避難民の生活条件を異なる社会的経験として扱う。"
  };

  $terraData.SETTING_SOURCES.SRC_V82_SIM = {
    title: "v82個別関係モデル",
    kind: "ゲーム用仮定",
    note: "架空の同僚・学校職員・診療担当者の態度と行動は個別のゲーム用生成結果。人種・種族で人格や能力を固定しない。"
  };

  $terraData.EVENT_FIELD_META.personTieAction = {
    unit: "特定NPCとの接触",
    meaning:
      "施設で既に知っている人物だけに対する、支援・差別・相談・関係修復等を人物IDごとに保存。一般差別から全NPCの友好度を変更しない",
    status: "S",
    valueType: "object"
  };

  $terraData.EVENT_EFFECT_TYPES.object.push("personTieAction");
});
