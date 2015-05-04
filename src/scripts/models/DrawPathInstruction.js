import DrawInstruction from './DrawInstruction';

export default class DrawPathInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.to = props.to;
    this.fill = props.fill;
    this.stroke = props.stroke;
    this.strokeWidth = props.strokeWidth;
    this.isClosed = props.isClosed;
  }

  getFromJs(index) {
    if (this.from.id) {
      return this.getPointVarJs(this.from, index);
    }
    return `{x: ${this.from.x}, y: ${this.from.y}}`;
  }

  getToJs(index) {
    // An array of points, each with a flag indicating whether
    // we draw a line or just move to that point
    let allTosJs = this.to.map(to => {
      let isLine = to.isLine;
      if (to.id) {
        let toJs = this.getPointVarJs(to, index);
        return `{x: ${toJs}.x, y: ${toJs}.y, isLine: ${isLine}},`;
      } else {
        // TODO need to be able to handle when the individual
        // dimensions of a point are data variables
        return `{x: ${to.x}, y: ${to.y}, isLine: ${isLine}},`;
      }
    });
    return ['['].concat(allTosJs, [']']).join('\n');
  }

  getJsCode(index) {
    return `utils.path({\n` +
                 `id: '${this.shapeId}',\n` +
                 `index: '${index}',\n` +
                 `from: ${this.getFromJs(index)},\n` +
                 `points: ${this.getToJs(index)},\n` +
                 `isClosed: ${this.isClosed},\n` +
                 `fill: '${this.fill}',\n` +
                 `stroke: '${this.stroke}',\n` +
                 `strokeWidth: ${this.strokeWidth},\n` +
                 `isGuide: ${this.isGuide}\n` +
                 `}, '${this.shapeId}', ${index});\n`;
  }

  getUiSentence() {
    let fromUi = `Draw path from ${this.getFromUi()}`;
    let allTosUi = this.to.map(to => {
      if (to.id) {
      return `to (to.id)`;
      }
      return `to (${to.x}, ${to.y})`;
    });
    return [fromUi].concat(allTosUi).join(' ');
  }
}
