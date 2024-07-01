import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { GameService } from '../../game.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DiceDoc, GameData, GameStatus, PlayerData } from '../../models';
import { Router } from '@angular/router';
import { TrayComponent } from '../tray/tray.component';
import { ConveyorBeltComponent } from '../conveyor-belt/conveyor-belt.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-play-game',
  standalone: true,
  imports: [
    MatButtonModule,
    TrayComponent,
    ConveyorBeltComponent,
    CommonModule,
  ],
  templateUrl: './play-game.component.html',
  styleUrl: './play-game.component.css',
})
export class PlayGameComponent implements OnInit, OnDestroy {
  gameService = inject(GameService);
  unsubscribeFromGame: Unsubscribe | null = null;
  unsubscribeFromGamePlayers: Unsubscribe | null = null;
  gameData!: GameData;
  playerData!: PlayerData[];
  myPlayerData!: PlayerData;
  readonly GameStatus: typeof GameStatus = GameStatus;

  @Input() gameId!: string;

  ngOnInit() {
    if (this.gameService.isGameNull()) {
      const result = this.gameService.initializeFromLocalStorage(this.gameId);
      if (result !== true) {
        this.snackBar.open(result, 'OK', {
          duration: 4000,
        });
        this.router.navigate(['']);
      }
    }
    this.unsubscribeFromGame = this.gameService.trackGame((gameSnap) => {
      console.log(gameSnap.data());
      this.gameData = gameSnap.data() as GameData;
    });
    this.unsubscribeFromGamePlayers = this.gameService.trackGamePlayers(
      (gamePlayersSnap) => {
        const playerDocs: PlayerData[] = [];
        gamePlayersSnap.forEach((doc) => {
          playerDocs.push(doc.data() as PlayerData);
        });
        console.log(playerDocs);
        this.playerData = playerDocs;
        this.myPlayerData = this.playerData.find(
          (p) => p.playerId === this.gameService.getPlayerId()
        ) as PlayerData;
      }
    );
  }

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  ngOnDestroy(): void {
    this.unsubscribeFromGame?.();
    this.unsubscribeFromGamePlayers?.();
  }

  startGame() {
    this.gameService.startGameForPlayer().then((result) => {
      if (result !== true) {
        this.snackBar.open(result, 'OK', {
          duration: 2000,
        });
      }
    });
  }

  myDiceClick(diceDoc: DiceDoc) {
    if (this.myPlayerData.myTurn) {
      this.gameService.pickDice(diceDoc);
    }
  }

  otherDiceClick(diceDoc: DiceDoc) {
    console.log('otherdiceclick', diceDoc);
  }
}
