import DrawInstruction from './DrawInstruction';

export default class DrawLineInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.width = props.width;
    this.height = props.height;
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

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.line({\n` +
           `x1: ${x},\n` +
           `y1: ${y},\n` +
           `x2: ${this.getToXJs(index)},\n` +
           `y2: ${this.getToYJs(index)},\n` +
           `stroke: '${this.stroke}',\n` +
           `strokeWidth: ${this.strokeWidth},\n` +
           `isGuide: ${this.isGuide}\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getWidthUi() {
    if (this.width.id) {
      return `${this.width.id}`;
    }
    return this.width;
  }

  getHeightUi() {
    if (this.height.id) {
      return `${this.height.id}`;
    }
    return this.height;
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    let fromUi = `Draw rect from ${this.getFromUi()}`;
    if (this.to) {
      return `${fromUi} until ${this.to.id}'s ${this.to.point}`;
    }
    return `${fromUi}, ${this.getWidthUi()} horizontally, ${this.getHeightUi()} vertically`;
  }

}
