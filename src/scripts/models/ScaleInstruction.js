import Instruction from './Instruction';

export default class ScaleInstruction extends Instruction {
  constructor({id, shapeId, prop, to}) {
    super({id, shapeId});
    this.prop = prop;
    this.to = to;
  }

  getToJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to.id) {
      return `utils.getData('${this.to.id}', ${index})`;
    }
    return this.to;
  }

  getJsCode(index) {
    let name = `${this.getVarPrefix(index)}.${this.prop}`;
    return `${name} = ${name} * ${this.getToJs(index)};`;
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
