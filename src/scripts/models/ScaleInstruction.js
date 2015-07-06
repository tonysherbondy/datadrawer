import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import PictureActions from '../actions/PictureActions';

export default class ScaleInstruction extends AdjustInstruction {

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new ScaleInstruction(props));
  }

  getCloneWithTo(to) {
    let props = this.getCloneProps();
    props.to = to;
    return new ScaleInstruction(props);
  }

  getJsCode(index) {
    let toJs = this.to.getJsCode(index);
    let paramsJs = `'${this.prop}', '${this.point}', ${toJs}`;
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.scalePropByPoint(${paramsJs});`;
  }

  getUiSentence(picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    return (
      <span className='instruction-sentence'>
        {`Scale ${shapeName}'s ${this.prop} by`}
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleToChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.to} />
      </span>
    );
  }

  handleToChange(picture, definition) {
    let props = this.getCloneProps();
    props.to = definition;
    this.modifyInstructionWithProps(picture, props);
  }

}
