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
  startGame: boolean;
  playerName: string;
}
