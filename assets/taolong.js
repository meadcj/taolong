const canvas1 = document.getElementById("layer1");
const ctx1 = canvas1.getContext("2d");
const canvas2 = document.getElementById("layer2");
const ctx2 = canvas2.getContext("2d");
const canvas3 = document.getElementById("layer3");
const ctx3 = canvas3.getContext("2d");

const humanWidth = 640;
const height = 640;
const turns = {
  H_TURN: Symbol("h_turn"),
  E_TURN: Symbol("e_turn")};
const gameStates = {
  NONE: Symbol("none"),
  NO_MOVES: Symbol("no_moves"),
  SELECT: Symbol("select"),
  SELECT_ELEM: Symbol("select_elem"),
  GAME_OVER: Symbol("game_over")};
const baGuaWidth = 320;
const baGuaCenter = {x: 640+160, y: 320};
const baGuaRadOut = 150;
const baGuaRadIn = 130;
const baGuaPoints = [[baGuaCenter.x, baGuaCenter.y - baGuaRadIn],
                     [baGuaCenter.x - baGuaRadIn * Math.sqrt(1/2),
                        baGuaCenter.y - baGuaRadIn * Math.sqrt(1/2)],
                     [baGuaCenter.x - baGuaRadIn, baGuaCenter.y],
                     [baGuaCenter.x - baGuaRadIn * Math.sqrt(1/2),
                        baGuaCenter.y + baGuaRadIn * Math.sqrt(1/2)],
                     [baGuaCenter.x, baGuaCenter.y + baGuaRadIn],
                     [baGuaCenter.x + baGuaRadIn * Math.sqrt(1/2),
                        baGuaCenter.y + baGuaRadIn * Math.sqrt(1/2)],
                     [baGuaCenter.x + baGuaRadIn, baGuaCenter.y],
                     [baGuaCenter.x + baGuaRadIn * Math.sqrt(1/2),
                        baGuaCenter.y - baGuaRadIn * Math.sqrt(1/2)]];
const stonesRad = 100;
const stonesPoints = [[baGuaCenter.x, baGuaCenter.y - stonesRad],
                     [baGuaCenter.x - stonesRad * Math.sqrt(1/2),
                       baGuaCenter.y - stonesRad * Math.sqrt(1/2)],
                     [baGuaCenter.x - stonesRad, baGuaCenter.y],
                     [baGuaCenter.x - stonesRad * Math.sqrt(1/2),
                       baGuaCenter.y + stonesRad * Math.sqrt(1/2)],
                     [baGuaCenter.x, baGuaCenter.y + stonesRad],
                     [baGuaCenter.x + stonesRad * Math.sqrt(1/2),
                       baGuaCenter.y + stonesRad * Math.sqrt(1/2)],
                     [baGuaCenter.x + stonesRad, baGuaCenter.y],
                     [baGuaCenter.x + stonesRad * Math.sqrt(1/2),
                       baGuaCenter.y - stonesRad * Math.sqrt(1/2)]];
const labelsRad = 160;
const labelsPoints = [[baGuaCenter.x, baGuaCenter.y - labelsRad],
                    [baGuaCenter.x - labelsRad * Math.sqrt(1/2),
                      baGuaCenter.y - labelsRad * Math.sqrt(1/2)],
                    [baGuaCenter.x - labelsRad, baGuaCenter.y],
                    [baGuaCenter.x - labelsRad * Math.sqrt(1/2),
                      baGuaCenter.y + labelsRad * Math.sqrt(1/2)],
                    [baGuaCenter.x, baGuaCenter.y + labelsRad],
                    [baGuaCenter.x + labelsRad * Math.sqrt(1/2),
                      baGuaCenter.y + labelsRad * Math.sqrt(1/2)],
                    [baGuaCenter.x + labelsRad, baGuaCenter.y],
                    [baGuaCenter.x + labelsRad * Math.sqrt(1/2),
                      baGuaCenter.y - labelsRad * Math.sqrt(1/2)]];

