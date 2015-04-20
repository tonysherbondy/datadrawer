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
      return {
        x: `${this.from.id}().x`,
        y: `${this.from.id}().y`,
      };
    }
    return {
      x: this.from.x,
      y: this.from.y,
    };
  }

  getWidthJs() {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x} = this.getTopLeftJs();
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${this.to.id}().x - ${x}`;
    } else if (this.width.id) {
      return `variables.data.${this.width.id}`;
    }
    return this.width;
  }

  getHeightJs() {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {y} = this.getTopLeftJs();
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${this.to.id}().y - ${y}`;
    } else if (this.height.id) {
      return `variables.data.${this.height.id}`;
    }
    return this.height;
  }


  getJsCode(varPrefix) {
    let create = `${varPrefix} = {}`;
    let {x, y} = this.getTopLeftJs();
    let setup = [
      `x = ${x}`,
      `y = ${y}`,
      `width = ${this.getWidthJs()}`,
      `height = ${this.getHeightJs()}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {x, y, width, height} = variables;
    return {
      type: 'rect',
      props: {x, y, width, height}
    };
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
      return `${fromUi} until ${this.to.id}`;
    }
    return `${fromUi}, ${this.getWidthUi()} horizontally, ${this.getHeightUi()} vertically`;
  }

}
