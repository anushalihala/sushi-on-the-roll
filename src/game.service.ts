import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-config.json';
import { GameStatus } from './models';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private db: Firestore;
  private game: DocumentReference | null;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    this.game = null;
  }

  async createGame() {
    const newGameRef = doc(collection(this.db, 'games'));
    await setDoc(newGameRef, { status: GameStatus.CREATED });
    const newPlayerRef = doc(
      collection(this.db, 'games', newGameRef.id, 'players')
    );
    await setDoc(newPlayerRef, {});
    this.game = newGameRef;
    return true;
  }

  async joinGame(gameId: string) {
    const gameRef = doc(this.db, 'games', gameId);
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) {
      return 'Game does not exist';
    }
    if (gameDoc.data()['status'] == GameStatus.STARTED) {
      return 'Game has already started';
    }
    const newPlayerRef = doc(collection(this.db, 'games', gameId, 'players'));
    await setDoc(newPlayerRef, {});
    this.game = gameRef;
    return true;
  }

  trackGame(handler: (snapshot: DocumentSnapshot) => void) {
    if (this.game == null) {
      throw Error('User has not joined a game');
    }
    return onSnapshot(this.game, handler);
  }
  //   getUserData(): Promise<User[]> {
  //     return new Promise((resolve) => {
  //       resolve(this.userData);
  //     });
  //   }
}
