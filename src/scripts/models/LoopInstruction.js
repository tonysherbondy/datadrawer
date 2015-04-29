export default class LoopInstruction {
  constructor({id, instructions, count}) {
    this.id = id;
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
      this.instructions.forEach(instruction => {
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

  getUISentence() {
    // TODO support different ranges by checking range property
    return `Repeat from 1 to ${this.getCountUi()}`;
  }
}
