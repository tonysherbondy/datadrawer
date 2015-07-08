import React from 'react';
import Shape from '../models/shapes/Shape';
import Picture from '../models/Picture';
import ExpressionEditorAndScrub from './ExpressionEditorAndScrub';
import ColorExpressionEditor from './ColorExpressionEditor';
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

    // Rename variables for this list
    let {propertyVariables} = instruction;
    let variableNameMap = {};
    propertyVariables.forEach(v => {
      variableNameMap[v.id] = `${instruction.name}'s ${v.name}`;
    });

    return (
      <div className="shape-data-list">
        <DataVariableList
          picture={picture}
          readOnly={true}
          variableNameMap={variableNameMap}
          onDefinitionChange={this.handleDefinitionChange.bind(this, instruction)}
          dataVariables={propertyVariables}
          dataValues={variableValues} />

      </div>
    );
        //<DataTable
          //picture={picture}
          //dataVariables={renamedVariables}
          //dataValues={variableValues} />
  }

  getExpressionEditor(instruction, variable) {
    let {picture, variableValues} = this.props;
    if (variable.definition.isColor()) {
      return (
        <ColorExpressionEditor
          picture={picture}
          variableValues={variableValues}
          onChange={this.handleDefinitionChange.bind(this, instruction, variable)}
          definition={variable.definition} />
      );
    } else {
      return (
        <ExpressionEditorAndScrub
          picture={picture}
          onChange={this.handleDefinitionChange.bind(this, instruction, variable)}
          variableValues={variableValues}
          definition={variable.definition} />
      );
    }
  }

  getDrawInstruction(id) {
    return this.props.picture.getDrawInstructionForShapeId(id);
  }

  handleDefinitionChange(instruction, variable, definition) {
    let newVariable = variable.cloneWithDefinition(definition);
    // TODO - Call something different if instruction is picture
    instruction.modifyInstructionWithPropertyVariable(this.props.picture, newVariable);
  }
}

ShapeDataList.propTypes = {
  variableValues: React.PropTypes.object.isRequired,
  picture: React.PropTypes.instanceOf(Picture).isRequired,
  // I'm passing shape instead of instruction as I may need shape for measurements
  shape: React.PropTypes.instanceOf(Shape)
};
