import Expression from './Expression';

export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  getCloneProps() {
    return {id: this.id, shapeId: this.shapeId};
  }

  isValid() {
    return true;
  }

  getShapeName() {
    return this.shapeId;
  }

  // TODO Can probably convert this to shape name now instead of object
  getShapeVarName(shape, index) {
    if (!shape) {
      shape = {id: this.shapeId};
    }
    return Expression.getShapeVarName(shape, index);
  }

  getDataOrShapePropJs(variable, index) {
    return Expression.getDataOrShapePropJs(variable, index);
  }

  getPointVarJs(pointVar, index) {
    let varName = this.getShapeVarName(pointVar, index);
    return `${varName}.getPoint('${pointVar.point}')`;
  }

}
