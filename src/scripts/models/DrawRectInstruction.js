import React from 'react';
import DrawInstruction from './DrawInstruction';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class DrawRectInstruction extends DrawInstruction {
  constructor(props={}) {
    super(props);
    this.name = props.name || 'rect';
    this.width = props.width || new Expression(1);
    this.height = props.height || new Expression(1);
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new DrawRectInstruction(props));
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
    // TODO - Shouldn't we do our own modify here?
    return new DrawRectInstruction(props);
  }

  getCloneWithTo(to, shapes, currentLoopIndex, magnets) {
    let props = this.getCloneProps();
    // TODO - if to is a magnet, we set to otherwise, width & height
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
    return new DrawRectInstruction(props);
  }

  clone() {
    return new DrawRectInstruction(this.getCloneProps());
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
    let propsJs = super.getPropsJs(index).join(',\n');
    return `utils.rect({\n` +
           `${propsJs},\n` +
           `x: ${x},\n` +
           `y: ${y},\n` +
           `width: ${this.getWidthJs(index)},\n` +
           `height: ${this.getHeightJs(index)}\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getSizeUi(pictureActions, picture, variableValues) {
    return (
      <span className="to-expression">
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleWidthChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.width} />
         horizontally

        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleHeightChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.height} />
        vertically.
      </span>
    );
  }

  handleWidthChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.width = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  handleHeightChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.height = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

}
