import React from 'react';
import Immutable from 'immutable';
import InstructionActions from '../../actions/InstructionActions';

export default class InstructionList extends React.Component {

  removeInstruction(index) {
    InstructionActions.removeInstruction(index);
  }

  render() {
    return (
      <ul className='instructions-list list-group'>
        {this.props.instructions.map((instruction, index) => {
          return (
              <li className='list-group-item' key={index}>
                {instruction.getUISentence()}
                <button
                  type='button'
                  className='btn btn-xs btn-danger pull-right'
                  onClick={this.removeInstruction.bind(this, index)}>
                  <i className='glyphicon glyphicon-remove'/>
                </button>
              </li>
          );
        })}
      </ul>
    );
  }

}

InstructionList.propTypes = {
  instructions: React.PropTypes.object
};

InstructionList.defaultProps = {
  instructions: new Immutable.List()
};
