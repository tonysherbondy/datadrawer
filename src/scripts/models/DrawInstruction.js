import React from 'react';
import Instruction from './Instruction';
import ContentEditable from '../components/ContentEditable';
import DataVariable from './DataVariable';
import {guid} from '../utils/utils';
import {OrderedMap} from 'immutable';
import _ from 'lodash';

export default class DrawInstruction extends Instruction {
  constructor(props = {}) {
    // Don't call super as that would reset our Id
    let id = props.id || guid();
    super({id, shapeId: `shape_${id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = props.from;
    this.fromMagnets = props.fromMagnets;
    this.to = props.to;
    this.toMagnets = props.toMagnets;
    this.isGuide = !!props.isGuide;
    this.name = props.name;

    // All draw instructions will have property variables which define some
    // properties about the shape, e.g., font size or fill color
    if (props.propertyVariables instanceof OrderedMap) {
      this._propertyVariables = props.propertyVariables;
    } else {
      // Map by name because I don't care about the id
      this._propertyVariables = OrderedMap((props.propertyVariables || []).map(v => [v.name, v]));
    }
    this.initializePropertyVariables();
  }

  initializePropertyVariables(initMap) {
    initMap = Object.assign({
      fill: `'rgba(0, 0, 0, 0.2)'`,
      stroke: `'#000000'`,
      strokeWidth: 1
    }, initMap);

    _.keys(initMap).forEach(name => {
      if (!this._propertyVariables.has(name)) {
        let v = initMap[name];
        if (!(v instanceof DataVariable)) {
          v = new DataVariable({name, definition: v});
        }
        this._propertyVariables = this._propertyVariables.set(name, v);
      }
    });
  }

  get propertyVariables() { return this._propertyVariables.valueSeq().toArray(); }
  set propertyVariables(v) { throw `Not allowed to set propertyVariables.  (Tried to set to ${v})`; }

  modifyInstructionWithPropertyVariable(pictureActions, picture, variable) {
    let propertyVariables = this._propertyVariables.set(variable.name, variable);
    this.modifyProps(pictureActions, picture, {propertyVariables});
  }

  getPropsJs(index) {
    let stylePropsJs = this.propertyVariables.map(variable => {
      let js = variable.definition.getJsCode(index);
      return `${variable.name}: ${js}`;
    });

    return super.getPropsJs(index).concat([
     `name: '${this.name}'`,
     ...stylePropsJs,
     `isGuide: ${this.isGuide}`
    ]);
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {from, fromMagnets, to, toMagnets, isGuide, propertyVariables} = this;
    return Object.assign(props, {to, toMagnets, from, fromMagnets,
                                 isGuide, propertyVariables});
  }

  isValid() {
    return !!this.from;
  }

  getFromJs(index) {
    if (this.from.id) {
      let fromPt = this.getPointVarJs(this.from, index);
      return {
        x: `${fromPt}.x`,
        y: `${fromPt}.y`
      };
    }
    return {
      x: this.from.x,
      y: this.from.y
    };
  }

  getFromValue(shapes, currentLoopIndex) {
    if (this.from.id) {
      // Must be a shape point
      let shape = shapes.getShapeByIdAndIndex(this.from.id, currentLoopIndex);
      return shape.getPoint(this.from.point);
    }
    return this.from;
  }

  getSizeUi() {
    return (
      <span className="size-ui">
        , with unknown size
      </span>
    );
  }

  getNameEditable(pictureActions, picture) {
    if (!this.name) {
      console.error('Must set name on draw instruction');
    }

    return (
      <ContentEditable
        className='name-editable'
        html={this.name}
        onChange={this.handleShapeNameChange.bind(this, pictureActions, picture)} />
    );
  }

  getInvalidUi(pictureActions, picture) {
    return (
      <span className='instruction-sentence'>
        Draw a {this.getNameEditable(pictureActions, picture)} ...
      </span>
    );
  }

  getFromUi(pictureActions, picture, shapes) {
    let pointUi = this.getPointUi(shapes, this.from);
    if (pointUi === null) {
      pointUi = `(${this.from.x}, ${this.from.y})`;
    }
    return (
      <span>Draw {this.getNameEditable(pictureActions, picture)} from {pointUi}</span>
    );
  }

  getToUi(pictureActions, picture, variableValues, shapeNameMap) {
    if (this.to) {
      return this.getPointToUi(shapeNameMap);
    } else {
      return this.getSizeUi(pictureActions, picture, variableValues);
    }
  }

  getPointToUi(shapes) {
    return ` until ${this.getPointUi(shapes, this.to)}`;
  }

  getUiSentence(pictureActions, picture, variableValues, shapeNameMap) {
    if (!this.isValid()) {
      return this.getInvalidUi(pictureActions, picture);
    }

    let fromUi = this.getFromUi(pictureActions, picture, shapeNameMap);
    let toUi = this.getToUi(pictureActions, picture, variableValues, shapeNameMap);

    return (
      <span className='instruction-sentence'>
        {fromUi}
        {toUi}
      </span>
    );
  }

  handleShapeNameChange(pictureActions, picture, evt) {
    // Only draw instructions can change shape name for now
    let props = this.getCloneProps();
    props.name = evt.target.value;
    this.modifyInstructionWithProps(pictureActions, picture, props);
  }

}
