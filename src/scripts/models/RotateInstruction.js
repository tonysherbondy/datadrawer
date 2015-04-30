import Instruction from './Instruction';

export default class RotateInstruction extends Instruction {
  constructor({id, shape, point, to}) {
    super({id, shapeId: shape.id});
    this.point = point;
    this.to = to;
    this.shape = shape;
  }

  getToJs(index) {
    // The to is either a dataVariable or hardcoded value
    if (this.to.id) {
      return this.getDataOrShapePropJs(this.to, index);
    }
    return this.to;
  }

  getPointJs(index) {
    if (this.point.id) {
      // When setting to a variable we will move the point = to the variable
      return this.getPointVarJs(this.point, index);
    } else {
      // Otherwise, we will move the point relative to the current position
      let getVarJs = v => {
        if (v.id) {
          return `utils.getData('${v.id}', ${index})`;
        }
        return v;
      };
      // Each dimension can either be a constant or a data variable
      let xJs = getVarJs(this.point.x);
      let yJs = getVarJs(this.point.y);
      return `{x: ${xJs}, y: ${yJs}}`;
    }
  }

  getJsCode(index) {
    let paramsJs = `${this.getToJs(index)}, ${this.getPointJs(index)}`;
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.rotateAroundPoint(${paramsJs});`;
  }

  getToUi() {
    if (this.to.id) {
      return this.to.id;
    }
    return this.to;
  }

  getPointUi() {
    if (this.point.id) {
      return this.point.id;
    }
    let {x, y} = this.point;
    return `(${x.id ? x.id : x}, ${y.id ? y.id : y})`;
  }

  // TODO This belongs in the UI most likely
  getUiSentence() {
    let to = this.to;
    return `Rotate ${this.shape.id} around ${this.getPointUi()} by ${to.id ? to.id : to}`;
  }
}
