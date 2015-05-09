import React from 'react';
import DrawInstruction from './DrawInstruction';
import ExpressionEditor from '../components/ExpressionEditor';
import Expression from './Expression';
import InstructionActions from '../actions/InstructionActions';

export default class DrawRectInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    // TODO - Assume these are Expressions
    this.width = props.width;
    this.height = props.height;
  }

  getWidthJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.width) {
      if (this.width.id) {
        return this.getDataOrShapePropJs(this.width, index);
      }
      return this.width;
    }

    if (this.to) {
      let {x} = this.getFromJs(index);
      if (this.to.id) {
        let toPt = this.getPointVarJs(this.to, index);
        // TODO Probably will need some util function to handle the fact
        // that we might get negative distances
        return `${toPt}.x - ${x}`;
      } else {
        // TODO - need to handle variable for to coords
        return `${this.to.x} - ${x}`;
      }
    }
  }

  getHeightJs(index) {
    // This can be one of the following, a point specified by the to parameter,
    // a number or a variable
    if (this.height) {
      if (this.height.id) {
        return this.getDataOrShapePropJs(this.height, index);
      }
      return this.height;
    }

    if (this.to) {
      let {y} = this.getFromJs(index);
      if (this.to.id) {
        let toPt = this.getPointVarJs(this.to, index);
        // TODO Probably will need some util function to handle the fact
        // that we might get negative distances
        return `${toPt}.y - ${y}`;
      } else {
        // TODO - need to handle variable for to coords
        return `${this.to.y} - ${y}`;
      }
    }
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    return `utils.rect({\n` +
           `id: '${this.shapeId}',\n` +
           `index: '${index}',\n` +
           `x: ${x},\n` +
           `y: ${y},\n` +
           `width: ${this.getWidthJs(index)},\n` +
           `height: ${this.getHeightJs(index)},\n` +
           `fill: '${this.fill}',\n` +
           `stroke: '${this.stroke}',\n` +
           `strokeWidth: ${this.strokeWidth},\n` +
           `isGuide: ${this.isGuide}\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getWidthUi(variableValues) {
    if (this.width) {
      return new Expression(this.width);
    }

    // TODO - Should be able to get rid of this, simply
    // make height an expression of the y position - from.y
    if (this.to.x) {
      let from = this.getFromValue(variableValues);
      return new Expression(this.to.x - from.x);
    }
  }

  getHeightUi(variableValues) {
    if (this.height) {
      return new Expression(this.height);
    }

    // TODO - Should be able to get rid of this, simply
    // make height an expression of the y position - from.y
    if (this.to.y) {
      let from = this.getFromValue(variableValues);
      return new Expression(this.to.y - from.y);
    }
  }

  // TODO This belongs in the UI most likely
  getUiSentence(variables, variableValues) {
    if (!this.isValid()) {
      return `Draw a rect ...`;
    }

    let fromUi = `Draw rect from ${this.getFromUi()}`;
    if (this.to && this.to.id) {
      return `${fromUi} until ${this.to.id}'s ${this.to.point}`;
    }

    let widthUi = this.getWidthUi(variableValues);
    let heightUi = this.getHeightUi(variableValues);
    return (
      <span className='instruction-sentence'>
        {fromUi},
        <ExpressionEditor
          onChange={this.handleWidthChange.bind(this, variableValues)}
          variables={variables}
          variableValues={variableValues}
          definition={widthUi} />
         horizontally

        <ExpressionEditor
          onChange={this.handleHeightChange.bind(this, variableValues)}
          variables={variables}
          variableValues={variableValues}
          definition={heightUi} />
        vertically.
      </span>
    );
  }

  // TODO - I think it would be best if these values
  // were also simply expressions
  handleWidthChange(variableValues, definition) {
    let props = this.getCloneProps();
    props.width = definition.evaluate(variableValues);
    InstructionActions.modifyInstruction(new DrawRectInstruction(props));
  }

  handleHeightChange(variableValues, definition) {
    let props = this.getCloneProps();
    props.height = definition.evaluate(variableValues);
    InstructionActions.modifyInstruction(new DrawRectInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {width, height} = this;
    props.width = width;
    props.height = height;
    return props;
  }

  getCloneWithFrom(from) {
    let props = this.getCloneProps();
    props.from = from;
    props.to = null;
    props.width = 10;
    props.height = 10;
    return new DrawRectInstruction(props);
  }

  getCloneWithTo(to) {
    let props = this.getCloneProps();
    props.to = to;
    props.width = null;
    props.height = null;
    return new DrawRectInstruction(props);
  }

}
