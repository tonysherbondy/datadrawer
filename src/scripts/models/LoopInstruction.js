import Instruction from './Instruction';
import _ from 'lodash';
import InstructionTreeNode from './InstructionTreeNode';

export default class LoopInstruction extends Instruction {
  constructor({id, instructions, count}) {
    super({id, shapeId: null});
    this.count = count;
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

  getMaxLoopCount(table) {
    // max loop count is either set on count or max table length
    return _.isNumber(this.count) ? this.count : table.maxLength;
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

  getCountUi() {
    if (isFinite(this.count)) {
      return this.count;
    }
    // TODO - Need read only variables to make this work
    return '# of columns';
  }

  getUiSentence() {
    // TODO support different ranges by checking range property
    return `Repeat from 1 to ${this.getCountUi()}`;
  }
}
