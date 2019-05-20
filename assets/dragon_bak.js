class Dragon {
  constructor(pos=null, facing=null, segments=3, fire=0, water=4) {
    // Format: [seg#][x, y]
    this.pos = pos;
    // Format [dx, dy]
    this.facing = facing;
    this.segments = segments;
    this.fire = fire;
    this.water = water;
  }

  static moveDragon(pos, moveTo) {
    let newPos = [];
    newPos[0] = moveTo;
    //console.log(positions);
    for (let i = 1; i < pos.length; i++) {
      newPos.push(pos[i - 1]);
    }
    //console.log(newPositions);
    return newPos;
  }
}
