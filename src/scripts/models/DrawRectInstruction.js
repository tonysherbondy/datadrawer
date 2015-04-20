import DrawInstruction from './DrawInstruction';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    // TODO Handle that they can either set the destination to a
    // point or a radius
    super(props);
    this.width = props.width;
    this.height = props.height;
  }

  getJsCode(varPrefix) {
    // TODO, a draw instruction can either
    // point
    // TODO, maybe creating is useful for looping??
    let create = `${varPrefix} = {}`;
    let setup = [
      `x = ${this.cx}`,
      `y = ${this.cy}`,
      `r = ${this.radius}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {cx, cy, r} = variables;
    return {
      type: 'rect',
      props: {r, cx, cy}
    };
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Draw circle around (${this.cx}, ${this.cy}) with radius ${this.radius}`;
  }

}
