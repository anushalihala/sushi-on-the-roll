import { DiceDoc, Dice } from './models';

export function docToDice(doc: DiceDoc): Dice {
  const cls = eval(doc.diceType);
  const dice = new cls() as Dice;
  dice.face = doc.diceFace;
  dice.value = doc.diceValue;
  dice.id = doc.id;
  return dice;
}

export function diceToDoc(dice: Dice): DiceDoc {
  return {
    diceValue: dice.value,
    diceFace: dice.face,
    diceType: dice.getDiceType(),
    id: dice.id,
  };
}
