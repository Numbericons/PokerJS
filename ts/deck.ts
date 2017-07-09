class Deck {

  cards: Card[] = [];
  
  constructor() {
    for(let i: number = 2; i <= 14; i++) {
      for(let j: number = 0; j <= 3; j++) {
        let card: Card = new Card(i, j);
        this.cards.push(card);
      }
    }
    this.shuffle();
  }

  shuffle() {
    this.cards = _.shuffle(this.cards);
  }

  take(amount: number): Card[] {
    let returnCards: Card[] = [];
    for(let i: number = 0; i < amount; i++) {
      let card = this.cards.pop();
      returnCards.push(card);
    }
    return returnCards;
  }

}