import React from 'react';
import Instruction from './Instruction';
import _ from 'lodash';
import InstructionTreeNode from './InstructionTreeNode';
import Expression from '../models/Expression';
import ExpressionEditor from '../components/ExpressionEditor';

export default class LoopInstruction extends Instruction {
  constructor({id, instructions, count}) {
    super({id, shapeId: null});
    this.count = count || 'max';
    this.instructions = instructions;
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {count, instructions} = this;
    props.count = count;
    props.instructions = instructions;
    return props;
  }

  clone() {
    return new LoopInstruction(this.getCloneProps());
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new LoopInstruction(props));
  }

  getMaxLoopCount(table) {
    // max loop count is either set on count or max table length
    let max = _.isNumber(this.count) ? this.count : table.maxLength;
    // Don't let the maximum be greater than the table length
    return _.min([max, table.maxLength]);
  }

  getJsCode(table, currentInstruction, currentLoopIndex) {

    // Either loop the complete number of times or the current loop count
    let count = this.getMaxLoopCount(table);
    if (_.isNumber(currentLoopIndex)) {
      count = _.min([count, currentLoopIndex + 1]);
    }

    let jsCode = '';
    for (let index = 0; index < count; index++) {
      let validInstructions = this.instructions.filter(i => i.isValid());
      let instructionsUpToCurrent = validInstructions;
      let isCurrentWithinLoop = currentInstruction && !!InstructionTreeNode.findById(this.instructions, currentInstruction.id);
      if (isCurrentWithinLoop && index === count - 1) {
        // Don't draw any instructions after current on the last loop
        let isAfter = InstructionTreeNode.isInstructionAfter.bind(null, this.instructions, currentInstruction);
        instructionsUpToCurrent = validInstructions.filter(i => !isAfter(i));
      }
      instructionsUpToCurrent.forEach(instruction => {
        jsCode += '\n' + instruction.getJsCode(index);
      });
      jsCode += '\n';
    }
    return jsCode;
  }

  getUiSentence(pictureActions, picture, variableValues) {
    // TODO support different ranges by checking range property
    let definition = new Expression(this.count || `'# of columns'`);
    return (
      <span className='instruction-sentence'>
        {`Repeat from 1 to `}
        <ExpressionEditor
          picture={picture}
          onChange={this.handleCountChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={definition} />
      </span>
    );
  }

  handleCountChange(pictureActions, picture, definition) {
    let count = definition.evaluate(picture.variables);
    if (!_.isNumber(count)) {
      count = 'max';
    }
    let props = this.getCloneProps();
    props.count = count;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }
}
