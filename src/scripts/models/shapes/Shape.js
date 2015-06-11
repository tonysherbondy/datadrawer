export default class Shape {
  constructor(props) {
    this.id = props.id;
    this.index = props.index;
    this.name = props.name || props.id;

    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isGuide = props.isGuide;
    this.rotation = props.rotation;
  }

  // Default is rect points
  getMagnetNames() {
    return [
      'topLeft', 'left', 'bottomLeft',
      'top', 'center', 'bottom',
      'topRight', 'right', 'bottomRight'
    ];
  }

  getShapeName() {
    if (this.index !== null && this.index !== undefined) {
      return `${this.id}_${this.index}`;
    }
    return this.id;
  }

  getMagnets() {
    return this.getMagnetNames().map(pointName => {
      let point = this.getPoint(pointName);
      return Object.assign({
        pointName,
        shapeId: this.id,
        index: this.index
      }, point);
    });
  }

  rotatePoint(point) {
    if (!this.rotation) {
      return point;
    }
    let {value, point: aboutPoint} = this.rotation;
    let {x: cx, y: cy} = aboutPoint;
    let {x, y} = point;
    let radians = (Math.PI / 180) * value;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);
    let nx = (cos * (x - cx)) - (sin * (y - cy)) + cx;
    let ny = (sin * (x - cx)) + (cos * (y - cy)) + cy;
    return {x: nx, y: ny};
  }


  getMagnetOutlineProps() {
    let props = this.getRenderProps();
    return Object.assign(props, {
      strokeWidth: 2,
      stroke: 'yellow',
      fillOpacity: 0,
      strokeOpacity: 1
    });
  }

  rotateAroundPoint(value, point) {
    this.rotation = {value, point};
  }

  getRenderProps() {
    let {stroke, strokeWidth, fill, rotation} = this;
    let transform = rotation ? `rotate(${rotation.value} ${rotation.point.x} ${rotation.point.y})` : '';
    return {
      stroke,
      strokeWidth,
      fill,
      transform,
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }
}