const yang = "0x967D";
const yin = "0x9670";
const heaven = "0x2630";
const earth = "0x2637";
const wind = "0x2634";
const thunder = "0x2633";
const lake = "0x2631";
const mountain = "0x2636";
const fire = "0x2632";
const water = "0x2635";
const baGuaText = [heaven, lake, fire, thunder, earth, mountain, water, wind];
const baGuaNames = ["heaven", "lake", "fire", "thunder",
                    "earth", "mountain", "water", "wind"];

let grid = []
let dragonHeaven = new Dragon([{x: 0, y: 1},
                               {x: 0, y: 0},
                               {x: 1, y: 0},
                               {x: 1, y: 1}
                               ],
                               {x: 0, y: 1}
                             );
let dragonEarth = new Dragon([{x: 6, y: 7},
                              {x: 7, y: 7},
                              {x: 7, y: 6},
                              {x: 6, y: 6}
                              ],
                              {x: -1, y: 0}
                            );
let centerFire = 8;
let centerWater = 0;
let stones = [2, 0, 2, 0, 2, 0, 2, 0];

let lastTime = null;
let timeSinceLastFrameSwap = 0;
let counter = 0;

let curTurn = turns.H_TURN;
let curDra = (curTurn === turns.H_TURN) ? dragonHeaven : dragonEarth;
let curOpp = (curTurn === turns.H_TURN) ? dragonEarth : dragonHeaven;
let curState = gameStates.NONE;
let choices = [];
let curMove = null;
let extraTurn = 0;
let elementPhase = null;


function init() {
  document.addEventListener("mousedown", mouseDown, false);
  document.addEventListener("mouseup", mouseUp, false);
  document.addEventListener("mousemove", mouseMove, false);

  // Background
  ctx1.fillStyle = "Tan";
  ctx1.fillRect(0, 0, humanWidth + baGuaWidth, height);

  // Draw board of human grid
  ctx1.strokeStyle = "Gray";
  ctx1.beginPath();
  for (let x = 19.5; x <= 620; x += 75) {
    ctx1.moveTo(x, 19.5);
    ctx1.lineTo(x, 620);
  }
  for (let y = 19.5; y <= 620; y += 75) {
    ctx1.moveTo(19.5, y);
    ctx1.lineTo(620, y);
  }
  ctx1.stroke();

  // Draw board of Ba Gua
  ctx1.strokeStyle = "Gray";
  ctx1.beginPath();
  ctx1.arc(baGuaCenter.x, baGuaCenter.y, baGuaRadOut, 0, 2 * Math.PI, false);
  ctx1.stroke();

  // Label yang/yin sides
  ctx1.font = "48px Arial";
  ctx1.textAlign = "center";
  ctx1.fillStyle = "White"
  ctx1.fillText(String.fromCharCode(yang), humanWidth + 57, 75)
  ctx1.fillStyle = "Black"
  ctx1.fillText(String.fromCharCode(yin), humanWidth + baGuaWidth - 57, height - 40)

  // empty fire/water circles
  ctx1.strokeStyle = "Red";
  for (let y = 0; y < 4; y ++) {
    ctx1.beginPath();
    ctx1.arc(baGuaCenter.x - 50, baGuaCenter.y + baGuaRadOut + 25 + y*20,
      10, 0, 2 * Math.PI, false);
      ctx1.stroke();
  }
  for (let y = 0; y < 4; y ++) {
    ctx1.beginPath();
    ctx1.arc(baGuaCenter.x - 50, baGuaCenter.y - baGuaRadOut - 25 - y*20,
      10, 0, 2 * Math.PI, false);
      ctx1.stroke();
  }
  ctx1.strokeStyle = "Blue";
  for (let y = 0; y < 4; y ++) {
    ctx1.beginPath();
    ctx1.arc(baGuaCenter.x + 50, baGuaCenter.y + baGuaRadOut + 25 + y*20,
      10, 0, 2 * Math.PI, false);
      ctx1.stroke();
  }
  for (let y = 0; y < 4; y ++) {
    ctx1.beginPath();
    ctx1.arc(baGuaCenter.x + 50, baGuaCenter.y - baGuaRadOut - 25 - y*20,
      10, 0, 2 * Math.PI, false);
      ctx1.stroke();
  }

  // write Ba Gua trigrams
  ctx1.fillStyle = "Gray";
  ctx1.strokeStyle = "Gray";
  for (let i = 0; i < 8; i++) {
    ctx1.beginPath();
    ctx1.arc(baGuaPoints[i][0], baGuaPoints[i][1], 20, 0, 2 * Math.PI, false);
    ctx1.stroke();
    //ctx1.rotate(20 * Math.PI / 180);
    ctx1.textAlign = "center";
    ctx1.font = "24px Arial";
    ctx1.fillText(String.fromCharCode(baGuaText[i]),
      baGuaPoints[i][0], baGuaPoints[i][1] + 4);
    ctx1.font = "8px Arial";
    ctx1.fillText(String(baGuaNames[i]), baGuaPoints[i][0], baGuaPoints[i][1] + 14);
  }

  initBoard();

  lastTime = window.performance.now();
}

