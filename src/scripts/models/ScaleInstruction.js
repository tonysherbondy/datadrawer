import Instruction from './Instruction';

export default class ScaleInstruction extends Instruction {
  constructor({id, shapeId, prop, to}) {
    super({id, shapeId});
    this.prop = prop;
    this.to = to;
  }

  getToJs() {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to.id) {
      return `variables.data.${this.to.id}`;
    }
    return this.to;
  }

  getJsCode() {
    let name = `${this.getVarPrefix()}.${this.prop}`;
    return `${name} = ${name} * ${this.getToJs()};`;
  }

  getToUi() {
    if (this.to.id) {
      return this.to.id;
    }
    return this.to;
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    return `Scale ${this.shapeId} ${this.prop} by ${this.getToUi()}`;
  }
}
