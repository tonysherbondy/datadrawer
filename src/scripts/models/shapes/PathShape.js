import Shape from './Shape';

export default class PathShape extends Shape {
  constructor(props) {
    super(props);
    this.from = props.from;
    this.points = props.points;
    this.isClosed = props.isClosed;
    this.type = 'path';
  }

  getD() {
    let pointsD = this.points.map(pt => {
      if (pt.isLine) {
        return `l ${pt.x} ${pt.y}`;
      } else if (pt.isArc) {
        let arcRadius = pt.arcRadius || 1;
        return `a ${arcRadius} ${arcRadius} 0 0 1 ${pt.x} ${pt.y}`;
      }
      return `m ${pt.x} ${pt.y}`;
    });
    let fromD = `M ${this.from.x} ${this.from.y}`;
    let closedD = this.isClosed ? 'Z' : '';
    return [fromD, ...pointsD, closedD].join(' ');
  }

  getRenderProps() {
    let d = this.getD();
    return Object.assign(super.getRenderProps(), {d});
  }

  getMagnetNames() {
    return ['from'].concat(this.points.map((p,i) => `point_${i}`));
  }

  getAbsPointPosition(index) {
    if (index < 0 || index >= this.points.length) {
      console.error('Bad index for path position');
    }
    let prevPt = index === 0 ? this.from : this.getAbsPointPosition(index - 1);
    let {x, y} = this.points[index];
    return {
      x: prevPt.x + x,
      y: prevPt.y + y
    };
  }

  getPoint(name) {
    // Point names are either from or point_index
    let point;
    if (name === 'from') {
      point = this.from;
    } else if (name === 'last') {
      let index = this.points.length - 1;
      point = this.getAbsPointPosition(index);
    } else {
      let index = parseInt(name.split('_')[1], 10);
      point = this.getAbsPointPosition(index);
    }
    return this.rotatePoint(point);
  }

  scalePropByPoint(prop, point, value) {
    // TODO Handle more than just 'from' point and all edge mapping to this
    this.points.forEach(pt => {
      // All points are relative
      pt.x *= value;
      pt.y *= value;
    });
  }

  extendPathWithRelativePoint(point) {
    this.points.push(point);
  }

  extendPathWithAbsolutePoint(point) {
    let lastPoint = this.getPoint('last');
    let x = point.x - lastPoint.x;
    let y = point.y - lastPoint.y;
    // Need to keep the props that might be passed on the point
    let relativePoint = Object.assign(point, {x, y});
    this.extendPathWithRelativePoint(relativePoint);
  }

  moveRelative(value) {
    // From is only absolute point
    this.from.x += value.x;
    this.from.y += value.y;
  }

  // Move the shape so that a particular point is set to value
  moveToPoint(name, value) {
    // Point names are either from or point_index
    if (name === 'from') {
      // All other points are relative so we just need to move from
      this.from = value;
    } else {
      console.error('Only support moving path from point');
    }
  }

}
