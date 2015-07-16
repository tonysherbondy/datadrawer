import React from 'react';
import Instruction from './Instruction';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import PictureActions from '../actions/PictureActions';

export default class IfInstruction extends Instruction {
  constructor({id, instructions, condition}) {
    super({id, shapeId: null});
    this.condition = condition;
    this.instructions = instructions;
  }

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new IfInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {condition, instructions} = this;
    props.condition = condition;
    props.instructions = instructions;
    return props;
  }

  clone() {
    return new IfInstruction(this.getCloneProps());
  }

  getJsCode(index) {
    // loop until maxLength of table
    let jsCode = `\nif (${this.condition.getJsCode(index)}) {\n`;
    let validInstructions = this.instructions.filter(i => i.isValid());
    validInstructions.forEach(instruction => {
      jsCode += instruction.getJsCode(index) + '\n';
    });
    jsCode += '}\n\n';
    return jsCode;
  }

  getConditionUi() {
    return this.condition.map(f => {
      if (f.id) {
        return f.id;
      }
      return f;
    }).join('');
  }

  getUiSentence(picture, variableValues) {
    return (
      <span className='instruction-sentence'>
        If
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleConditionChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.condition} />
      </span>
    );
  }

  handleConditionChange(picture, definition) {
    let props = this.getCloneProps();
    props.condition = definition;
    this.modifyInstructionWithProps(picture, props);
  }
}
