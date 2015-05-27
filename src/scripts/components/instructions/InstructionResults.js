import React from 'react';
import Canvas from '../drawing/Canvas';
import InstructionTitle from './InstructionTitle';
import InstructionCode from './InstructionCode';
import DataVariableList from './DataVariableList';
import DataTable from './DataTable';
import InstructionList from './InstructionList';
import PictureResult from '../../models/PictureResult';

export default class InstructionResults extends React.Component {

  render() {
    let {pictureResult} = this.props;
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    let {currentInstruction} = this.props;
    let {selectedInstructions} = this.props;
    let selectedShape = pictureResult.getShapeById(this.props.selectedShapeId);
    let shapeNameMap = pictureResult.getShapeNameMap();

    return (
      <div>
        <DataVariableList
          scalars={scalars}
          dataVariables={this.props.dataVariables}
          dataValues={pictureResult.variableValues} />

        <DataTable
          currentLoopIndex={this.props.drawingState.currentLoopIndex}
          table={pictureResult.getTable()} />

        <InstructionTitle
          dataVariables={this.props.dataVariables}
          variableValues={pictureResult.variableValues}
          shapeNameMap={shapeNameMap}
          instruction={currentInstruction} />

        <Canvas
          drawingState={this.props.drawingState}
          // TODO - Only need this to create new instruction ID :/
          instructions={this.props.instructions}
          selectedShape={selectedShape}
          pictureResult={pictureResult}
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
  pictureResult: React.PropTypes.instanceOf(PictureResult).isRequired,
  instructions: React.PropTypes.array,
  dataVariables: React.PropTypes.array
};

InstructionResults.defaultProps = {
  instructions: [],
  dataVariables: []
};
