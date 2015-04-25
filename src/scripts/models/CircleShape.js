export default class CircleShape {
  constructor({cx, cy, r}) {
    this.cx = cx;
    this.cy = cy;
    this.r = r;
    this.type = 'circle';
  }

  getPoint(name) {
    switch (name) {
      case 'center':
        return {x: this.cx, y: this.cy};
      case 'left':
        return {x: this.cx - this.r, y: this.cy};
      case 'right':
        return {x: this.cx + this.r, y: this.cy};
      case 'top':
        return {x: this.cx, y: this.cy - this.r};
      case 'bottom':
        return {x: this.cx, y: this.cy + this.r};
      default:
        console.error('Unknown point', name);
    }
  }

  moveRelative(value) {
    // Doesn't matter what point we move, the distance applies
    // to the center
    this.cx += value.x;
    this.cy += value.y;
  }

  moveToPoint(name, value) {
    let {x, y} = value;
    switch (name) {
      case 'center':
        this.cx = x;
        this.cy = y;
        break;
      default:
        console.error('unkown point', name);
    }
  }

  getRenderProps() {
    return {
      cx: this.cx,
      cy: this.cy,
      r: this.r
    };
  }

}
