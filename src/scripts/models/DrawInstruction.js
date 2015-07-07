import React from 'react';
import Instruction from './Instruction';
import ContentEditable from '../components/ContentEditable';
import DataVariable from './DataVariable';
import {guid} from '../utils/utils';
import {OrderedMap} from 'immutable';

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

  initializePropertyVariables() {
    let inits = [
      {name: 'Stroke Width', definition: 1},
      {name: 'Stroke', definition: `'#000000'`},
      {name: 'Fill', definition: `'rgba(0, 0, 0, 0.2)'`}
    ];
    inits.forEach(property => {
      let {name, definition} = property;
      if (!this._propertyVariables.has(name)) {
        this._propertyVariables = this._propertyVariables.set(name, new DataVariable({name, definition}));
      }
    });
  }

  get propertyVariables() { return this._propertyVariables.valueSeq().toArray(); }
  set propertyVariables(v) { throw `Not allowed to set propertyVariables.  (Tried to set to ${v})`; }

  modifyInstructionWithPropertyVariable(picture, variable) {
    let propertyVariables = this._propertyVariables.set(variable.name, variable);
    this.modifyProps(picture, {propertyVariables});
  }

  getPropsJs(index) {
    let styleProps = [
      {name: 'Fill', shapeName: 'fill'},
      {name: 'Stroke', shapeName: 'stroke'},
      {name: 'Stroke Width', shapeName: 'strokeWidth'}
    ];

    let stylePropsJs = styleProps.map(prop => {
      let variable = this._propertyVariables.get(prop.name);
      let js = variable.definition.getJsCode(index);
      return `${prop.shapeName}: ${js}`;
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

  getNameEditable(picture) {
    if (!this.name) {
      console.error('Must set name on draw instruction');
    }

    return (
      <ContentEditable
        className='name-editable'
        html={this.name}
        onChange={this.handleShapeNameChange.bind(this, picture)} />
    );
  }

  getInvalidUi(picture) {
    return (
      <span className='instruction-sentence'>
        Draw a {this.getNameEditable(picture)} ...
      </span>
    );
  }

  getFromUi(picture, shapes) {
    let pointUi = this.getPointUi(shapes, this.from);
    if (pointUi === null) {
      pointUi = `(${this.from.x}, ${this.from.y})`;
    }
    return (
      <span>Draw {this.getNameEditable(picture)} from {pointUi}</span>
    );
  }

  getToUi(picture, variableValues, shapeNameMap) {
    if (this.to) {
      return this.getPointToUi(shapeNameMap);
    } else {
      return this.getSizeUi(picture, variableValues);
    }
  }

  getPointToUi(shapes) {
    return ` until ${this.getPointUi(shapes, this.to)}`;
  }

  getUiSentence(picture, variableValues, shapeNameMap) {
    if (!this.isValid()) {
      return this.getInvalidUi(picture);
    }

    let fromUi = this.getFromUi(picture, shapeNameMap);
    let toUi = this.getToUi(picture, variableValues, shapeNameMap);

    return (
      <span className='instruction-sentence'>
        {fromUi}
        {toUi}
      </span>
    );
  }

  handleShapeNameChange(picture, evt) {
    // Only draw instructions can change shape name for now
    let props = this.getCloneProps();
    props.name = evt.target.value;
    this.modifyInstructionWithProps(picture, props);
  }

}
