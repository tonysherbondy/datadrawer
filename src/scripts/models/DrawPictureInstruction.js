import React from 'react';
import _ from 'lodash';
import {OrderedMap} from 'immutable';
import DrawInstruction from './DrawInstruction';
import PictureActions from '../actions/PictureActions';
import Expression from './Expression';
import ExpressionEditorAndScrub from '../components/ExpressionEditorAndScrub';

// TODO: (nhan) most of the code for the geometry of the picture was copied-
// pasted from DrawRectInstruction.  Should probably abstract this out.
export default class DrawPictureInstruction extends DrawInstruction {
  constructor(props={}) {
    super(props);
    this.name = props.name || 'picture';
    this.pictureId = props.pictureId || 'bars';
    this.width = props.width || new Expression(1);
    this.height = props.height || new Expression(1);

    let {pictureVariables} = props;
    if (!props.preserveVariables && pictureVariables) {
      let clone = this.initializePictureVariables(props.pictureVariables);
      this.pictureIdToDrawIdMap = clone.pictureIdToDrawIdMap;
      pictureVariables = clone.pictureVariables;
    } else {
      this.pictureIdToDrawIdMap = props.pictureIdToDrawIdMap || {};
    }

    if (pictureVariables instanceof OrderedMap) {
      this._pictureVariables = pictureVariables;
    } else {
      this._pictureVariables = OrderedMap((pictureVariables || []).map(v => [v.name, v]));
    }
  }

  // Need to clone all of picture's variables and add them to
  // our propertyVariables
  initializePictureVariables(variables) {

    // First pass: create a clone variable with same name and definition as original
    let pictureIdToDrawIdMap = {};
    let newVariables = (variables || []).map(v => {
      let newV = v.cloneWithNewId();
      pictureIdToDrawIdMap[v.id] = newV.id;
      return newV;
    });

    // Second pass: change any reference to previous variables to new clones
    let mappedVariables = newVariables.map(v => {
      if (v.getDependentVariables().length === 0) {
        return v;
      }
      // Create new definition by replacing fragment ids with local one
      let newFragments = v.definition.fragments.map(f => {
        if (_.isString(f)) { return f; }
        return Object.assign(_.cloneDeep(f), {id: pictureIdToDrawIdMap[f.id]});
      });
      return v.cloneWithDefinition(newFragments);
    });

    return {pictureVariables: mappedVariables, pictureIdToDrawIdMap};
  }

  get pictureVariables() { return this._pictureVariables.valueSeq().toArray(); }
  set pictureVariables(v) { throw `Not allowed to set propertyVariables.  (Tried to set to ${v})`; }

  modifyInstructionWithPictureVariable(picture, variable) {
    let pictureVariables = this._pictureVariables.set(variable.name, variable);
    this.modifyProps(picture, {pictureVariables});
  }

  modifyInstructionWithProps(picture, props) {
    PictureActions.modifyInstruction(picture, new DrawPictureInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {width, height, pictureId, pictureVariables, pictureIdToDrawIdMap} = this;
    props.pictureId = pictureId;
    props.width = width;
    props.height = height;
    props.pictureVariables = pictureVariables;
    props.pictureIdToDrawIdMap = pictureIdToDrawIdMap;
    props.preserveVariables = true;
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
           `pictureIdToDrawIdMap: ${JSON.stringify(this.pictureIdToDrawIdMap)},\n` +
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
