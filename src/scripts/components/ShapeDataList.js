import React from 'react';
import Shape from '../models/shapes/Shape';
import Picture from '../models/Picture';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import DataVariableList from './instructions/DataVariableList';
//import DataTable from './instructions/DataTable';

export default class ShapeDataList extends React.Component {

  render() {

    let {shape, variableValues, picture} = this.props;
    if (!shape) {
      return (<span>No shape selected.</span>);
    }

    let instruction = this.getDrawInstruction(shape.id);
    if (!instruction) {
      return (<span>Cannot modify shape.</span>);
    }

    // Picture variables are different as they have the Picture data
    let variables;
    if (instruction instanceof DrawPictureInstruction) {
      variables = instruction.pictureVariables;
    } else {
      variables = instruction.propertyVariables;
    }

    // Rename variables
    let variableNameMap = {};
    (variables || []).forEach(v => {
      variableNameMap[v.id] = `${instruction.name}'s ${v.name}`;
    });

    return (
      <div className="shape-data-list">
        <DataVariableList
          picture={picture}
          readOnly={true}
          variableNameMap={variableNameMap}
          onDefinitionChange={this.handleDefinitionChange.bind(this, instruction)}
          dataVariables={variables}
          dataValues={variableValues} />

      </div>
    );
        //<DataTable
          //picture={picture}
          //dataVariables={renamedVariables}
          //dataValues={variableValues} />
  }

  getDrawInstruction(id) {
    return this.props.picture.getDrawInstructionForShapeId(id);
  }

  handleDefinitionChange(instruction, variable, definition) {
    let newVariable = variable.cloneWithDefinition(definition);
    if (instruction instanceof DrawPictureInstruction) {
      instruction.modifyInstructionWithPictureVariable(this.props.picture, newVariable);
    } else {
      instruction.modifyInstructionWithPropertyVariable(this.props.picture, newVariable);
    }
  }
}

ShapeDataList.propTypes = {
  variableValues: React.PropTypes.object.isRequired,
  picture: React.PropTypes.instanceOf(Picture).isRequired,
  // I'm passing shape instead of instruction as I may need shape for measurements
  shape: React.PropTypes.instanceOf(Shape)
};
