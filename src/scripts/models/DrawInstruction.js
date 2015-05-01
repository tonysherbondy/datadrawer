import Instruction from './Instruction';

export default class DrawInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: `shape_${props.id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = props.from;
    this.to = props.to;
    this.isGuide = !!props.isGuide;
    this.strokeWidth = props.strokeWidth || 1;
    this.stroke = props.stroke || 'black';
    this.fill = props.fill || 'rgba(0, 0, 0, 0.2)';
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {from, to, isGuide, strokeWidth, stroke, fill} = this;
    return Object.assign(props, {to, from, isGuide, stroke,
                         strokeWidth, fill});
  }

  isValid() {
    return !!this.from;
  }

  getFromJs(index) {
    if (this.from.id) {
      let fromPt = this.getPointVarJs(this.from, index);
      return {
        x: `${fromPt}.x`,
        y: `${fromPt}.y`
      };
    }
    return {
      x: this.from.x,
      y: this.from.y
    };
  }

  getToXJs(index) {
    let {x} = this.getFromJs(index);
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.x`;
    } else if (this.width.id) {
      return `utils.getData('${this.width.id}', ${index}) + ${x}`;
    }
    return `${this.width} + ${x}`;
  }

  getToYJs(index) {
    let {y} = this.getFromJs(index);
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.y`;
    } else if (this.height.id) {
      return `utils.getData('${this.height.id}', ${index}) + ${y}`;
    }
    return `${this.height} + ${y}`;
  }


  getFromUi() {
    if (this.from.id) {
      return `${this.from.id}'s ${this.from.point}`;
    }
    return `(${this.from.x}, ${this.from.y})`;
  }

}
