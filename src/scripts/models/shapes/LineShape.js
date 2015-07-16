import Shape from './Shape';

export default class LineShape extends Shape {
  constructor(props) {
    super(props);
    this.x1 = props.x1;
    this.y1 = props.y1;
    this.x2 = props.x2;
    this.y2 = props.y2;
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

  getMagnetNames() {
    return ['left', 'center', 'right'];
  }

  getPoint(name) {
    let {x1, y1, x2, y2} = this;
    let point;
    switch (name) {
      case 'left':
        point = {x: x1, y: y1};
        break;
      case 'center':
        point = {x: (x1 + x2) / 2, y: (y1 + y2) / 2};
        break;
      case 'right':
        point = {x: x2, y: y2};
        break;
      default:
        return console.error('Unknown point', name);
    }
    return this.rotatePoint(point);
  }

  // Move the shape relatively by this value
  moveRelative(name, value, isReshape, axis) {
    let {x, y} = value;
    let {x1, x2, y1, y2} = this;
    if (isReshape) {
      switch (name) {
        case 'left': {
          x1 += x;
          y1 += y;
          break;
        }
        case 'center': {
          x1 += x;
          y1 += y;
          x2 += x;
          y2 += y;
          break;
        }
        case 'right': {
          x2 += x;
          y2 += y;
          break;
        }
        default: {
          console.error(`Don't know point`, name);
        }
      }
    } else {
      x1 += x;
      y1 += y;
      x2 += x;
      y2 += y;
    }
    if (axis === 'x') {
      y1 = this.y1;
      y2 = this.y2;
    } else if (axis === 'y') {
      x1 = this.x1;
      x2 = this.x2;
    }
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }

  // Move the shape so that a particular point is set to value
  moveToPoint(name, value, isReshape, axis) {
    let {x, y} = value;
    let dx, dy;
    switch (name) {
      case 'left':
        dx = x - this.x1;
        dy = y - this.y1;
        break;
      case 'center':
        dx = x - (this.x1 / 2 + this.x2 / 2);
        dy = y - (this.y1 / 2 + this.y2 / 2);
        break;
      case 'right':
        dx = x - this.x2;
        dy = y - this.y2;
        break;
      default:
        console.error('Unknown point', name);
        return;
    }
    this.moveRelative(name, {x: dx, y: dy}, isReshape, axis);
  }

  getRenderProps() {
    let {x1, y1, x2, y2} = this;
    return Object.assign(super.getRenderProps(), {x1, y1, x2, y2});
  }

  // TODO - Maybe should be measuremnt prop now?
  getProp(name) {
    if (name === 'angle') {
      let dx = this.x2 - this.x1;
      let dy = this.y2 - this.y1;
      // atan is between -90 and 90, when x is negative
      // we want the other hemi-circle
      let flip = dx < 0 ? 180 : 0;
      return Math.atan(dy / dx) * 180 / Math.PI + flip;
    } else if (name === 'dy') {
      return this.y2 - this.y1;
    } else if (name === 'dx') {
      return this.x2 - this.x1;
    }
    console.error(`Don't know how to get prop`, name);
  }

  getMeasurementProps() {
    return ['dy', 'dx'];
  }

}
