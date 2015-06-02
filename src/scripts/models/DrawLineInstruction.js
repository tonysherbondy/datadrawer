import React from 'react';
import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import Expression from './Expression';

export default class DrawLineInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'line';
    this.width = props.width || new Expression(1);
    this.height = props.height || new Expression(1);
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawLineInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {width, height} = this;
    props.width = width;
    props.height = height;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    return new DrawLineInstruction(props);
  }

  getCloneWithTo(to, pictureResult, magnets) {
    let props = this.getCloneProps();
    // TODO - if to is a magnet, we set to otherwise, width & height
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
    return new DrawLineInstruction(props);
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    let propsJs = super.getPropsJs(index).join(',\n');
    return `utils.line({\n` +
           `${propsJs},\n` +
           `x1: ${x},\n` +
           `y1: ${y},\n` +
           `x2: ${this.getToXJs(index)},\n` +
           `y2: ${this.getToYJs(index)},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getSizeUi(variables, variableValues) {
    return (
      <span className="to-expression">
        <ExpressionEditorAndScrub
          onChange={this.handleWidthChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.width} />
         horizontally

        <ExpressionEditorAndScrub
          onChange={this.handleHeightChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.height} />
        vertically.
      </span>
    );
  }

  handleWidthChange(definition) {
    let props = this.getCloneProps();
    props.width = definition;
    this.modifyInstructionWithProps(props);
  }

  handleHeightChange(definition) {
    let props = this.getCloneProps();
    props.height = definition;
    this.modifyInstructionWithProps(props);
  }


}
