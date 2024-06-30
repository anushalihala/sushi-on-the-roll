import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QuerySnapshot,
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
import { BagOfDice, GameStatus } from './models';
import { diceToDoc } from './utils';

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
    await setDoc(newGameRef, { status: GameStatus.CREATED, playerCount: 1 });
    const newPlayerRef = doc(
      collection(this.db, 'games', newGameRef.id, 'players')
    );
    await setDoc(newPlayerRef, {
      playerName,
      playerId: newPlayerRef.id,
      startGame: false,
      leader: true,
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
      playerName,
      playerId: newPlayerRef.id,
      startGame: false,
      leader: false,
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
        const diceCollection = [];
        for (let i = 0; i < diceCount; i++) {
          const newDice = bag.takeDice();
          diceCollection.push(newDice);
        }
        await updateDoc(currPlayerRef, {
          conveyorBelt: diceCollection.map((d) => diceToDoc(d)),
          tray: [],
        });
      });
    }
  }
}
