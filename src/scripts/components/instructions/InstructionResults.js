import React from 'react';
import _ from 'lodash';
import Canvas from '../drawing/Canvas';
import InstructionTitle from './InstructionTitle';
import InstructionCode from './InstructionCode';
import DataVariableList from './DataVariableList';
import DataTable from './DataTable';
import InstructionList from './InstructionList';
import DrawInstruction from '../../models/DrawInstruction';
import InstructionTreeNode from '../../models/InstructionTreeNode';

export default class InstructionResults extends React.Component {

  // Create map from shapeId to shapeName, this has to be done so that all possible shapes
  // even the ones not currently drawn are in the map
  getShapeNameMap(instructions) {
    let nameMap = {canvas: 'canvas'};
    InstructionTreeNode
      .flatten(instructions)
      .filter(i => i instanceof DrawInstruction)
      .forEach(i => {
        nameMap[i.shapeId] = i.name || i.id;
      });
    return nameMap;
  }

  getSelectedShape(id, shapes) {
    if (!_.isString(id)) {
      return null;
    }
    let shape = shapes[id];
    if (!shape) {
      // try adding looping index
      shape = shapes[`${id}_0`];
    }
    return shape;
  }

  render() {
    let {pictureResult} = this.props;
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    let {currentInstruction} = this.props;
    let {selectedInstructions} = this.props;
    let selectedShape = this.getSelectedShape(this.props.selectedShapeId, pictureResult.shapes);
    let shapeNameMap = this.getShapeNameMap(this.props.instructions);

    return (
      <div>
        <DataVariableList
          scalars={scalars}
          dataVariables={this.props.dataVariables}
          dataValues={pictureResult.variableValues} />

        <DataTable
          table={pictureResult.getTable()} />

        <InstructionTitle
          dataVariables={this.props.dataVariables}
          variableValues={pictureResult.variableValues}
          shapeNameMap={shapeNameMap}
          instruction={currentInstruction} />

        <Canvas
          shapes={pictureResult.shapes}
          drawingState={this.props.drawingState}
          // TODO - Only need this to create new instruction ID :/
          instructions={this.props.instructions}
          selectedShape={selectedShape}
          editingInstruction={this.props.editingInstruction} />

        <InstructionCode code={pictureResult.jsCode} />

        <div>
          Mode: {this.props.drawingState.mode}
        </div>

        <InstructionList
          currentInstruction={currentInstruction}
          selectedInstructions={selectedInstructions}
          dataVariables={this.props.dataVariables}
          variableValues={pictureResult.variableValues}
          shapeNameMap={shapeNameMap}
          instructions={this.props.instructions} />
      </div>
    );
  }

}

InstructionResults.propTypes = {
  instructions: React.PropTypes.array,
  dataVariables: React.PropTypes.array
};

InstructionResults.defaultProps = {
  instructions: [],
  dataVariables: []
};
