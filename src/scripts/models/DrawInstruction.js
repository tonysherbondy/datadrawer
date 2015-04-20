
export default class DrawInstruction {
  constructor(props) {
    this.id = props.id;
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = props.from;
    this.to = props.to;
  }

  // TODO Modify instructions will need to get shapeName from
  // draw instruction that they modify
  getShapeName() {
    return `shape_${this.id}`;
  }

  getFromUi() {
    if (this.from.id) {
      return `${this.from.id}`;
    }
    return `(${this.from.x}, ${this.from.y})`;
  }

}
