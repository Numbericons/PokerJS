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
    }
    Card.prototype.drawCard = function (faceUp, x, y) {
        if (faceUp) {
            var xOffset = (this.value - 2) * cardWidth;
            var yOffset = void 0;
            if (this.suit == CardSuit.Spades)
                yOffset = 0;
            if (this.suit == CardSuit.Hearts)
                yOffset = 1;
            if (this.suit == CardSuit.Clubs)
                yOffset = 2;
            if (this.suit == CardSuit.Diamonds)
                yOffset = 3;
            yOffset *= cardHeight;
            ctx.drawImage(cardSpriteSheet, xOffset, yOffset, cardWidth, cardHeight, x - cardWidth * 0.5, y - cardHeight * 0.5, cardWidth, cardHeight);
        }
        else {
            ctx.drawImage(cardBackImage, x - cardWidth * 0.5, y - cardWidth * 0.5, cardWidth, cardHeight);
        }
    };
    return Card;
}());
var Deck = (function () {
    function Deck() {
        this.cards = [];
        for (var i = 2; i <= 14; i++) {
            for (var j = 0; j <= 3; j++) {
                var card = new Card(i, j);
                this.cards.push(card);
            }
        }
        this.shuffle();
    }
    Deck.prototype.shuffle = function () {
        this.cards = _.shuffle(this.cards);
    };
    Deck.prototype.take = function (amount) {
        var returnCards = [];
        for (var i = 0; i < amount; i++) {
            var card = this.cards.pop();
            returnCards.push(card);
        }
        return returnCards;
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
        this.whoseTurn = 0;
        this.dealer = 0;
        this.currentBet = 0;
        this.lastBetter = 0;
        this.pot = 0;
        this.stage = Stage.PreFlop;
        this.communityCards = [];
        this.positions = [
            { x: 500, y: 500 },
            { x: 700, y: 500 },
            { x: 900, y: 300 },
            { x: 700, y: 100 },
            { x: 500, y: 100 },
            { x: 300, y: 100 },
            { x: 100, y: 300 },
            { x: 300, y: 500 },
        ];
        this.positionConfigs = {
            2: [0, 4],
            3: [0, 2, 6],
            4: [0, 2, 4, 6],
            5: [0, 2, 3, 5, 6],
            6: [0, 2, 3, 4, 5, 6],
            7: [0, 2, 3, 4, 5, 6, 7],
            8: [0, 1, 2, 3, 4, 5, 6, 7]
        };
        this.messageLog = "";
        for (var i = 0; i < numPlayers; i++) {
            var isHuman = i == 0 ? true : false;
            var name_1 = "";
            if (isHuman) {
                name_1 = "Player 1";
            }
            else {
                name_1 = "CPU " + (numPlayers - i);
            }
            var player = new Player(name_1, [], isHuman, 100);
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
            $("#raiseAmount").val("");
            _this.endTurn(Move.Raise, raiseAmount);
        });
        $("#fold").on("click", function () {
            _this.endTurn(Move.Fold, 0);
        });
        $("#continueNextRound").on("click", function () {
            _this.newRound(false);
        });
        $("#continueNextRound").hide();
    }
    Game.prototype.playerOffsetIndex = function (startIndex, offset) {
        var curPlayer;
        var moveCount = 0;
        do {
            startIndex += Math.sign(offset);
            if (startIndex < 0)
                startIndex = this.players.length - 1;
            curPlayer = this.players[startIndex];
            if (!curPlayer.folded) {
                moveCount++;
            }
        } while (moveCount < Math.abs(offset));
        return startIndex;
    };
    Game.prototype.startTurn = function () {
        var player = this.players[this.whoseTurn];
        this.logMessage(player.name + "'s turn.");
        if (player.isHuman) {
            this.enableDOMUI(true);
        }
        else {
        }
        this.redraw();
    };
    Game.prototype.endTurn = function (move, betAmount) {
        var player = this.players[this.whoseTurn];
        if (move == Move.Check) {
            this.logMessage(player.name + " checked!");
        }
        else if (move == Move.Call) {
            player.chips -= this.currentBet;
            this.pot += this.currentBet;
            this.logMessage(player.name + " called! (Put in " + this.currentBet + " chips.)");
        }
        else if (move == Move.Raise) {
            player.chips -= this.currentBet;
            player.chips -= betAmount;
            this.currentBet += betAmount;
            this.pot += this.currentBet;
            this.lastBetter = this.whoseTurn;
            this.logMessage(player.name + " raised! (Put in " + this.currentBet + " chips.)");
        }
        else if (move == Move.Fold) {
            player.folded = true;
            this.logMessage(player.name + " folded!");
        }
        var lastStanding = this.getLastStanding();
        if (lastStanding) {
            this.finishRound(lastStanding, "");
            return;
        }
        this.whoseTurn = this.playerOffsetIndex(this.whoseTurn, -1);
        if (this.lastBetter == this.whoseTurn) {
            this.stage++;
            this.currentBet = 0;
            this.whoseTurn = this.playerOffsetIndex(this.dealer, -1);
            this.lastBetter = this.whoseTurn;
            if (this.stage == Stage.Flop) {
                this.communityCards = this.communityCards.concat(this.deck.take(3));
                this.logMessage("Flop revealed!");
            }
            else if (this.stage == Stage.Turn) {
                this.communityCards = this.communityCards.concat(this.deck.take(1));
                this.logMessage("Turn revealed!");
            }
            else if (this.stage == Stage.River) {
                this.communityCards = this.communityCards.concat(this.deck.take(1));
                this.logMessage("River revealed!");
            }
            else {
                this.finishRound(this.players[0], "with a pair ");
                return;
            }
        }
        if (move == Move.Fold) {
            this.lastBetter = this.playerOffsetIndex(this.whoseTurn, -1);
        }
        this.startTurn();
    };
    Game.prototype.getLastStanding = function () {
        var lastStanding = null;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
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
    Game.prototype.finishRound = function (winner, winMsg) {
        var lastWithChips = this.getLastWithChips();
        if (lastWithChips) {
            window.alert(lastWithChips.name + " wins the game! Everyone else has been eliminated.");
            return;
        }
        var message = winner.name + " wins the round " + winMsg + "and takes pot of " + this.pot + " chips!";
        this.logMessage(message);
        winner.chips += this.pot;
        this.pot = 0;
        this.redraw(true);
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
        if (!isFirstTime) {
            this.dealer = this.playerOffsetIndex(this.dealer, -1);
        }
        else {
            this.dealer = this.playerOffsetIndex(0, 3);
        }
        this.whoseTurn = this.playerOffsetIndex(this.dealer, -3);
        this.lastBetter = this.whoseTurn;
        for (var _i = 0, _a = this.players; _i < _a.length; _i++) {
            var player = _a[_i];
            player.folded = false;
            player.hand = this.deck.take(2);
        }
        this.currentBet = 0;
        this.lastBetter = 0;
        this.stage = Stage.PreFlop;
        this.communityCards = [];
        this.startTurn();
    };
    Game.prototype.redraw = function (showAllCards) {
        ctx.clearRect(0, 0, 1000, 600);
        this.drawRoundRect(50, 50, 1150, 550, 75, "#5ed15e");
        ctx.drawImage(deckImage, 400, 300 - cardHeight / 2, cardWidth, cardHeight);
        for (var i = 0; i < this.communityCards.length; i++) {
            this.communityCards[i].drawCard(true, 400 + cardWidth * (i + 1) * 1.05, 300 - cardHeight / 2);
        }
        ctx.fillStyle = "black";
        ctx.font = "normal 20px arial";
        ctx.textAlign = "center";
        ctx.fillText("Pot: " + this.pot, 450, 225);
        var positionConfig = this.positionConfigs[this.players.length];
        for (var i = 0; i < this.players.length; i++) {
            var player = this.players[i];
            var position = this.positions[positionConfig[i]];
            if (player.isHuman) {
                player.drawHand(true, position.x, position.y, player.folded);
            }
            else {
                var cpuFaceUp = player.folded || showAllCards;
                player.drawHand(cpuFaceUp, position.x, position.y, player.folded);
            }
            ctx.fillStyle = "black";
            ctx.font = "normal 20px arial";
            var caption = "";
            if (i === this.dealer)
                caption = " (Dealer)";
            else if (i === this.playerOffsetIndex(this.dealer, -1))
                caption = " (Small Blind)";
            else if (i === this.playerOffsetIndex(this.dealer, -2))
                caption = " (Big Blind)";
            ctx.fillText(player.name + caption, position.x, position.y - 80);
            ctx.fillText("Chips: " + player.chips, position.x, position.y - 60);
            if (player.folded) {
                ctx.font = "bold 30px arial";
                ctx.fillStyle = "white";
                ctx.fillText("FOLDED", position.x, position.y);
                ctx.strokeStyle = "black";
                ctx.strokeText("FOLDED", position.x, position.y);
            }
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
        $("#fold").prop("disabled", !enable);
    };
    Game.prototype.updateDOM = function () {
        $("#currentBet").text(this.currentBet);
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
var Player = (function () {
    function Player(name, hand, isHuman, chips) {
        this.name = "";
        this.folded = false;
        this.name = name;
        this.hand = hand;
        this.isHuman = isHuman;
        this.chips = chips;
    }
    Player.prototype.drawHand = function (faceUp, x, y, folded) {
        if (folded) {
            ctx.globalAlpha = 0.5;
        }
        this.hand[0].drawCard(faceUp, x - 50, y);
        this.hand[1].drawCard(faceUp, x + 50, y);
        ctx.globalAlpha = 1;
    };
    return Player;
}());
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var cardSpriteSheet = document.createElement("img");
cardSpriteSheet.src = "img/cards.png";
var deckImage = document.createElement("img");
deckImage.src = "img/deck.jpg";
var cardBackImage = document.createElement("img");
cardBackImage.src = "img/cardBack.jpg";
var cardWidth = 73;
var cardHeight = 98;
$(window).on("load", init);
function init() {
    var game = new Game(4);
}
//# sourceMappingURL=poker.js.map