import Instruction from './Instruction';

export default class DrawInstruction extends Instruction {
  constructor({id, from, to}) {
    super({id, shapeId: `shape_${id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = from;
    this.to = to;
  }

  getFromUi() {
    if (this.from.id) {
      return `${this.from.id}'s ${this.from.point}`;
    }
    return `(${this.from.x}, ${this.from.y})`;
  }

}