function initBoard() {
  /* 0 = empty
     1 = heaven dragon
     2 = earth dragon

     grid[x][y]
   */
  for (let x = 0; x < 8; x++) {
    grid[x] = [];
    for (let y = 0; y < 8; y++) {grid[x][y] = 0}
  }
  for (let i = 0; i < dragonHeaven.pos.length; i++) {
    let x = dragonHeaven.pos[i].x;
    let y = dragonHeaven.pos[i].y;
    grid[x][y] = 1;
  }
  for (let i = 0; i < dragonEarth.pos.length; i++) {
    let x = dragonEarth.pos[i].x;
    let y = dragonEarth.pos[i].y;
    grid[x][y] = 2;
  }
}

function moveStones(location) {
  if (stones[location] > 0) {
    if (curState === gameStates.NO_MOVES) {
      let stonesToMove = stones[location];
      stones[location] = 0;
      for (let i = 1; i <= stonesToMove; i++) {
        stones[(location + i) % 8] += 1;
      }
      curState = gameStates.NONE;
      endTurn();
    } else if (makeMove((location + stones[location]) % 8)) {
      if (!curMove) {curMove = (location + stones[location]) % 8}
      let stonesToMove = stones[location];
      stones[location] = 0;
      for (let i = 1; i <= stonesToMove; i++) {
        stones[(location + i) % 8] += 1;
      }
    }
  }
}

function checkMove(location) {
  switch (location) {
    // Heaven
    case 0:
      // check for correct facing
      if ((curDra.facing.y !== 0)
          && (checkValid(curDra.pos[0].x, curDra.pos[0].y + 2*curDra.facing.y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x][curDra.pos[0].y + curDra.facing.y] === 0)
            && (grid[curDra.pos[0].x][curDra.pos[0].y + 2*curDra.facing.y] === 0)) {
          return true;
        }
      }
      return false;
    // Lake
    case 1:
      // check facing
      if (curDra.facing.x !== 0) {
        return true;
      } else if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
              || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
              || checkValid(curDra.pos[0].x, curDra.pos[0].y + curDra.facing.y)) {
        return true;
      } else {return false}
    // Fire
    case 2:
      if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)) {
        return true;
      }
      return false;
    // Thunder
    case 3:
      // check for correct facing
      // Must face horizontally
      if (curDra.facing.x !== 0) {
        // check for one valid move
        if ((checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
            || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1))) {
          return true;
        }
      }
      return false;
    // Earth
    case 4:
      // check for correct facing
      if ((curDra.facing.x !== 0)
          && (checkValid(curDra.pos[0].x + 2*curDra.facing.x, curDra.pos[0].y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x + curDra.facing.x][curDra.pos[0].y] === 0)
            && (grid[curDra.pos[0].x + 2*curDra.facing.x][curDra.pos[0].y] === 0)) {
          return true;
        }
      }
      return false;
    // Mountain
    case 5:
      // check facing
      if (curDra.facing.y !== 0) {
        return true;
      } else if (checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
              || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)
              || checkValid(curDra.pos[0].x + curDra.facing.x, curDra.pos[0].y)) {
        return true;
      } else {return false}
    // Water
    case 6:
      if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)) {
        return true;
      }
      return false;
    // Wind
    case 7:
      // check for correct facing
      // Must face vertically
      if (curDra.facing.y !== 0) {
        // check for one valid move
        if ((checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
            || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y))) {
          return true;
        }
      }
      return false;
  }
}

