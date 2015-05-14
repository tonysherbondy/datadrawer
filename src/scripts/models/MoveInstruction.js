import React from 'react';
import AdjustInstruction from './AdjustInstruction';
import ExpressionEditor from '../components/ExpressionEditor';
import InstructionActions from '../actions/InstructionActions';
import Expression from './Expression';

export default class MoveInstruction extends AdjustInstruction {
  constructor(props) {
    super(props);
    this.x = props.x;
    this.y = props.y;
    this.isReshape = props.isReshape;
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new MoveInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {x, y, isReshape} = this;
    props.x = x;
    props.y = y;
    props.isReshape = isReshape;
    return props;
  }

  modifyWithTo(to, start) {
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
    this.modifyInstructionWithProps(props);
  }

  getJsCode(index) {
    let varName = this.getShapeVarName(this.shape, index);
    if (this.to) {
      // When setting to a variable we will move the point = to the variable
      let pointJs = this.getPointVarJs(this.to, index);
      return `${varName}.moveToPoint('${this.point}', ${pointJs}, ${this.isReshape});\n`;
    }
    let xJs = this.x.getJsCode(index);
    let yJs = this.y.getJsCode(index);
    let pointJs = `{x: ${xJs}, y: ${yJs}}`;
    return `${varName}.moveRelative('${this.point}', ${pointJs}, ${this.isReshape});\n`;
  }

  getUiSentence(variables, variableValues) {
    let shapeName = this.getShapeName(variableValues.shapes);
    let fromUi = `Move ${shapeName}'s ${this.point}`;
    let toUi;
    let pointUi = this.getPointUi(variableValues.shapes, this.to);
    if (pointUi) {
      toUi = `, to meet ${pointUi}`;
    } else {
      toUi = this.getSizeUi(variables, variableValues);
    }
    return (
      <span className='instruction-sentence'>
        {fromUi}
        {toUi}
      </span>
    );
  }

  getSizeUi(variables, variableValues) {
    return (
      <span className="size-ui">
        <ExpressionEditor
          onChange={this.handleXChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.x} />
         horizontally

        <ExpressionEditor
          onChange={this.handleYChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.y} />
        vertically.
      </span>
    );
  }

  handleXChange(definition) {
    let props = this.getCloneProps();
    props.x = definition;
    this.modifyInstructionWithProps(props);
  }

  handleYChange(definition) {
    let props = this.getCloneProps();
    props.y = definition;
    this.modifyInstructionWithProps(props);
  }

}
