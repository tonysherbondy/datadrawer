import DrawLineInstruction from './DrawLineInstruction';
import InstructionActions from '../actions/InstructionActions';
import Expression from './Expression';
import React from 'react';
import ExpressionEditor from '../components/ExpressionEditor';

export default class DrawTextInstruction extends DrawLineInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'text';
    this.text = props.text || new Expression(`'yolo'`);
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

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    return new DrawTextInstruction(props);
  }

  getCloneWithTo(to, pictureResult, magnets) {
    let props = this.getCloneProps();
    // if to is a magnet, we set to otherwise, width & height
    if (to.id) {
      props.to = to;
      props.toMagnets = magnets;
      props.width = null;
      props.height = null;
    } else {
      let from = this.getFromValue(pictureResult);
      props.to = null;
      props.width = new Expression(to.x - from.x);
      props.height = new Expression(to.y - from.y);
    }
    // TODO - Shouldn't we do our own modify here?
    return new DrawTextInstruction(props);
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

  handleTextChange(definition) {
    let props = this.getCloneProps();
    props.text = definition;
    this.modifyInstructionWithProps(props);
  }

  // TODO - this is only here because I need to place text
  // value somewhere
  getUiSentence(variables, variableValues, shapeNameMap) {
    if (!this.isValid()) {
      return this.getInvalidUi();
    }

    let fromUi = this.getFromUi(shapeNameMap);
    let toUi;
    if (this.to) {
      toUi = this.getPointToUi(shapeNameMap);
    } else {
      toUi = this.getSizeUi(variables, variableValues);
    }
    return (
      <span className='instruction-sentence'>
        {fromUi}

        of
        <ExpressionEditor
          onChange={this.handleTextChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.text} />

        {toUi}
      </span>
    );
  }
}
