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

  // Need to be able to refer to these variables
  getShapeVariableNames() {
    return {
      center: `shape_${this.id}_center`
    };
  }

  getJsCode() {
    let varNames = this.getShapeVariableNames();
    let statements = [];
    statements.push(`${varNames.center} = ${this.from}`);
    return statements.join('\n');
  }

  getShapeFromVariables(variables) {
    // TODO Extract these from variables
    let x = this.to.x - this.from.x;
    let y = this.to.y - this.from.y;
    let r = Math.sqrt(x*x + y*y);
    return {
      type: this.shape,
      props: {
        r: r,
        cx: this.from.x,
        cy: this.from.y
      }
    };
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Draw circle around (${this.from.x}, ${this.from.y})`;
  }

}
