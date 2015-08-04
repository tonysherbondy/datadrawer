import React from 'react';
import DrawInstruction from './DrawInstruction';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';
import {distanceBetweenPoints} from '../utils/utils';
import Expression from '../models/Expression';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props={}) {
    super(props);
    this.name = props.name || 'circle';
    this.radius = props.radius || new Expression(1);
  }

  modifyInstructionWithProps(pictureActions, picture, props) {
    pictureActions.modifyInstruction(picture, new DrawCircleInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    props.radius = this.radius;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    // TODO - Shouldn't we do our own modify here?
    return new DrawCircleInstruction(props);
  }

  getCloneWithTo(to, shapes, currentLoopIndex, magnets) {
    let props = this.getCloneProps();
    // TODO - if to is a magnet, we set to otherwise, width & height
    if (to.id) {
      props.to = to;
      props.toMagnets = magnets;
      props.radius = null;
    } else {
      let from = this.getFromValue(shapes, currentLoopIndex);
      props.to = null;
      let radius = Math.round(distanceBetweenPoints(to, from) * 100) / 100;
      props.radius = new Expression(radius);
    }
    // TODO - Shouldn't we do our own modify here?
    return new DrawCircleInstruction(props);
  }

  getRadiusJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {x, y} = this.getFromJs(index);
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

  getSizeUi(pictureActions, picture, variableValues) {
    return (
      <span className="size-ui">
        , with radius
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleRadiusChange.bind(this, pictureActions, picture)}
          variableValues={variableValues}
          definition={this.radius} />
      </span>
    );
  }

  handleRadiusChange(pictureActions, picture, definition) {
    let props = this.getCloneProps();
    props.radius = definition;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

}
