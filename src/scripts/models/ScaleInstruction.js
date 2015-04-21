import Instruction from './Instruction';

export default class ScaleInstruction extends Instruction {
  constructor({id, shapeId, prop, to}) {
    super({id, shapeId});
    this.prop = prop;
    this.to = to;
  }

  getJsCode() {
    let name = `${this.getVarPrefix()}.${this.prop}`;
    return `${name} = ${name} * ${this.to};`;
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Scale ${this.shapeId} ${this.prop} by ${this.to}`;
  }
}
