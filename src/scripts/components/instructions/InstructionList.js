import React from 'react';
import InstructionActions from '../../actions/InstructionActions';
import DrawingStateActions from '../../actions/DrawingStateActions';

export default class InstructionList extends React.Component {

  removeInstruction(index) {
    InstructionActions.removeInstruction(index);
  }

  render() {
    let getInstructionItems = (instruction, index) => {
      let subInstructions = (instruction.instructions || []).filter(i => i.isValid());
      let subInstructionList;
      if (subInstructions) {
        subInstructionList = (
          <ul className='sub-instructions-list'>
            {subInstructions.map(getInstructionItems)}
          </ul>
        );
      }

      let itemClass = 'instruction-list-item';
      let isSelected = this.props.selectedInstruction && instruction.id === this.props.selectedInstruction.id;
      if (isSelected) {
        itemClass += ' selected';
      }

      return (
        <li className={itemClass} key={index} onClick={this.handleItemClick.bind(this, instruction)}>
          {instruction.getUiSentence(this.props.dataVariables, this.props.variableValues)}
          <button
            type='button'
            className='delete-instruction'
            onClick={this.removeInstruction.bind(this, index)}>
            <i className="fa fa-close"></i>
          </button>
          {subInstructionList}
        </li>
      );
    };

    let validInstructions = this.props.instructions.filter(i => i.isValid());
    return (
      <ul className='instructions-list'>
        {validInstructions.map(getInstructionItems)}
      </ul>
    );
  }

  handleItemClick(instruction, evt) {
    DrawingStateActions.setSelectedInstruction(instruction);
    evt.stopPropagation();
  }

}

InstructionList.propTypes = {
  dataVariables: React.PropTypes.array.isRequired,
  instructions: React.PropTypes.array,
  variableValues: React.PropTypes.object
};

InstructionList.defaultProps = {
  instructions: [],
  variableValues: {}
};
