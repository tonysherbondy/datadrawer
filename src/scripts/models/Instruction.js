import Expression from './Expression';

export default class Instruction {
  constructor({id, shapeId}) {
    this.id = id;
    this.shapeId = shapeId;
  }

  getPropsJs(index) {
    return [
      `id: '${this.shapeId}'`,
      `index: ${this.getIndexString(index)}`
    ];
  }

  getCloneProps() {
    return {id: this.id, shapeId: this.shapeId};
  }

  isValid() {
    return true;
  }

  getShapeName(shapes, shapeId) {
    shapeId = shapeId || this.shapeId;
    let shape = shapes[shapeId];
    if (!shape) {
      // That means we have a looped shape
      shape = shapes[`${shapeId}_0`];
    }
    return shape.name;
  }

  getIndexString(index) {
    return isFinite(index) ? `'${index}'` : undefined;
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
