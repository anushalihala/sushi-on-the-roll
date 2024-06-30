import { Routes } from '@angular/router';
import { JoinGameComponent } from './join-game/join-game.component';
import { PlayGameComponent } from './play-game/play-game.component';

export const routes: Routes = [
  {
    path: ':gameId',
    component: PlayGameComponent,
  },
  {
    path: '',
    component: JoinGameComponent,
  },
];
