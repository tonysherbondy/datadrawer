import _ from 'lodash';
import React from 'react';
import Addons from 'react/addons';
let {update} = Addons.addons;
import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

export default class DrawPathInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.to = props.to || [this.getLinePt(1, 1)];
    this.name = props.name || 'path';
    this.isClosed = props.isClosed;
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawPathInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    props.isClosed = this.isClosed;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    // TODO - Shouldn't we do our own modify here?
    return new DrawPathInstruction(props);
  }

  // Update the last to point in the array
  getNewToPtFromMouse(to, pictureResult, isNew) {
    let newPt = to;
    if (to.id) {
      newPt.isLine = true;
    } else {
      let prevPt = this.getPrevPointValue(pictureResult, isNew);
      newPt = this.getLinePt(to.x - prevPt.x, to.y - prevPt.y);
    }
    return newPt;
  }

  getPrevPointValue(pictureResult, isNew) {
    // Get our own shape on the canvas because this point is drawn relative
    // to the previous value on the canvas
    let shape = pictureResult.getShapeById(this.shapeId);
    // Index to prev to last point
    let index = this.to.length - 2;
    if (isNew) {
      // If the To pt has been added the last point of the path is the previous
      index++;
    }
    if (index < 0) {
      return shape.getPoint('from');
    }
    return shape.getAbsPointPosition(index);
  }

  getCloneWithTo(to, pictureResult, magnets) {
    let newPt = this.getNewToPtFromMouse(to, pictureResult);
    let props = this.getCloneProps();
    if (magnets) {
      props.toMagnets = magnets;
    }
    props.to = _.initial(props.to).concat([newPt]);
    return new DrawPathInstruction(props);
  }

  getCloneWithAddedPoint(to, pictureResult, magnets) {
    let newPt = this.getNewToPtFromMouse(to, pictureResult, true);
    let props = this.getCloneProps();
    if (magnets) {
      props.toMagnets = magnets;
    }
    props.to = [...props.to, newPt];
    return new DrawPathInstruction(props);

  }

  getLinePt(x, y) {
    return {x: new Expression(x), y: new Expression(y), isLine: true};
  }

  getToJs(index) {
    // An array of points, each with a flag indicating whether
    // we draw a line or just move to that point
    let {x, y} = this.getFromJs(index);
    let allTosJs = this.to.map(to => {
      let isLine = to.isLine;
      if (to.id) {
        let toPt = this.getPointVarJs(to, index);
        return `{x: ${toPt}.x - ${x}, y: ${toPt}.y - ${y}, isLine: ${isLine}},`;
      } else {
        let xJs = to.x.getJsCode(index);
        let yJs = to.y.getJsCode(index);
        return `{x: ${xJs}, y: ${yJs}, isLine: ${isLine}},`;
      }
    });
    return ['['].concat(allTosJs, [']']).join('\n');
  }

  getJsCode(index) {
    let propsJs = super.getPropsJs(index).join(',\n');
    let from = this.getFromJs(index);
    return `utils.path({\n` +
           `${propsJs},\n` +
           `from: {x: ${from.x}, y: ${from.y}},\n` +
           `points: ${this.getToJs(index)},\n` +
           `isClosed: ${this.isClosed},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  getToUi(variables, variableValues, shapeNameMap) {
    return this.to.map((to, index) => {
      if (to.id) {
        return ` until ${this.getPointUi(shapeNameMap, to)}`;
      } else {
        return (
          <span key={index} className="to-expression">
            to (
            <ExpressionEditorAndScrub
              onChange={this.handleToXChange.bind(this, index)}
              variables={variables}
              variableValues={variableValues}
              definition={to.x} />
                ,

            <ExpressionEditorAndScrub
              onChange={this.handleToYChange.bind(this, index)}
              variables={variables}
              variableValues={variableValues}
              definition={to.y} />
            )
          </span>
        );
      }
    });
  }

  handleToXChange(index, definition) {
    let setUpdate = {};
    setUpdate[index] = {x: {$set: definition}};
    let props = update(this.getCloneProps(), {to: setUpdate});
    this.modifyInstructionWithProps(props);
  }

  handleToYChange(index, definition) {
    let setUpdate = {};
    setUpdate[index] = {y: {$set: definition}};
    let props = update(this.getCloneProps(), {to: setUpdate});
    this.modifyInstructionWithProps(props);
  }

}
