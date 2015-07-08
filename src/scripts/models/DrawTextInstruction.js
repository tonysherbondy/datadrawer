import DrawLineInstruction from './DrawLineInstruction';
import PictureActions from '../actions/PictureActions';
import Expression from './Expression';
import React from 'react';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class DrawTextInstruction extends DrawLineInstruction {
  constructor(props={}) {
    super(props);
    this.name = props.name || 'text';
    this.text = props.text || new Expression(`'yolo'`);
  }

  initializePropertyVariables(initMap) {
    super.initializePropertyVariables(Object.assign({
      fontSize: 20,
      fill: `'#000000'`,
      strokeWidth: 0,
      textAnchor: `'middle'`
    },
    initMap));
  }

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new DrawTextInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {text} = this;
    props.text = text;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    return new DrawTextInstruction(props);
  }

  getCloneWithTo(to, shapes, currentLoopIndex, magnets) {
    let props = this.getCloneProps();
    // if to is a magnet, we set to otherwise, width & height
    if (to.id) {
      props.to = to;
      props.toMagnets = magnets;
      props.width = null;
      props.height = null;
    } else {
      let from = this.getFromValue(shapes, currentLoopIndex);
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
           `x1: ${x},\n` +
           `y1: ${y},\n` +
           `x2: ${this.getToXJs(index)},\n` +
           `y2: ${this.getToYJs(index)},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  handleTextChange(picture, definition) {
    let props = this.getCloneProps();
    props.text = definition;
    this.modifyInstructionWithProps(picture, props);
  }

  // TODO - this is only here because I need to place text
  // value somewhere
  getUiSentence(picture, variableValues, shapeNameMap) {
    if (!this.isValid()) {
      return this.getInvalidUi();
    }

    let fromUi = this.getFromUi(picture, shapeNameMap);
    let toUi;
    if (this.to) {
      toUi = this.getPointToUi(shapeNameMap);
    } else {
      toUi = this.getSizeUi(picture, variableValues);
    }
    return (
      <span className='instruction-sentence'>
        {fromUi}

        of
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleTextChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.text} />

        {toUi}
      </span>
    );
  }
}
