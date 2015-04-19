import biff from '../dispatcher/dispatcher';

const InstructionActions = biff.createActions({
  addInstruction(instruction) {

    this.dispatch({
      actionType: 'ADD_INSTRUCTION_START'
    });

    // Simulate Async Call
    setTimeout(() => {

      if (instruction !== '') {
        this.dispatch({
          actionType: 'ADD_INSTRUCTION_SUCCESS',
          data: instruction
        });
      } else {
        this.dispatch({
          actionType: 'ADD_INSTRUCTION_ERROR'
        });
      }

    }, 600);

  },
  removeInstruction(index) {
    this.dispatch({
      actionType: 'REMOVE_INSTRUCTION',
      data: index
    });
  }
});

export default InstructionActions;