function makeMove(location) {
  switch (location) {
    // Heaven
    case 0:
      // check for correct facing
      if ((curDra.facing.y !== 0)
          && (checkValid(curDra.pos[0].x, curDra.pos[0].y + 2*curDra.facing.y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x][curDra.pos[0].y + curDra.facing.y] === 0)
            && (grid[curDra.pos[0].x][curDra.pos[0].y + 2*curDra.facing.y] === 0)) {
          curDra.moveDragon({x: curDra.pos[0].x, y: curDra.pos[0].y + curDra.facing.y});
          curDra.moveDragon({x: curDra.pos[0].x, y: curDra.pos[0].y + curDra.facing.y});
          endTurn();
          return true;
        }
      }
      return false;
    // Lake
    case 1:
      // check facing
      if (curDra.facing.x !== 0) {
        endTurn();
        return true;
      } else if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
              || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
              || checkValid(curDra.pos[0].x, curDra.pos[0].y + curDra.facing.y)) {
        // activate selection mode
        curState = gameStates.SELECT;
        // highlight valid moves for selection
        choicesAdd(curDra.pos[0].x + 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x - 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y + curDra.facing.y);
        return true;
      } else {return false}
    // Fire
    case 2:
      if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)) {
        // activate selection mode
        curState = gameStates.SELECT;
        // highlight valid moves for selection
        choicesAdd(curDra.pos[0].x + 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x - 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y - 1);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y + 1);
        elementPhase = "fire";
        return true;
      }
      return false;
    // Thunder
    case 3:
      // check for correct facing
      // Must face horizontally
      if (curDra.facing.x !== 0) {
        // check for one valid move
        if ((checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
            || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1))) {
          // activate selection mode
          curState = gameStates.SELECT;
          // highlight valid moves for selection
          choicesAdd(curDra.pos[0].x, curDra.pos[0].y - 1);
          choicesAdd(curDra.pos[0].x, curDra.pos[0].y + 1);
          (extraTurn === 0) ? extraTurn = 1 : extraTurn = 0;
          return true;
        }
      }
      return false;
    // Earth
    case 4:
      // check for correct facing
      if ((curDra.facing.x !== 0)
          && (checkValid(curDra.pos[0].x + 2*curDra.facing.x, curDra.pos[0].y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x + curDra.facing.x][curDra.pos[0].y] === 0)
            && (grid[curDra.pos[0].x + 2*curDra.facing.x][curDra.pos[0].y] === 0)) {
          curDra.moveDragon({x: curDra.pos[0].x + curDra.facing.x, y: curDra.pos[0].y});
          curDra.moveDragon({x: curDra.pos[0].x + curDra.facing.x, y: curDra.pos[0].y});
          endTurn();
          return true;
        }
      }
      return false;
    // Mountain
    case 5:
      // check facing
      if (curDra.facing.y !== 0) {
        endTurn();
        return true;
      } else if (checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
              || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)
              || checkValid(curDra.pos[0].x + curDra.facing.x, curDra.pos[0].y)) {
        // activate selection mode
        curState = gameStates.SELECT;
        // highlight valid moves for selection
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y - 1);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y + 1);
        choicesAdd(curDra.pos[0].x + curDra.facing.x, curDra.pos[0].y);
        return true;
      } else {return false}
    // Water
    case 6:
      if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)
          || checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)) {
        // activate selection mode
        curState = gameStates.SELECT;
        // highlight valid moves for selection
        choicesAdd(curDra.pos[0].x + 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x - 1, curDra.pos[0].y);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y - 1);
        choicesAdd(curDra.pos[0].x, curDra.pos[0].y + 1);
        elementPhase = "water";
        return true;
      }
      return false;
    // Wind
    case 7:
      // check for correct facing
      // Must face vertically
      if (curDra.facing.y !== 0) {
        // check for one valid move
        if ((checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)
            || checkValid(curDra.pos[0].x - 1, curDra.pos[0].y))) {
          // activate selection mode
          curState = gameStates.SELECT;
          // highlight valid moves for selection
          choicesAdd(curDra.pos[0].x + 1, curDra.pos[0].y);
          choicesAdd(curDra.pos[0].x - 1, curDra.pos[0].y);
          (extraTurn === 0) ? extraTurn = 1 : extraTurn = 0;
          return true;
        }
      }
      return false;
  }
}

