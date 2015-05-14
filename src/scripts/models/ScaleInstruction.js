import React from 'react';
import Instruction from './Instruction';
import ExpressionEditor from '../components/ExpressionEditor';
import InstructionActions from '../actions/InstructionActions';

export default class ScaleInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: props.shape.id});
    this.point = props.point;
    this.prop = props.prop;
    this.to = props.to;
    this.toMagnets = props.toMagnets;
    this.shape = props.shape;
  }

  getJsCode(index) {
    let toJs = this.to.getJsCode(index);
    let paramsJs = `'${this.prop}', '${this.point}', ${toJs}`;
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.scalePropByPoint(${paramsJs});`;
  }

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues) {
    let shapeName = this.getShapeName(variableValues.shapes);
    return (
      <span className='instruction-sentence'>
        {`Scale ${shapeName}'s ${this.prop} by`}
        <ExpressionEditor
          onChange={this.handleToChange.bind(this, variableValues)}
          variables={variables}
          variableValues={variableValues}
          definition={this.to} />
      </span>
    );
  }

  handleToChange(variableValues, definition) {
    let props = this.getCloneProps();
    props.to = definition;
    InstructionActions.modifyInstruction(new ScaleInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {point, prop, to, shape} = this;
    props.point = point;
    props.prop = prop;
    props.to = to;
    props.shape = shape;
    return props;
  }

  getCloneWithTo(to) {
    let props = this.getCloneProps();
    props.to = to;
    return new ScaleInstruction(props);
  }
}
