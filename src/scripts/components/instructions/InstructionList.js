import React from 'react';
import classNames from 'classnames';
import InstructionActions from '../../actions/InstructionActions';
import DrawingStateActions from '../../actions/DrawingStateActions';
import InstructionTreeNode from '../../models/InstructionTreeNode';

export default class InstructionList extends React.Component {

  removeInstruction(instruction) {
    InstructionActions.removeInstruction(instruction);
  }

  render() {
    let {selectedInstructions} = this.props;

    let getSubInstructionsList = (instruction, isSelected) => {
      let subInstructions = (instruction.instructions || []);
      if (subInstructions) {
        return (
          <ul className={classNames('sub-instructions-list', {selected: isSelected})}>
            {subInstructions.map(getInstructionItems)}
          </ul>
        );
      }
      return undefined;
    };

    let getInstructionItems = (instruction, index) => {
      let isSelected = selectedInstructions.findIndex(i => i.id === instruction.id) > -1;
      let itemClass = classNames('instruction-list-item', {selected: isSelected});
      let subInstructionList = getSubInstructionsList(instruction, isSelected);

      return (
        <li className={itemClass} key={index} onClick={this.handleItemClick.bind(this, instruction)}>
          {instruction.getUiSentence(this.props.dataVariables, this.props.variableValues, this.props.shapeNameMap)}
          <button
            type='button'
            className='delete-instruction'
            onClick={this.removeInstruction.bind(this, instruction)}>
            <i className="fa fa-close"></i>
          </button>
          {subInstructionList}
        </li>
      );
    };

    return (
      <ul className='instructions-list'>
        {this.props.instructions.map(getInstructionItems)}
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
  shapeNameMap: React.PropTypes.object.isRequired,
  dataVariables: React.PropTypes.array.isRequired,
  instructions: React.PropTypes.array,
  variableValues: React.PropTypes.object
};

InstructionList.defaultProps = {
  instructions: [],
  variableValues: {}
};
