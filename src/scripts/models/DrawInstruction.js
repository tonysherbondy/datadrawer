import Instruction from './Instruction';

export default class DrawInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: `shape_${props.id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = props.from;
    this.to = props.to;
    this.isGuide = !!props.isGuide;
    this.strokeWidth = props.strokeWidth || 1;
    this.stroke = props.stroke || 'black';
    this.fill = props.fill || 'rgba(0, 0, 0, 0.2)';
  }

  getFromUi() {
    if (this.from.id) {
      return `${this.from.id}'s ${this.from.point}`;
    }
    return `(${this.from.x}, ${this.from.y})`;
  }

}
