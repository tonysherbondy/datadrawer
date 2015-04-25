export default class RectShape {
  constructor({x, y, width, height}) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = 'rect';
  }

  getPoint(name) {
    let {x, y, width: w, height: h} = this;
    switch (name) {
      case 'leftTop':
        return {x, y};
      case 'left':
        return {x, y: y + h / 2};
      case 'leftBottom':
        return {x, y: y + h};

      case 'top':
        return {x: x + w / 2, y};
      case 'center':
        return {x: x + w / 2, y: y + h / 2};
      case 'bottom':
        return {x: x + w / 2, y: y + h};

      case 'rightTop':
        return {x: x + w, y};
      case 'right':
        return {x: x + w, y: y + h / 2};
      case 'rightBottom':
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
      height: this.height
    };
  }

}
