import Shape from './Shape';
import Expression from '../Expression';

export default class RectShape extends Shape {
  constructor(props) {
    super(props);
    let {x, y, width, height} = props;
    this.setCanonicalRect({x, y, width, height});
    this.type = 'rect';
  }

  setCanonicalRect({x, y, width, height}) {
    let {x: cx, width: cwidth} = this.getCanonicalX({x, width});
    let {y: cy, height: cheight} = this.getCanonicalY({y, height});
    this.x = cx;
    this.y = cy;
    this.width = cwidth;
    this.height = cheight;
  }

  getCanonicalOrigin({o, d}) {
    if (d < 0) {
      return {o: o + d, d: -d};
    }
    return {o, d};
  }

  getCanonicalX({x, width}) {
    let {o, d} = this.getCanonicalOrigin({o: x, d: width});
    return {x: o, width: d};
  }

  getCanonicalY({y, height}) {
    let {o, d} = this.getCanonicalOrigin({o: y, d: height});
    return {y: o, height: d};
  }

  scalePropByPoint(prop, point, value) {
    // Point is the point being moved with the scale operation
    // Prop is the property to scale
    let {x, y, width, height} = this;
    if (prop === 'width') {
      switch (point) {
        case 'right':
        case 'topRight':
        case 'bottomRight':
          width *= value;
          break;
        case 'left':
        case 'topLeft':
        case 'bottomLeft':
          let w = width * value;
          x += width - w;
          width = w;
          break;
        default:
          console.error('unable to scale width with point', point);
      }
    } else {
      switch (point) {
        case 'top':
        case 'topRight':
        case 'topLeft':
          let h = height * value;
          y += height - h;
          height = h;
          break;
        case 'bottom':
        case 'bottomRight':
        case 'bottomLeft':
          height *= value;
          break;
        default:
          console.error('unable to scale height with point', point);
      }
    }
    this.setCanonicalRect({x, y, width, height});
  }

  getPoint(name) {
    let {x, y, width: w, height: h} = this;
    let point;
    switch (name) {
      case 'topLeft':
        point = {x, y};
        break;
      case 'left':
        point = {x, y: y + h / 2};
        break;
      case 'bottomLeft':
        point = {x, y: y + h};
        break;

      case 'top':
        point = {x: x + w / 2, y};
        break;
      case 'center':
        point = {x: x + w / 2, y: y + h / 2};
        break;
      case 'bottom':
        point = {x: x + w / 2, y: y + h};
        break;

      case 'topRight':
        point = {x: x + w, y};
        break;
      case 'right':
        point = {x: x + w, y: y + h / 2};
        break;
      case 'bottomRight':
        point = {x: x + w, y: y + h};
        break;

      default:
        return console.error('Unknown point', name);
    }
    return this.rotatePoint(point);
  }

  moveRelative(name, value) {
    // Doesn't matter what point we move, the distance applies
    // to the center
    this.x += value.x;
    this.y += value.y;
  }

  // Move the shape so that a particular point is set to value
  moveToPoint(name, value, isReshape) {
    let {x, y, width, height} = this;

    function left() {
      let dx = x - value.x;
      if (isReshape) {
        width += dx;
      }
      x -= dx;
    }

    function right() {
      let dx = value.x - (x + width);
      if (isReshape) {
        width += dx;
      } else {
        x += dx;
      }
    }

    function top() {
      let dy = y - value.y;
      if (isReshape) {
        height += dy;
      }
      y -= dy;
    }

    function bottom() {
      let dy = value.y - (y + height);
      if (isReshape) {
        height += dy;
      } else {
        y += dy;
      }
    }

    switch (name) {

      case 'left':
        left();
        break;
      case 'center':
        // Can't reshape from center
        x = value.x - width / 2;
        y = value.y - height / 2;
        break;
      case 'right':
        right();
        break;

      case 'topLeft':
        top();
        left();
        break;
      case 'top':
        top();
        break;
      case 'topRight':
        top();
        right();
        break;

      case 'bottomLeft':
        bottom();
        left();
        break;
      case 'bottom':
        bottom();
        break;
      case 'bottomRight':
        bottom();
        right();
        break;

      default:
        console.error('Unknown point', name);
        return;
    }
    this.setCanonicalRect({x, y, width, height});
  }

  getScaleAdjustProps(startPoint, toPoint) {
    // Output:
    // - Shape id
    // - The name of point we are scaling from
    // - The amount to scale the canonical axis from that point,
    //    e.g., for 'bottom' we would scale 'y' axis
    // Input:
    //  - Name of point to adjust.
    //  - Position from where we started the scale
    //  - Position we ended the scale
    let prop = '';
    let {pointName} = startPoint;
    let props = {
      shape: {id: this.id},
      point: pointName,
      to: new Expression(0)
    };

    function getAxisProps(opp, axis) {
      // Input:
      // - opp: point opposite the scaling point, e.g., for top point it would be bottom
      // - axis: one of ['x', 'y']
      prop = axis === 'y' ? 'height' : 'width';
      let toV = toPoint[axis];
      let oppV = opp[axis];
      let startV = startPoint[axis];
      // Ratio of (current length on axis) to (starting length on axis), rounded to two digits
      let roundTo = Math.round((toV - oppV) / (startV - oppV) * 100) / 100;
      // Only support positive scales
      if (roundTo < 0) {
        roundTo = 0;
      }
      return {
        prop,
        to: new Expression(roundTo)
      };
    }

    switch (pointName) {
      case 'top':
        props = Object.assign(props, getAxisProps(this.getPoint('bottom'), 'y'));
        break;
      case 'bottom':
        props = Object.assign(props, getAxisProps(this.getPoint('top'), 'y'));
        break;
      case 'left':
        props = Object.assign(props, getAxisProps(this.getPoint('right'), 'x'));
        break;
      case 'right':
        props = Object.assign(props, getAxisProps(this.getPoint('left'), 'x'));
        break;
      default:
        console.warn(`Don't know how to scale from ${pointName}`);
        return null;
    }
    return props;
  }

  getRenderProps() {
    let {x, y, width, height} = this;
    return Object.assign(super.getRenderProps(), {x, y, width, height});
  }

}
