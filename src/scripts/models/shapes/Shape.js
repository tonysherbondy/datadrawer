import Expression from '../Expression';
import DataVariable from '../DataVariable';
import Matrix from '../../utils/Matrix';

export default class Shape {
  constructor(props) {
    this.id = props.id;
    this.index = props.index;
    this.name = props.name || props.id;

    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isGuide = props.isGuide;

    // Is a matrix
    this.rotation = new Matrix(props.rotation);
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

  // TODO - Expand this to handle stroke etc.
  adjustColor(color) {
    this.fill = color;
  }

  rotatePoint(point) {
    if (this.rotation.isIdentity()) {
      return point;
    }
    let rotatedPoint = this.rotation.vecMultiply([point.x, point.y, 1]);
    return {x: rotatedPoint[0], y: rotatedPoint[1]};
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
    // Adds rotation to the current rotation matrix
    let rotation = Matrix.rotationAroundPoint(value, [point.x, point.y, 1]);
    this.rotation = rotation.multiply(this.rotation);
  }

  getTransform() {
    return this.rotation.getSvgTransform();
  }

  // Apply some rules to colors to make things easier
  getValidColor(color) {
    let isRGB = color.slice(0, 3) === 'rgb';
    if (isRGB) {
      // Make sure the first three numbers are rounded
      let rColor = [0, 0, 0, 1];
      let r = /-?\d+(?:\.\d*)?/g;
      let c;
      let i = 0;
      while((c = r.exec(color)) !== null && i < 4) {
        if (i === 3) {
          rColor[i] = c;
        } else {
          rColor[i] = Math.round(+c);
        }
        i++;
      }
      return `rgba(${rColor.join(',')})`;
    } else {
      return color;
    }
  }

  getRenderProps() {
    let {stroke, strokeWidth, fill} = this;
    fill = this.getValidColor(fill);
    stroke = this.getValidColor(stroke);
    let transform = this.getTransform();
    return {
      stroke,
      strokeWidth,
      fill,
      transform,
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

  getProp(name) {
    console.error(`Don't know how to get prop`, name);
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
