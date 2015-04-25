
export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  getShapeName(shapeId, index) {
    if (isFinite(index)) {
      return `${shapeId}_${index}`;
    }
    return shapeId;
  }

  getVarName(shapeId, index) {
    return `variables.shapes.${this.getShapeName(shapeId, index)}`;
  }

  getPointVarJs(pointVar, index) {
    let varName = this.getVarName(pointVar.id, pointVar.isLoop ? index : undefined);
    return `${varName}.getPoint('${pointVar.point}')`;
  }

}
