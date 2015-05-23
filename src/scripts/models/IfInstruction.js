import Instruction from './Instruction';

export default class IfInstruction extends Instruction {
  constructor({id, instructions, condition}) {
    super({id, shapeId: null});
    this.condition = condition;
    this.instructions = instructions;
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

  getUiSentence() {
    // TODO support different ranges by checking range property
    return `If ${this.getConditionUi()}`;
  }
}
