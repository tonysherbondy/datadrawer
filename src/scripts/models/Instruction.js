
export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  // TODO Can probably convert this to shape name now instead of object
  getShapeVarName(shape, index) {
    let shapeId = shape ? shape.id : this.shapeId;
    return `utils.getShapeVariable('${shapeId}', ${index})`;
  }

  getPointVarJs(pointVar, index) {
    let varName = this.getShapeVarName(pointVar, index);
    return `${varName}.getPoint('${pointVar.point}')`;
  }

  getDataOrShapePropJs(variable, index) {
    if (variable.prop) {
      // Shape property
      let varName = this.getShapeVarName(variable, index);
      return `${varName}.getProp('${variable.prop}')`;
    } else {
      // Data variable
      return `utils.getData('${variable.id}', ${index})`;
    }
  }

}
