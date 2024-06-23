import { Component, inject } from '@angular/core';
import { GameService } from '../../game.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Unsubscribe } from 'firebase/firestore';

@Component({
  selector: 'app-join-game',
  standalone: true,
  imports: [MatButtonModule, FormsModule],
  templateUrl: './join-game.component.html',
  styleUrl: './join-game.component.css',
})
export class JoinGameComponent {
  gameIdInput: string = '';
  gameService = inject(GameService);
  // unsubscribeFromGame: Unsubscribe;

  constructor(private snackBar: MatSnackBar) {
    // this.unsubscribeFromGame = this.gameService.trackGame((gameSnap) =>
    //   console.log(gameSnap)
    // );
  }

  // ngOnDestroy(): void {
  //   this.unsubscribeFromGame();
  // }

  joinGame() {
    this.gameService.joinGame(this.gameIdInput).then((result) => {
      if (result === true) {
        this.snackBar.open('Successfully joined game', 'OK', {
          duration: 2000,
        });
      } else {
        this.snackBar.open(result, 'OK', {
          duration: 2000,
        });
      }
    });
  }

  createGame() {
    this.gameService.createGame().then((result) => {
      if (result === true) {
        this.snackBar.open('Successfully created game', 'OK', {
          duration: 2000,
        });
      } else {
        this.snackBar.open('Failed to create game', 'OK', {
          duration: 2000,
        });
      }
    });
  }
}
