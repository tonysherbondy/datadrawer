import React from 'react';
import DrawInstruction from './DrawInstruction';
import PictureActions from '../actions/PictureActions';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

import DataVariable from './DataVariable';
import {OrderedMap} from 'immutable';

// TODO: (nhan) most of the code for the geometry of the picture was copied-
// pasted from DrawRectInstruction.  Should probably abstract this out.
export default class DrawPictureInstruction extends DrawInstruction {
  constructor(props={}) {
    super(props);
    this.name = props.name || 'picture';
    this.pictureId = props.pictureId || 'bars';
    this.width = props.width || new Expression(1);
    this.height = props.height || new Expression(1);
    this._variables = this.createDataVariableClones();
  }

  createDataVariableClones() {
    let v = new DataVariable({
      name: 'clone variable',
      definition: 42
    });
    return OrderedMap([[v.id, v]]);
  }

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new DrawPictureInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {width, height, pictureId} = this;
    props.pictureId = pictureId;
    props.width = width;
    props.height = height;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    // TODO - Shouldn't we do our own modify here?
    return new DrawPictureInstruction(props);
  }

  getCloneWithTo(to, shapes, currentLoopIndex, magnets) {
    let props = this.getCloneProps();
    // TODO - if to is a magnet, we set to otherwise, width & height
    if (to.id) {
      props.to = to;
      props.toMagnets = magnets;
      props.width = null;
      props.height = null;
    } else {
      let from = this.getFromValue(shapes, currentLoopIndex);
      props.to = null;
      props.width = new Expression(to.x - from.x);
      props.height = new Expression(to.y - from.y);
    }
    // TODO - Shouldn't we do our own modify here?
    return new DrawPictureInstruction(props);
  }

  clone() {
    return new DrawPictureInstruction(this.getCloneProps());
  }

  getWidthJs(index) {
    // Someone can specify a magnet to draw to
    if (this.to) {
      let {x} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.x - ${x}`;
    }

    // Otherwise width must be an expression
    return this.width.getJsCode(index);
  }

  getHeightJs(index) {
    // Someone can specify a magnet to draw to
    if (this.to) {
      let {y} = this.getFromJs(index);
      let toPt = this.getPointVarJs(this.to, index);
      // TODO Probably will need some util function to handle the fact
      // that we might get negative distances
      return `${toPt}.y - ${y}`;
    }

    // Otherwise height must be an expression
    return this.height.getJsCode(index);
  }

  getJsCode(index) {
    let {x, y} = this.getFromJs(index);
    let propsJs = super.getPropsJs(index).join(',\n');
    return `utils.picture({\n` +
           `${propsJs},\n` +
           `x: ${x},\n` +
           `y: ${y},\n` +
           `width: ${this.getWidthJs(index)},\n` +
           `height: ${this.getHeightJs(index)},\n` +
           `pictureId: '${this.pictureId}'\n` +
           `}, '${this.shapeId}', ${index}, utils);\n`;
  }

  getFromUi(picture, shapes) {
    let pointUi = this.getPointUi(shapes, this.from);
    if (pointUi === null) {
      pointUi = `(${this.from.x}, ${this.from.y})`;
    }

    // change this to picture name once we have names for pictures
    return (
      <span>Draw {this.pictureId} from {pointUi}</span>
    );
  }

  getSizeUi(picture, variableValues) {
    return (
      <span className="to-expression">
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleWidthChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.width} />
         horizontally

        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleHeightChange.bind(this, picture)}
          variableValues={variableValues}
          definition={this.height} />
        vertically.
      </span>
    );
  }

  handleWidthChange(picture, definition) {
    let props = this.getCloneProps();
    props.width = definition;
    this.modifyInstructionWithProps(picture, props);
  }

  handleHeightChange(picture, definition) {
    let props = this.getCloneProps();
    props.height = definition;
    this.modifyInstructionWithProps(picture, props);
  }

}
