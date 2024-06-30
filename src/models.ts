export enum GameStatus {
  CREATED,
  STARTED,
  FINISHED,
  ABORTED,
}

export interface GameData {
  status: GameStatus;
  playerCount: number;
}

export interface PlayerData {
  playerName: string;
  playerId: string;
  startGame: boolean;
  leader: boolean;
  conveyorBelt: DiceDoc[];
  tray: DiceDoc[];
}

type DiceValues = 0 | 1 | 2 | 3 | 4 | 5;

export interface DiceDoc {
  diceValue: DiceValues;
  diceFace: number;
  diceType: string;
  id: string;
}

export class Dice {
  static 0: number;
  static 1: number;
  static 2: number;
  static 3: number;
  static 4: number;
  static 5: number;
  value!: DiceValues;
  face!: number;
  id: string;

  constructor() {
    this.id = Math.random().toString(36).slice(2, 9);
    this.diceRoll();
  }

  diceRoll() {
    this.value = Math.floor(Math.random() * 6) as DiceValues;
    this.face = (this.constructor as typeof Dice)[this.value] as number;
  }

  getDiceType(): string {
    return this.constructor.name.slice(1);
  }
}

enum NigiriFace {
  SALMON,
  EGG,
  SQUID,
}

export class NigiriDice extends Dice {
  static override 0 = NigiriFace.EGG;
  static override 1 = NigiriFace.EGG;
  static override 2 = NigiriFace.SALMON;
  static override 3 = NigiriFace.SALMON;
  static override 4 = NigiriFace.SALMON;
  static override 5 = NigiriFace.SQUID;
  static myEnum = NigiriFace;
}

enum PuddingFace {
  ONE,
  TWO,
  THREE,
}

export class PuddingDice extends Dice {
  static override 0 = PuddingFace.ONE;
  static override 1 = PuddingFace.ONE;
  static override 2 = PuddingFace.TWO;
  static override 3 = PuddingFace.TWO;
  static override 4 = PuddingFace.THREE;
  static override 5 = PuddingFace.THREE;
  static myEnum = PuddingFace;
}

enum AppetizerFace {
  DUMPLING,
  TEMPURA,
  SASHIMI,
}

export class AppetizerDice extends Dice {
  static override 0 = AppetizerFace.DUMPLING;
  static override 1 = AppetizerFace.DUMPLING;
  static override 2 = AppetizerFace.DUMPLING;
  static override 3 = AppetizerFace.TEMPURA;
  static override 4 = AppetizerFace.TEMPURA;
  static override 5 = AppetizerFace.SASHIMI;
  static myEnum = AppetizerFace;
}

enum MakiFace {
  ONE,
  TWO,
  THREE,
}

export class MakiDice extends Dice {
  static override 0 = MakiFace.ONE;
  static override 1 = MakiFace.ONE;
  static override 2 = MakiFace.TWO;
  static override 3 = MakiFace.TWO;
  static override 4 = MakiFace.THREE;
  static override 5 = MakiFace.THREE;
  static myEnum = MakiFace;
}

enum SpecialFace {
  WASABI,
  MENUS,
  CHOPSTICK,
  CHOPSTICKS,
}

export class SpecialDice extends Dice {
  static override 0 = SpecialFace.WASABI;
  static override 1 = SpecialFace.WASABI;
  static override 2 = SpecialFace.MENUS;
  static override 3 = SpecialFace.MENUS;
  static override 4 = SpecialFace.CHOPSTICK;
  static override 5 = SpecialFace.CHOPSTICKS;
  static myEnum = SpecialFace;
}

export class BagOfDice {
  private dices: Dice[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.dices.push(new AppetizerDice());
    }
    for (let i = 0; i < 6; i++) {
      this.dices.push(new MakiDice());
    }
    for (let i = 0; i < 5; i++) {
      this.dices.push(new NigiriDice());
    }
    for (let i = 0; i < 5; i++) {
      this.dices.push(new SpecialDice());
    }
    for (let i = 0; i < 4; i++) {
      this.dices.push(new PuddingDice());
    }
  }

  takeDice() {
    const index = Math.floor(Math.random() * this.dices.length);
    return this.dices.splice(index, 1)[0];
  }
}
