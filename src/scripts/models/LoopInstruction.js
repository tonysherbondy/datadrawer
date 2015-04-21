import Instruction from './Instruction';

export default class LoopInstruction {
  constructor({id, instructions}) {
    this.id = id;
    this.instructions = instructions;
  }

  getJsCode() {
    return this.instructions.reduce((code, i) => {
      return code + '\n' + i.getJsCode();
    }, '');
  }

  getUISentence() {
    // TODO support different ranges by checking range property
    return `Loop over table`;
  }
}
