import Instruction from './Instruction';

export default class LoopInstruction {
  constructor({id, instructions}) {
    this.id = id;
    this.instructions = instructions;
  }

  getJsCode(table) {
    // loop until maxLength of table
    let jsCode = '';
    for (let index = 0; index < table.maxLength; index++) {
      this.instructions.forEach(instruction => {
        jsCode += '\n' + instruction.getJsCode(index);
      });
      jsCode += '\n';
    }
    return jsCode;
  }

  getUISentence() {
    // TODO support different ranges by checking range property
    return `Loop over table`;
  }
}
