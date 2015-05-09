import Shape from './Shape';
import Expression from '../Expression';

export default class RectShape extends Shape {
  constructor(props) {
    super(props);
    let {x, y, width, height} = props;
    this.setCanonicalRect({x, y, width, height});
    // TODO - should probably be in a base shape class
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isGuide = props.isGuide;
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
    switch (name) {
      case 'topLeft':
        return {x, y};
      case 'left':
        return {x, y: y + h / 2};
      case 'bottomLeft':
        return {x, y: y + h};

      case 'top':
        return {x: x + w / 2, y};
      case 'center':
        return {x: x + w / 2, y: y + h / 2};
      case 'bottom':
        return {x: x + w / 2, y: y + h};

      case 'topRight':
        return {x: x + w, y};
      case 'right':
        return {x: x + w, y: y + h / 2};
      case 'bottomRight':
        return {x: x + w, y: y + h};

      default:
        console.error('Unknown point', name);
    }
  }

  getMagnets() {
    let names = [
      'topLeft', 'left', 'bottomLeft',
      'top', 'center', 'bottom',
      'topRight', 'right', 'bottomRight'
    ];
    return names.map(pointName => {
      return Object.assign({
        pointName,
        shapeName: this.id,
        index: this.index
      }, this.getPoint(pointName));
    });
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

  getAdjustProps(mode, startPoint, toPoint) {
    // Input:
    //  - mode of adjust (scale or move)
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
      prop = axis === 'y' ? 'height' : 'width';
      let toV = toPoint[axis];
      let oppV = opp[axis];
      let startV = startPoint[axis];
      let roundTo = Math.round((toV - oppV) / (startV - oppV) * 100) / 100;
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
    let {x, y, width, height, stroke, strokeWidth, fill} = this;
    return {
      x, y, width, height,

      // TODO there should definitely be a base shape for this
      stroke, strokeWidth, fill,
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
