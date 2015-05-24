import React from 'react';

export default class InstructionTitle extends React.Component {

  render() {
    let titleUi = '';
    let instruction = this.props.instruction;
    if (instruction) {
      titleUi = instruction.getUiSentence(this.props.dataVariables, this.props.variableValues, this.props.shapeNameMap);
    }
    return (
      <div className="instruction-title">
        {titleUi}
      </div>
    );
  }
}

InstructionTitle.propTypes = {
  shapeNameMap: React.PropTypes.object.isRequired,
  dataVariables: React.PropTypes.array.isRequired,
  variableValues: React.PropTypes.object
};

InstructionTitle.defaultProps = {
  variableValues: {}
};
