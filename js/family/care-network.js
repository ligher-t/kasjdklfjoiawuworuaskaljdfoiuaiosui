function makeCare(regionName = null, birthYear = START) {
  const x = wp(CARE_TYPES);
  const networkIncome =
    x.network * (1 - P("care.networkIncomeVariation") / 2 + R() * P("care.networkIncomeVariation"));
  return {
    kind: x.n,
    caregivers: x.caregivers,
    parentShare: x.parentShare,
    networkIncome,
    networkType: x.networkType || null,
    supportNetwork: x.networkType
      ? {
          id: "care-network-1",
          type: x.networkType,
          label: x.networkLabel,
          roles: [...x.networkRoles],
          formalGuardianship: "unconfirmed",
          status: "active",
          contactState: "within_care",
          contactReviewYear: null,
          contactEndedYear: null,
          reconnectInviteYear: null,
          contactHistory: [],
          region: regionName,
          knownRegion: regionName,
          regionKnownYear: regionName ? birthYear : null,
          knownMoveCount: 0,
          moveCount: 0,
          moveHistory: [],
          knownMoveHistory: [],
          pendingMoveNotices: [],
          moveReviewYear: null,
          startedYear: birthYear,
          endedYear: null,
          fundingStatus: "active",
          fundingEndedYear: null,
          contributionHistory: [],
          legacyRepair: []
        }
      : null,
    support: clamp(x.support + (R() - 0.5) * P("care.supportVariation"), 0, 1),
    stability: clamp(0.5 + (R() - 0.5) * P("care.stabilityVariation"), 0, 1)
  };
}
const caregiverWords = care =>
  ({
    "両親と暮らす": { who: "親", arms: "親の腕の中で" },
    "片親と暮らす": { who: "親", arms: "親の腕の中で" },
    "親族の支援を受ける": { who: "親や親族", arms: "親や親族の腕の中で" },
    "後見人・養育者と暮らす": { who: "養育者", arms: "養育者の腕の中で" },
    "氏族・共同体で育つ": { who: "氏族や共同体の世話人", arms: "氏族や共同体の人に抱かれて" },
    "避難・離散した世帯で育つ": { who: "そばにいる親族や世話人", arms: "そばにいる親族や世話人に抱かれて" }
  })[care?.kind] || { who: "家の人", arms: "家の人に抱かれて" };
