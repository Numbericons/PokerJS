enum Move {
  Check,
  Call,
  Raise,
  Fold
}

enum Stage {
  PreFlop,
  Flop,
  Turn,
  River
}

class Game {

  deck: Deck;
  players: Player[] = [];
  whoseTurn: number = 0;
  dealer: number = 0;
  currentBet: number = 0;
  lastBetter: number = 0;
  pot: number = 0;
  stage: Stage = Stage.PreFlop;
  communityCards: Card[] = [];  //Cards dealt face-up in middle

  positions = [
    { x: 500, y: 500 },
    { x: 700, y: 500 },
    { x: 900, y: 300 },
    { x: 700, y: 100 },
    { x: 500, y: 100 },
    { x: 300, y: 100 },
    { x: 100, y: 300 },
    { x: 300, y: 500 },
  ];

  positionConfigs: any = {
    2: [0, 4],
    3: [0, 2, 6],
    4: [0, 2, 4, 6],
    5: [0, 2, 3, 5, 6],
    6: [0, 2, 3, 4, 5, 6],
    7: [0, 2, 3, 4, 5, 6, 7],
    8: [0, 1, 2, 3, 4, 5, 6, 7],
  }

  constructor(numPlayers: number) {

    //Create the players, assigning them two cards each
    for(let i:number = 0; i < numPlayers; i++) {
      let isHuman: boolean =  i == 0 ? true: false;
      let name: string = "";
      if(isHuman) {
        name = "Player 1";
      } else {
        name = "CPU " + (numPlayers - i);
      }
      let player:Player = new Player(name, [], isHuman, 100);
      this.players.push(player);
    }

    this.newRound(true);

    //Bind event handlers
    $("#check").on("click", () => {
      this.endTurn(Move.Check, 0);
    });
    $("#call").on("click", () => {
      this.endTurn(Move.Call, 0);
    });
    $("#raise").on("click", () => {
      let raiseAmount: number = Number($("#raiseAmount").val());
      $("#raiseAmount").val("");
      this.endTurn(Move.Raise, raiseAmount);
    });
    $("#fold").on("click", () => {
      this.endTurn(Move.Fold, 0);
    });
    $("#continueNextRound").on("click", () => {
      this.newRound(false);
    });
    $("#continueNextRound").hide();
  }

  playerOffsetIndex(startIndex: number, offset: number) {
    let curPlayer: Player;
    let moveCount: number = 0;
    do {
      startIndex += Math.sign(offset);
      if(startIndex < 0) startIndex = this.players.length - 1;
      curPlayer = this.players[startIndex];
      if(!curPlayer.folded) {
        moveCount++;
      }
    } while(moveCount < Math.abs(offset));
    return startIndex;
  }

  startTurn() {
    let player: Player = this.players[this.whoseTurn];
    this.logMessage(player.name + "'s turn.");
    if(player.isHuman) {
      //Enable DOM UI
      this.enableDOMUI(true);
    } else {
      //this.enableDOMUI(false);
    }
    this.redraw();
  }

  endTurn(move: Move, betAmount: number) {
    let player: Player = this.players[this.whoseTurn];
    if(move == Move.Check) {
      this.logMessage(player.name + " checked!");
    } else if(move == Move.Call) {
      player.chips -= this.currentBet;
      this.pot += this.currentBet;
      this.logMessage(player.name + " called! (Put in " + this.currentBet + " chips.)");
    } else if(move == Move.Raise) {
      player.chips -= this.currentBet;
      player.chips -= betAmount;
      this.currentBet += betAmount;
      this.pot += this.currentBet;
      this.lastBetter = this.whoseTurn;
      this.logMessage(player.name + " raised! (Put in " + this.currentBet + " chips.)");
    } else if(move == Move.Fold) {
      player.folded = true;
      this.logMessage(player.name + " folded!");
    }

    let lastStanding: Player = this.getLastStanding();
    if(lastStanding) {
      this.finishRound(lastStanding, "");
      return;
    }

    this.whoseTurn = this.playerOffsetIndex(this.whoseTurn, -1);

    if(this.lastBetter == this.whoseTurn) {
      this.stage++;
      this.currentBet = 0;
      this.whoseTurn = this.playerOffsetIndex(this.dealer, -1);
      this.lastBetter = this.whoseTurn;
      if(this.stage == Stage.Flop) {
        this.communityCards = this.communityCards.concat(this.deck.take(3));
        this.logMessage("Flop revealed!");
      } else if(this.stage == Stage.Turn) {
        this.communityCards = this.communityCards.concat(this.deck.take(1));
        this.logMessage("Turn revealed!");
      } else if(this.stage == Stage.River) {
        this.communityCards = this.communityCards.concat(this.deck.take(1));
        this.logMessage("River revealed!");
      } else {
        this.finishRound(this.players[0], "with a pair ");
        return;
      }
    }

    //If the last better folded, the next player is the last better
    if(move == Move.Fold) {
      this.lastBetter = this.playerOffsetIndex(this.whoseTurn, -1);
    }

    this.startTurn();
  }

  getLastStanding(): Player {
    let lastStanding: Player = null;
    for(let player of this.players) {
      if(!player.folded) {
        if(!lastStanding) {
          lastStanding = player;
        } else {
          lastStanding = null;
          return null;
        }
      }
    }
    return lastStanding;
  }

