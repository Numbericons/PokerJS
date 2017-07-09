enum CardValue {
  Two = 2,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
  Ace
}

enum CardSuit {
  Clubs = 0,
  Diamonds,
  Hearts,
  Spades
}

class Card {
  value: CardValue;
  suit: CardSuit;

  constructor(value: CardValue, suit: CardSuit) {
    this.value = value;
    this.suit = suit;
  }

  drawCard(faceUp: boolean, x: number, y: number) {
    if(faceUp) {
      let xOffset: number = (this.value - 2) * cardWidth;
      let yOffset: number;

      if(this.suit == CardSuit.Spades) yOffset = 0;
      if(this.suit == CardSuit.Hearts) yOffset = 1;
      if(this.suit == CardSuit.Clubs) yOffset = 2;
      if(this.suit == CardSuit.Diamonds) yOffset = 3;
      yOffset *= cardHeight;

      ctx.drawImage(cardSpriteSheet, xOffset, yOffset, cardWidth, cardHeight, x - cardWidth * 0.5, y - cardHeight * 0.5, cardWidth, cardHeight);
    } else {
      ctx.drawImage(cardBackImage, x - cardWidth * 0.5, y - cardWidth * 0.5, cardWidth, cardHeight);
    }
  }

}