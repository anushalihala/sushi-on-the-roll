import { Component, Input } from '@angular/core';
import { TrayComponent } from '../tray/tray.component';
import { DiceDoc } from '../../models';

@Component({
  selector: 'app-conveyor-belt',
  standalone: true,
  imports: [TrayComponent],
  templateUrl: './conveyor-belt.component.html',
  styleUrl: './conveyor-belt.component.css',
})
export class ConveyorBeltComponent {
  @Input() diceDocs!: DiceDoc[];

  handleDiceClick(doc: DiceDoc): void {
    console.log('click on dice', doc);
  }
}
