
export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  getShapeName() {
    return this.shapeId;
  }

  getVarPrefix() {
    return `variables.shapes.${this.getShapeName()}`;
  }

  getPointVarJs(pointVar) {
    return `utils.${pointVar.point}('${pointVar.id}')`;
  }

}
