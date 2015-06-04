import React from 'react';
import Instruction from './Instruction';
import ContentEditable from '../components/ContentEditable';

export default class DrawInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: `shape_${props.id}`});
    // Every draw instruction has a from, that can either be an explicit
    // point or reference to another point, refPoint
    this.from = props.from;
    this.fromMagnets = props.fromMagnets;
    this.to = props.to;
    this.toMagnets = props.toMagnets;
    this.isGuide = !!props.isGuide;
    this.name = props.name;
    this.strokeWidth = props.strokeWidth || 1;
    this.stroke = props.stroke || 'black';
    this.fill = props.fill || 'rgba(0, 0, 0, 0.2)';
  }

  getPropsJs(index) {
    return super.getPropsJs(index).concat([
     `name: '${this.name}'`,
     `fill: '${this.fill}'`,
     `stroke: '${this.stroke}'`,
     `strokeWidth: ${this.strokeWidth}`,
     `isGuide: ${this.isGuide}`
    ]);
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {from, fromMagnets, to, toMagnets, isGuide, strokeWidth, stroke, fill} = this;
    return Object.assign(props, {to, toMagnets, from, fromMagnets,
                                 isGuide, stroke,
                                 strokeWidth, fill});
  }

  serialize() {
    var json = super.serialize();

    if (this.from !== undefined) {
      json.from = this.from;
    }
    if (this.to !== undefined) {
      json.to = this.to;
    }
    if (this.isGuide !== undefined) {
      json.isGuide = this.isGuide;
    }
    if (this.strokeWidth !== undefined) {
      json.strokeWidth = this.strokeWidth;
    }
    if (this.stroke !== undefined) {
      json.stroke = this.stroke;
    }
    if (this.fill !== undefined) {
      json.fill = this.fill;
    }

    return json;
  }

  serializeOld() {
    var serialized = this.getCloneProps();
    for (var prop in serialized) {
      if (serialized.hasOwnProperty(prop) && serialized[prop] === undefined) {
        delete serialized[prop];
      }
    }
    return serialized;
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

  getFromValue(pictureResult) {
    if (this.from.id) {
      // Must be a shape point
      let shape = pictureResult.getShapeById(this.from.id);
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

  getNameEditable() {
    if (!this.name) {
      console.error('Must set name on draw instruction');
    }

    return (
      <ContentEditable
        className='name-editable'
        html={this.name}
        onChange={this.handleShapeNameChange.bind(this)} />
    );
  }

  getInvalidUi() {
    return (
      <span className='instruction-sentence'>
        Draw a {this.getNameEditable()} ...
      </span>
    );
  }

  getFromUi(shapes) {
    let pointUi = this.getPointUi(shapes, this.from);
    if (pointUi === null) {
      pointUi = `(${this.from.x}, ${this.from.y})`;
    }
    return (
      <span>Draw {this.getNameEditable()} from {pointUi}</span>
    );
  }

  getPointToUi(shapes) {
    return ` until ${this.getPointUi(shapes, this.to)}`;
  }

  getUiSentence(variables, variableValues, shapeNameMap) {
    if (!this.isValid()) {
      return this.getInvalidUi();
    }

    let fromUi = this.getFromUi(shapeNameMap);
    let toUi;
    if (this.to) {
      toUi = this.getPointToUi(shapeNameMap);
    } else {
      toUi = this.getSizeUi(variables, variableValues);
    }
    return (
      <span className='instruction-sentence'>
        {fromUi}
        {toUi}
      </span>
    );
  }

  handleShapeNameChange(evt) {
    // Only draw instructions can change shape name for now
    let props = this.getCloneProps();
    props.name = evt.target.value;
    this.modifyInstructionWithProps(props);
  }

}