function onBoard(x, y) {
  if ((x < 0) || (x > 7) || (y < 0) || (y > 7)) {
    return false;
  } else {return true}
}
function checkValid(x, y) {
  if (!onBoard(x, y)) {
    return false;
  } else if (grid[x][y] !== 0) {
    return false;
  } else {return true}
}

function choicesAdd(x, y) {
  if (checkValid(x, y)) {
    ctx3.fillStyle = "Cyan";
    ctx3.beginPath();
    ctx3.arc(gridX(x), gridY(y),
      10, 0, 2 * Math.PI, false);
    ctx3.fill();
    choices.push({x: x, y: y, facing: {x: x - curDra.pos[0].x, y: y - curDra.pos[0].y}});
  }
}

function choicesAddElem() {
  ctx3.fillStyle = (elementPhase === "fire") ? "Red" : "Blue";
  ctx3.beginPath();
  ctx3.arc(gridX(curDra.pos[0].x), gridY(curDra.pos[0].y), 10, 0, 2 * Math.PI, false);
  ctx3.arc(baGuaCenter.x, baGuaCenter.y, 10, 0, 2 * Math.PI, false);
  ctx3.fill();
}

function selection(x, y) {
  for (let i = 0; i < choices.length; i++) {
    if (((x - gridX(choices[i].x))**2 + (y - gridY(choices[i].y))**2) <= (10**2)) {
      curDra.moveDragon({x: choices[i].x, y: choices[i].y}, choices[i].facing,
        (elementPhase) ? false : true);
      choices = [];
      ctx3.clearRect(0, 0, humanWidth + baGuaWidth, height);
      if (elementPhase) {
        curState = gameStates.SELECT_ELEM;
        choicesAddElem();
      } else {
        curState = gameStates.NONE;
        endTurn();
      }
    }
  }
}

function selectionElem(x, y) {
  if (((x - gridX(curDra.pos[0].x))**2 + (y - gridY(curDra.pos[0].y))**2) <= (10**2)) {
    // Expel Element
    ctx3.clearRect(0, 0, humanWidth + baGuaWidth, height);
    let t = {two: {x: curDra.pos[0].x + curDra.facing.x,
                     y: curDra.pos[0].y + curDra.facing.y},
             one: [{x: curDra.pos[0].x + 2 * curDra.facing.x,
                     y: curDra.pos[0].y + 2 * curDra.facing.y},
                   {x: curDra.pos[0].x + curDra.facing.x + curDra.facing.y,
                     y: curDra.pos[0].y + curDra.facing.y + curDra.facing.x},
                   {x: curDra.pos[0].x + curDra.facing.x - curDra.facing.y,
                     y: curDra.pos[0].y + curDra.facing.y - curDra.facing.x}],
             zero: {x: curDra.pos[0].x + 3 * curDra.facing.x,
                     y: curDra.pos[0].y + 3 * curDra.facing.y}};

    if (onBoard(t.two.x, t.two.y) && (grid[t.two.x][t.two.y] > 0)) {
      curOpp.takeDamage(2 + curDra.expel(elementPhase));
    } else if ((onBoard(t.one[0].x, t.one[0].y) && (grid[t.one[0].x][t.one[0].y] > 0))
            || (onBoard(t.one[1].x, t.one[1].y) && (grid[t.one[1].x][t.one[1].y] > 0))
            || (onBoard(t.one[2].x, t.one[2].y) && (grid[t.one[2].x][t.one[2].y] > 0))) {
      curOpp.takeDamage(1 + curDra.expel(elementPhase));
    } else if (onBoard(t.zero.x, t.zero.y) && (grid[t.zero.x][t.zero.y] > 0)) {
      curOpp.takeDamage(0 + curDra.expel(elementPhase));
    }

    curState = gameStates.NONE;
    elementPhase = null;
    endTurn();

  } else if (((x - baGuaCenter.x)**2 + (y - baGuaCenter.y)**2) <= (10**2)) {
    // Absorb Element
    ctx3.clearRect(0, 0, humanWidth + baGuaWidth, height);
    curDra.absorb(elementPhase);
    curState = gameStates.NONE;
    elementPhase = null;
    endTurn();
  }
}

