import DrawInstruction from './DrawInstruction';

export default class DrawLineInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.width = props.width;
    this.height = props.height;
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
