import DrawInstruction from './DrawInstruction';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    // TODO Handle that they can either set the destination to a
    // point or a radius
    this.radius = props.radius;
  }

  getJsCode(varPrefix) {
    // TODO, a draw instruction can either
    // point
    // TODO, maybe creating is useful for looping??
    let create = `${varPrefix} = {}`;
    let setup = [
      `cx = ${this.from.x}`,
      `cy = ${this.from.y}`,
      `r = ${this.radius}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {cx, cy, r} = variables;
    return {
      type: 'circle',
      props: {r, cx, cy}
    };
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Draw circle around (${this.from.x}, ${this.from.y}) with radius ${this.radius}`;
  }

}
