import React from 'react';
import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.name = props.name || 'circle';
    this.radius = props.radius;
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
    } else if (this.radius.id) {
      return this.getDataOrShapePropJs(this.radius, index);
    }
    return this.radius;
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.circle({\n` +
                 `id: '${this.shapeId}',\n` +
                 `index: '${index}',\n` +
                 `cx: ${x},\n` +
                 `cy: ${y},\n` +
                 `r: ${this.getRadiusJs(index)},\n` +
                 `fill: '${this.fill}',\n` +
                 `stroke: '${this.stroke}',\n` +
                 `strokeWidth: ${this.strokeWidth},\n` +
                 `isGuide: ${this.isGuide}\n` +
                 `}, '${this.shapeId}', ${index});\n`;
  }

  getRadiusUi() {
    if (this.radius.id) {
      return `${this.radius.id}`;
    }
    return this.radius;
  }

  getUiSentence(variables, variableValues) {
    let basicUi = super.getUiSentence(variables, variableValues);
    if (basicUi) {
      return basicUi;
    }
    let fromUi = this.getFromUi(variableValues.shapes);

    return (
      <span className='instruction-sentence'>
        {fromUi},
        with radius {this.getRadiusUi()}
      </span>
    );
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawCircleInstruction(props));
  }

}
