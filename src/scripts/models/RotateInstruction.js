import AdjustInstruction from './AdjustInstruction';
import PictureActions from '../actions/PictureActions';
import Expression from './Expression';

export default class RotateInstruction extends AdjustInstruction {

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new RotateInstruction(props));
  }

  modifyWithTo(picture, to, start) {
    PictureActions.modifyInstruction(picture, this.getCloneWithTo(to, start));
  }

  getCloneWithTo(to, startPoint) {
    let props = this.getCloneProps();
    let degreesPerPixel = 180 / 100;
    props.to = new Expression((to.x - startPoint.x) * degreesPerPixel);
    return new RotateInstruction(props);
  }

  getPointJs(index) {
    if (this.point.id) {
      // When setting to a variable we will move the point = to the variable
      return this.getPointVarJs(this.point, index);
    } else {
      // Otherwise, we will move the point relative to the current position
      let getVarJs = v => {
        if (v.id) {
          return this.getDataOrShapePropJs(v, index);
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
    let paramsJs = `${this.to.getJsCode(index)}, ${this.getPointJs(index)}`;
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

  // TODO Expression-ize this thing
  getUiSentence() {
    let to = this.to;
    return `Rotate ${this.shape.id} around ${this.getPointUi()} by ${to.id ? to.id : to}`;
  }
}
