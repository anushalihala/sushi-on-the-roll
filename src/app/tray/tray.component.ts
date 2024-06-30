import { Component, Input } from '@angular/core';
import { DiceDoc } from '../../models';
import { DieComponent } from '../die/die.component';

@Component({
  selector: 'app-tray',
  standalone: true,
  imports: [DieComponent],
  templateUrl: './tray.component.html',
  styleUrl: './tray.component.css',
})
export class TrayComponent {
  @Input() diceDocs!: DiceDoc[];
}
