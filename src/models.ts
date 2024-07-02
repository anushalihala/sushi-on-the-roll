export enum SpecialState {
  NONE,
  REROLL,
  SWAP,
}

export enum GameStatus {
  CREATED,
  STARTED,
  FINISHED,
  ABORTED,
}

export interface GameData {
  status: GameStatus;
  playerCount: number;
  round: number;
  winner: string | undefined;
}

export interface PlayerData {
  playerName: string;
  playerId: string;
  startGame: boolean;
  roundStarter: boolean;
  myTurn: boolean;
  conveyorBelt: DiceDoc[];
  tray: DiceDoc[];
  chopsticks: number;
  menus: number;
  freeWasabis: number;
  pudding: number;
  points: number;
  maki: number;
}

type DiceValues = 0 | 1 | 2 | 3 | 4 | 5;

export interface DiceDoc {
  diceValue: DiceValues;
  diceFace: number;
  diceType: string;
  id: string;
  selected?: boolean;
}

export interface DiceDocPartial {
  diceValue?: DiceValues;
  diceFace?: number;
  selected?: boolean;
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

  static newDice(diceType: string) {
    const id = Math.random().toString(36).slice(2, 9);
    return Dice.rollDice({ diceType, id, selected: false });
  }

  static rollDice(doc: DiceDocPartial): DiceDoc {
    const value = Math.floor(Math.random() * 6) as DiceValues;
    const cls = eval(doc.diceType);
    const face = cls[value];
    return {
      ...doc,
      diceValue: value,
      diceFace: face,
    };
  }

  getDiceType(): string {
    return this.constructor.name.slice(1);
  }
}

enum NigiriFace {
  EGG = 1,
  SALMON = 2,
  SQUID = 3,
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
  ONE = 1,
  TWO = 2,
  THREE = 3,
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

export enum AppetizerFace {
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
  ONE = 1,
  TWO = 2,
  THREE = 3,
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

export enum SpecialFace {
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
  private diceDocs: DiceDoc[] = [];

  constructor() {
    for (let i = 0; i < 10; i++) {
      this.diceDocs.push(Dice.newDice('AppetizerDice'));
    }
    for (let i = 0; i < 6; i++) {
      this.diceDocs.push(Dice.newDice('MakiDice'));
    }
    for (let i = 0; i < 5; i++) {
      this.diceDocs.push(Dice.newDice('NigiriDice'));
    }
    for (let i = 0; i < 5; i++) {
      this.diceDocs.push(Dice.newDice('SpecialDice'));
    }
    for (let i = 0; i < 4; i++) {
      this.diceDocs.push(Dice.newDice('PuddingDice'));
    }
  }

  takeDice() {
    const index = Math.floor(Math.random() * this.diceDocs.length);
    return this.diceDocs.splice(index, 1)[0];
  }
}
