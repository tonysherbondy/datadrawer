import React, { Component } from 'react';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd/modules/backends/HTML5';

import DnDInstructionListItem from './DnDInstructionListItem';

const style = {
  width: 400
};

@DragDropContext(HTML5Backend)
class DnDInstructionList extends Component {
  constructor(props) {
    super(props);
    this.moveInstruction = this.moveInstruction.bind(this);
    this.state = {
      instructions: [{
        id: 1,
        text: 'Write a cool JS library'
      }, {
        id: 2,
        text: 'Make it generic enough'
      }, {
        id: 3,
        text: 'Write README'
      }, {
        id: 4,
        text: 'Create some examples'
      }, {
        id: 5,
        text: 'Spam in Twitter and IRC to promote it'
      }, {
        id: 6,
        text: '???'
      }, {
        id: 7,
        text: 'PROFIT'
      }]
    };
  }

  render() {
    const { instructions } = this.state;

    return (
      <div style={style}>
        {instructions.map(instruction => {
          return (
            <DnDInstructionListItem key={instruction.id}
                  id={instruction.id}
                  text={instruction.text}
                  moveInstruction={this.moveInstruction} />
          );
        })}
      </div>
    );
  }

  moveInstruction(id, afterId) {
    const { instructions } = this.state;

    const instruction = instructions.filter(c => c.id === id)[0];
    const afterInstruction = instructions.filter(c => c.id === afterId)[0];
    const instructionIndex = instructions.indexOf(instruction);
    const afterIndex = instructions.indexOf(afterInstruction);

    this.setState(update(this.state, {
      instructions: {
        $splice: [
          [instructionIndex, 1],
          [afterIndex, 0, instruction]
        ]
      }
    }));
  }

}

export default DnDInstructionList;
