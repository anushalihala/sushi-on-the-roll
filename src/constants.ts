interface Dice<T> {
  0: T;
  1: T;
  2: T;
  3: T;
  4: T;
  5: T;
}

enum NigiriFace {
  SALMON,
  EGG,
  SQUID,
}

export const NigiriDice: Dice<NigiriFace> = {
  0: NigiriFace.EGG,
  1: NigiriFace.EGG,
  2: NigiriFace.SALMON,
  3: NigiriFace.SALMON,
  4: NigiriFace.SALMON,
  5: NigiriFace.SQUID,
};

enum PuddingFace {
  ONE,
  TWO,
  THREE,
}

export const PuddingDice: Dice<PuddingFace> = {
  0: PuddingFace.ONE,
  1: PuddingFace.ONE,
  2: PuddingFace.TWO,
  3: PuddingFace.TWO,
  4: PuddingFace.THREE,
  5: PuddingFace.THREE,
};

enum AppetizerFace {
  DUMPLING,
  TEMPURA,
  SASHIMI,
}

export const AppetizerDice: Dice<AppetizerFace> = {
  0: AppetizerFace.DUMPLING,
  1: AppetizerFace.DUMPLING,
  2: AppetizerFace.DUMPLING,
  3: AppetizerFace.TEMPURA,
  4: AppetizerFace.TEMPURA,
  5: AppetizerFace.SASHIMI,
};

enum MakiFace {
  ONE,
  TWO,
  THREE,
}

export const MakiDice: Dice<MakiFace> = {
  0: MakiFace.ONE,
  1: MakiFace.ONE,
  2: MakiFace.TWO,
  3: MakiFace.TWO,
  4: MakiFace.THREE,
  5: MakiFace.THREE,
};

enum SpecialFace {
  WASABI,
  MENUS,
  CHOPSTICK,
  CHOPSTICKS,
}

export const SpecialDice: Dice<SpecialFace> = {
  0: SpecialFace.WASABI,
  1: SpecialFace.WASABI,
  2: SpecialFace.MENUS,
  3: SpecialFace.MENUS,
  4: SpecialFace.CHOPSTICK,
  5: SpecialFace.CHOPSTICKS,
};
