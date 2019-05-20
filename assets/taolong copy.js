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
  SELECT: Symbol("select")};
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
let curState = gameStates.NONE;
let choices = [];
let extraPhase = false;


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
    if (makeMove((location + stones[location]) % 8)) {
      let stonesToMove = stones[location];
      stones[location] = 0;
      for (let i = 1; i <= stonesToMove; i++) {
        stones[(location + i) % 8] += 1;
      }
    }
  }
}

function makeMove(location) {
  switch (location) {
    case 0:
      console.log(curDra.facing);
      // check for correct facing
      if ((curDra.facing.y !== 0)
          && (checkValid(curDra.pos[0].x, curDra.pos[0].y + 2*curDra.facing.y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x][curDra.pos[0].y + curDra.facing.y] === 0)
            && (grid[curDra.pos[0].x][curDra.pos[0].y + 2*curDra.facing.y] === 0)) {
          console.log(curDra.pos);
          curDra.pos = Dragon.moveDragon(curDra.pos,
            {x: curDra.pos[0].x, y: curDra.pos[0].y + curDra.facing.y});
          console.log(curDra.pos);
          curDra.pos = Dragon.moveDragon(curDra.pos,
            {x: curDra.pos[0].x, y: curDra.pos[0].y + curDra.facing.y});
          console.log(curDra.pos);
          endTurn();
          return true;
        }
      }
      return false;
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
/*        if (checkValid(curDra.pos[0].x + 1, curDra.pos[0].y)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x + 1), gridY(curDra.pos[0].y),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x + 1, y: curDra.pos[0].y,
            facing: {x: 1, y: 0}});
        }
        if (checkValid(curDra.pos[0].x - 1, curDra.pos[0].y)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x - 1), gridY(curDra.pos[0].y),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x - 1, y: curDra.pos[0].y,
            facing: {x: -1, y: 0}});
        }
        if (checkValid(curDra.pos[0].x, curDra.pos[0].y + curDra.facing.y)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x), gridY(curDra.pos[0].y + curDra.facing.y),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x, y: curDra.pos[0].y + curDra.facing.y,
            facing: curDra.facing});
        } */
        return true;
      }
    case 2:
      return false;
    case 3:
      return false;
    case 4:
      // check for correct facing
      if ((curDra.facing.x !== 0)
          && (checkValid(curDra.pos[0].x + 2*curDra.facing.x, curDra.pos[0].y))) {
        // check for collisions on path
        if ((grid[curDra.pos[0].x + curDra.facing.x][curDra.pos[0].y] === 0)
            && (grid[curDra.pos[0].x + 2*curDra.facing.x][curDra.pos[0].y] === 0)) {
          console.log(curDra.pos);
          console.log(curDra.facing);
          curDra.pos = Dragon.moveDragon(curDra.pos,
            {x: curDra.pos[0].x + curDra.facing.x, y: curDra.pos[0].y});
          console.log(curDra.pos);
          curDra.pos = Dragon.moveDragon(curDra.pos,
            {x: curDra.pos[0].x + curDra.facing.x, y: curDra.pos[0].y});
          console.log(curDra.pos);
          endTurn();
          return true;
        }
      }
      return false;
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
/*        if (checkValid(curDra.pos[0].x, curDra.pos[0].y - 1)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x), gridY(curDra.pos[0].y - 1),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x, y: curDra.pos[0].y - 1,
            facing: {x: 0, y: -1}});
        }
        if (checkValid(curDra.pos[0].x, curDra.pos[0].y + 1)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x), gridY(curDra.pos[0].y + 1),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x, y: curDra.pos[0].y + 1,
            facing: {x: 0, y: 1}});
        }
        if (checkValid(curDra.pos[0].x + curDra.facing.x, curDra.pos[0].y)) {
          ctx3.fillStyle = "Cyan";
          ctx3.beginPath();
          ctx3.arc(gridX(curDra.pos[0].x + curDra.facing.x), gridY(curDra.pos[0].y),
            10, 0, 2 * Math.PI, false);
          ctx3.fill();
          choices.push({x: curDra.pos[0].x + curDra.facing.x, y: curDra.pos[0].y,
            facing: curDra.facing});
        } */
        return true;
      }
    case 6:
      return false;
    case 7:
      return false;
  }
}

function checkValid(x, y) {
  if ((x < 0) || (x > 7) || (y < 0) || (y > 7)) {
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

function bite() {

}

function selection(x, y) {
  for (let i = 0; i < choices.length; i++) {
    if (((x - gridX(choices[i].x))**2 + (y - gridY(choices[i].y))**2) <= (10**2)) {
      curDra.pos = Dragon.moveDragon(curDra.pos, {x: choices[i].x, y: choices[i].y});
      curDra.facing = choices[i].facing;
      console.log(curDra.facing);
      choices = [];
      ctx3.clearRect(0, 0, humanWidth + baGuaWidth, height)
      curState = gameStates.NONE;
      endTurn();
      console.log(curDra);
    }
  }
}

function endTurn() {
  if (extraPhase === false) {
    curDra = (curTurn === turns.H_TURN) ? dragonEarth : dragonHeaven;
    curTurn = (curTurn === turns.H_TURN) ? turns.E_TURN : turns.H_TURN;
  } else {extraPhase = false}
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
    grid[x][y] = 1;
  }
  for (let i = 0; i < dragonEarth.pos.length; i++) {
    let x = dragonEarth.pos[i].x;
    let y = dragonEarth.pos[i].y;
    grid[x][y] = 2;
  }
}

function draw() {
  ctx2.clearRect(0, 0, humanWidth + baGuaWidth, height)
  // Draw dragons
  ctx2.font = "32px Arial";
  ctx2.textAlign = "center";
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        ctx2.fillStyle = "White";
        ctx2.fillText(grid[x][y], gridX(x), 10 + gridY(y));
      } else if (grid[x][y] === 2) {
        ctx2.fillStyle = "Black";
        ctx2.fillText(grid[x][y], gridX(x), 10 + gridY(y));
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
