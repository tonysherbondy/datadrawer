import Instruction from './Instruction';

export default class DrawInstruction extends Instruction {
  constructor({id, from, to, isGuide}) {
    super({id, shapeId: `shape_${id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = from;
    this.to = to;
    this.isGuide = isGuide;
  }

  getFromUi() {
    if (this.from.id) {
      return `${this.from.id}'s ${this.from.point}`;
    }
    return `(${this.from.x}, ${this.from.y})`;
  }

}
