import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QuerySnapshot,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-config.json';
import {
  AppetizerFace,
  BagOfDice,
  Dice,
  DiceDoc,
  GameData,
  GameStatus,
  PlayerData,
  SpecialFace,
} from './models';

const playerStarterData = {
  startGame: false,
  chopsticks: 2,
  menus: 3,
  freeWasabis: 0,
  pudding: 0,
  points: 0,
  maki: 0,
};

const MAX_ROUNDS = 3;

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private db: Firestore;
  private game: DocumentReference | null;
  private player: DocumentReference | null;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.game = null;
    this.player = null;
  }

  async createGame(playerName: string) {
    const newGameRef = doc(collection(this.db, 'games'));
    await setDoc(newGameRef, {
      status: GameStatus.CREATED,
      playerCount: 1,
      round: 1,
    });
    const newPlayerRef = doc(
      collection(this.db, 'games', newGameRef.id, 'players')
    );
    await setDoc(newPlayerRef, {
      ...playerStarterData,
      playerName,
      playerId: newPlayerRef.id,
      roundStarter: true,
      myTurn: true,
    });
    this.game = newGameRef;
    this.player = newPlayerRef;
    this.saveToLocalStorage(newPlayerRef.id, newGameRef.id);
    return true;
  }

  async joinGame(playerName: string, gameId: string) {
    const gameRef = doc(this.db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) {
      return 'Game does not exist';
    } else if (gameDoc.data()['status'] == GameStatus.STARTED) {
      return 'Game has already started';
    } else if (gameDoc.data()['status'] == GameStatus.FINISHED) {
      return 'Game has already finished';
    } else if (gameDoc.data()['playerCount'] >= 5) {
      return 'Game is full';
    }
    const newPlayerRef = doc(collection(this.db, 'games', gameId, 'players'));
    await setDoc(newPlayerRef, {
      ...playerStarterData,
      playerName,
      playerId: newPlayerRef.id,
      roundStarter: false,
      myTurn: false,
    });
    await updateDoc(gameRef, { playerCount: increment(1) });
    this.game = gameRef;
    this.player = newPlayerRef;
    this.saveToLocalStorage(newPlayerRef.id, gameRef.id);
    return true;
  }

  saveToLocalStorage(playerId: string, gameId: string) {
    let localStorageObj: null | object | string =
      localStorage.getItem('sushi-on-the-roll');
    if (localStorageObj == null) {
      localStorageObj = {};
    } else {
      localStorageObj = JSON.parse(localStorageObj as string);
    }
    localStorage.setItem(
      'sushi-on-the-roll',
      JSON.stringify({ ...(localStorageObj as object), [gameId]: playerId })
    );
  }

  initializeFromLocalStorage(gameId: string) {
    let localStorageObj: null | object | string =
      localStorage.getItem('sushi-on-the-roll');
    if (localStorageObj == null) {
      return 'You have not joined any games';
    }
    localStorageObj = JSON.parse(localStorageObj as string) as object;
    const playerId = localStorageObj[gameId as keyof typeof localStorageObj];
    if (playerId == null) {
      return 'You have not joined this particular game';
    }
    this.game = doc(this.db, 'games', gameId);
    this.player = doc(this.db, 'games', gameId, 'players', playerId);
    return true;
  }

  trackGame(handler: (snapshot: DocumentSnapshot) => void) {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    return onSnapshot(this.game, handler);
  }

  trackGamePlayers(handler: (snapshot: QuerySnapshot) => void) {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    return onSnapshot(collection(this.game, 'players'), handler);
  }

  getGameId(): string {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    return this.game.id;
  }
  getPlayerId(): string {
    if (this.game == null || this.player == null) {
      throw Error('User has not joined a game');
    }
    return this.player.id;
  }

  isGameNull() {
    return this.game == null;
  }

  async startGameForPlayer() {
    if (this.game == null || this.player == null) {
      throw Error('User has not joined a game');
    }
    const gameDoc = await getDoc(this.game);
    if (gameDoc.data()?.['playerCount'] < 2) {
      return 'Not enough players. Minimum 2 players are required.';
    }
    await updateDoc(this.player, { startGame: true });
    await this.startGameGlobal();
    return true;
  }

  private async startGameGlobal() {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }

    const docsSnapshot = await getDocs(collection(this.game, 'players'));
    let allTrue = true;
    docsSnapshot.forEach((doc) => {
      if (!doc.data()['startGame']) allTrue = false;
    });

    if (allTrue) {
      await updateDoc(this.game, { status: GameStatus.STARTED });
      await this.assignDice();
    }
  }

  private async assignDice() {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    const docsSnapshot = await getDocs(collection(this.game, 'players'));
    const bag = new BagOfDice();
    const USER_TO_DICE_COUNT = { 2: 8, 3: 7, 4: 6, 5: 5 };
    const userCount = docsSnapshot.size;
    const diceCount =
      USER_TO_DICE_COUNT[userCount as keyof typeof USER_TO_DICE_COUNT];

    docsSnapshot.forEach(async (currDoc) => {
      const currPlayerRef = doc(
        this.game as DocumentReference,
        'players',
        currDoc.id
      );
      const diceCollection: DiceDoc[] = [];
      for (let i = 0; i < diceCount; i++) {
        const newDice = bag.takeDice();
        diceCollection.push(newDice);
      }
      await updateDoc(currPlayerRef, {
        conveyorBelt: diceCollection,
        tray: [],
      });
    });
  }

  private async updatePoints(diceDoc: DiceDoc) {
    if (this.game == null || this.player == null) {
      throw Error('User has not joined a game');
    }
    const playerDoc: PlayerData = (
      await getDoc(this.player)
    ).data() as unknown as PlayerData;
    if (diceDoc.diceType == 'NigiriDice') {
      let multiplier = playerDoc.freeWasabis > 0 ? 3 : 1;
      await updateDoc(this.player, {
        points: increment(multiplier * diceDoc.diceFace),
        freeWasabis:
          playerDoc.freeWasabis > 0
            ? playerDoc.freeWasabis - 1
            : playerDoc.freeWasabis,
      });
    } else if (diceDoc.diceType == 'PuddingDice') {
      await updateDoc(this.player, {
        pudding: increment(diceDoc.diceFace),
      });
    } else if (diceDoc.diceType == 'AppetizerDice') {
      const count = playerDoc.tray.filter(
        (d) => d.diceType == 'AppetizerDice' && d.diceFace == diceDoc.diceFace
      ).length;
      const pointMap = {
        [AppetizerFace.DUMPLING]: [0, 2, 2, 4, 0, 0, 0, 0, 0],
        [AppetizerFace.TEMPURA]: [0, 1, 4, 5, 0, 0, 0, 0, 0],
        [AppetizerFace.SASHIMI]: [0, 0, 6, 7, 0, 0, 0, 0, 0],
      };
      await updateDoc(this.player, {
        points: increment(
          pointMap[diceDoc.diceFace as keyof typeof pointMap][count]
        ),
      });
    } else if (diceDoc.diceType == 'MakiDice') {
      await updateDoc(this.player, {
        maki: increment(diceDoc.diceFace),
      });
    } else if (diceDoc.diceType == 'SpecialDice') {
      if (diceDoc.diceFace == SpecialFace.WASABI) {
        await updateDoc(this.player, {
          freeWasabis: increment(1),
        });
      } else if (diceDoc.diceFace == SpecialFace.MENUS) {
        await updateDoc(this.player, {
          menus: increment(2),
        });
      } else if (diceDoc.diceFace == SpecialFace.CHOPSTICK) {
        await updateDoc(this.player, {
          chopsticks: increment(1),
        });
      } else if (diceDoc.diceFace == SpecialFace.CHOPSTICKS) {
        await updateDoc(this.player, {
          chopsticks: increment(2),
        });
      }
    }
  }

  async pickDice(diceDoc: DiceDoc) {
    if (this.game == null || this.player == null) {
      throw Error('User has not joined a game');
    }
    await updateDoc(this.player, {
      conveyorBelt: arrayRemove(diceDoc),
      tray: arrayUnion(diceDoc),
      myTurn: false,
    });
    await this.updatePoints(diceDoc);

    const docsSnapshot = await getDocs(collection(this.game, 'players'));
    const myIndex = docsSnapshot.docs.findIndex(
      (doc) => doc.id === this.player?.id
    );
    if (
      docsSnapshot.docs[(myIndex + 1) % docsSnapshot.size].data()[
        'roundStarter'
      ]
    ) {
      await this.lastTurn();
    } else {
      await updateDoc(
        doc(
          this.game,
          'players',
          docsSnapshot.docs[(myIndex + 1) % docsSnapshot.size].id
        ),
        {
          myTurn: true,
        }
      );
    }

    const gameDoc: GameData = (
      await getDoc(this.game)
    ).data() as unknown as GameData;
    if (
      docsSnapshot.docs.every((doc) => doc.data()['conveyorBelt'].length == 0)
    ) {
      await this.nextRound();
      if (gameDoc.round >= MAX_ROUNDS) {
        await this.endGame();
      }
    }
  }

  private async lastTurn() {
    const reRollConveyorBelt = (diceDocs: DiceDoc[]) => {
      return diceDocs.map((d) => Dice.rollDice(d));
    };

    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    const docsSnapshot = await getDocs(collection(this.game, 'players'));
    const lastConveyorBelt =
      docsSnapshot.docs[docsSnapshot.size - 1].data()['conveyorBelt'];
    const lastRoundStarter =
      docsSnapshot.docs[docsSnapshot.size - 1].data()['roundStarter'];
    for (let i = 1; i < docsSnapshot.size; i++) {
      const currPlayerRef = doc(
        this.game as DocumentReference,
        'players',
        docsSnapshot.docs[i].id
      );
      await updateDoc(currPlayerRef, {
        conveyorBelt: reRollConveyorBelt(
          docsSnapshot.docs[i - 1].data()['conveyorBelt']
        ),
        roundStarter: docsSnapshot.docs[i - 1].data()['roundStarter'],
        myTurn: docsSnapshot.docs[i - 1].data()['roundStarter'],
      });
    }
    await updateDoc(
      doc(this.game as DocumentReference, 'players', docsSnapshot.docs[0].id),
      {
        conveyorBelt: reRollConveyorBelt(lastConveyorBelt),
        roundStarter: lastRoundStarter,
        myTurn: lastRoundStarter,
      }
    );
  }

  async nextRound() {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    await this.assignDice();
    await updateDoc(this.game, { round: increment(1) });
    const sortedMaki = (
      await getDocs(collection(this.game, 'players'))
    ).docs.sort((d1, d2) => d2.data()['maki'] - d1.data()['maki']);
    await updateDoc(doc(this.game, 'players', sortedMaki[0].id), {
      points: increment(6),
    });
    await updateDoc(doc(this.game, 'players', sortedMaki[1].id), {
      points: increment(3),
    });
  }

  async endGame() {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    const sortedPudding = (
      await getDocs(collection(this.game, 'players'))
    ).docs.sort((d1, d2) => d1.data()['pudding'] - d2.data()['pudding']);
    await updateDoc(doc(this.game, 'players', sortedPudding[0].id), {
      points: increment(-6),
    });
    await updateDoc(
      doc(this.game, 'players', sortedPudding[sortedPudding.length - 1].id),
      { points: increment(6) }
    );
    (await getDocs(collection(this.game, 'players'))).forEach(
      async (playerDoc) => {
        if (this.game == null) {
          throw Error('User has not joined a game');
        }
        await updateDoc(doc(this.game, 'players', playerDoc.id), {
          points: increment(
            (playerDoc.data()['menus'] + playerDoc.data()['chopsticks']) / 2
          ),
        });
      }
    );
    const winnerName = (await getDocs(collection(this.game, 'players'))).docs
      .map((d) => d.data())
      .reduce(
        (acc, curr) =>
          curr['points'] > acc['points']
            ? { points: curr['points'], winner: curr['playerName'] }
            : acc,
        { points: 0 }
      )['winner'];
    await updateDoc(this.game, {
      status: GameStatus.FINISHED,
      winner: winnerName,
    });
  }

  async reRoll(conveyorBeltSelections: DiceDoc[]) {
    if (this.player == null) {
      throw Error('User has not joined a game');
    }
    await updateDoc(this.player, {
      conveyorBelt: conveyorBeltSelections.map((dice) =>
        dice.selected ? Dice.rollDice({ ...dice, selected: false }) : dice
      ),
      menus: increment(-1),
    });
  }

  async swap(
    mySelectedDice: DiceDoc,
    otherPlayerId: string,
    otherPlayerSelectedDice: DiceDoc
  ) {
    if (this.game == null || this.player == null) {
      throw Error('User has not joined a game');
    }
    mySelectedDice = { ...mySelectedDice, selected: false };
    otherPlayerSelectedDice = { ...otherPlayerSelectedDice, selected: false };
    await updateDoc(this.player, {
      conveyorBelt: arrayRemove(mySelectedDice),
      chopsticks: increment(-1),
    });
    await updateDoc(this.player, {
      conveyorBelt: arrayUnion(otherPlayerSelectedDice),
    });
    await updateDoc(doc(this.game, 'players', otherPlayerId), {
      conveyorBelt: arrayRemove(otherPlayerSelectedDice),
    });
    await updateDoc(doc(this.game, 'players', otherPlayerId), {
      conveyorBelt: arrayUnion(mySelectedDice),
    });
  }
}
