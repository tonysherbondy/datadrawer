import React from 'react';
import DrawInstruction from './DrawInstruction';
import ExpressionEditor from '../components/ExpressionEditor';
import InstructionActions from '../actions/InstructionActions';
import Expression from './Expression';
import ContentEditable from '../components/ContentEditable';

export default class DrawRectInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'rect';
    this.width = props.width || new Expression(1);
    this.height = props.height || new Expression(1);
  }

  getWidthJs(index) {
    // Someone can specify a magnet to draw to
    if (this.to) {
      let {x} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.x - ${x}`;
    }

    // Otherwise width must be an expression
    return this.width.getJsCode(index);
  }

  getHeightJs(index) {
    // Someone can specify a magnet to draw to
    if (this.to) {
      let {y} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.y - ${y}`;
    }

    // Otherwise height must be an expression
    return this.height.getJsCode(index);
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.rect({\n` +
           `id: '${this.shapeId}',\n` +
           `index: ${this.getIndexString(index)},\n` +
           `name: '${this.name}',\n` +
           `x: ${x},\n` +
           `y: ${y},\n` +
           `width: ${this.getWidthJs(index)},\n` +
           `height: ${this.getHeightJs(index)},\n` +
           `fill: '${this.fill}',\n` +
           `stroke: '${this.stroke}',\n` +
           `strokeWidth: ${this.strokeWidth},\n` +
           `isGuide: ${this.isGuide}\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  handleShapeNameChange(name) {
    console.log('handle shape name change', name);
  }

  getNameEditable() {
    return (
      <ContentEditable className='name-editable' html={this.name} onChange={this.handleShapeNameChange.bind(this)} />
    );
  }

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues) {
    if (!this.isValid()) {
      return (
        <span className='instruction-sentence'>
          Draw a {this.getNameEditable()}
        </span>
      );
    }

    let fromUi = (
      <span>Draw {this.getNameEditable()} from {this.getFromUi()}</span>
    );
    if (this.to) {
      let toUi = `until ${this.to.id}'s ${this.to.point}`;
      return (
        <span className='instruction-sentence'>
          {fromUi}
          {toUi}
        </span>
      );
    }

    return (
      <span className='instruction-sentence'>
        {fromUi},
        <ExpressionEditor
          onChange={this.handleWidthChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.width} />
         horizontally

        <ExpressionEditor
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
    InstructionActions.modifyInstruction(new DrawRectInstruction(props));
  }

  handleHeightChange(definition) {
    let props = this.getCloneProps();
    props.height = definition;
    InstructionActions.modifyInstruction(new DrawRectInstruction(props));
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
    return new DrawRectInstruction(props);
  }

  getCloneWithTo(to, shapes, magnets) {
    let props = this.getCloneProps();
    // TODO - if to is a magnet, we set to otherwise, width & height
    if (to.id) {
      props.to = to;
      props.toMagnets = magnets;
      props.width = null;
      props.height = null;
    } else {
      let from = this.getFromValue(shapes);
      props.to = null;
      // TODO - Somehow this gets set to empty array???
      props.width = new Expression(to.x - from.x);
      props.height = new Expression(to.y - from.y);
    }
    return new DrawRectInstruction(props);
  }

  clone() {
    return new DrawRectInstruction(this.getCloneProps());
  }

}
