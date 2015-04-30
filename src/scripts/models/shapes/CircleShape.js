import Shape from './Shape';

export default class CircleShape extends Shape {
  constructor(props) {
    super(props);
    this.cx = props.cx;
    this.cy = props.cy;
    this.r = props.r;
    // TODO - should probably be in a base shape class
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isGuide = props.isGuide;
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
    let {cx, cy, r, stroke, strokeWidth, fill} = this;
    return {
      cx, cy, r,

      // TODO there should definitely be a base shape for this
      stroke, strokeWidth, fill,
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
