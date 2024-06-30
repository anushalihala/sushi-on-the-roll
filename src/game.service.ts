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
    await setDoc(newPlayerRef, { playerName, startGame: false });
    this.game = newGameRef;
    this.player = newPlayerRef;
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
    await setDoc(newPlayerRef, { playerName, startGame: false });
    await updateDoc(gameRef, { playerCount: increment(1) });
    this.game = gameRef;
    this.player = newPlayerRef;
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
          newDice.diceRoll();
          diceCollection.push(newDice);
        }
        await updateDoc(currPlayerRef, {
          conveyorBelt: diceCollection,
          tray: [],
        });
      });
    }
  }
}
