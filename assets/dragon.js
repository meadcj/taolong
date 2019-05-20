class Dragon {
  constructor(pos=null, facing=null, segments=3, fire=0, water=4) {
    // Format: [seg#]{x, y}
    this.pos = pos;
    // Format [dx, dy]
    this.facing = facing;
    this.segments = segments;
    this.fire = fire;
    this.water = water;
  }

  moveDragon(moveTo, facing=this.facing, bite=true) {
    let newPos = [];
    newPos[0] = moveTo;
    //console.log(positions);
    for (let i = 1; i < this.pos.length; i++) {
      newPos.push(this.pos[i - 1]);
    }
    //console.log(newPositions);
    this.pos = newPos;
    this.facing = facing;
    console.log("biteflag: " + bite);
    if (bite === true) {this.bite()}
  }


  bite() {
    if (onBoard(this.pos[0].x + this.facing.x, this.pos[0].y + this.facing.y)
        && (grid[this.pos[0].x + this.facing.x][this.pos[0].y + this.facing.y] > 0)) {
      console.log("BITE");
      curOpp.takeDamage(1);
    } else {console.log("nobite")}
  }

  takeDamage(dam) {
    if (dam > 4) {
      while (dam > 0) {
        if (dam % 4 !== 0) {
          console.log("Damage: " + dam);
          console.log("Remainder: " + dam % 4);
          this.takeDamage(dam % 4);
          dam -= dam % 4;
        } else if (Math.floor(dam / 4) > 0) {
          this.takeDamage(4);
          dam -= 4;
        }
      } // Implicitly the rest are "dam <= 4"
    } else {
      if (dam > this.water) {
        centerWater += this.water;
        dam -= this.water;
        this.water = 0;
        this.loseSeg();
      }
      centerWater += dam;
      this.water -= dam;
      if (this.water === 0) {this.loseSeg()}
    }
  }

/*

    if ((dam > 0) && (dam <= this.water)) {
      this.water -= dam;
      centerWater += dam;
      if (this.water === 0) {this.loseSeg()}
    } else if ((dam > 0) && (dam > this.water)) {
      if (dam <= 4) {

      }
      while (dam > 0) {
        if (dam % 4 !== 0) {
          console.log("Damage: " + dam);
          console.log("Remainder: " + dam % 4);
          this.takeDamage(dam % 4);
          dam -= dam % 4;
        } else if (Math.floor(dam / 4) > 0) {
          this.takeDamage(4);
          dam -= 4;
        }
      }
    }

/*
    this.water -= dam; - 6
    centerWater += dam; 12
    if (this.water <= 0) {
      let newDam = -this.water; 6
      centerWater -= 4; 8
      this.water += 4; -2
      this.segments -= 1;
      this.pos.pop();
      if (newDam > 0) {this.takeDamage(newDam)}
    } */


  loseSeg() {
    this.pos.pop();
    centerWater -= 4;
    this.water = 4;
    this.segments -= 1;
  }

  absorb(elem) {
    // Check if bar is full
    if (this[elem] >= 4) {
      return;
    } else {
      this[elem] += 1;
      (elem === "fire") ? centerFire -= 1 : centerWater -= 1;
    }
  }

  expell(elem) {
    if (elem === "fire") {
      let dam = this.fire;
      centerFire += this.fire;
      this.fire = 0;
      return dam;
    } else {return centerWater}
  }

}
