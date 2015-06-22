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
    let props = ['strokeWidth', 'stroke', 'fill'];
    let propsUi = props.map(property => {
      let name = `${instructionName}'s ${property}`;
      let id = `${instruction.id}_${property}`;
      let variable = {id, name};
      let value = shape[property];
      let getExpressionEditor = expression => {
        if (expression.isColor()) {
          return (
            <ColorExpressionEditor
              picture={this.props.picture}
              variableValues={this.props.variableValues}
              onChange={this.handleDefinitionChange.bind(this, this.props.picture, instruction, property)}
              definition={expression} />
          );
        } else {
          return (
            <ExpressionEditorAndScrub
              picture={this.props.picture}
              onChange={this.handleDefinitionChange.bind(this, this.props.picture, instruction, property)}
              variableValues={this.props.variableValues}
              definition={expression} />
          );
        }
      };
      return (
        <li className='shape-data-list-item' key={property}>
          <VariablePill variable={variable} />
          {getExpressionEditor(instruction[property])}
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

  getDrawInstruction(id) {
    return this.props.picture.getDrawInstructionForShapeId(id);
  }
  handleDefinitionChange(picture, instruction, property, definition) {
    let props = instruction.getCloneProps();
    props[property] = definition;
    instruction.modifyInstructionWithProps(picture, props);
  }
}

ShapeDataList.propTypes = {
  variableValues: React.PropTypes.object.isRequired,
  picture: React.PropTypes.instanceOf(Picture).isRequired,
  // I'm passing shape instead of instruction as I may need shape for measurements
  shape: React.PropTypes.instanceOf(Shape)
};
