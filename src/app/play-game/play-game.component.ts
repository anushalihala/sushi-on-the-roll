import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Unsubscribe } from 'firebase/firestore';
import { GameService } from '../../game.service';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  DiceDoc,
  GameData,
  GameStatus,
  PlayerData,
  SpecialState,
} from '../../models';
import { Router } from '@angular/router';
import { TrayComponent } from '../tray/tray.component';
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
  readonly SpecialState: typeof SpecialState = SpecialState;
  specialState: SpecialState = SpecialState.NONE;
  otherSelectedDice: DiceDoc | null = null;
  otherSelectedDicePlayerId: string | null = null;

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
      this.gameData = gameSnap.data() as GameData;
    });
    this.unsubscribeFromGamePlayers = this.gameService.trackGamePlayers(
      (gamePlayersSnap) => {
        const playerDocs: PlayerData[] = [];
        gamePlayersSnap.forEach((doc) => {
          playerDocs.push(doc.data() as PlayerData);
        });
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

  goToJoinGame() {
    this.router.navigate(['']);
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
      if (this.specialState == SpecialState.NONE) {
        this.gameService.pickDice(diceDoc);
      } else if (this.specialState == SpecialState.REROLL) {
        this.myPlayerData['conveyorBelt'] = this.myPlayerData[
          'conveyorBelt'
        ].map((dice) =>
          dice.id == diceDoc.id ? { ...dice, selected: !dice.selected } : dice
        );
      } else if (this.specialState == SpecialState.SWAP) {
        this.myPlayerData['conveyorBelt'] = this.myPlayerData[
          'conveyorBelt'
        ].map((dice) =>
          dice.id == diceDoc.id
            ? { ...dice, selected: !dice.selected }
            : { ...dice, selected: false }
        );
      }
    }
  }

  otherDiceClick(diceDoc: DiceDoc, otherPlayerId: string) {
    if (this.myPlayerData.myTurn) {
      if (this.specialState == SpecialState.SWAP) {
        this.otherSelectedDice = diceDoc;
        this.otherSelectedDicePlayerId = otherPlayerId;
        this.playerData = this.playerData.map((player) =>
          player.playerId == otherPlayerId
            ? {
                ...player,
                conveyorBelt: player.conveyorBelt.map((dice) =>
                  dice.id == diceDoc.id
                    ? {
                        ...dice,
                        selected: !dice.selected,
                      }
                    : {
                        ...dice,
                        selected: false,
                      }
                ),
              }
            : {
                ...player,
                conveyorBelt: player.conveyorBelt.map((dice) => ({
                  ...dice,
                  selected: false,
                })),
              }
        );
      }
    }
  }

  enableReroll() {
    if (this.myPlayerData.myTurn && this.myPlayerData.menus > 0) {
      this.specialState =
        this.specialState == SpecialState.REROLL
          ? SpecialState.NONE
          : SpecialState.REROLL;
      this.clearDiceSelections();
    }
  }

  enableSwap() {
    if (this.myPlayerData.myTurn && this.myPlayerData.chopsticks > 0) {
      this.specialState =
        this.specialState == SpecialState.SWAP
          ? SpecialState.NONE
          : SpecialState.SWAP;
      this.clearDiceSelections();
    }
  }
  clearDiceSelections() {
    this.myPlayerData['conveyorBelt'] = this.myPlayerData['conveyorBelt'].map(
      (dice) => ({ ...dice, selected: false })
    );
    this.playerData = this.playerData.map((data) => ({
      ...data,
      conveyorBelt: data.conveyorBelt.map((dice) => ({
        ...dice,
        selected: false,
      })),
    }));
    this.otherSelectedDice = null;
    this.otherSelectedDicePlayerId = null;
  }

  reRollValid(): boolean {
    return !this.myPlayerData.conveyorBelt.some((dice) => dice.selected);
  }

  swapValid(): boolean {
    return !(
      this.myPlayerData.conveyorBelt.some((dice) => dice.selected) &&
      this.playerData.some((player) =>
        player.conveyorBelt.some((dice) => dice.selected)
      )
    );
  }

  reRoll() {
    this.gameService.reRoll(this.myPlayerData.conveyorBelt);
    this.specialState = SpecialState.NONE;
    this.clearDiceSelections();
  }

  swap() {
    this.gameService.swap(
      this.myPlayerData.conveyorBelt.find((dice) => dice.selected) as DiceDoc,
      this.otherSelectedDicePlayerId as string,
      this.otherSelectedDice as DiceDoc
    );
    this.specialState = SpecialState.NONE;
    this.clearDiceSelections();
  }
}
