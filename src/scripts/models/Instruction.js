
export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  getShapeName(index) {
    if (isFinite(index)) {
      return `${this.shapeId}_${index}`;
    }
    return this.shapeId;
  }

  getVarPrefix(index) {
    return `variables.shapes.${this.getShapeName(index)}`;
  }

  getPointVarJs(pointVar) {
    return `utils.${pointVar.point}('${pointVar.id}')`;
  }

}
