let canvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("canvas");
let ctx: CanvasRenderingContext2D = canvas.getContext("2d");

let cardSpriteSheet: HTMLImageElement = <HTMLImageElement> document.createElement("img"); 
cardSpriteSheet.src = "img/cards.png";

let deckImage: HTMLImageElement = <HTMLImageElement> document.createElement("img"); 
deckImage.src = "img/deck.jpg";

let cardBackImage: HTMLImageElement = <HTMLImageElement> document.createElement("img"); 
cardBackImage.src = "img/cardBack.jpg";

const cardWidth: number = 73;
const cardHeight: number = 98;

$(window).on("load", init);
//deckImage.onload = init;

function init() {
  let game: Game = new Game(4);
}