import DrawInstruction from './DrawInstruction';

export default class DrawRectInstruction extends DrawInstruction {
  constructor(props) {
    // TODO Handle that they can either set the destination to a
    // point or a radius
    super(props);
    this.width = props.width;
    this.height = props.height;
  }

  getTopLeftJs() {
    if (this.from.id) {
      let fromPt = this.getPointVarJs(this.from);
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

  getWidthJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x} = this.getTopLeftJs();
      let toPt = this.getPointVarJs(this.to);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.x - ${x}`;
    } else if (this.width.id) {
      return `utils.getData('${this.width.id}', ${index})`;
    }
    return this.width;
  }

  getHeightJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {y} = this.getTopLeftJs();
      let toPt = this.getPointVarJs(this.to);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.y - ${y}`;
    } else if (this.height.id) {
      return `utils.getData('${this.height.id}', ${index})`;
    }
    return this.height;
  }


  getJsCode(index) {
    let varPrefix = this.getVarPrefix(index);
    let create = `${varPrefix} = {}`;
    let {x, y} = this.getTopLeftJs();
    let setup = [
      'type = "rect"',
      `x = ${x}`,
      `y = ${y}`,
      `width = ${this.getWidthJs(index)}`,
      `height = ${this.getHeightJs(index)}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
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
