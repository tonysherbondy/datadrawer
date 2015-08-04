import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class MoveInstruction extends AdjustInstruction {
  constructor(props={}) {
    super(props);
    this.x = props.x;
    this.y = props.y;
    this.isReshape = props.isReshape;
    this.axis = props.axis;
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new MoveInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {x, y, isReshape, axis} = this;
    props.x = x;
    props.y = y;
    props.isReshape = isReshape;
    props.axis = axis;
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
    let axisString = this.axis ? `'${this.axis}'` : this.axis;

    if (this.to) {
      // When setting to a variable we will move the point = to the variable
      let toPointJs = this.getPointVarJs(this.to, index);
      return `${varName}.moveToPoint('${this.point}', ${toPointJs}, ${this.isReshape}, ${axisString});\n`;
    }
    let xJs = this.x.getJsCode(index);
    let yJs = this.y.getJsCode(index);
    let pointJs = `{x: ${xJs}, y: ${yJs}}`;
    return `${varName}.moveRelative('${this.point}', ${pointJs}, ${this.isReshape}, ${axisString});\n`;
  }

  getUiSentence(pictureActions, picture, variableValues, shapeNameMap) {
    let shapeName = this.getShapeName(shapeNameMap);
    let moveOrReshape = this.isReshape ? 'Reshape' : 'Move';
    let pointWithAxis = this.point + (this.axis ? `(${this.axis} only)` : '');
    let fromUi = (
      <span>
        <button onClick={this.handleMoveOrReshapeToggle.bind(this, pictureActions, picture)}>{moveOrReshape}</button>
        {`${shapeName}'s`}
        <button onClick={this.handleMoveAxisToggle.bind(this, pictureActions, picture)}>{pointWithAxis}</button>
      </span>
    );
    let toUi;
    let pointUi = this.getPointUi(shapeNameMap, this.to);
    if (pointUi) {
      toUi = `, to meet ${pointUi}`;
    } else {
      toUi = this.getSizeUi(pictureActions, picture, variableValues);
    }
    return (
      <span className='instruction-sentence'>
        {fromUi}
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

  handleMoveOrReshapeToggle(pictureActions, picture) {
    let props = this.getCloneProps();
    props.isReshape = !props.isReshape;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

  handleMoveAxisToggle(pictureActions, picture) {
    let props = this.getCloneProps();
    if (this.axis === 'x') {
      props.axis = 'y';
    } else if (this.axis === 'y') {
      props.axis = null;
    } else {
      props.axis = 'x';
    }
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
