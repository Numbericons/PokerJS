class Player {

  name: string = "";
  hand: Card[];
  isHuman: boolean;
  chips: number;
  folded: boolean = false;
  
  constructor(name: string, hand: Card[], isHuman: boolean, chips: number) {
    this.name = name;
    this.hand = hand;
    this.isHuman = isHuman;
    this.chips = chips;
  }

  drawHand(faceUp: boolean, x: number, y: number, folded: boolean) {
    if(folded) {
      ctx.globalAlpha = 0.5;
    }
    this.hand[0].drawCard(faceUp, x - 50, y);
    this.hand[1].drawCard(faceUp, x + 50, y);
    ctx.globalAlpha = 1;
  }
  
}