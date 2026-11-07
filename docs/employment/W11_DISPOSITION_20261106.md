# W11 employment concept and prose draft dispositions

Date: 2026-11-06. This records whether the 36 concepts and 10 full-text drafts
should become new runtime events in the current employment integration. It is
not a claim that every B/C/D event has received human semantic or prose
approval. The W11 queue remains an inventory; the runtime employment review
covers all 330 entries with explicit job/livelihood context and runtime W12
sources, while the other 532 entries remain contextual candidates without an
established employment dependency.

No new event prose was added or edited in this pass. Proposed prose below is
not approved for play. Existing behavior is referenced only to prevent a
duplicate route or to identify why the proposed trigger currently has no
supported runtime state.

## 36 concept decisions

| Concept | Decision | Basis |
|---|---|---|
| `work_area_without_hiring_site` | Use existing job search state | A missing opening is represented by vacancy discovery; a separate scene would duplicate the search entry. |
| `work_notice_still_open` | Use opening/work-case state | Current opening status and player knowledge own whether a notice is live. |
| `work_job_offer_wrong_site` | Use site-linked admission | An organization name cannot create a site or opening; the existing admission boundary rejects it. |
| `work_reference_from_old_colleague` | Do not add | No sourced referral person or recorded referral relationship exists to trigger this scene. |
| `work_interview_trip_cancel` | Do not add | The employment model has no specific cancelled-trip record for this proposed route. |
| `work_credential_from_apprentice` | Keep skills separate from credentials | Recorded practice may support an application; it does not grant a formal credential without an awarding authority. |
| `work_qualified_no_vacancy` | Use opening/work-case state | Qualification and vacancy are independent checks already represented by the application flow. |
| `work_first_day_clock` | Use employment episode start | Acceptance creates the dated work episode; a separate attendance calendar is not modeled. |
| `work_shift_swap_for_care` | Retain existing family-schedule route | The current schedule review remains the route; no additional event is needed without a shift-roster state. |
| `work_timecard_missing` | Use wage claims | The finance ledger records due, paid, and unpaid wages by employment episode. |
| `work_pay_delayed_market` | Use wage claims and existing dispute scenes | Delay belongs to the episode payment ledger; a new generic dispute scene would repeat existing employer-conflict routes. |
| `work_factory_machine_guard` | Use worksite incident state | Existing technical-safety events and site incident effects own the hazard and its resolution. |
| `work_foreman_help_during_fault` | Use work-project setback | The existing project setback route handles a known work problem without inventing a second general workplace event. |
| `work_contract_housing_ends` | Do not add | Employer-provided housing is not represented as a contract state, so a closure result would be invented. |
| `work_craft_supplier_broke` | Do not add | Self-employment has no supplier/inventory transaction state to support this result. |
| `work_self_shop_first_customer` | Do not add | A customer and stock-sale transaction are not recorded; no sale or profit should be implied. |
| `work_family_field_in_kind` | Do not add | No harvest or crop-allocation record exists. Existing meal and winter-support ledgers stay tied to their actual roles. |
| `work_sami_winter_food_share` | Already implemented | The seasonal community allocation records four service months, the receiving wallet, and a one-time allocation. |
| `work_sargon_caravan_return` | Use completed-gig accounting | A completed contract has a one-time receipt; it does not create continuing employment. |
| `work_kazdel_forge_request` | Do not add | The proposed repair lacks a recorded forge, material, and accepted commission in the runtime world. |
| `work_rim_mine_evac_shift` | Use mine/site incident path | Existing mine outcomes connect the local hazard to the active work period. |
| `work_urs_ore_worker_coercion` | Use coercive-assignment path | The reviewed mine assignment route records coercion and its distinct exit conditions. |
| `work_lungmen_courier_small_job` | Use transporter gig path | Existing route contracts record the accepted delivery and one-time result. |
| `work_kaz_newsroom_missing_print` | Do not add | No named newsroom, paper supply, or print-run state is established for this trigger. |
| `work_kazimierz_sponsor_breach` | Use sponsor-contract path | Existing competition-career events own sponsor terms and consequences. |
| `work_bsw_quiet_office_training` | Keep training separate from military qualification | Current BSW recruitment/training records do not authorize a new military credential or a second hiring path. |
| `work_rhine_lab_safety_minutes` | Use Rhine worksite incident path | Existing Rhine events bind access and incidents to the actual assignment and site. |
| `work_karlan_rail_station_work` | Use dated railway/appointment path | Existing Kjerag hiring is tied to the railway opening period and actual appointment site. |
| `work_siesta_relocated_job` | Use site operation and new-opening transition | Closure/relocation is recorded per site; a destination job still requires a separate opening. |
| `work_iberia_decommissioned_dock` | Use site closure and employment exit | The closed dock cannot be reopened by prose; only a separately supported site can employ the former worker. |
| `work_laterano_duty_elsewhere` | Use appointment-only employment | A posting requires an actual appointment event and destination; regional transfer is not inferred from the job title. |
| `work_victoria_rail_repair_postwar` | Use postwar repair/hiring route | Existing Victoria career routes own the dated work opportunity; repair demand is not generalized to every rail site. |
| `work_education_teacher_contract` | Use school/teacher employment state | School operation and teacher role remain distinct; the proposal adds no supported school contract transition. |
| `work_elder_light_task_offer` | Use elder re-entry search | The existing re-entry route can present an actual local opening or gig without inventing a former-workshop offer. |
| `work_infected_rejected_hearsay` | Use workplace-scoped disclosure records | A rejection does not establish that the employer knew a diagnosis; disclosure remains attached to the receiving site. |
| `work_household_income_from_spouse` | Use dependent employment and household finance | A spouse's actual episode/site closure changes that person's income; it does not alter the protagonist's employer. |

## 10 full-text drafts

| Draft | Decision | Existing boundary or missing state |
|---|---|---|
| `work_w11_notice_corner` | Do not add | The real opening and work-case flow already owns notice knowledge, verification, and application. |
| `work_w11_worn_rule` | Do not add | Fold into the existing work-project setback route when its actual site and task are known. |
| `work_w11_pay_envelope` | Do not add | Use wage claims, settlement, and the existing dispute routes; do not create another generic payroll rule. |
| `work_w11_route_rope` | Do not add | The current gig route lacks a separate delivery-progress record for this scene. |
| `work_w11_stall_leftovers` | Do not add | No inventory, daily sales, or spoilage ledger supports the stated choices. |
| `work_w11_gate_closed` | Do not add | Site operation history and the active episode own closure; the player's next job still requires a new opening. |
| `work_w11_apprentice_pencil` | Do not add | Practice may update a skill; it must not create formal literacy certification. |
| `work_w11_rest_day` | Do not add | There is no dated shift/leave calendar to establish that this is a real day off. |
| `work_w11_medical_schedule` | Do not add | A shift roster and appointment-overlap record are absent; no employer diagnosis knowledge may be inferred. |
| `work_w11_community_bowl` | Do not add | Existing meal and seasonal in-kind records already cover accepted support without adding a second allocation. |

The decisions above close the current add/merge/defer choice for these proposals.
They do not assert that the drafts' player-facing prose has been implemented,
or that all contextual W11/W12 prose has passed editorial review.
