export default class RectShape {
  constructor(props) {
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

  // Move the shape so that a particular point is set to value
  moveToPoint(name, value) {
    let {x, y, width, height} = this;
    switch (name) {
      case 'left':
        width = x + width - value.x;
        x = value.x;
        break;
      case 'right':
        width = value.x - x;
        break;
      case 'top':
        height = y + height - value.y;
        y = value.y;
        break;
      case 'bottom':
        height = value.y - y;
        break;
      case 'center':
        x = value.x - width / 2;
        y = value.y - height / 2;
        break;
      default:
        console.error('Unknown point', name);
        return;
    }
    this.setCanonicalRect({x, y, width, height});
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
