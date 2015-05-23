import React from 'react';
import InstructionActions from '../../actions/InstructionActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
import InstructionTreeNode from '../../models/InstructionTreeNode';

export default class InstructionList extends React.Component {

  removeInstruction(index) {
    InstructionActions.removeInstruction(index);
  }

  render() {
    let {selectedInstructions} = this.props;
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
      let isSelected = selectedInstructions.findIndex(i => i.id === instruction.id) > -1;
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
    let {selectedInstructions} = this.props;
    // Only select range of instructions with shift key down and if we have only one other selected
    if (evt.shiftKey && selectedInstructions.length === 1) {
      // try to select range of instructions
      let {instructions} = this.props;
      // try either end of the instructions to see which side is bigger
      let prevInstruction = selectedInstructions[0];
      let between = InstructionTreeNode.findBetweenRange(instructions, prevInstruction, instruction);
      if (between.length && between.length > 0) {
        DrawingStateActions.setSelectedInstructions(between);
      }
    } else {
      DrawingStateActions.setSelectedInstruction(instruction);
    }
    evt.stopPropagation();
    evt.preventDefault();
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
