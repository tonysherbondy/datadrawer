export default class RectShape {
  constructor({x, y, width, height, isGuide}) {
    let {x: cx, width: cwidth} = this.getCanonicalX({x, width});
    let {y: cy, height: cheight} = this.getCanonicalY({y, height});
    this.x = cx;
    this.y = cy;
    this.width = cwidth;
    this.height = cheight;
    this.isGuide = isGuide;
    this.type = 'rect';
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
    if (prop === 'width') {
      switch (point) {
        case 'right':
        case 'topRight':
        case 'bottomRight':
          this.width *= value;
          break;
        case 'left':
        case 'topLeft':
        case 'bottomLeft':
          let w = this.width * value;
          this.x += this.width - w;
          this.width = w;
          break;
        default:
          console.error('unable to scale width with point', point);
      }
    } else {
      switch (point) {
        case 'top':
        case 'topRight':
        case 'topLeft':
          let h = this.height * value;
          this.y += this.height - h;
          this.height = h;
          break;
        case 'bottom':
        case 'bottomRight':
        case 'bottomLeft':
          this.height *= value;
          break;
        default:
          console.error('unable to scale height with point', point);
      }
    }
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

  movePoint(name, value) {
    // Doesn't matter what point we move, the distance applies
    // to the center
    this.x += value.x;
    this.y += value.y;
  }

  getRenderProps() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,

      // TODO there should definitely be a base shape for this
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
