import biff from '../dispatcher/dispatcher';

const PictureActions = biff.createActions({
  addNewPicture() {
    this.dispatch({
      actionType: 'ADD_NEW_PICTURE'
    });
  },

  addInstruction(picture, instruction) {
    this.dispatch({
      actionType: 'ADD_INSTRUCTION',
      picture: picture,
      instruction: instruction
    });
  },

  modifyInstruction(picture, instruction) {
    this.dispatch({
      actionType: 'MODIFY_INSTRUCTION',
      picture: picture,
      instruction: instruction
    });
  },

  removeInstruction(picture, instruction) {
    PictureActions.removeInstructions(picture, [instruction]);
  },

  removeInstructions(picture, instructions) {
    this.dispatch({
      actionType: 'REMOVE_INSTRUCTIONS',
      picture: picture,
      instructions: instructions
    });
  },

  insertInstruction(picture, instruction, index, parent) {
    this.dispatch({
      actionType: 'INSERT_INSTRUCTION',
      picture: picture,
      instruction: instruction,
      index: index,
      parent: parent
    });
  },

  addVariable(picture, variable) {
    this.dispatch({
      actionType: 'ADD_VARIABLE',
      picture: picture,
      variable: variable
    });
  },

  modifyVariable(picture, variable) {
    this.dispatch({
      actionType: 'MODIFY_VARIABLE',
      picture: picture,
      variable: variable
    });
  },

  removeVariable(picture, variable) {
    this.dispatch({
      actionType: 'REMOVE_VARIABLE',
      picture: picture,
      variable: variable
    });
  }
});

export default PictureActions;
