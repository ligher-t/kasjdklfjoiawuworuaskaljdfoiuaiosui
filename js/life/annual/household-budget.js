// js/life/annual/household-budget.js: ordered annual phase; see ANNUAL.md.
function settleAnnualHouseholdBudget(s, services, a) {
  const familyHome = !s.fl?.household_separated &&
    typeof s.residenceArrangement === "string" && s.residenceArrangement.startsWith("family_home_");
  if (a < services.householdEndAge(s) || familyHome) {
    /* 養育者の職業収入・家族規模・地域物価から世帯収支を作り、子どもの医療や教育費も同じ帳簿へ載せる。
       支出は収入割合で打ち切らず、家族構成に応じた必要額を払う。数値は公式統計ではなくモデル仮定。 */
    const house =
      s.house ||
      (s.house = {
        cash: services.EXP[s.w.i] * services.P("birth.initialHouseholdReserveYears"),
        debt: 0,
        inc: 0,
        exp: 0
      });
    // Caregiver income and living costs follow the family ledger, not the
    // adult protagonist's privately held savings.
    const householdReference = services.EXP[2] * s.res.pm * (s.priceIndex || 1) * 1.6;
    const householdYears = householdReference > 0
      ? Math.max(0, (house.cash || 0) - (house.debt || 0)) / householdReference : 0;
    const householdWealthIndex = Math.min(services.EXP.length - 1,
      services.P("economy.wealthClassReserveYears").filter(x => householdYears >= x).length);
    const parents = (s.care.parentKeys || ["fa", "mo"]).map(k => s.par[k]).filter(x => x && !x.d);
    const grossParentIncome = parents.reduce(
        (sum, x) => sum + (services.J[x.j]?.pay || 0) * (x.workShare ?? 1),
        0
      ),
      unemployedParent = s.par?.[s.parentUnemploymentTargetKey],
      lostParentIncome =
        s.fl.parent_unemployed && unemployedParent && !unemployedParent.d
          ? (services.J[unemployedParent.j]?.pay || 0) * (unemployedParent.workShare ?? 1)
          : 0;
    const wageIndex = (1 + (s.priceIndex - 1) * 0.65) * services.localityEarningsMultiplier(s),
      networkIncome = s.care.networkIncome * s.res.pm * wageIndex,
      capitalIncome = [0, 0, 3e5, 2e6, 6e6][householdWealthIndex] * s.res.pm * wageIndex,
      hinc =
        Math.max(0, grossParentIncome - lostParentIncome) * s.care.parentShare * s.res.pm * wageIndex +
        networkIncome +
        capitalIncome;
    // 共有家計を続ける限り、成人後も本人の生活・治療をこの帳簿で負担する。
    // 個人会計を選んだ場合は本人分を家計人数・治療費から外し、本人会計へ載せる。
    const householdCoversProtagonist =
      a < services.P("life.workStartAge") || services.inSharedHousehold(s);
    const petCost = s.pet ? services.petCostBase(s.pet) * s.res.pm : 0,
      schoolCost =
        s.fl.sch && a < services.P("life.schoolEnrollmentEndAge") &&
          !s.educationPath?.offeringId
          ? services.P("economy.schoolMaterialsAnnualCost") * s.res.pm
          : 0,
      tc =
        householdCoversProtagonist && s.inf && s.fl.tx
          ? services.P("economy.treatmentCostBase") *
            s.res.md *
            (1 + services.infectionSocialPressure(s).medical * 0.45) *
            services.infectionCareTravelCostScale(s) *
            (1 +
              (s.ob < services.P("infection.stageOneEnd")
                ? 0
                : s.ob < services.P("infection.stageTwoEnd")
                  ? 1
                  : 2))
          : 0,
      parentTreatmentCost =
        parents.filter(parent => parent.inf && parent.tx).length *
        services.P("economy.parentInfectionTreatmentAnnualCost") *
        s.res.pm *
        (1 + services.infectionSocialPressure(s).medical * 0.3) *
        services.infectionCareTravelCostScale(s),
      siblingCareCost = services.householdSiblingCareExpense(s),
      treatmentTravel = services.infectionCareTravelPortion(tc, s),
      parentTreatmentTravel = services.infectionCareTravelPortion(parentTreatmentCost, s),
      siblingCareTravel = services.infectionCareTravelPortion(siblingCareCost, s);
    const costPm = s.res.pm * s.priceIndex * services.localityLivingMultiplier(s),
      dependents = services.householdDependentSiblings(s).length,
      parentUnits = parents.length > 1 ? 1.5 : 1.0,
      protagonistUnits = householdCoversProtagonist ? (a < 15 ? 0.35 : 0.5) : 0,
      siblingUnits = 0.25 * dependents,
      householdUnits = parentUnits + protagonistUnits + siblingUnits;
    const hex =
      Math.max(
        services.P("economy.minimumExpenseBase") * costPm,
        services.EXP[householdWealthIndex] * costPm * householdUnits
      ) +
      petCost * s.priceIndex +
      schoolCost * s.priceIndex +
      tc * s.priceIndex +
      parentTreatmentCost * s.priceIndex +
      siblingCareCost * s.priceIndex;
    if(typeof updateLoanContractStatuses==="function")updateLoanContractStatuses(s);
    // Shared household reserves are available for the actual family shortfall.
    // Transfer only the amount needed; do not silently confiscate a wage earner's savings.
    const reserveContribution = services.inSharedHousehold(s) && a >= services.P("life.workStartAge")
      ? Math.min(Math.max(0, s.cash || 0), Math.max(0, hex - hinc - (house.cash || 0)))
      : 0;
    if (reserveContribution > 0) {
      s.cash -= reserveContribution;
      house.cash += reserveContribution;
    }
    const hnet = hinc - hex;
    if (hnet >= 0) {
      const contractPaid=typeof settleContractDebt==="function" ? settleContractDebt(s,"household",hnet) : 0,
        remaining=hnet-contractPaid,
        pay=Math.min(Math.max(0,(house.debt||0)-loanContractOutstanding(s,"household")),remaining);
      house.debt-=pay;
      house.cash+=remaining-pay;
    } else {
      house.cash += hnet;
      if (house.cash < 0) {
        house.debt -= house.cash;
        house.cash = 0;
      }
    }
    if(typeof accrueUncontractedDebtInterest==="function")
      accrueUncontractedDebtInterest(s,"household",services.P("economy.debtInterest"));
    else house.debt *= 1 + services.P("economy.debtInterest");
    const educationTuition=educationAnnualOutflow(s,s.year,"household");
    house.inc = hinc + reserveContribution;
    house.exp = hex + educationTuition;
    house.flow = {
      year: s.year,
      income: {
        caregivers:
          Math.max(0, grossParentIncome - lostParentIncome) * s.care.parentShare * s.res.pm * wageIndex,
        network: networkIncome,
        capital: capitalIncome,
        ...(reserveContribution > 0 ? { protagonistReserve: reserveContribution } : {})
      },
      expense: {
        living: Math.max(
          services.P("economy.minimumExpenseBase") * costPm,
          services.EXP[householdWealthIndex] * costPm * householdUnits
        ),
        pet: petCost * s.priceIndex,
        school: schoolCost * s.priceIndex + educationTuition,
        treatment: (tc - treatmentTravel) * s.priceIndex,
        parentTreatment: (parentTreatmentCost - parentTreatmentTravel) * s.priceIndex,
        siblingCare: (siblingCareCost - siblingCareTravel) * s.priceIndex,
        medicalTravel: (treatmentTravel + parentTreatmentTravel + siblingCareTravel) * s.priceIndex
      },
      net: hnet + reserveContribution - educationTuition
    };
    const network = s.care.supportNetwork;
    if (network && network.status === "active") {
      network.contributionHistory || (network.contributionHistory = []);
      network.contributionHistory.push({
        year: s.year,
        amount: networkIncome,
        region: s.res.n,
        priceIndex: s.priceIndex
      });
      network.contributionHistory = network.contributionHistory.slice(-16);
    }
    if (tc && house.debt > services.P("economy.treatmentStopDebtMultiple") * tc && house.cash < tc) {
      s.fl.tx = 0;
      services.L('<span class="bad">家計の負債が膨らみ、家族の治療を続けられなくなった。</span>');
    }
    if (
      parentTreatmentCost &&
      house.debt > services.P("economy.treatmentStopDebtMultiple") * parentTreatmentCost &&
      house.cash < parentTreatmentCost
    ) {
      const parent = parents.find(x => x.inf && x.tx);
      if (parent) {
        services.setParentTreatment(s, parent, 0, "養育家計の療養費を払えない");
        services.L(
          `<span class="bad">家計の支払いが重なり、${services.esc(parent.nm)}の継続療養をいったん中断した。</span>`
        );
      }
    }
    if (siblingCareCost) services.lapseUnaffordableSiblingTreatment(s, siblingCareCost);
    // 成年・自立年齢への移行時の資金引き継ぎ（世帯貯蓄に余力がある場合、本人口座へ独立支度金を分与）
    if (a <= Math.max(18, services.householdEndAge(s)) &&
        (a >= 18 || a >= services.householdEndAge(s) - 1) &&
        !s.familyLaunchTransferred && (house.cash || 0) > 0 && (house.debt || 0) <= 0) {
      const share = [0, 0.1, 0.2, 0.25, 0.3][householdWealthIndex] || 0.2;
      const transferAmount = Math.floor(house.cash * share);
      if (transferAmount > 0) {
        house.cash -= transferAmount;
        s.cash = (s.cash || 0) + transferAmount;
        s.familyLaunchTransferred = true;
        services.L(`<span class="good">自立の節目を迎え、実家の蓄えから門出の支度金として${services.m(transferAmount)}を渡された。</span>`);
        if (s.moneyLog) {
          s.moneyLog.push({
            year: s.year,
            label: "実家からの自立支度金",
            assetsDelta: transferAmount,
            debtDelta: 0,
            investmentDelta: 0
          });
        }
      }
    }
  } else if (s.fl.parent_unemployed) {
    s.fl.parent_unemployed = 0;
    s.parentUnemploymentTargetKey = null;
  }
  const careFunding = s.care?.supportNetwork;
  if (careFunding && careFunding.fundingStatus === "active" && a >= services.householdEndAge(s)) {
    careFunding.fundingStatus = "ended";
    careFunding.fundingEndedYear = s.year;
    services.endCareNetworkPeopleRoles(careFunding, s.year);
  }
}
