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

  // Need to be able to refer to these variables
  getShapeVariableNames(varPrefix) {
    let prefix = `${varPrefix}.${this.getVarName()}`;
    return {
      center: `${prefix}.center`,
      r: `${prefix}.r`
    };
  }

  getJsCode(varPrefix) {
    // TODO, need to check if to is a point or variable or variable per point
    let create = `${varPrefix} = {from: {}, to: {}}`;
    let setup = [
      `from.x = ${this.from.x}`,
      `from.y = ${this.from.y}`,
      `to.x = ${this.from.x}`,
      `to.y = ${this.from.y}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {from, to} = variables;
    let r = Math.sqrt(to.x*to.x + to.y*to.y);
    return {
      type: this.shape,
      props: {
        r: r,
        cx: from.x,
        cy: from.y
      }
    };
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Draw circle around (${this.from.x}, ${this.from.y})`;
  }

}
