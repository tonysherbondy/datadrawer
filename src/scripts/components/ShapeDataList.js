import React from 'react';
import Shape from '../models/shapes/Shape';
import Picture from '../models/Picture';
import VariablePill from './VariablePill';
import ExpressionEditorAndScrub from './ExpressionEditorAndScrub';
import ColorExpressionEditor from './ColorExpressionEditor';

export default class ShapeDataList extends React.Component {

  render() {

    let shape = this.props.shape;
    if (!shape) {
      return (<span>No shape selected.</span>);
    }

    let instruction = this.getDrawInstruction(shape.id);
    if (!instruction) {
      return (<span>Cannot modify shape.</span>);
    }

    let instructionName = instruction.name;
    let {propertyVariables} = instruction;
    let propsUi = propertyVariables.map(property => {
      let name = `${instructionName}'s ${property.name}`;
      let value = property.definition.evaluate(this.props.variableValues);
      return (
        <li className='shape-data-list-item' key={property.name}>
          <VariablePill variable={{id: property.id, name}} />
          {this.getExpressionEditor(instruction, property)}
          <div className='shape-data-value'>
            {value}
          </div>
        </li>
      );
    });
    return (
      <ul className='shape-data-list'>
        {propsUi}
      </ul>
    );
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
    instruction.modifyInstructionWithPropertyVariable(this.props.picture, newVariable);
  }
}

ShapeDataList.propTypes = {
  variableValues: React.PropTypes.object.isRequired,
  picture: React.PropTypes.instanceOf(Picture).isRequired,
  // I'm passing shape instead of instruction as I may need shape for measurements
  shape: React.PropTypes.instanceOf(Shape)
};
