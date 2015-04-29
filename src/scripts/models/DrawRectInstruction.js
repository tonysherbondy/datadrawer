import DrawInstruction from './DrawInstruction';

export default class DrawRectInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.width = props.width;
    this.height = props.height;
  }

  getWidthJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.x - ${x}`;
    } else if (this.width.id) {
      return this.getDataOrShapePropJs(this.width, index);
    }
    return this.width;
  }

  getHeightJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {y} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.y - ${y}`;
    } else if (this.height.id) {
      return this.getDataOrShapePropJs(this.height, index);
    }
    return this.height;
  }


  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.rect({\n` +
           `x: ${x},\n` +
           `y: ${y},\n` +
           `width: ${this.getWidthJs(index)},\n` +
           `height: ${this.getHeightJs(index)},\n` +
           `fill: '${this.fill}',\n` +
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