  getLastWithChips(): Player {
    let lastStanding: Player = null;
    for(let player of this.players) {
      if(player.chips > 0) {
        if(!lastStanding) {
          lastStanding = player;
        } else {
          lastStanding = null;
          return null;
        }
      }
    }
    return lastStanding;
  }

  finishRound(winner: Player, winMsg: string) {

    //this.enableDOMUI(false);

    //Check if someone won the whole game
    let lastWithChips: Player = this.getLastWithChips();
    if(lastWithChips) {
      window.alert(lastWithChips.name + " wins the game! Everyone else has been eliminated.");
      return;
    }

    let message: string = winner.name + " wins the round " + winMsg + "and takes pot of " + this.pot + " chips!"
    this.logMessage(message);

    winner.chips += this.pot;
    this.pot = 0;

    //Reveal all cards
    this.redraw(true);

    $("#continueNextRound").show();
  }

  newRound(isFirstTime: boolean) {
    $("#continueNextRound").hide();
    
    if(!isFirstTime) {
      this.logMessage("======================");
      this.logMessage("A new round has begun.");
      this.logMessage("======================");
    }

    this.deck = new Deck();
    if(!isFirstTime) {
      this.dealer = this.playerOffsetIndex(this.dealer, -1);
    } else {
      //this.dealer = Math.floor(Math.random() * this.players.length);
      this.dealer = this.playerOffsetIndex(0, 3); //Always make the player go first, to prevent confusion
    }
    this.whoseTurn = this.playerOffsetIndex(this.dealer, -3);
    this.lastBetter = this.whoseTurn;
    for(let player of this.players) {
      player.folded = false;
      player.hand = this.deck.take(2);
    }

    this.currentBet = 0;
    this.lastBetter = 0;
    
    this.stage = Stage.PreFlop;
    this.communityCards = [];

    this.startTurn();
  }

  redraw(showAllCards?: boolean) {
     
    ctx.clearRect(0, 0, 1000, 600);

    //Draw the table
    this.drawRoundRect(50, 50, 1150, 550, 75, "#5ed15e");

    //Draw the deck
    ctx.drawImage(deckImage, 400, 300 - cardHeight/2, cardWidth, cardHeight);

    //Draw the community cards
    for(let i = 0; i < this.communityCards.length; i++) {
      this.communityCards[i].drawCard(true, 400 + cardWidth*(i+1)*1.05, 300 - cardHeight/2);
    }

    ctx.fillStyle = "black";
    ctx.font = "normal 20px arial";
    ctx.textAlign = "center";
    
    //Draw the pot text
    ctx.fillText("Pot: " + this.pot, 450, 225);

    var positionConfig = this.positionConfigs[this.players.length];
    //Draw each player's cards
    for(let i = 0; i < this.players.length; i++) {
      let player: Player = this.players[i];
      let position = this.positions[positionConfig[i]];
      if(player.isHuman) {
        //Draw the cards, face up
        player.drawHand(true, position.x, position.y, player.folded);
      } else {
        let cpuFaceUp: boolean = player.folded || showAllCards;
        player.drawHand(cpuFaceUp, position.x, position.y, player.folded);
      }

      //Draw texts
      ctx.fillStyle = "black";
      ctx.font = "normal 20px arial";

      let caption: string = "";
      if(i === this.dealer) caption = " (Dealer)";
      else if(i === this.playerOffsetIndex(this.dealer, -1)) caption = " (Small Blind)";
      else if(i === this.playerOffsetIndex(this.dealer, -2)) caption = " (Big Blind)";

      ctx.fillText(player.name + caption, position.x, position.y - 80);
      ctx.fillText("Chips: " + player.chips, position.x, position.y - 60);

      if(player.folded) {
        ctx.font = "bold 30px arial";
        ctx.fillStyle = "white";
        ctx.fillText("FOLDED", position.x, position.y);
        ctx.strokeStyle = "black";
        ctx.strokeText("FOLDED", position.x, position.y);
      }
    }
  }

  messageLog: string = "";
  
  logMessage(message: string) {
    this.messageLog += message + "\n";
    $("#messageLog").text(this.messageLog);
    $("#messageLog").scrollTop($("#messageLog")[0].scrollHeight - $("#messageLog").height());
  }

  enableDOMUI(enable: boolean) {
    $("#check").prop("disabled", !enable);
    $("#call").prop("disabled", !enable);
    $("#raise").prop("disabled", !enable);
    $("#raiseChips").prop("disabled", !enable);
    $("#fold").prop("disabled", !enable);
  }

  updateDOM() {
    $("#currentBet").text(this.currentBet);
  }

  drawRoundRect(x0: number, y0: number, x1: number, y1: number, r: number, color: string)
  {
    let w = x1 - x0;
    let h = y1 - y0;
    if (r > w/2) r = w/2;
    if (r > h/2) r = h/2;
    ctx.beginPath();
    ctx.moveTo(x1 - r, y0);
    ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
    ctx.lineTo(x1, y1-r);
    ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
    ctx.lineTo(x0 + r, y1);
    ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
    ctx.lineTo(x0, y0 + r);
    ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

}