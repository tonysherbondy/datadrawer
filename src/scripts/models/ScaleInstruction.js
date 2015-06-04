import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import InstructionActions from '../actions/InstructionActions';

export default class ScaleInstruction extends AdjustInstruction {
  constructor(props) {
    super(props);
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new ScaleInstruction(props));
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

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    return (
      <span className='instruction-sentence'>
        {`Scale ${shapeName}'s ${this.prop} by`}
        <ExpressionEditorAndScrub
          onChange={this.handleToChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.to} />
      </span>
    );
  }

  handleToChange(definition) {
    let props = this.getCloneProps();
    props.to = definition;
    this.modifyInstructionWithProps(props);
  }

  serialize() {
    var serialized = this.getCloneProps();
    for (var prop in serialized) {
      if (serialized.hasOwnProperty(prop) && serialized[prop] === undefined) {
        delete serialized[prop];
      }
    }
    return serialized;
  }
}
