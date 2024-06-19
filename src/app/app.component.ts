import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DieComponent } from './die/die.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DieComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'sushi-on-the-roll';
  hello() {
    console.log('hello');
  }
}
