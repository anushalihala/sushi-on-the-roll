import { Component, Input, OnInit } from '@angular/core';
import {
  AppetizerDice,
  Dice,
  DiceDoc,
  MakiDice,
  NigiriDice,
  PuddingDice,
  SpecialDice,
} from '../../models';

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
  NAMES_TO_CLASS = new Map(
    Object.entries({
      NigiriDice,
      PuddingDice,
      AppetizerDice,
      MakiDice,
      SpecialDice,
    })
  );

  ngOnInit(): void {
    const cls = this.NAMES_TO_CLASS.get(this.diceDoc.diceType) as any;
    this.dieClass = `die ${this.diceDoc.diceType
      .slice(0, -4)
      .toLowerCase()} ${cls.myEnum[this.diceDoc.diceFace].toLowerCase()}`;
    if (this.diceDoc.selected) {
      this.dieClass += ' selected';
    }
  }
}
