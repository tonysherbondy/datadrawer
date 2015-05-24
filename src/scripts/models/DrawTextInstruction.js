import React from 'react';
import DrawLineInstruction from './DrawLineInstruction';
import InstructionActions from '../actions/InstructionActions';

export default class DrawTextInstruction extends DrawLineInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'text';
    this.text = props.text;
    this.fontSize = props.fontSize;
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawTextInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {text, fontSize} = this;
    props.text = text;
    props.fontSize = fontSize;
    return props;
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    let propsJs = super.getPropsJs(index).join(',\n');
    return `utils.text({\n` +
           `${propsJs},\n` +
           `text: ${this.text.getJsCode(index)},\n` +
           `fontSize: ${this.fontSize},\n` +
           `x1: ${x},\n` +
           `y1: ${y},\n` +
           `x2: ${this.getToXJs(index)},\n` +
           `y2: ${this.getToYJs(index)},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues, shapeNameMap) {
    return (
      <span className='instruction-sentence'>
        {this.getFromUi(shapeNameMap)}
      </span>
    );
  }

}
