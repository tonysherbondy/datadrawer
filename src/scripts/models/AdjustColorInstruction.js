import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import Expression from './Expression';

export default class AdjustColorInstruction extends AdjustInstruction {
  constructor(props) {
    super(props);
    this.to = props.to || new Expression(`'rgba(0, 0, 0, 0.2)'`);
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new AdjustColorInstruction(props));
  }

  getCloneWithTo(to) {
    let props = this.getCloneProps();
    props.to = to;
    return new AdjustColorInstruction(props);
  }

  getJsCode(index) {
    let toJs = this.to.getJsCode(index);
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.adjustColor(${toJs});`;
  }

  getUiSentence(pictureActions, picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    return (
      <span className='instruction-sentence'>
        {`Set ${shapeName} fill color to`}
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
