var CardValue;
(function (CardValue) {
    CardValue[CardValue["Two"] = 2] = "Two";
    CardValue[CardValue["Three"] = 3] = "Three";
    CardValue[CardValue["Four"] = 4] = "Four";
    CardValue[CardValue["Five"] = 5] = "Five";
    CardValue[CardValue["Six"] = 6] = "Six";
    CardValue[CardValue["Seven"] = 7] = "Seven";
    CardValue[CardValue["Eight"] = 8] = "Eight";
    CardValue[CardValue["Nine"] = 9] = "Nine";
    CardValue[CardValue["Ten"] = 10] = "Ten";
    CardValue[CardValue["Jack"] = 11] = "Jack";
    CardValue[CardValue["Queen"] = 12] = "Queen";
    CardValue[CardValue["King"] = 13] = "King";
    CardValue[CardValue["Ace"] = 14] = "Ace";
})(CardValue || (CardValue = {}));
var CardSuit;
(function (CardSuit) {
    CardSuit[CardSuit["Clubs"] = 0] = "Clubs";
    CardSuit[CardSuit["Diamonds"] = 1] = "Diamonds";
    CardSuit[CardSuit["Hearts"] = 2] = "Hearts";
    CardSuit[CardSuit["Spades"] = 3] = "Spades";
})(CardSuit || (CardSuit = {}));
var Card = (function () {
    function Card(value, suit) {
        this.value = value;
        this.suit = suit;
        this.humanReadableName = this.getFormattedName();
    }
    Card.prototype.getFormattedValue = function () {
        var valComponent = "";
        if (this.value == CardValue.Jack)
            valComponent = "J";
        else if (this.value == CardValue.Queen)
            valComponent = "Q";
        else if (this.value == CardValue.King)
            valComponent = "K";
        else if (this.value == CardValue.Ace)
            valComponent = "A";
        else
            valComponent = String(this.value);
        return valComponent;
    };
    Card.prototype.getFormattedSuit = function () {
        var suitComponent = "";
        if (this.suit == CardSuit.Clubs)
            suitComponent = "\u2663";
        else if (this.suit == CardSuit.Diamonds)
            suitComponent = "\u2666";
        else if (this.suit == CardSuit.Hearts)
            suitComponent = "\u2665";
        else if (this.suit == CardSuit.Spades)
            suitComponent = "\u2660";
        return suitComponent;
    };
    Card.prototype.getFormattedName = function () {
        return this.getFormattedValue() + this.getFormattedSuit();
    };
    Card.prototype.drawCard = function (faceUp, x, y) {
        var val = this.value - 1;
        if (this.value == CardValue.Ace)
            val = 0;
        if (faceUp) {
            var xOffset = val * cardWidth;
            var yOffset = void 0;
            if (this.suit == CardSuit.Clubs)
                yOffset = 0;
            if (this.suit == CardSuit.Hearts)
                yOffset = 1;
            if (this.suit == CardSuit.Spades)
                yOffset = 2;
            if (this.suit == CardSuit.Diamonds)
                yOffset = 3;
            yOffset *= cardHeight;
            ctx.drawImage(cardSpriteSheet, xOffset, yOffset, cardWidth, cardHeight, x - cardDrawWidth * 0.5, y - cardDrawHeight * 0.5, cardDrawWidth, cardDrawHeight);
        }
        else {
            ctx.drawImage(cardBackImage, x - cardDrawWidth * 0.5, y - cardDrawHeight * 0.5, cardDrawWidth, cardDrawHeight);
        }
    };
    Card.prototype.getValue = function () {
        return this.value;
    };
    return Card;
}());
var Deck = (function () {
    function Deck() {
        this.cards = [];
        this.communityCards = [];
        for (var i = 2; i <= 14; i++) {
            for (var j = 0; j <= 3; j++) {
                var card = new Card(i, j);
                this.cards.push(card);
            }
        }
        this.shuffle();
        this.communityCards = [];
    }
    Deck.prototype.shuffle = function () {
        this.cards = _.shuffle(this.cards);
    };
    Deck.prototype.placeAllCommunityCards = function () {
        while (this.communityCards.length < 5) {
            this.communityCards.push(this.cards.pop());
        }
    };
    Deck.prototype.placeCommunityCards = function (amount) {
        this.communityCards = this.communityCards.concat(this.take(amount));
    };
    Deck.prototype.take = function (amount) {
        var returnCards = [];
        for (var i = 0; i < amount; i++) {
            var card = this.cards.pop();
            returnCards.push(card);
        }
        return returnCards;
    };
    Deck.prototype.getBestHand = function (playerHand) {
        var handCombos = k_combinations(playerHand.concat(this.communityCards), 5);
        var hands = _.map(handCombos, function (hand) { return new Hand(hand); });
        hands.sort(Hand.compare);
        return hands[hands.length - 1];
    };
    Deck.prototype.getAllPlayersBestHands = function (players) {
        var unfoldedPlayers = _.filter(players, function (player) {
            return !player.folded;
        });
        var maxHandValue = -1;
        var bestHand = null;
        var bestHands = [];
        for (var _i = 0, unfoldedPlayers_1 = unfoldedPlayers; _i < unfoldedPlayers_1.length; _i++) {
            var player = unfoldedPlayers_1[_i];
            var playerBestHand = this.getBestHand(player.hand);
            playerBestHand.player = player;
            bestHands.push(playerBestHand);
        }
        bestHands.sort(Hand.compare);
        bestHands.reverse();
        return bestHands;
    };
    Deck.prototype.getWinningHands = function (players) {
        var unfoldedPlayers = _.filter(players, function (player) {
            return !player.folded;
        });
        var allPlayerBestHands = this.getAllPlayersBestHands(unfoldedPlayers);
        var bestHandsReturn = [allPlayerBestHands[0]];
        for (var i = 0; i < allPlayerBestHands.length - 1; i++) {
            if (Hand.compare(allPlayerBestHands[i], allPlayerBestHands[i + 1]) == 0) {
                bestHandsReturn.push(allPlayerBestHands[i + 1]);
            }
            else {
                break;
            }
        }
        return bestHandsReturn;
    };
    return Deck;
}());
var Move;
(function (Move) {
    Move[Move["Check"] = 0] = "Check";
    Move[Move["Call"] = 1] = "Call";
    Move[Move["Raise"] = 2] = "Raise";
    Move[Move["Fold"] = 3] = "Fold";
})(Move || (Move = {}));
var Stage;
(function (Stage) {
    Stage[Stage["PreFlop"] = 0] = "PreFlop";
    Stage[Stage["Flop"] = 1] = "Flop";
    Stage[Stage["Turn"] = 2] = "Turn";
    Stage[Stage["River"] = 3] = "River";
})(Stage || (Stage = {}));
var Game = (function () {
    function Game(numPlayers) {
        var _this = this;
        this.players = [];
        this.playersInPlay = [];
        this.whoseTurn = 0;
        this.dealer = 0;
        this.smallBlind = 0;
        this.bigBlind = 0;
        this.currentBet = 0;
        this.lastBetter = 0;
        this.pot = 0;
        this.stage = Stage.PreFlop;
        this.positions = [
            { x: canvasWidth / 2, y: 500 },
            { x: canvasWidth - 325, y: 500 },
            { x: canvasWidth - 125, y: 300 },
            { x: canvasWidth - 325, y: 125 },
            { x: canvasWidth / 2, y: 125 },
            { x: 325, y: 125 },
            { x: 125, y: 300 },
            { x: 325, y: 500 },
        ];
        this.positionConfigs = {
            2: [0, 4],
            3: [0, 2, 6],
            4: [0, 2, 4, 6],
            5: [0, 2, 3, 5, 6],
            6: [0, 2, 3, 4, 5, 6],
            7: [0, 2, 3, 4, 5, 6, 7],
            8: [0, 1, 2, 3, 4, 5, 6, 7],
        };
        this.messageLog = "";
        var positionConfig = this.positionConfigs[numPlayers];
        for (var i = 0; i < numPlayers; i++) {
            var isHuman = i == 0 ? true : false;
            var name_1 = "";
            if (isHuman) {
                name_1 = "Player 1";
            }
            else {
                name_1 = "CPU " + (numPlayers - i);
            }
            var player = new Player(name_1, [], isHuman, 100, this.positions[positionConfig[i]]);
            this.players.push(player);
        }
        this.newRound(true);
        $("#check").on("click", function () {
            _this.endTurn(Move.Check, 0);
        });
        $("#call").on("click", function () {
            _this.endTurn(Move.Call, 0);
        });
        $("#raise").on("click", function () {
            var raiseAmount = Number($("#raiseAmount").val());
            if (raiseAmount < _this.getMinRaiseAmount() || raiseAmount > _this.getMaxRaiseAmount()) {
                window.alert("Invalid bet/raise amount!");
                return;
            }
            $("#raiseAmount").val("");
            _this.endTurn(Move.Raise, raiseAmount);
        });
        $("#allin").on("click", function () {
            _this.endTurn(Move.Raise, _this.getMaxRaiseAmount());
        });
        $("#fold").on("click", function () {
            _this.endTurn(Move.Fold, 0);
        });
        $("#continueNextRound").on("click", function () {
            _this.newRound(false);
        });
        $("#continueNextRound").hide();
        $("#continue").on("click", function () {
            _this.aiDecide();
        });
        $("#continue").hide();
    }
    Object.defineProperty(Game.prototype, "curPlayer", {
        get: function () {
            return this.playersInPlay[this.whoseTurn];
        },
        set: function (player) {
            this.playersInPlay[this.whoseTurn] = player;
        },
        enumerable: true,
        configurable: true
    });
    Game.prototype.playerOffsetIndex = function (startIndex, offset) {
        if (this.playersInPlay.length <= 1)
            return startIndex;
        if (_.every(this.playersInPlay, function (player) { return player.folded || player.chips <= 0; }))
            return startIndex;
        var curPlayer;
        var moveCount = 0;
        do {
            startIndex += Math.sign(offset);
            if (startIndex < 0)
                startIndex = this.playersInPlay.length - 1;
            else if (startIndex >= this.playersInPlay.length)
                startIndex = 0;
            curPlayer = this.playersInPlay[startIndex];
            if (!curPlayer.folded && curPlayer.chips > 0) {
                moveCount++;
            }
        } while (moveCount < Math.abs(offset));
        return startIndex;
    };
    Game.prototype.startTurn = function () {
        var _this = this;
        var player = this.curPlayer;
        if (this.stage == Stage.PreFlop && player == this.playersInPlay[this.bigBlind]) {
            this.currentBet -= 2;
            player.lastRaise = 0;
        }
        this.enableDOMUI(true);
        this.updateDOM();
        if (player.isHuman) {
            this.logMessage("It is your turn.");
            $("#continue").hide();
        }
        else {
            this.logMessage(player.name + "'s turn.");
            if (!debug) {
                this.enableDOMUI(false);
                setTimeout(function () { _this.aiDecide(); }, 1000);
            }
        }
        this.redraw();
    };
    Game.prototype.testFinish = function () {
        this.deck.placeCommunityCards(5);
        this.finishRoundWithShowdown();
    };
    Game.prototype.aiDecide = function () {
        var move;
        var betAmount = 0;
        var randMove = rand(1, 20);
        var betPercent = this.currentBet / (this.curPlayer.chips + 1);
        if (betPercent > 0.25) {
            if (rand(1, 4) != 1) {
                move = Move.Fold;
                this.endTurn(move, betAmount);
                return;
            }
        }
        if (randMove >= 1 && randMove < 8 && this.canRaise()) {
            move = Move.Raise;
            betAmount = rand(this.getMinRaiseAmount(), this.getMaxRaiseAmount());
            if (rand(1, 10) != 1)
                betAmount = _.clamp(betAmount, 2, 10);
        }
        else if (randMove == 8) {
            move = Move.Fold;
        }
        else {
            move = this.canCall() ? Move.Call : Move.Check;
        }
        this.endTurn(move, betAmount);
    };
    Game.prototype.endTurn = function (move, betAmount) {
        var player = this.curPlayer;
        var newLastBetter = -1;
        if (move == Move.Check) {
            this.logMessage(player.name + " checked!");
            player.lastRaise = 0;
        }
        else if (move == Move.Call) {
            var chipsPlaced = player.deductChips(this.currentBetForPlayer());
            this.pot += chipsPlaced;
            this.logMessage(player.name + " called! (Put in " + chipsPlaced + " chips.)");
            player.lastRaise = 0;
        }
        else if (move == Move.Raise) {
            var chipsPlaced = player.deductChips(this.currentBetForPlayer() + betAmount);
            if (player.chips == 0)
                this.logMessage(player.name + " went all-in! (Put in " + chipsPlaced + " chips.)");
            else if (this.currentBet == 0)
                this.logMessage(player.name + " placed a bet! (Put in " + chipsPlaced + " chips.)");
            else
                this.logMessage(player.name + " raised the bet! (Put in " + chipsPlaced + " chips.)");
            this.currentBet += betAmount;
            this.pot += chipsPlaced;
            this.lastBetter = this.whoseTurn;
            player.lastRaise = betAmount;
        }
        else if (move == Move.Fold) {
            player.folded = true;
            this.logMessage(player.name + " folded!");
            player.lastRaise = 0;
        }
        if ((move == Move.Fold || player.chips == 0) && this.lastBetter === this.whoseTurn) {
            newLastBetter = this.playerOffsetIndex(this.whoseTurn, -1);
        }
        var lastStanding = this.getLastStanding();
        if (lastStanding) {
            this.finishRound([lastStanding], lastStanding.name + " wins the round because everyone else folded, and takes pot of " + this.pot + " chips!");
            return;
        }
        if (_.every(this.playersInPlay, function (player) {
            return player.chips <= 0 || player.folded;
        })) {
            this.deck.placeAllCommunityCards();
            this.finishRoundWithShowdown();
            return;
        }
        this.whoseTurn = this.playerOffsetIndex(this.whoseTurn, -1);
        if (this.lastBetter == this.whoseTurn) {
            this.clearLastRaises();
            this.currentBet = 0;
            this.whoseTurn = this.playerOffsetIndex(this.dealer, -1);
            this.lastBetter = this.whoseTurn;
            var numPlayersWithChips = _.filter(this.playersInPlay, function (p) { return p.chips > 0 && !p.folded; }).length;
            if (numPlayersWithChips == 1) {
                this.stage = Stage.River + 1;
                this.deck.placeAllCommunityCards();
                this.finishRoundWithShowdown();
                return;
            }
            this.stage++;
            if (this.stage == Stage.Flop) {
                this.deck.placeCommunityCards(3);
                this.logMessage("Flop revealed!");
            }
            else if (this.stage == Stage.Turn) {
                this.deck.placeCommunityCards(1);
                this.logMessage("Turn revealed!");
            }
            else if (this.stage == Stage.River) {
                this.deck.placeCommunityCards(1);
                this.logMessage("River revealed!");
            }
            else {
                this.finishRoundWithShowdown();
                return;
            }
        }
        if (newLastBetter != -1) {
            this.lastBetter = newLastBetter;
        }
        this.startTurn();
    };
    Game.prototype.finishRoundWithShowdown = function () {
        this.enableDOMUI(false);
        var winningHands = this.deck.getWinningHands(this.playersInPlay);
        var winners = _.map(winningHands, function (hand) { return hand.player; });
        if (winningHands.length == 1) {
            var winMsg = winningHands[0].player.name + " wins the round with a " + winningHands[0].name + " and takes pot of " + this.pot + " chips!";
            this.finishRound(winners, winMsg);
        }
        else {
            var winMsg = "";
            for (var i = 0; i < winningHands.length; i++) {
                var hand = winningHands[i];
                winMsg += hand.player.name;
                if (i == winningHands.length - 2)
                    winMsg += " and ";
                else if (i < winningHands.length - 2)
                    winMsg += " ,";
            }
            winMsg += " split the pot, tieing with a best hand of " + winningHands[0].name + "!";
            this.finishRound(winners, winMsg);
        }
    };
    Game.prototype.clearLastRaises = function () {
        _.each(this.playersInPlay, function (player) {
            player.lastRaise = 0;
        });
    };
    Game.prototype.getLastStanding = function () {
        var lastStanding = null;
        for (var _i = 0, _a = this.playersInPlay; _i < _a.length; _i++) {
            var player = _a[_i];
            if (!player.folded) {
                if (!lastStanding) {
                    lastStanding = player;
                }
                else {
                    lastStanding = null;
                    return null;
                }
            }
        }
        return lastStanding;
    };
    Game.prototype.getLastWithChips = function () {
        var lastStanding = null;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            if (player.chips > 0) {
                if (!lastStanding) {
                    lastStanding = player;
                }
                else {
                    lastStanding = null;
                    return null;
                }
            }
        }
        return lastStanding;
    };
    Game.prototype.finishRound = function (winners, winMsg) {
        this.enableDOMUI(false);
        this.clearLastRaises();
        this.redraw(true, winners);
        this.logMessage(winMsg);
        for (var _i = 0, winners_1 = winners; _i < winners_1.length; _i++) {
            var winner = winners_1[_i];
            winner.chips += Math.floor(this.pot / winners.length);
        }
        this.pot = 0;
        var lastWithChips = this.getLastWithChips();
        if (lastWithChips) {
            this.redraw(true, winners);
            window.setTimeout(function () {
                window.alert((lastWithChips.isHuman ? "You " : lastWithChips.name) + " won the game and claimed a pot of " + winners[0].chips + " chips! Everyone else has been eliminated.");
            }, 0);
            return;
        }
        $("#continueNextRound").show();
    };
    Game.prototype.newRound = function (isFirstTime) {
        $("#continueNextRound").hide();
        if (!isFirstTime) {
            this.logMessage("======================");
            this.logMessage("A new round has begun.");
            this.logMessage("======================");
        }
        this.deck = new Deck();
        this.playersInPlay = [];
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.folded = false;
            player.hand = [];
            if (player.chips > 0) {
                player.hand = this.deck.take(2);
                this.playersInPlay.push(player);
            }
        }
        if (!isFirstTime) {
            this.dealer = this.playerOffsetIndex(this.dealer, -1);
        }
        else {
            if (this.players.length > 2)
                this.dealer = this.playerOffsetIndex(0, 3);
            else
                this.dealer = 0;
        }
        if (this.playersInPlay.length > 2) {
            this.smallBlind = this.playerOffsetIndex(this.dealer, -1);
            this.bigBlind = this.playerOffsetIndex(this.dealer, -2);
            this.whoseTurn = this.playerOffsetIndex(this.dealer, -3);
            this.lastBetter = this.whoseTurn;
        }
        else {
            this.smallBlind = this.dealer;
            this.bigBlind = this.playerOffsetIndex(this.dealer, -1);
            this.whoseTurn = this.dealer;
            this.lastBetter = this.dealer;
        }
        this.pot += this.playersInPlay[this.smallBlind].deductChips(1);
        this.pot += this.playersInPlay[this.bigBlind].deductChips(2);
        this.players[this.smallBlind].lastRaise = 1;
        this.players[this.bigBlind].lastRaise = 1;
        this.logMessage(this.players[this.smallBlind].name + " put in a small blind bet of 1 chip.");
        this.logMessage(this.players[this.bigBlind].name + " put in a big blind bet of 2 chips.");
        this.currentBet = 2;
        this.stage = Stage.PreFlop;
        this.startTurn();
    };
    Game.prototype.numNotFolded = function () {
        return _.filter(this.playersInPlay, function (player) { return !player.folded; }).length;
    };
    Game.prototype.redraw = function (endOfRound, winners) {
        var bestHands = [];
        if (endOfRound && this.numNotFolded() > 1) {
            bestHands = this.deck.getAllPlayersBestHands(this.playersInPlay);
        }
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        this.drawRoundRect(0, 0, canvasWidth, canvasHeight, 300, "#555555");
        var edgeWidth = 25;
        this.drawRoundRect(edgeWidth, edgeWidth, canvasWidth - edgeWidth, canvasHeight - edgeWidth, 300 - edgeWidth, "#5ed15e");
        var startX = 435;
        ctx.drawImage(deckImage, startX - cardDrawWidth / 2, 300 - cardDrawHeight / 2, cardDrawWidth, cardDrawHeight);
        for (var i = 0; i < 5; i++) {
            if (this.deck.communityCards[i])
                this.deck.communityCards[i].drawCard(true, startX + cardDrawWidth * (i + 1) * 1.05, 300);
            else {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(startX + 1 + (cardDrawWidth * (i + 1) * 1.05) - cardDrawWidth / 2, 300 + 1 - cardDrawHeight / 2, cardDrawWidth - 2, cardDrawHeight - 2);
                ctx.font = "normal 20px arial";
                ctx.fillStyle = "gray";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("?", startX + cardDrawWidth * (i + 1) * 1.05, 300);
            }
        }
        ctx.fillStyle = "black";
        ctx.font = "normal 20px arial";
        ctx.textAlign = "center";
        ctx.fillText("Pot: " + this.pot + " / Bet: " + this.currentBet, canvasWidth / 2, 240);
        var _loop_1 = function (i) {
            var player = this_1.players[i];
            var position = player.position;
            drawBoxMessage = function (type) {
                var text = player.name + "'s turn";
                ctx.strokeStyle = "yellow";
                if (type == 1) {
                    text = "Round Winner!";
                    ctx.strokeStyle = "blue";
                    ctx.fillStyle = "blue";
                }
                ctx.font = "italic 16px arial";
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.lineWidth = 4;
                var w = 100, h = 100;
                ctx.strokeRect(position.x - w, position.y - h - 10, w * 2, h * 1.87);
                ctx.fillText(text, position.x, position.y - h - 7);
            };
            if (!endOfRound) {
                if (this_1.curPlayer == player) {
                    drawBoxMessage(0);
                }
            }
            else {
                if (winners.indexOf(player) != -1) {
                    drawBoxMessage(1);
                }
            }
            ctx.textBaseline = "middle";
            ctx.lineWidth = 1;
            if (this_1.playersInPlay.indexOf(player) > -1) {
                if (player.isHuman) {
                    player.drawHand(true, position.x, position.y, player.folded);
                }
                else {
                    var cpuFaceUp = player.folded || endOfRound;
                    player.drawHand(cpuFaceUp, position.x, position.y, player.folded);
                }
                if (player.lastRaise > 0) {
                    ctx.font = "normal 16px arial";
                    ctx.fillStyle = "black";
                    ctx.fillText("Last bet/raise: +" + player.lastRaise, position.x, position.y + 12 + cardDrawHeight / 2);
                }
            }
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            var caption = "";
            if (player === this_1.playersInPlay[this_1.dealer])
                caption = " (Dealer)";
            else if (player === this_1.playersInPlay[this_1.smallBlind])
                caption = " (Small Blind)";
            else if (player === this_1.playersInPlay[this_1.bigBlind])
                caption = " (Big Blind)";
            ctx.font = "bold 16px arial";
            ctx.fillText(player.name + caption, position.x, position.y - 80);
            ctx.font = "normal 16px arial";
            ctx.fillText("Chips: " + player.chips, position.x, position.y - 60);
            if (this_1.playersInPlay.indexOf(player) == -1) {
                ctx.font = "bold 30px arial";
                ctx.fillStyle = "white";
                ctx.fillText("ELIMINATED", position.x, position.y);
                ctx.strokeStyle = "black";
                ctx.strokeText("ELIMINATED", position.x, position.y);
            }
            else if (player.folded) {
                ctx.font = "bold 30px arial";
                ctx.fillStyle = "white";
                ctx.fillText("FOLDED", position.x, position.y);
                ctx.strokeStyle = "black";
                ctx.strokeText("FOLDED", position.x, position.y);
            }
            else if (endOfRound && this_1.numNotFolded() > 1) {
                ctx.font = "bold 12px arial";
                ctx.textAlign = "center";
                var index = 0;
                var curHand = _.find(bestHands, function (hand) { return hand.player == player; });
                curHand.cards.reverse();
                ctx.fillText("Best hand: " + curHand.name, position.x, position.y + 9 + cardDrawHeight / 2);
                for (var _i = 0, _a = curHand.cards; _i < _a.length; _i++) {
                    var card = _a[_i];
                    ctx.fillStyle = "black";
                    ctx.fillText(card.getFormattedValue(), position.x + (index * 20) - 40, position.y + 23 + cardDrawHeight / 2);
                    if (card.suit == CardSuit.Diamonds || card.suit == CardSuit.Hearts)
                        ctx.fillStyle = "red";
                    ctx.fillText(card.getFormattedSuit(), position.x + (index * 20) - 40 + 8, position.y + 23 + cardDrawHeight / 2);
                    index++;
                }
            }
        };
        var this_1 = this, drawBoxMessage;
        for (var i = 0; i < this.players.length; i++) {
            _loop_1(i);
        }
    };
    Game.prototype.logMessage = function (message) {
        this.messageLog += message + "\n";
        $("#messageLog").text(this.messageLog);
        $("#messageLog").scrollTop($("#messageLog")[0].scrollHeight - $("#messageLog").height());
    };
    Game.prototype.enableDOMUI = function (enable) {
        $("#check").prop("disabled", !enable);
        $("#call").prop("disabled", !enable);
        $("#raise").prop("disabled", !enable);
        $("#raiseChips").prop("disabled", !enable);
        $("#allin").prop("disabled", !enable);
        $("#fold").prop("disabled", !enable);
        if (enable) {
            if (this.currentBet == 0) {
                $("#raise").html("Bet");
            }
            else {
                $("#raise").html("Raise");
            }
            $("#raiseAmount").prop("placeholder", this.getMinRaiseAmount() + "-" + this.getMaxRaiseAmount());
        }
    };
    Game.prototype.getMinRaiseAmount = function () {
        if (this.currentBet == 0)
            return 2;
        return this.playersInPlay[this.lastBetter].lastRaise;
    };
    Game.prototype.getMaxRaiseAmount = function () {
        return this.curPlayer.chips - this.currentBetForPlayer();
    };
    Game.prototype.currentBetForPlayer = function () {
        return this.currentBet - this.curPlayer.lastRaise;
    };
    Game.prototype.canRaise = function () {
        return this.curPlayer.chips > this.currentBetForPlayer();
    };
    Game.prototype.canCall = function () {
        return this.currentBetForPlayer() > 0;
    };
    Game.prototype.updateDOM = function () {
        if (!this.canCall()) {
            $("#call").prop("disabled", true);
        }
        else {
            $("#check").prop("disabled", true);
        }
        if (!this.canRaise()) {
            $("#raise").prop("disabled", true);
            $("#raiseChips").prop("disabled", true);
        }
    };
    Game.prototype.drawRoundRect = function (x0, y0, x1, y1, r, color) {
        var w = x1 - x0;
        var h = y1 - y0;
        if (r > w / 2)
            r = w / 2;
        if (r > h / 2)
            r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x1 - r, y0);
        ctx.quadraticCurveTo(x1, y0, x1, y0 + r);
        ctx.lineTo(x1, y1 - r);
        ctx.quadraticCurveTo(x1, y1, x1 - r, y1);
        ctx.lineTo(x0 + r, y1);
        ctx.quadraticCurveTo(x0, y1, x0, y1 - r);
        ctx.lineTo(x0, y0 + r);
        ctx.quadraticCurveTo(x0, y0, x0 + r, y0);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    };
    return Game;
}());
var Hand = (function () {
    function Hand(cards) {
        this.kickers = [];
        cards.sort(function (a, b) { return a.value - b.value; });
        this.cards = cards;
        if (this.isStraightFlush()) {
            this.kickers = [];
            this.name = "straight flush";
            this.value = 1000;
        }
        else if (this.isFours()) {
            this.name = "four of a kind";
            this.value = 900;
        }
        else if (this.isFullHouse()) {
            this.kickers = [];
            this.name = "full house";
            this.value = 800;
        }
        else if (this.isFlush()) {
            this.kickers = [];
            this.name = "flush";
            this.value = 700;
        }
        else if (this.isStraight()) {
            this.kickers = [];
            this.name = "straight";
            this.value = 600;
        }
        else if (this.isThrees()) {
            this.name = "three of a kind";
            this.value = 600;
        }
        else if (this.isTwoPair()) {
            this.name = "two pair";
            this.value = 500;
        }
        else if (this.isPair()) {
            this.name = "pair";
            this.value = 400;
        }
        else {
            this.kickers = this.cards.slice(0);
            this.name = "high card";
            this.value = 300;
        }
    }
    Hand.prototype.isStraightFlush = function () {
        return this.isStraight() && this.isFlush();
    };
    Hand.prototype.isFours = function () {
        return this.getModeMapping()[4] > 0;
    };
    Hand.prototype.isFullHouse = function () {
        return this.getModeMapping()[2] > 0 && this.getModeMapping()[3] > 0;
    };
    Hand.prototype.isFlush = function () {
        return (this.cards[0].suit == this.cards[1].suit &&
            this.cards[1].suit == this.cards[2].suit &&
            this.cards[2].suit == this.cards[3].suit &&
            this.cards[3].suit == this.cards[4].suit);
    };
    Hand.prototype.isStraight = function () {
        return (this.cards[0].value == this.cards[1].value - 1 &&
            this.cards[1].value == this.cards[2].value - 1 &&
            this.cards[2].value == this.cards[3].value - 1 &&
            this.cards[3].value == this.cards[4].value - 1);
    };
    Hand.prototype.isThrees = function () {
        return this.getModeMapping()[3] > 0;
    };
    Hand.prototype.isTwoPair = function () {
        return this.getModeMapping()[2] > 1;
    };
    Hand.prototype.isPair = function () {
        return this.getModeMapping()[2] > 0;
    };
    Hand.prototype.getModeMapping = function () {
        var _this = this;
        var consecutives = 1;
        var consecutives2 = 1;
        var whichConsecutive = 0;
        this.kickers = this.cards.slice(0);
        var indicesToRemove = {};
        for (var i = 0; i < this.cards.length - 1; i++) {
            if (this.cards[i].value == this.cards[i + 1].value) {
                indicesToRemove[i] = this.cards[i];
                indicesToRemove[i + 1] = this.cards[i + 1];
                if (whichConsecutive == 0) {
                    consecutives++;
                }
                else {
                    consecutives2++;
                }
            }
            else if (consecutives > 1) {
                whichConsecutive++;
            }
        }
        _.each(indicesToRemove, function (value, key) {
            _.remove(_this.kickers, function (val) { return val === value; });
        });
        var retObj = {
            2: 0,
            3: 0,
            4: 0
        };
        retObj[consecutives] = 1;
        retObj[consecutives2] = 1;
        if (consecutives == 2 && consecutives2 == 2) {
            retObj[consecutives] = 2;
        }
        return retObj;
    };
    Hand.prototype.getHighestCardValue = function () {
        return _.maxBy(this.cards, function (card) {
            return card.getValue();
        }).getValue();
    };
    Hand.compare = function (hand1, hand2) {
        if (hand1.value > hand2.value) {
            return 1;
        }
        else if (hand1.value == hand2.value) {
            var myHandCards = _.difference(hand1.cards, hand1.kickers);
            var otherHandCards = _.difference(hand2.cards, hand2.kickers);
            var comparison = Hand.compareEqualHands(myHandCards, otherHandCards);
            if (comparison == 0) {
                return Hand.compareEqualHands(hand1.kickers, hand2.kickers);
            }
            return comparison;
        }
        else {
            return -1;
        }
    };
    Hand.compareEqualHands = function (set1, set2) {
        set1.sort(function (a, b) { return b.value - a.value; });
        set2.sort(function (a, b) { return b.value - a.value; });
        for (var i = 0; i < set1.length && i < set2.length; i++) {
            if (set1[i].value > set2[i].value)
                return 1;
            else if (set1[i].value < set2[i].value)
                return -1;
        }
        return 0;
    };
    return Hand;
}());
var Player = (function () {
    function Player(name, hand, isHuman, chips, position) {
        this.name = "";
        this.folded = false;
        this.name = name;
        this.hand = hand;
        this.isHuman = isHuman;
        this.chips = chips;
        this.position = position;
        this.lastRaise = 0;
    }
    Player.prototype.deductChips = function (amount) {
        if (this.chips >= amount) {
            this.chips -= amount;
            return amount;
        }
        else {
            var retAmount = this.chips;
            this.chips = 0;
            return retAmount;
        }
    };
    Player.prototype.drawHand = function (faceUp, x, y, folded) {
        if (folded) {
            ctx.globalAlpha = 0.5;
        }
        this.hand[0].drawCard(faceUp, x - cardDrawWidth * 0.52, y);
        this.hand[1].drawCard(faceUp, x + cardDrawWidth * 0.52, y);
        ctx.globalAlpha = 1;
    };
    return Player;
}());
var debug = false;
var debugNum = 8;
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cardSpriteSheet = document.createElement("img");
cardSpriteSheet.src = "img/cards.png";
var deckImage = document.createElement("img");
deckImage.src = "img/deck.png";
var cardBackImage = document.createElement("img");
cardBackImage.src = "img/cardBack.png";
var canvasWidth = 1200;
var canvasHeight = 600;
var cardWidth = 73;
var cardHeight = 98;
var cardDrawWidth = 73 * 0.875;
var cardDrawHeight = 98 * 0.875;
var smallCardWidth = 73 * 0.575;
var smallCardHeight = 98 * 0.575;
$(window).on("load", init);
var game;
function init() {
    var num;
    if (debug) {
        num = debugNum;
    }
    else {
        var promptString = prompt("How many players? (Enter a number from 2-8)");
        num = Number(promptString);
        if (isNaN(num) || num < 1 || num > 8) {
            alert("Invalid number!");
            return;
        }
    }
    game = new Game(num);
}
function k_combinations(set, k) {
    var i, j, combs, head, tailcombs;
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i + 1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}
function rand(min, max) {
    return Math.floor((Math.random() * max) + min);
}
function testApp() {
    function createHand(cardAbbr) {
        return new Hand(createCards(cardAbbr));
    }
    function testKickers(testName, handAbbrs, expectedKickerAbbrs) {
        var hand = new Hand(createCards(handAbbrs));
        var expectedKickers = createCards(expectedKickerAbbrs);
        hand.kickers.sort(function (a, b) { return (a.value + a.suit * 0.1) - (b.value + b.suit * 0.1); });
        expectedKickers.sort(function (a, b) { return (a.value + a.suit * 0.1) - (b.value + b.suit * 0.1); });
        if (hand.kickers.length != expectedKickers.length) {
            console.error("The test " + testName + " failed!");
            console.log("Expected:");
            console.log(expectedKickers);
            console.log("Got:");
            console.log(hand.kickers);
            return;
        }
        for (var i = 0; i < hand.kickers.length; i++) {
            if (hand.kickers[i].value != expectedKickers[i].value) {
                console.error("The test " + testName + " failed!");
                console.log("Expected:");
                console.log(expectedKickers);
                console.log("Got:");
                console.log(hand.kickers);
                return;
            }
        }
    }
    function testHandComparison(testName, hand1Abbrs, hand2Abbrs, expectedCompare) {
        var hand1 = createHand(hand1Abbrs);
        var hand2 = createHand(hand2Abbrs);
        if (Hand.compare(hand1, hand2) != expectedCompare) {
            console.error("The test " + testName + " failed!");
        }
    }
    function testBestHand(testName, communityCards, playerHand, expectedBestHand) {
        var deck = new Deck();
        deck.communityCards = createCards(communityCards);
        var bestHand = deck.getBestHand(createCards(playerHand));
        var expectedBest = new Hand(createCards(expectedBestHand));
        bestHand.cards.sort(function (a, b) { return (a.value + a.suit * 0.1) - (b.value + b.suit * 0.1); });
        expectedBest.cards.sort(function (a, b) { return (a.value + a.suit * 0.1) - (b.value + b.suit * 0.1); });
        if (expectedBest.cards.length != bestHand.cards.length) {
            console.error("The test " + testName + " failed!");
            return;
        }
        for (var i = 0; i < expectedBest.cards.length; i++) {
            if (expectedBest.cards[i].value != bestHand.cards[i].value) {
                console.error("The test " + testName + " failed!");
            }
        }
    }
    function assert(testName, assertion) {
        if (!assertion) {
            console.error("The test " + testName + " failed!");
        }
    }
    function createCards(cardAbbrs) {
        var cards = [];
        for (var _i = 0, cardAbbrs_1 = cardAbbrs; _i < cardAbbrs_1.length; _i++) {
            var cardAbbr = cardAbbrs_1[_i];
            if (cardAbbr == "2C")
                cards.push(new Card(CardValue.Two, CardSuit.Clubs));
            else if (cardAbbr == "3C")
                cards.push(new Card(CardValue.Three, CardSuit.Clubs));
            else if (cardAbbr == "4C")
                cards.push(new Card(CardValue.Four, CardSuit.Clubs));
            else if (cardAbbr == "5C")
                cards.push(new Card(CardValue.Five, CardSuit.Clubs));
            else if (cardAbbr == "6C")
                cards.push(new Card(CardValue.Six, CardSuit.Clubs));
            else if (cardAbbr == "7C")
                cards.push(new Card(CardValue.Seven, CardSuit.Clubs));
            else if (cardAbbr == "8C")
                cards.push(new Card(CardValue.Eight, CardSuit.Clubs));
            else if (cardAbbr == "9C")
                cards.push(new Card(CardValue.Nine, CardSuit.Clubs));
            else if (cardAbbr == "10C")
                cards.push(new Card(CardValue.Ten, CardSuit.Clubs));
            else if (cardAbbr == "JC")
                cards.push(new Card(CardValue.Jack, CardSuit.Clubs));
            else if (cardAbbr == "QC")
                cards.push(new Card(CardValue.Queen, CardSuit.Clubs));
            else if (cardAbbr == "KC")
                cards.push(new Card(CardValue.King, CardSuit.Clubs));
            else if (cardAbbr == "AC")
                cards.push(new Card(CardValue.Ace, CardSuit.Clubs));
            else if (cardAbbr == "2S")
                cards.push(new Card(CardValue.Two, CardSuit.Spades));
            else if (cardAbbr == "3S")
                cards.push(new Card(CardValue.Three, CardSuit.Spades));
            else if (cardAbbr == "4S")
                cards.push(new Card(CardValue.Four, CardSuit.Spades));
            else if (cardAbbr == "5S")
                cards.push(new Card(CardValue.Five, CardSuit.Spades));
            else if (cardAbbr == "6S")
                cards.push(new Card(CardValue.Six, CardSuit.Spades));
            else if (cardAbbr == "7S")
                cards.push(new Card(CardValue.Seven, CardSuit.Spades));
            else if (cardAbbr == "8S")
                cards.push(new Card(CardValue.Eight, CardSuit.Spades));
            else if (cardAbbr == "9S")
                cards.push(new Card(CardValue.Nine, CardSuit.Spades));
            else if (cardAbbr == "10S")
                cards.push(new Card(CardValue.Ten, CardSuit.Spades));
            else if (cardAbbr == "JS")
                cards.push(new Card(CardValue.Jack, CardSuit.Spades));
            else if (cardAbbr == "QS")
                cards.push(new Card(CardValue.Queen, CardSuit.Spades));
            else if (cardAbbr == "KS")
                cards.push(new Card(CardValue.King, CardSuit.Spades));
            else if (cardAbbr == "AS")
                cards.push(new Card(CardValue.Ace, CardSuit.Spades));
            else if (cardAbbr == "2D")
                cards.push(new Card(CardValue.Two, CardSuit.Diamonds));
            else if (cardAbbr == "3D")
                cards.push(new Card(CardValue.Three, CardSuit.Diamonds));
            else if (cardAbbr == "4D")
                cards.push(new Card(CardValue.Four, CardSuit.Diamonds));
            else if (cardAbbr == "5D")
                cards.push(new Card(CardValue.Five, CardSuit.Diamonds));
            else if (cardAbbr == "6D")
                cards.push(new Card(CardValue.Six, CardSuit.Diamonds));
            else if (cardAbbr == "7D")
                cards.push(new Card(CardValue.Seven, CardSuit.Diamonds));
            else if (cardAbbr == "8D")
                cards.push(new Card(CardValue.Eight, CardSuit.Diamonds));
            else if (cardAbbr == "9D")
                cards.push(new Card(CardValue.Nine, CardSuit.Diamonds));
            else if (cardAbbr == "10D")
                cards.push(new Card(CardValue.Ten, CardSuit.Diamonds));
            else if (cardAbbr == "JD")
                cards.push(new Card(CardValue.Jack, CardSuit.Diamonds));
            else if (cardAbbr == "QD")
                cards.push(new Card(CardValue.Queen, CardSuit.Diamonds));
            else if (cardAbbr == "KD")
                cards.push(new Card(CardValue.King, CardSuit.Diamonds));
            else if (cardAbbr == "AD")
                cards.push(new Card(CardValue.Ace, CardSuit.Diamonds));
            else if (cardAbbr == "2H")
                cards.push(new Card(CardValue.Two, CardSuit.Hearts));
            else if (cardAbbr == "2H")
                cards.push(new Card(CardValue.Two, CardSuit.Hearts));
            else if (cardAbbr == "3H")
                cards.push(new Card(CardValue.Three, CardSuit.Hearts));
            else if (cardAbbr == "4H")
                cards.push(new Card(CardValue.Four, CardSuit.Hearts));
            else if (cardAbbr == "5H")
                cards.push(new Card(CardValue.Five, CardSuit.Hearts));
            else if (cardAbbr == "6H")
                cards.push(new Card(CardValue.Six, CardSuit.Hearts));
            else if (cardAbbr == "7H")
                cards.push(new Card(CardValue.Seven, CardSuit.Hearts));
            else if (cardAbbr == "8H")
                cards.push(new Card(CardValue.Eight, CardSuit.Hearts));
            else if (cardAbbr == "9H")
                cards.push(new Card(CardValue.Nine, CardSuit.Hearts));
            else if (cardAbbr == "10H")
                cards.push(new Card(CardValue.Ten, CardSuit.Hearts));
            else if (cardAbbr == "JH")
                cards.push(new Card(CardValue.Jack, CardSuit.Hearts));
            else if (cardAbbr == "QH")
                cards.push(new Card(CardValue.Queen, CardSuit.Hearts));
            else if (cardAbbr == "KH")
                cards.push(new Card(CardValue.King, CardSuit.Hearts));
            else if (cardAbbr == "AH")
                cards.push(new Card(CardValue.Ace, CardSuit.Clubs));
            else {
                console.log("ERROR: wrong abbreviation " + cardAbbr);
            }
        }
        return cards;
    }
}
//# sourceMappingURL=poker.js.map