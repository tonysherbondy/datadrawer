import React from 'react';
import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';
import ExpressionEditor from '../components/ExpressionEditor';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'circle';
    this.radius = props.radius;
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawCircleInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    props.radius = this.radius;
    return props;
  }

  getRadiusJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x, y} = this.getFromJs();
      let fromPt = `{x: ${x}, y: ${y}}`;
      let toPt = this.getPointVarJs(this.to, index);
      return `utils.distanceBetweenPoints(${fromPt}, ${toPt})`;
    }
    return this.radius.getJsCode(index);
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    let propsJs = super.getPropsJs(index).join(',\n');
    return `utils.circle({\n` +
           `${propsJs},\n` +
           `cx: ${x},\n` +
           `cy: ${y},\n` +
           `r: ${this.getRadiusJs(index)},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getSizeUi(variables, variableValues) {
    return (
      <span className="size-ui">
        , with radius
        <ExpressionEditor
          onChange={this.handleRadiusChange.bind(this)}
          variables={variables}
          variableValues={variableValues}
          definition={this.radius} />
      </span>
    );
  }

  handleRadiusChange(definition) {
    let props = this.getCloneProps();
    props.radius = definition;
    this.modifyInstructionWithProps(props);
  }

}