function checkIfMove() {
  for (let i = 0; i < stones.length; i++) {
    if (stones[i] > 0) {
      if (checkMove((i + stones[i]) % 8)) {return true}
    }
  }
  return false;
}

function endTurn() {
  if (curOpp.segments <= 0 || curDra.segments <= 0) {
    curState = gameStates.GAME_OVER;
  }
  if (extraTurn !== 1) {
    curDra = (curTurn === turns.H_TURN) ? dragonEarth : dragonHeaven;
    curOpp = (curTurn === turns.H_TURN) ? dragonHeaven : dragonEarth;
    curTurn = (curTurn === turns.H_TURN) ? turns.E_TURN : turns.H_TURN;
    console.log("Hseg: " + dragonHeaven.segments);
    console.log("Hw: " + dragonHeaven.water);
    console.log("Eseg: " + dragonEarth.segments);
    console.log("Ew: " + dragonEarth.water);
    extraTurn = 0;
    curMove = null;
    // check for valid moves for new dragon ...
      // need to generate a list of moves that can be triggered based on stones
      // need to do an OR test to see if at least one of those returns "true"
      // if so proceed
      // if not, send message, do 1 point of damage to dragon, and endTurn()
    if (!checkIfMove()) {
      curDra.takeDamage(1);
      console.log("No Moves");
      curState = gameStates.NO_MOVES;
    }
  } else {
    extraTurn = 2;
    curMove = null;
    if (!checkIfMove()) {
      curDra.takeDamage(1);
      console.log("No Moves");
      curState = gameStates.NO_MOVES;
    }
  }
}

function gridX(x) {
  return (20 + (75/2) + 75 * x);
}

function gridY(y) {
  return (20 + (75/2) + 75 * y);
}

function update() {
  for (let x = 0; x < 8; x++) {
    grid[x] = [];
    for (let y = 0; y < 8; y++) {grid[x][y] = 0}
  }
  for (let i = 0; i < dragonHeaven.pos.length; i++) {
    let x = dragonHeaven.pos[i].x;
    let y = dragonHeaven.pos[i].y;
    grid[x][y] = 1 + i/10;
  }
  for (let i = 0; i < dragonEarth.pos.length; i++) {
    let x = dragonEarth.pos[i].x;
    let y = dragonEarth.pos[i].y;
    grid[x][y] = 2 + i/10;
  }
}

