import React from 'react';
import InstructionActions from '../../actions/InstructionActions';

export default class InstructionList extends React.Component {

  removeInstruction(index) {
    InstructionActions.removeInstruction(index);
  }

  render() {
    let getInstructionItems = (instruction, index) => {
      let subInstructions = instruction.instructions;
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
          {instruction.getUISentence()}
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
    return (
      <ul className='instructions-list'>
        {this.props.instructions.map(getInstructionItems)}
      </ul>
    );
  }

}

InstructionList.propTypes = {
  instructions: React.PropTypes.array
};

InstructionList.defaultProps = {
  instructions: []
};
