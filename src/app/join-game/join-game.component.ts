import { Component, inject } from '@angular/core';
import { GameService } from '../../game.service';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

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
  playerName: string = '';
  inputPlayerName: string = '';

  constructor(private snackBar: MatSnackBar, private router: Router) {}

  setPlayerName() {
    if (this.inputPlayerName.trim() !== '') {
      this.playerName = this.inputPlayerName.trim();
    }
  }

  joinGame() {
    this.gameService
      .joinGame(this.playerName, this.gameIdInput)
      .then((result) => {
        if (result === true) {
          this.snackBar.open('Successfully joined game', 'OK', {
            duration: 2000,
          });
          this.router.navigate([this.gameService.getGameId()]);
        } else {
          this.snackBar.open(result, 'OK', {
            duration: 2000,
          });
        }
      });
  }

  createGame() {
    this.gameService.createGame(this.playerName).then((result) => {
      if (result === true) {
        this.snackBar.open('Successfully created game', 'OK', {
          duration: 2000,
        });
        this.router.navigate([this.gameService.getGameId()]);
      } else {
        this.snackBar.open('Failed to create game', 'OK', {
          duration: 2000,
        });
      }
    });
  }
}
