import React, { Component, PropTypes } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DnDInstructionListItem from './DnDInstructionListItem';

const style = {};

@DragDropContext(HTML5Backend)
class DnDInstructionList extends Component {
  static propTypes = {
    instructions: PropTypes.array.isRequired,
    picture: PropTypes.object.isRequired
  }

  static contextTypes = {
    actions: PropTypes.shape({
      picture: PropTypes.object.isRequired
    })
  }

  constructor(props) {
    super(props);
    this.moveInstruction = this.moveInstruction.bind(this);
    this.state = {
      instructions: props.instructions
    };
  }

  render() {
    const { instructions } = this.state;

    return (
      <div style={style}>
        {instructions.map(instruction => {
          return (
            <DnDInstructionListItem key={instruction.id}
                  instruction={instruction}
                  moveInstruction={this.moveInstruction} />
          );
        })}
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ instructions: nextProps.instructions });
  }

  moveInstruction(id, afterId) {
    const { instructions } = this.state;
    const instruction = instructions.filter(c => c.id === id)[0];
    const afterInstruction = instructions.filter(c => c.id === afterId)[0];

    this.context.actions.picture.moveInstructionToInstruction(
      this.props.picture.id, instruction, afterInstruction);
  }
}

export default DnDInstructionList;
