
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

  getShapeVarName(shape, index) {
    if (!shape) {
      shape = {id: this.shapeId, isLoop: isFinite(index)};
    }
    index = shape.isLoop ? index : undefined;
    return `variables.shapes.${this.getShapeName(shape.id, index)}`;
  }

  getPointVarJs(pointVar, index) {
    let varName = this.getShapeVarName(pointVar, index);
    return `${varName}.getPoint('${pointVar.point}')`;
  }

}
