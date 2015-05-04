import React from 'react';
import InstructionActions from '../../actions/InstructionActions';

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

      return (
        <li className='instruction-list-item' key={index}>
          {instruction.getUiSentence(this.props.variableValues)}
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

}

InstructionList.propTypes = {
  instructions: React.PropTypes.array,
  variableValues: React.PropTypes.object
};

InstructionList.defaultProps = {
  instructions: [],
  variableValues: {}
};
