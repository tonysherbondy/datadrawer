import DrawLineInstruction from './DrawLineInstruction';

export default class DrawTextInstruction extends DrawLineInstruction {
  constructor(props) {
    super(props);
    this.text = props.text;
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.text({\n` +
           `text: '${this.text}',\n` +
           `x1: ${x},\n` +
           `y1: ${y},\n` +
           `x2: ${this.getToXJs(index)},\n` +
           `y2: ${this.getToYJs(index)},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    let fromUi = `Draw text from ${this.getFromUi()}`;
    if (this.to) {
      return `${fromUi} until ${this.to.id}'s ${this.to.point}`;
    }
    return `${fromUi}, ${this.getWidthUi()} horizontally, ${this.getHeightUi()} vertically`;
  }

}
