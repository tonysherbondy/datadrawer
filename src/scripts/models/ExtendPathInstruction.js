import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import PictureActions from '../actions/PictureActions';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class ExtendPathInstruction extends AdjustInstruction {
  constructor(props={}) {
    super(props);
    this.x = props.x;
    this.y = props.y;
  }

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new ExtendPathInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {x, y} = this;
    props.x = x;
    props.y = y;
    return props;
  }

  modifyWithTo(picture, to, start) {
    let props = this.getCloneProps();
    if (to.id) {
      props.to = to;
      props.x = null;
      props.y = null;
    } else {
      props.to = null;
      props.x = new Expression(to.x - start.x);
      props.y = new Expression(to.y - start.y);
    }
    this.modifyInstructionWithProps(picture, props);
  }

  getJsCode(index) {
    let varName = this.getShapeVarName(this.shape, index);

    if (this.to) {
      // When setting to a variable we will move the point = to the variable
      let toPointJs = this.getPointVarJs(this.to, index);
      return `${varName}.extendPathWithAbsolutePoint(${toPointJs});\n`;
    }

    let xJs = this.x.getJsCode(index);
    let yJs = this.y.getJsCode(index);
    let pointJs = `{x: ${xJs}, y: ${yJs}}`;

    return `${varName}.extendPathWithRelativePoint(${pointJs});\n`;
  }

  getUiSentence(picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    let toUi;
    let pointUi = this.getPointUi(shapeNameMap, this.to);
    if (pointUi) {
      toUi = `, to meet ${pointUi}`;
    } else {
      toUi = this.getSizeUi(picture, variableValues);
    }

    // May need to allow more than line to
    return (
      <span className='instruction-sentence'>
        {`Extend ${shapeName} with line to`}
        {toUi}
      </span>
    );
  }

  getSizeUi(picture, variableValues) {
    return (
      <span className="size-ui">
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleXChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.x} />
         horizontally

        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleYChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.y} />
        vertically.
      </span>
    );
  }

  handleXChange(picture, definition) {
    let props = this.getCloneProps();
    props.x = definition;
    this.modifyInstructionWithProps(picture, props);
  }

  handleYChange(picture, definition) {
    let props = this.getCloneProps();
    props.y = definition;
    this.modifyInstructionWithProps(picture, props);
  }

}
