function pictureActions(pictureApi, imgurApi) {
  return {
    addNewPicture(picture) {
      this.dispatch({actionType: 'ADD_NEW_PICTURE', picture});
    },

    deletePicture(picture) {
      this.dispatch({actionType: 'DELETE_PICTURE', picture});
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

    insertInstruction(pictureId, instruction, index, parent) {
      this.dispatch({
        actionType: 'INSERT_INSTRUCTION',
        pictureId,
        instruction,
        index,
        parent
      });
    },

    insertInstructionAfterInstruction(pictureId, instructionToInsert, instruction) {
      this.dispatch({
        actionType: 'INSERT_INSTRUCTION_AFTER_INSTRUCTION',
        pictureId,
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

    importVariables(picture, variableMap) {
      this.dispatch({actionType: 'IMPORT_VARIABLES', picture, variableMap});
    },

    setGoogleSpreadsheetId(picture, id) {
      this.dispatch({actionType: 'SET_SPREADSHEET_ID', picture, id});
    },

    setActivePicture(pictureId) {
      this.dispatch({actionType: 'SET_ACTIVE_PICTURE', pictureId});
    },

    setInvalidPictureState() {
      this.dispatch({actionType: 'SET_INVALID_PICTURE_STATE'});
    },

    uploadPngAndSave(notebookId, picture, png) {
      this.dispatch({actionType: 'SAVING_PICTURE', picture});
      imgurApi.uploadPng(png).then(response => {
        let pngUrl = response.data.link;
        pictureApi.savePngUrl(notebookId, picture.id, pngUrl).then(() => {
          this.dispatch({actionType: 'UPlOADED_PNG', pngUrl: response.data.link});
        }).catch(err => {
          console.err('problem saving png url', err);
        });
      }).catch(err => {
        console.error('Sharing picture failed', err);
      });
    },

    loadNotebookAndSetActivePicture(notebookId, pictureId) {
      this.dispatch({actionType: 'LOADING_NOTEBOOK'});
      pictureApi.loadNotebook(notebookId).then((notebook) => {
        this.dispatch({
          actionType: 'LOADED_NOTEBOOK',
          activePictureId: pictureId,
          notebook
        });
      }).catch((err) => {
        if (err.message === 'notebook not found') {
          this.dispatch({
            actionType: 'NOTEBOOK_NOT_FOUND',
            notebookId
          });
        } else {
          console.error(err);
        }
      });
    },

    savePicture(notebookId, picture, pngPreview) {
      this.dispatch({actionType: 'SAVING_PICTURE', picture});
      pictureApi.savePicture(notebookId, picture).then(() => {
        console.log('saved picture');
        this.dispatch({
          actionType: 'SAVED_PICTURE'
        });
        // Also save a preview png of the picture
        console.log('saving png preview');
        pngPreview.then(pngUri => {

          pictureApi.savePngUri(notebookId, picture.id, pngUri).then(() => {
            this.dispatch({actionType: 'UPlOADED_PNG'});
            console.log('saved png preview');
          }).catch(err => {
            console.err('problem saving png preview', err);
          });

        }).catch(err => {
          console.error('problem creating png preview', err);
        });
      }).catch((err) => {
        if (err.status === 401) {
          this.dispatch({
            actionType: 'PROMPT_TO_FORK'
          });
        } else {
          console.error(err);
        }
      });
    },

    saveNotebook(notebook) {
      this.dispatch({actionType: 'SAVING_NOTEBOOK', notebook});
      pictureApi.saveNotebook(notebook).then(() => {
        console.log('saved notebook');
        // TODO - may want to do some history management here
        this.dispatch({
          actionType: 'SAVED_NOTEBOOK'
        });
      }).catch((err) => {
        if (err.status === 401) {
          this.dispatch({
            actionType: 'PROMPT_TO_FORK'
          });
        } else {
          console.error(err);
        }
      });
    },

    cancelFork() {
      this.dispatch({
        actionType: 'CANCEL_FORK'
      });
    },

    // only one of notebook or notebookId should be provided
    // the notebook will be loaded from the server if notebookId is given
    forkNotebook({notebook, notebookId, newOwnerId}) {
      this.dispatch({actionType: 'FORKING_NOTEBOOK'});

      let loadNotebook;
      if (notebookId) {
        loadNotebook = pictureApi.loadNotebook(notebookId);
      } else {
        loadNotebook = Promise.resolve(notebook);
      }

      // needed because pictureApi.saveNotebook doesn't give the notebook
      // back right now
      let forkedNotebook;

      loadNotebook.then((loadedNotebook) => {
        forkedNotebook = loadedNotebook.fork(newOwnerId);
        return forkedNotebook;
      })
      .then(pictureApi.saveNotebook.bind(pictureApi))
      .then(() => {
        let firstPicture = forkedNotebook.pictures.first();
        this.dispatch({
          actionType: 'LOADED_NOTEBOOK',
          activePictureId: firstPicture.id,
          notebook: forkedNotebook
        });
      }).catch((err) => {
        if (err.message === 'notebook not found') {
          this.dispatch({
            actionType: 'NOTEBOOK_NOT_FOUND',
            notebookId
          });
        } else {
          console.error(err);
        }
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
  constructor(dispatcher, pictureApi, imgurApi) {
    return dispatcher.createActions(pictureActions(pictureApi, imgurApi));
  }
}
