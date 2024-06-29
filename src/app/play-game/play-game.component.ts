import { Component, Input, inject } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { GameService } from '../../game.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameData, PlayerData } from '../../models';

@Component({
  selector: 'app-play-game',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './play-game.component.html',
  styleUrl: './play-game.component.css',
})
export class PlayGameComponent {
  gameId: string = '';
  gameService = inject(GameService);
  unsubscribeFromGame: Unsubscribe;
  unsubscribeFromGamePlayers: Unsubscribe;
  gameData: GameData | null = null;
  playerData: PlayerData[] | null = null;

  @Input() set gameid(value: string) {
    this.gameId = value;
  }

  constructor(private snackBar: MatSnackBar) {
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
      }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeFromGame();
    this.unsubscribeFromGamePlayers();
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
}
