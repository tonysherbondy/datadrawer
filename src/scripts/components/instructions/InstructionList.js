import React from 'react';
import InstructionActions from '../../actions/InstructionActions';

export default class InstructionList extends React.Component {

  removeInstruction(index) {
    InstructionActions.removeInstruction(index);
  }

  render() {
    return (
      <ul className='instructions-list'>
        {this.props.instructions.map((instruction, index) => {
          return (
              <li className='instruction-list-item' key={index}>
                {instruction.getUISentence()}
                <button
                  type='button'
                  className='delete-instruction'
                  onClick={this.removeInstruction.bind(this, index)}>
                  <i className="fa fa-close"></i>
                </button>
              </li>
          );
        })}
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
