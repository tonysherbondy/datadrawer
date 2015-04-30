import Instruction from './Instruction';

export default class LoopInstruction extends Instruction {
  constructor({id, instructions, count}) {
    super({id, shapeId: null});
    this.count = count;
    this.instructions = instructions;
  }

  getJsCode(table) {
    // loop until maxLength of table
    let jsCode = '';
    let count = this.count;
    if (!isFinite(count)) {
      count = table.maxLength;
    }
    for (let index = 0; index < count; index++) {
      let validInstructions = this.instructions.filter(i => i.isValid());
      validInstructions.forEach(instruction => {
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
