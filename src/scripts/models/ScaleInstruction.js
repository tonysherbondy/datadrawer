import Instruction from './Instruction';

export default class ScaleInstruction extends Instruction {
  constructor({id, shape, point, prop, to}) {
    super({id, shapeId: shape.id});
    this.point = point;
    this.prop = prop;
    this.to = to;
    this.shape = shape;
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
    let paramsJs = `'${this.prop}', '${this.point}', ${this.getToJs(index)}`;
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.scalePropByPoint(${paramsJs});`;
  }

  getToUi() {
    if (this.to.id) {
      return this.to.id;
    }
    return this.to;
  }

  // TODO This belongs in the UI most likely
  getUiSentence() {
    return `Scale ${this.shape.id} ${this.prop} by ${this.getToUi()}`;
  }
}
