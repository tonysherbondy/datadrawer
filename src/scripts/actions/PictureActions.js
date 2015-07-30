import biff from '../dispatcher/dispatcher';

const PictureActions = biff.createActions({
  addNewPicture(picture) {
    this.dispatch({actionType: 'ADD_NEW_PICTURE', picture});
  },

  addInstruction(picture, instruction) {
    this.dispatch({actionType: 'ADD_INSTRUCTION', picture, instruction});
  },

  modifyInstruction(picture, instruction) {
    this.dispatch({actionType: 'MODIFY_INSTRUCTION', picture, instruction});
  },

  removeInstruction(picture, instruction) {
    PictureActions.removeInstructions(picture, [instruction]);
  },

  removeInstructions(picture, instructions) {
    this.dispatch({actionType: 'REMOVE_INSTRUCTIONS', picture, instructions});
  },

  replaceInstructions(picture, toRemove, toAdd) {
    this.dispatch({actionType: 'REPLACE_INSTRUCTIONS', picture, toRemove, toAdd});
  },

  insertInstruction(picture, instruction, index, parent) {
    this.dispatch({
      actionType: 'INSERT_INSTRUCTION',
      picture,
      instruction,
      index,
      parent
    });
  },

  insertInstructionAfterInstruction(picture, instructionToInsert, instruction) {
    if (!instruction) {
      // If no current instruction, simply add the instruction to end
      PictureActions.addInstruction(picture, instructionToInsert);
    } else {
      this.dispatch({
        actionType: 'INSERT_INSTRUCTION_AFTER_INSTRUCTION',
        picture,
        instruction,
        instructionToInsert
      });
    }
  },

  addVariable(picture, variable) {
    this.dispatch({actionType: 'ADD_VARIABLE', picture, variable});
  },

  modifyVariable(picture, variable) {
    this.dispatch({actionType: 'MODIFY_VARIABLE', picture, variable});
  },

  removeVariable(picture, variable) {
    this.dispatch({actionType: 'REMOVE_VARIABLE', picture, variable});
  },

  undoChange(picture) {
    this.dispatch({actionType: 'UNDO_CHANGE_TO_PICTURE', picture});
  },

  redoChange(picture) {
    this.dispatch({actionType: 'REDO_CHANGE_TO_PICTURE', picture});
  }
});

export default PictureActions;
