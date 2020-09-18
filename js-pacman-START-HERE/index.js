import { LEVEL, OBJECT_TYPE } from "./setup";
import { randomMovement } from "./ghostMoves";

//classes
import GameBoard from "./GameBoard";
import Pacman from "./Pacman";
import Ghost from "./Ghost";

//Dom elements

const gameGrid = document.querySelector("#game");
const scoreTable = document.querySelector("#score");
const startButton = document.querySelector("#start-button");

//Game Constants
const POWER_PILL_TIME = 10000; //ms
const GLOBAL_SPEED = 80; //ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

//initial setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

function gameOver(pacman, grid) {
  document.removeEventListener("keydown", (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist)
  );

  gameBoard.showGameStatus(gameWin);

  //end the game loop
  clearInterval(timer);

  startButton.classList.remove("hide");
}

function checkCollision(pacman, ghosts) {
  //which ghost calculate collided with
  const collidedGhost = ghosts.find((ghost) => pacman.pos === ghost.pos);

  if (collidedGhost) {
    //if pacman eated powerpill, remove ghost
    if (pacman.powerPill) {
      gameBoard.removeObject(collidedGhost.pos, [
        OBJECT_TYPE.GHOST,
        OBJECT_TYPE.SCARED,
        collidedGhost.name,
      ]);

      //reset the pos on the ghost and add score
      collidedGhost.pos = collidedGhost.startPos;
      score += 100;
    } else {
      gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);

      gameBoard.rotateDiv(pacman.pos, 0);
      gameOver(pacman, gameGrid);
    }
  }
}

function gameLoop(pacman, ghosts) {
  gameBoard.moveCharacter(pacman);
  //check collision after pacman movement
  checkCollision(pacman, ghosts);

  ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
  //check collision after ghost movement
  checkCollision(pacman, ghosts);

  //Check if pacman eats a dot
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);

    gameBoard.dotCount--;
    score += 10;
  }
  //check if pacman eats a powerpill
  if (gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
    gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);

    pacman.powerPill = true;

    score += 50;

    clearTimeout(powerPillTimer);
    powerPillTimer = setTimeout(
      () => (pacman.powerPill = false),
      POWER_PILL_TIME
    );
  }

  //change ghost scare mode depending on powerpill
  if (pacman.powerPill != powerPillActive) {
    powerPillActive = pacman.powerPill;
    ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
  }

  //check if all dots has been eaten
  if (gameBoard.dotCount === 0) {
    gameWin = true;
    gameOver(pacman, ghosts);
  }

  //Show Scores
  scoreTable.innerHTML = score;
}

function startGame() {
  //reset some variables

  gameWin = false;
  powerPillActive = false;
  score = 0;

  startButton.classList.add("hide");

  gameBoard.createGrid(LEVEL);

  const pacman = new Pacman(2, 287);

  gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
  document.addEventListener("keydown", (e) =>
    pacman.handleKeyInput(e, gameBoard.objectExist)
  );

  const ghosts = [
    new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
    new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
    new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
    new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE),
  ];

  timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

//Initialize game
startButton.addEventListener("click", startGame);
