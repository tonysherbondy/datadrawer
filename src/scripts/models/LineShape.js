export default class LineShape {
  constructor({x1, y1, x2, y2, isGuide}) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.isGuide = isGuide;
    this.type = 'line';
  }

  scalePropByPoint(prop, point, value) {
    // Point is the point being moved with the scale operation
    // Prop is the property to scale
    if (prop === 'x2') {
      let dx = this.x2 - this.x1;
      this.x2 = this.x1 + dx * value;
    } else {
      let dy = this.y2 - this.y1;
      this.y2 = this.y1 + dy * value;
    }
  }

  getPoint(name) {
    let {x1, y1, x2, y2} = this;
    switch (name) {
      case 'left':
        return {x: x1, y: y1};
      case 'center':
        return {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
      case 'right':
        return {x: x2, y: y2};
      default:
        console.error('Unknown point', name);
    }
  }

  movePoint(name, value) {
    let {x, y} = value;
    switch (name) {
      case 'left':
        this.x1 += x;
        this.y1 += y;
        break;
      case 'center':
        this.x1 += x;
        this.y1 += y;
        this.x2 += x;
        this.y2 += y;
        break;
      case 'right':
        this.x2 += x;
        this.y2 += y;
        break;
      default:
        console.error('Unknown point', name);
    }
  }

  getRenderProps() {
    let {x1, y1, x2, y2} = this;
    return {
      x1,
      y1,
      x2,
      y2,
      stroke: 'black',
      strokeWidth: 2,

      // TODO there should definitely be a base shape for this
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