function draw() {
  ctx2.clearRect(0, 0, humanWidth + baGuaWidth, height)
  // Game Over
  if (curState === gameStates.GAME_OVER) {
    ctx1.fillStyle = "Red";
    ctx1.fillRect(0, 0, humanWidth + baGuaWidth, height);
  }
  // Draw dragons
  ctx2.font = "32px Arial";
  ctx2.textAlign = "center";
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (Math.floor(grid[x][y]) === 1) {
        ctx2.fillStyle = "White";
        if (grid[x][y] % 1 !== 0) {
          ctx2.fillText("l", gridX(x), 10 + gridY(y));
        } else {
          ctx2.save();
          ctx2.translate(gridX(x), gridY(y));
          if (dragonHeaven.facing.x === -1) {
            ctx2.rotate(Math.PI / 2);
          } else if (dragonHeaven.facing.y === -1) {
            ctx2.rotate(Math.PI);
          } else if (dragonHeaven.facing.x === 1) {
            ctx2.rotate(-Math.PI / 2);
          } // faces down by default
          ctx2.fillText("v", 0, 0);
          ctx2.restore();
        }
      } else if (Math.floor(grid[x][y]) === 2) {
        ctx2.fillStyle = "Black";
        if (grid[x][y] % 1 !== 0) {
          ctx2.fillText("l", gridX(x), 10 + gridY(y));
        } else {
          ctx2.save();
          ctx2.translate(gridX(x), gridY(y));
          if (dragonEarth.facing.x === -1) {
            ctx2.rotate(Math.PI / 2);
          } else if (dragonEarth.facing.y === -1) {
            ctx2.rotate(Math.PI);
          } else if (dragonEarth.facing.x === 1) {
            ctx2.rotate(-Math.PI / 2);
          } // faces down by default
          ctx2.fillText("v", 0, 0);
          ctx2.restore();
        }
      }
    }
  }

  // Turn indicator
  ctx2.fillStyle = "Tan";
  if (curTurn === turns.H_TURN) {
    ctx2.fillRect(humanWidth + baGuaWidth - 80, height - 80, 50, 50);
  } else {ctx2.fillRect(humanWidth + 30, 30, 50, 50)}

  // Draw Ba Gua stones
  ctx2.font = "16px Arial";
  ctx2.textAlign = "center";
  ctx2.fillStyle = "Black";
  for (let i = 0; i < stones.length; i++) {
    ctx2.fillText(stones[i], stonesPoints[i][0], stonesPoints[i][1] + 6);
  }

  // Draw fire & water stones
  // Earth dragon - fire stones
  ctx2.fillStyle = "Red";
  for (let y = 0; y < dragonEarth.fire; y ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x - 50, baGuaCenter.y + baGuaRadOut + 25 + y*20,
      6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }
  // Heaven dragon - fire stones
  for (let y = 0; y < dragonHeaven.fire; y ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x - 50, baGuaCenter.y - baGuaRadOut - 25 - y*20,
      6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }
  // Earth dragon - water stones
  ctx2.fillStyle = "Blue";
  for (let y = 0; y < dragonEarth.water; y ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x + 50, baGuaCenter.y + baGuaRadOut + 25 + y*20,
      6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }
  // Heaven dragon - water stones
  for (let y = 0; y < dragonHeaven.water; y ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x + 50, baGuaCenter.y - baGuaRadOut - 25 - y*20,
      6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }
  // Center stones
  ctx2.fillStyle = "Red";
  for (let x = 0; x < centerFire; x ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x - 52.5 + x*15, baGuaCenter.y - 20, 6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }
  ctx2.fillStyle = "Blue";
  for (let x = 0; x < centerWater; x ++) {
    ctx2.beginPath();
    ctx2.arc(baGuaCenter.x - 52.5 + x*15, baGuaCenter.y + 20, 6, 0, 2 * Math.PI, false);
    ctx2.fill();
  }

// This is causing some issues
// It also revealed that I should probably refactor
//
// Specifically, the current setup of overlapping board movement and turn
// ending (and how this functions differently for different moves) is likely
// to lead to more trouble down the line. The checkMove logic already lays the
// groundwork for a design that properly orders move selection, movement
// enaction, and turn ending. This might also allow for unde/move cancelling.
/*
  // Ring highlight of current move
  console.log(curMove);
  if (curMove) {
    ctx2.beginPath();
    ctx2.strokeStyle = "Black";
    ctx2.lineWidth = 3;
    ctx2.arc(baGuaPoints[curMove][0], baGuaPoints[curMove][1], 20, 0, 2 * Math.PI, false);
    ctx2.stroke();
    ctx2.lineWidth = 1;
  } */
}

function step(timestamp) {
  let now = window.performance.now();
  let elapsed = now - lastTime;
  lastTime = now;
  timeSinceLastFrameSwap += elapsed;

  if (timeSinceLastFrameSwap > 30) {
    update();
    draw();
    timeSinceLastFrameSwap = 0;
  }
  window.requestAnimationFrame(step);
}

init();
window.requestAnimationFrame(step);
