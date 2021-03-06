import Expression from './Expression';
import _ from 'lodash';
import InstructionTreeNode from './InstructionTreeNode';
import {guid} from '../utils/utils';

export default class Instruction extends InstructionTreeNode {
  constructor({id, shapeId}) {
    super();
    this.id = id || guid();
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

  modifyProps(pictureActions, picture, modProps) {
    let props = this.getCloneProps();
    let nextProps = Object.assign(props, modProps);
    this.modifyInstructionWithProps(pictureActions, picture, nextProps);
  }

  isValid() {
    return true;
  }

  getShapeName(shapes, shapeId) {
    shapeId = shapeId || this.shapeId;
    return shapes[shapeId];
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

  getPointUi(shapes, point) {
    if (!point || !point.point) {
      return null;
    }
    let name = this.getShapeName(shapes, point.id);
    return `${name}'s ${point.point}`;
  }

  getShapeIds() {
    if (this.shapeId) {
      return [this.shapeId];
    } else if (this.instructions) {
      return _.flatten(this.instructions.map(i => i.getShapeIds()));
    }
    return [];
  }

}
