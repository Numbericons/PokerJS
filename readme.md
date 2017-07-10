# About
Live demo: https://kkzz19.github.io/PokerJS/

This is a JavaScript program that plays the Texas Hold'em variant of poker. You can play against 1-7 computer opponents.

It makes heavy use of TypeScript and object-oriented programming.

# Setup
* Install typescript via npm, then run `tsc` in this directory to compile the typescript files in ts directory into poker.js. Then open index.html.

# Technologies used
* Typescript
* JQuery
* Lodash
* ES6

# Todo
* Better, more interesting AI
* Pot split logic
* Slider for AI speed
* Chip graphics and animation
* Use unit test framework
* Get a ts linter
* Fix jQuery typing file error
* Get better TS typing tools/system

# Known Bugs
* If a player's small/big blind results in zero chips against a single other opponent with positive chips, the showdown should be immediate.

# License
MIT