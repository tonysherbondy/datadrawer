import React from 'react';
import Instruction from './Instruction';
import Expression from './Expression';
import ExpressionEditor from '../components/ExpressionEditor';
import InstructionActions from '../actions/InstructionActions';

export default class ScaleInstruction extends Instruction {
  constructor({id, shape, point, prop, to}) {
    super({id, shapeId: shape.id});
    this.point = point;
    this.prop = prop;
    this.to = to;
    this.shape = shape;
  }

  getToJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to.id) {
      return this.getDataOrShapePropJs(this.to, index);
    }
    return this.to;
  }

  getJsCode(index) {
    let paramsJs = `'${this.prop}', '${this.point}', ${this.getToJs(index)}`;
    let varName = this.getShapeVarName(this.shape, index);
    return `${varName}.scalePropByPoint(${paramsJs});`;
  }

  getToUi() {
    return new Expression(this.to);
  }

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues) {
    return (
      <span className='instruction-sentence'>
        {`Scale ${this.shape.id} ${this.prop} by`}
        <ExpressionEditor
          onChange={this.handleToChange.bind(this, variableValues)}
          variables={variables}
          variableValues={variableValues}
          definition={this.getToUi(variableValues)} />
      </span>
    );
  }

  handleToChange(variableValues, definition) {
    let props = this.getCloneProps();
    props.to = definition.evaluate(variableValues);
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
