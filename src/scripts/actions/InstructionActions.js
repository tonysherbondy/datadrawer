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

    }, 6);

  },

  // Expect that you change the instruction and pass it in
  modifyInstruction(instruction) {
    this.dispatch({
      actionType: 'MODIFY_INSTRUCTION',
      data: instruction
    });
  },

  // TODO Should probably change this to picture, or change instruction
  // store to picture store
  loadPresetInstructions(name) {
    this.dispatch({
      actionType: 'LOAD_PRESET_INSTRUCTIONS',
      data: name
    });
  },

  removeInstructions(instructions) {
    this.dispatch({
      actionType: 'REMOVE_INSTRUCTIONS',
      data: instructions
    });
  },

  insertInstruction(instruction, index, parent) {
    this.dispatch({
      actionType: 'INSERT_INSTRUCTION',
      data: {instruction, index, parent}
    });
  },

  removeInstruction(instruction) {
    InstructionActions.removeInstructions([instruction]);
  },

  setName(name) {
    this.dispatch({
      actionType: 'SET_PICTURE_NAME',
      data: name
    });
  }
});

export default InstructionActions;

