import Expression from '../Expression';
import DataVariable from '../DataVariable';

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

  getScalePropsForAxis(startPoint, toPoint, anchorPoint, axis, prop) {
    // Input:
    // - startPoint: Point where the scale operation started
    // - toPoint: Point where the scale operation ends
    // - anchorPoint: point to anchor the scale from
    //      e.g., if we are scaling from the top point, then the anchor would be
    //            bottom for rect or center for circle
    // - axis: one of ['x', 'y']
    // Output:
    // - props: property for scale that has
    // -- shapeId
    // -- point: name of point we are scaling
    // -- prop: property to scale, e.g., 'height', 'width', 'radius'
    // -- to: Expression describing how much to scale by (range [0, 1])
    let toV = toPoint[axis];
    let anchorV = anchorPoint[axis];
    let startV = startPoint[axis];
    // Ratio of (current length on axis) to (starting length on axis), rounded to two digits
    let roundTo = Math.round((toV - anchorV) / (startV - anchorV) * 100) / 100;
    // Only support positive scales
    if (roundTo < 0) {
      roundTo = 0;
    }
    return {
      prop,
      shape: {id: this.id},
      point: startPoint.pointName,
      to: new Expression(roundTo)
    };
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

  getMeasurementProps() {
    return [];
  }

  getMeasurementVariables() {
    let {id} = this;
    return this.getMeasurementProps().map(prop => new DataVariable({
      id,
      prop,
      isReadOnly: true,
      definition: new Expression({id, prop})
    }));
  }
}
