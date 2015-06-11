import Shape from './Shape';

export default class CircleShape extends Shape {
  constructor(props) {
    super(props);
    this.cx = props.cx;
    this.cy = props.cy;
    this.r = props.r;
    this.type = 'circle';
  }

  getPoint(name) {
    let point;
    switch (name) {
      case 'center':
        point = {x: this.cx, y: this.cy};
        break;
      case 'left':
        point = {x: this.cx - this.r, y: this.cy};
        break;
      case 'right':
        point = {x: this.cx + this.r, y: this.cy};
        break;
      case 'top':
        point = {x: this.cx, y: this.cy - this.r};
        break;
      case 'bottom':
        point = {x: this.cx, y: this.cy + this.r};
        break;
      default:
        return console.error('Unknown point', name);
    }
    return this.rotatePoint(point);
  }

  getMagnetNames() {
    return ['left', 'top', 'center', 'bottom', 'right'];
  }

  getScaleAdjustProps(startPoint, toPoint) {
    let anchorPoint = this.getPoint('center');
    let {pointName: name} = startPoint;
    let axis = name === 'top' || name === 'bottom' ? 'y' : 'x';
    return this.getScalePropsForAxis(startPoint, toPoint, anchorPoint, axis, 'r');
  }

  scalePropByPoint(prop, point, value) {
    // We only have radius so this is simple
    this.r *= value;
  }

  moveRelative(name, value) {
    // Doesn't matter what point we move, the distance applies
    // to the center
    this.cx += value.x;
    this.cy += value.y;
  }

  // Move the shape so that a particular point is set to value
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
    let {cx, cy, r} = this;
    return Object.assign(super.getRenderProps(), {cx, cy, r});
  }

}
