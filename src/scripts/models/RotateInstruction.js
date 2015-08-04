import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class RotateInstruction extends AdjustInstruction {

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new RotateInstruction(props));
  }

  modifyWithTo(pictureActions, picture, to, start) {
    pictureActions.modifyInstruction(picture, this.getCloneWithTo(to, start));
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

  getUiSentence(pictureActions, picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    let pointUi = this.getPointUi(shapeNameMap, this.point);
    return (
      <span className='instruction-sentence'>
        {`Rotate ${shapeName} about ${pointUi} by`}
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleToChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.to} />
      </span>
    );
  }

  handleToChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.to = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }
}
