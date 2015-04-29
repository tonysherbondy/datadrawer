import Instruction from './Instruction';

export default class IfInstruction extends Instruction {
  constructor({id, instructions, condition}) {
    super({id, shapeId: null});
    this.condition = condition;
    this.instructions = instructions;
  }

  getConditionJs(index) {
    return this.condition.reduce((js, fragment) => {
      if (fragment.id) {
        return js + this.getDataOrShapePropJs(fragment, index);
      }
      return js + fragment;
    }, '');
  }

  getJsCode(index) {
    // loop until maxLength of table
    let jsCode = `\nif (${this.getConditionJs(index)}) {\n`;
    this.instructions.forEach(instruction => {
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

  getUISentence() {
    // TODO support different ranges by checking range property
    return `If ${this.getConditionUi()}`;
  }
}
