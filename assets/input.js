
function mouseDown() {
  if (curState === gameStates.NONE || curState === gameStates.NO_MOVES) {
    if (((event.clientX - baGuaPoints[0][0])**2 +
        (event.clientY - baGuaPoints[0][1])**2) <= (20**2)) {
      console.log("box0");
      moveStones(0);
    } else if (((event.clientX - baGuaPoints[1][0])**2 +
        (event.clientY - baGuaPoints[1][1])**2) <= (20**2)) {
      console.log("box1");
      moveStones(1);
    } else if (((event.clientX - baGuaPoints[2][0])**2 +
        (event.clientY - baGuaPoints[2][1])**2) <= (20**2)) {
      console.log("box2");
      moveStones(2);
    } else if (((event.clientX - baGuaPoints[3][0])**2 +
        (event.clientY - baGuaPoints[3][1])**2) <= (20**2)) {
      console.log("box3");
      moveStones(3);
    } else if (((event.clientX - baGuaPoints[4][0])**2 +
        (event.clientY - baGuaPoints[4][1])**2) <= (20**2)) {
      console.log("box4");
      moveStones(4);
    } else if (((event.clientX - baGuaPoints[5][0])**2 +
        (event.clientY - baGuaPoints[5][1])**2) <= (20**2)) {
      console.log("box5");
      moveStones(5);
    } else if (((event.clientX - baGuaPoints[6][0])**2 +
        (event.clientY - baGuaPoints[6][1])**2) <= (20**2)) {
      console.log("box6");
      moveStones(6);
    } else if (((event.clientX - baGuaPoints[7][0])**2 +
        (event.clientY - baGuaPoints[7][1])**2) <= (20**2)) {
      console.log("box7");
      moveStones(7);
    }
  } else if (curState === gameStates.SELECT) {
    selection(event.clientX, event.clientY);
  } else if (curState === gameStates.SELECT_ELEM) {
    selectionElem(event.clientX, event.clientY);
  }
}

function mouseUp() {

}

function mouseMove() {

}
