//
// TODO Do more than circle
export default class DrawInstruction {
  constructor(props) {
    this.id = props.id;
    this.operation = props.operation;
    this.shape = props.shape;
    // from, to can either be points or variables, thats it
    this.from = props.from;
    this.to = props.to;
  }

  // TODO Modify instructions will need to get shapeName from
  // draw instruction that they modify
  getShapeName() {
    return `shape_${this.id}`;
  }

  getRadiusFromPoints(from, to) {
    let x = from.x - to.x;
    let y = from.y - to.y;
    return Math.sqrt(x*x + y*y);
  }

  getJsCode(varPrefix) {
    // TODO, a draw instruction can either
    // point
    let radius = this.getRadiusFromPoints(this.from, this.to);
    // TODO, maybe creating is useful for looping??
    let create = `${varPrefix} = {}`;
    let setup = [
      `cx = ${this.from.x}`,
      `cy = ${this.from.y}`,
      `r = ${radius}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {cx, cy, r} = variables;
    return {
      type: this.shape,
      props: {r, cx, cy}
    };
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Draw circle around (${this.from.x}, ${this.from.y})`;
  }

}
