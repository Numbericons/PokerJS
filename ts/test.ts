function testApp() {

  function createHand(cardAbbr: string[]): Hand {
    return new Hand(createCards(cardAbbr));
  }

  function testKickers(testName: string, handAbbrs: string[], expectedKickerAbbrs: string[]) {
    let hand = new Hand(createCards(handAbbrs));
    let expectedKickers = createCards(expectedKickerAbbrs);
    hand.kickers.sort((a, b) => { return (a.value + a.suit*0.1) - (b.value + b.suit*0.1) });
    expectedKickers.sort((a, b) => { return (a.value + a.suit*0.1) - (b.value + b.suit*0.1) });
    if(hand.kickers.length != expectedKickers.length) {
      console.error("The test " + testName + " failed!");
      console.log("Expected:");
      console.log(expectedKickers);
      console.log("Got:");
      console.log(hand.kickers);
      return;
    }
    for(let i = 0; i < hand.kickers.length; i++) {
      if(hand.kickers[i].value != expectedKickers[i].value) {
        console.error("The test " + testName + " failed!");
        console.log("Expected:");
        console.log(expectedKickers);
        console.log("Got:");
        console.log(hand.kickers);
        return;
      }
    }
  }

  function testHandComparison(testName: string, hand1Abbrs: string[], hand2Abbrs: string[], expectedCompare: number) {
    let hand1 = createHand(hand1Abbrs);
    let hand2 = createHand(hand2Abbrs);
    if(Hand.compare(hand1, hand2) != expectedCompare) {
      console.error("The test " + testName + " failed!");
    }
  }

  function testBestHand(testName: string, communityCards: string[], playerHand: string[], expectedBestHand: string[]) {
    let deck = new Deck();
    deck.communityCards = createCards(communityCards);
    let bestHand = deck.getBestHand(createCards(playerHand));
    let expectedBest = new Hand(createCards(expectedBestHand));
    bestHand.cards.sort((a, b) => { return (a.value + a.suit*0.1) - (b.value + b.suit*0.1) });
    expectedBest.cards.sort((a, b) => { return (a.value + a.suit*0.1) - (b.value + b.suit*0.1) });
    //console.log(expectedBest.cards);
    //console.log(bestHand.cards);
    if(expectedBest.cards.length != bestHand.cards.length) {
      console.error("The test " + testName + " failed!");
      return;
    }
    for(let i = 0; i < expectedBest.cards.length; i++) {
      if(expectedBest.cards[i].value != bestHand.cards[i].value) {
        console.error("The test " + testName + " failed!");
      }
    }
  }

  function assert(testName: string, assertion: boolean) {
    if(!assertion) {
      console.error("The test " + testName + " failed!");
    }
  }

  /*
  //Test hand detection logic
  let hand = createHand(["2D", "5S", "7H" , "9C", "JC"]);
  assert("High card test", hand.name == "high card");
  hand = createHand(["2D", "2S", "7H" , "9C", "JC"]);
  assert("Pair test", hand.name == "pair");
  hand = createHand(["2D", "4S", "7H" , "2C", "JC"]);
  assert("Pair test", hand.name == "pair");
  hand = createHand(["2D", "2S", "7H" , "2C", "JC"]);
  assert("three of a kind test", hand.name == "three of a kind");
  hand = createHand(["2D", "5S", "4H" , "3C", "6C"]);
  assert("straight test", hand.name == "straight");
  hand = createHand(["2D", "9D", "4D", "3D", "6D"]);
  assert("flush test", hand.name == "flush");
  hand = createHand(["2D", "5D", "2D" , "2C", "5S"]);
  assert("full house test", hand.name == "full house");
  hand = createHand(["2D", "5D", "2H" , "2C", "2S"]);
  assert("four of a kind test", hand.name == "four of a kind");
  hand = createHand(["2D", "3D", "4D" , "5D", "6D"]);
  assert("straight flush test", hand.name == "straight flush");
  
  //Test best card logic
  //http://www.pokerlistings.com/strategy/beginner/how-to-determine-the-winning-hand
  
  testBestHand("TestHand1", ["9D", "JD", "2S", "KD", "AD"], ["7D", "AC"], ["AD", "KD", "JD", "9D", "7D"]);
  testBestHand("TestHand2", ["9D", "JD", "2S", "KD", "AD"], ["6D", "QS"], ["AD", "KD", "JD", "9D", "6D"]);
  
  testBestHand("TestHand3", ["KD", "QS", "2S", "3H", "2C"], ["AD", "AC"], ["AD", "AC", "2S", "2C", "KD"]);
  testBestHand("TestHand4", ["KD", "QS", "2S", "3H", "2C"], ["KH", "QH"], ["KD", "KH", "QS", "QH", "3H"]);

  testBestHand("TestHand4", ["KD", "9S", "9C", "9D", "9H"], ["AD", "2C"], ["9S", "9C", "9D", "9H", "AD"]);
  testBestHand("TestHand5", ["KD", "9S", "9C", "9D", "9H"], ["KS", "KC"], ["9S", "9C", "9D", "9H", "KC"]);

  //Test kickers
  testKickers("TestKickers1", ["2D", "4H", "7S", "QH", "3H"], ["2D", "4H", "7S", "QH", "3H"]);
  testKickers("TestKickers2", ["KD", "KH", "QS", "QH", "3H"], ["3H"]);
  testKickers("TestKickers3", ["AD", "AS", "2C", "3H", "4D"], ["2C", "3H", "4D"]);
  testKickers("TestKickers4", ["AD", "7D", "2C", "3H", "4D"], ["AD", "7D", "2C", "3H", "4D"]);
  testKickers("TestKickers4", ["AD", "7D", "2D", "3D", "4D"], []);
  
  //Test hand comparison
  testHandComparison("Compare1", ["AD", "KD", "JD", "9D", "7D"], ["AD", "KD", "JD", "9D", "6D"], 1);
  testHandComparison("Compare2", ["AD", "AC", "2S", "2C", "KD"], ["AD", "7D", "2C", "3H", "4D"], 1);
  testHandComparison("Compare3", ["9S", "9C", "9D", "9H", "AD"], ["9S", "9C", "9D", "9H", "KC"], 1); 
  testHandComparison("Compare4", ["9S", "9C", "9D", "9H", "AD"], ["9S", "9C", "9D", "9H", "AD"], 0);
  testHandComparison("Compare4", ["2H", "2S", "JS", "9C", "7D"], ["2D", "2C", "JH", "9H", "6D"], 1);
  testHandComparison("Compare4", ["2H", "2S", "JS", "9C", "7D"], ["2D", "2C", "JH", "9H", "7S"], 0);
  testHandComparison("Compare4", ["2H", "3S", "JS", "9C", "7D"], ["2D", "3C", "JH", "9H", "6S"], 1);
  */
  
  function createCards(cardAbbrs: string[]): Card[] {
    let cards: Card[] = [];
    for(let cardAbbr of cardAbbrs) {
      if(cardAbbr == "2C") cards.push(new Card(CardValue.Two, CardSuit.Clubs));
      else if(cardAbbr == "3C") cards.push(new Card(CardValue.Three, CardSuit.Clubs));
      else if(cardAbbr == "4C") cards.push(new Card(CardValue.Four, CardSuit.Clubs));
      else if(cardAbbr == "5C") cards.push(new Card(CardValue.Five, CardSuit.Clubs));
      else if(cardAbbr == "6C") cards.push(new Card(CardValue.Six, CardSuit.Clubs));
      else if(cardAbbr == "7C") cards.push(new Card(CardValue.Seven, CardSuit.Clubs));
      else if(cardAbbr == "8C") cards.push(new Card(CardValue.Eight, CardSuit.Clubs));
      else if(cardAbbr == "9C") cards.push(new Card(CardValue.Nine, CardSuit.Clubs));
      else if(cardAbbr == "10C") cards.push(new Card(CardValue.Ten, CardSuit.Clubs));
      else if(cardAbbr == "JC") cards.push(new Card(CardValue.Jack, CardSuit.Clubs));
      else if(cardAbbr == "QC") cards.push(new Card(CardValue.Queen, CardSuit.Clubs));
      else if(cardAbbr == "KC") cards.push(new Card(CardValue.King, CardSuit.Clubs));
      else if(cardAbbr == "AC") cards.push(new Card(CardValue.Ace, CardSuit.Clubs));
      else if(cardAbbr == "2S") cards.push(new Card(CardValue.Two, CardSuit.Spades));
      else if(cardAbbr == "3S") cards.push(new Card(CardValue.Three, CardSuit.Spades));
      else if(cardAbbr == "4S") cards.push(new Card(CardValue.Four, CardSuit.Spades));
      else if(cardAbbr == "5S") cards.push(new Card(CardValue.Five, CardSuit.Spades));
      else if(cardAbbr == "6S") cards.push(new Card(CardValue.Six, CardSuit.Spades));
      else if(cardAbbr == "7S") cards.push(new Card(CardValue.Seven, CardSuit.Spades));
      else if(cardAbbr == "8S") cards.push(new Card(CardValue.Eight, CardSuit.Spades));
      else if(cardAbbr == "9S") cards.push(new Card(CardValue.Nine, CardSuit.Spades));
      else if(cardAbbr == "10S") cards.push(new Card(CardValue.Ten, CardSuit.Spades));
      else if(cardAbbr == "JS") cards.push(new Card(CardValue.Jack, CardSuit.Spades));
      else if(cardAbbr == "QS") cards.push(new Card(CardValue.Queen, CardSuit.Spades));
      else if(cardAbbr == "KS") cards.push(new Card(CardValue.King, CardSuit.Spades));
      else if(cardAbbr == "AS") cards.push(new Card(CardValue.Ace, CardSuit.Spades));
      else if(cardAbbr == "2D") cards.push(new Card(CardValue.Two, CardSuit.Diamonds));
      else if(cardAbbr == "3D") cards.push(new Card(CardValue.Three, CardSuit.Diamonds));
      else if(cardAbbr == "4D") cards.push(new Card(CardValue.Four, CardSuit.Diamonds));
      else if(cardAbbr == "5D") cards.push(new Card(CardValue.Five, CardSuit.Diamonds));
      else if(cardAbbr == "6D") cards.push(new Card(CardValue.Six, CardSuit.Diamonds));
      else if(cardAbbr == "7D") cards.push(new Card(CardValue.Seven, CardSuit.Diamonds));
      else if(cardAbbr == "8D") cards.push(new Card(CardValue.Eight, CardSuit.Diamonds));
      else if(cardAbbr == "9D") cards.push(new Card(CardValue.Nine, CardSuit.Diamonds));
      else if(cardAbbr == "10D") cards.push(new Card(CardValue.Ten, CardSuit.Diamonds));
      else if(cardAbbr == "JD") cards.push(new Card(CardValue.Jack, CardSuit.Diamonds));
      else if(cardAbbr == "QD") cards.push(new Card(CardValue.Queen, CardSuit.Diamonds));
      else if(cardAbbr == "KD") cards.push(new Card(CardValue.King, CardSuit.Diamonds));
      else if(cardAbbr == "AD") cards.push(new Card(CardValue.Ace, CardSuit.Diamonds));
      else if(cardAbbr == "2H") cards.push(new Card(CardValue.Two, CardSuit.Hearts));
      else if(cardAbbr == "2H") cards.push(new Card(CardValue.Two, CardSuit.Hearts));
      else if(cardAbbr == "3H") cards.push(new Card(CardValue.Three, CardSuit.Hearts));
      else if(cardAbbr == "4H") cards.push(new Card(CardValue.Four, CardSuit.Hearts));
      else if(cardAbbr == "5H") cards.push(new Card(CardValue.Five, CardSuit.Hearts));
      else if(cardAbbr == "6H") cards.push(new Card(CardValue.Six, CardSuit.Hearts));
      else if(cardAbbr == "7H") cards.push(new Card(CardValue.Seven, CardSuit.Hearts));
      else if(cardAbbr == "8H") cards.push(new Card(CardValue.Eight, CardSuit.Hearts));
      else if(cardAbbr == "9H") cards.push(new Card(CardValue.Nine, CardSuit.Hearts));
      else if(cardAbbr == "10H") cards.push(new Card(CardValue.Ten, CardSuit.Hearts));
      else if(cardAbbr == "JH") cards.push(new Card(CardValue.Jack, CardSuit.Hearts));
      else if(cardAbbr == "QH") cards.push(new Card(CardValue.Queen, CardSuit.Hearts));
      else if(cardAbbr == "KH") cards.push(new Card(CardValue.King, CardSuit.Hearts));
      else if(cardAbbr == "AH") cards.push(new Card(CardValue.Ace, CardSuit.Clubs));
      else {
        console.log("ERROR: wrong abbreviation " + cardAbbr);
      }
    }
    return cards;
  }

}