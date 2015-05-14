import React from 'react';
import Instruction from './Instruction';
import ExpressionEditor from '../components/ExpressionEditor';

export default class MoveInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: props.shape.id});
    this.point = props.point;
    this.to = props.to;
    this.x = props.x;
    this.y = props.y;
    this.shape = props.shape;
    this.isReshape = props.isReshape;
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

  handleYChange(evt) {
    console.log('handle y change', evt);
  }

  handleXChange(evt) {
    console.log('handle x change', evt);
  }
}
