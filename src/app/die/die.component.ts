import { Component, Input, OnInit } from '@angular/core';
import { DiceDoc } from '../../models';

@Component({
  selector: 'app-die',
  standalone: true,
  imports: [],
  templateUrl: './die.component.html',
  styleUrl: './die.component.css',
})
export class DieComponent implements OnInit {
  @Input() diceDoc!: DiceDoc;
  dieClass!: string;

  ngOnInit(): void {
    const cls = eval(this.diceDoc.diceType);
    this.dieClass = `die ${this.diceDoc.diceType
      .slice(0, -4)
      .toLowerCase()} ${cls.myEnum[this.diceDoc.diceFace].toLowerCase()}`;
    if (this.diceDoc.selected) {
      this.dieClass += ' selected';
    }
  }
}
