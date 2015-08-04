import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class ExtendPathInstruction extends AdjustInstruction {
  constructor(props={}) {
    super(props);
    this.x = props.x;
    this.y = props.y;
    this.isLine = props.isLine;
    this.isArc = props.isArc;
    this.arcRadius = props.arcRadius || new Expression(10);
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new ExtendPathInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {x, y, isLine, isArc, arcRadius} = this;
    props.x = x;
    props.y = y;

    // TODO - This is stupid, this should just be an extend type with either
    // move, line, or arc
    props.isLine = isLine;
    props.isArc = isArc;
    props.arcRadius = arcRadius;
    return props;
  }

  modifyWithTo(pictureActions, picture, to, start) {
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
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  getJsCode(index) {
    let varName = this.getShapeVarName(this.shape, index);
    let props = `{isLine: ${this.isLine}, isArc: ${this.isArc}, arcRadius: ${this.arcRadius.getJsCode(index)}}`;
    let extendWithProps = pJs => `Object.assign(${pJs}, ${props})`;
    if (this.to) {
      // When setting to a variable we will move the point = to the variable
      let toPointJs = this.getPointVarJs(this.to, index);
      let toWithProps = extendWithProps(toPointJs);
      return `${varName}.extendPathWithAbsolutePoint(${toWithProps});\n`;
    }

    let xJs = this.x.getJsCode(index);
    let yJs = this.y.getJsCode(index);
    let pointJs = `{x: ${xJs}, y: ${yJs}}`;
    let pointWithProps = extendWithProps(pointJs);
    return `${varName}.extendPathWithRelativePoint(${pointWithProps});\n`;
  }

  getUiSentence(pictureActions, picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    let toUi;
    let pointUi = this.getPointUi(shapeNameMap, this.to);
    if (pointUi) {
      toUi = `, to meet ${pointUi}`;
    } else {
      toUi = this.getSizeUi(pictureActions, picture, variableValues);
    }

    // TODO - Eventually allow 'Move to'
    let extendType = 'Line to';
    let extendParams;
    if (this.isArc) {
      extendType = 'Arc to';
      extendParams = (
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleArcRadiusChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.arcRadius} />
      );
    }

    let extendToUi = (
      <span>
        <button onClick={this.handleExtendTypeChange.bind(this, pictureActions, picture)}>{extendType}</button>
        {extendParams}
      </span>
    );

    // May need to allow more than line to
    return (
      <span className='instruction-sentence'>
        {`Extend ${shapeName} with`}
        {extendToUi}
        {toUi}
      </span>
    );
  }

  getSizeUi(pictureActions, picture, variableValues) {
    return (
      <span className="size-ui">
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleXChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.x} />
         horizontally

        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleYChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.y} />
        vertically.
      </span>
    );
  }

  // TODO - Just a toggle right now, eventually handle 'Move to' with
  // select
  handleExtendTypeChange(pictureActions, picture) {
    let props = this.getCloneProps();
    if (props.isLine) {
      props.isLine = false;
      props.isArc = true;
    } else {
      props.isLine = true;
      props.isArc = false;
    }
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  handleArcRadiusChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.arcRadius = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  handleXChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.x = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  handleYChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.y = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

}
