export default class Shape {
  constructor(props) {
    this.name = props.name;
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
