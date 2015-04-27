export default class PathShape {
  constructor(props) {
    this.from = props.from;
    this.points = props.points;
    this.isClosed = props.isClosed;

    // TODO - should probably be in a base shape class
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isGuide = props.isGuide;
    this.transform = '';
    this.type = 'path';
  }

  getD() {
    let pointsD = this.points.map(pt => {
      if (pt.isLine) {
      return `l ${pt.x} ${pt.y}`;
      }
      return `m ${pt.x} ${pt.y}`;
    });
    let fromD = `M ${this.from.x} ${this.from.y}`;
    let closedD = this.isClosed ? 'Z' : '';
    return [fromD, ...pointsD, closedD].join(' ');
  }

  getRenderProps() {
    let {stroke, strokeWidth, fill, transform} = this;
    return {
      d: this.getD(),

      // TODO there should definitely be a base shape for this
      stroke, strokeWidth, fill, transform,
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

  getPoint(name) {
    // Point names are either from or point_index
    if (name === 'from') {
      return this.from;
    } else {
      let index = parseInt(name.split('_')[1], 10);
      let point = this.points[index];
      return {
        x: this.from.x + point.x,
        y: this.from.y + point.y
      };
    }
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

  rotateAroundPoint(value, point) {
    this.transform = `rotate(${value} ${point.x} ${point.y})`;
  }
}
