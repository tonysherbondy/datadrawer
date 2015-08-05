function pictureActions(pictureApi) {
  return {
    addNewPicture(picture) {
      this.dispatch({actionType: 'ADD_NEW_PICTURE', picture});
    },

    setNotebookName(notebookName) {
      this.dispatch({actionType: 'SET_NOTEBOOK_NAME', notebookName});
    },

    modifyInstruction(picture, instruction) {
      this.dispatch({actionType: 'MODIFY_INSTRUCTION', picture, instruction});
    },

    removeInstruction(picture, instruction) {
      this.dispatch({actionType: 'REMOVE_INSTRUCTIONS', picture, instructions: [instruction]});
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
      this.dispatch({
        actionType: 'INSERT_INSTRUCTION_AFTER_INSTRUCTION',
        picture,
        instruction,
        instructionToInsert
      });
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

    setActivePicture(picture) {
      this.dispatch({actionType: 'SET_ACTIVE_PICTURE', picture});
    },

    setInvalidPictureState() {
      this.dispatch({actionType: 'SET_INVALID_PICTURE_STATE'});
    },

    loadAllPicturesAndSetActive(activePictureId) {
      this.dispatch({actionType: 'LOADING_PICTURES'});
      pictureApi.loadAllPictures().then((loadedPictures) => {
        this.dispatch({
          actionType: 'LOADED_PICTURES',
          activePictureId,
          pictures: loadedPictures
        });
      }).catch((err) => {
        console.error(err);
      });
    },

    savePicture(picture) {
      this.dispatch({actionType: 'SAVING_PICTURE', picture: picture});
      pictureApi.savePicture(picture).then(() => {
        this.dispatch({
          actionType: 'SAVED_PICTURE'
        });
      }).catch((err) => {
        console.error(err);
      });
    },

    undoChange(picture) {
      this.dispatch({actionType: 'UNDO_CHANGE_TO_PICTURE', picture});
    },

    redoChange(picture) {
      this.dispatch({actionType: 'REDO_CHANGE_TO_PICTURE', picture});
    }
  };
}

export default class {
  constructor(dispatcher, pictureApi) {
    return dispatcher.createActions(pictureActions(pictureApi));
  }
}
