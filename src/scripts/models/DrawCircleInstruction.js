import DrawInstruction from './DrawInstruction';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    // TODO Handle that they can either set the destination to a
    // point or a radius
    this.radius = props.radius;
  }

  getRadiusJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x, y} = this.getFromJs();
      let fromPt = `{x: ${x}, y: ${y}}`;
      let toPt = this.getPointVarJs(this.to, index);
      return `utils.distanceBetweenPoints(${fromPt}, ${toPt})`;
    } else if (this.radius.id) {
      return this.getDataOrShapePropJs(this.radius, index);
    }
    return this.radius;
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.circle({\n` +
                 `id: '${this.shapeId}',\n` +
                 `index: '${index}',\n` +
                 `cx: ${x},\n` +
                 `cy: ${y},\n` +
                 `r: ${this.getRadiusJs(index)},\n` +
                 `fill: '${this.fill}',\n` +
                 `stroke: '${this.stroke}',\n` +
                 `strokeWidth: ${this.strokeWidth},\n` +
                 `isGuide: ${this.isGuide}\n` +
                 `}, '${this.shapeId}', ${index});\n`;
  }

  getRadiusUi() {
    if (this.radius.id) {
      return `${this.radius.id}`;
    }
    return this.radius;
  }


  // TODO This belongs in the UI most likely
  getUiSentence() {
    let fromUi = `Draw circle around ${this.getFromUi()}`;
    if (this.to) {
      return `${fromUi} until ${this.to.id}'s ${this.to.point}`;
    }
    return `${fromUi} with radius ${this.getRadiusUi()}`;
  }

}
