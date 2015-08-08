import {OrderedMap} from 'immutable';

import History from '../models/History';
import Notebook from '../models/Notebook';

// maintains the history of states of an immutable object
// used for supporting undo/redo

function pictureStore(props) {
  let activePictureId = null;
  // states can be 'loading', 'loaded', 'saving', 'picture.invalid', 'notebook.invalid'
  let apiState = 'init';
  let notebook = new Notebook();
  let pictureHistories = OrderedMap();

  function getApiState() {
    return apiState;
  }

  function getActivePicture() {
    return notebook.pictures.get(activePictureId);
  }

  function getNotebook() {
    return notebook;
  }

  function getPictures() {
    return notebook.pictures.valueSeq().toArray();
  }

  function updateNotebook(properties) {
    notebook = new Notebook({
      id: properties.id || notebook.id,
      name: properties.name || notebook.name,
      pictures: properties.pictures || notebook.pictures
    });
  }

  function addPicture(picture) {
    updatePicture(picture);
  }

  function updatePicture(picture, historyModifier) {
    historyModifier = historyModifier || (history => history.append(picture));

    updateNotebook({ pictures: notebook.pictures.set(picture.id, picture) });

    if (pictureHistories.has(picture.id)) {
      pictureHistories = pictureHistories.update(picture.id, historyModifier);
    } else {
      pictureHistories = pictureHistories.set(picture.id, History.of(picture));
    }
  }

  function handleAction(payload) {
    switch (payload.actionType) {
      case 'SET_NOTEBOOK_NAME': {
        updateNotebook({ name: payload.notebookName });
        props.fluxStore.emitChange();
        break;
      }

      case 'ADD_NEW_PICTURE': {
        addPicture(payload.picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'ADD_VARIABLE': {
        let picture = payload.picture.addVariable(payload.variable);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'MODIFY_VARIABLE': {
        let picture = payload.picture.addVariable(payload.variable);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'REMOVE_VARIABLE': {
        let picture = payload.picture.removeVariable(payload.variable);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'REMOVE_INSTRUCTIONS': {
        let picture = payload.picture.removeInstructions(payload.instructions);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'REPLACE_INSTRUCTIONS': {
        let picture = payload.picture.replaceInstructions(payload.toRemove, payload.toAdd);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'MODIFY_INSTRUCTION': {
        let picture = payload.picture.updateInstruction(payload.instruction);
        // Only push a new history when instructions are added and deleted.
        // This is so we don't undo to the last mouse position while in the
        // middle of creating a draw instruction.
        // TODO: think about how to handle editing the parameters of the
        // instruction in the instruction tree.
        // Here we overwrite the current state in the history
        updatePicture(picture, history => history.replaceCurrent(picture));
        props.fluxStore.emitChange();
        break;
      }

      case 'INSERT_INSTRUCTION': {
        let {instruction, index, parent} = payload;
        let picture = getActivePicture();
        picture = picture.insertInstructionAtIndexWithParent(
          index, parent, instruction);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
        let {instruction, instructionToInsert} = payload;
        let picture = getActivePicture();
        if (!instruction) {
          picture = picture.addInstruction(instructionToInsert);
        } else {
          picture = picture.insertInstructionAfterInstruction(
            instructionToInsert, instruction);
        }
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'UNDO_CHANGE_TO_PICTURE': {
        updatePicture(payload.picture, history => history.undo());
        props.fluxStore.emitChange();
        break;
      }

      case 'REDO_CHANGE_TO_PICTURE': {
        updatePicture(payload.picture, history => history.redo());
        props.fluxStore.emitChange();
        break;
      }

      case 'SAVING_PICTURE': {
        props.fluxStore.emitChange();
        break;
      }

      case 'SAVED_PICTURE': {
        props.fluxStore.emitChange();
        break;
      }

      case 'SET_ACTIVE_PICTURE': {
        activePictureId = payload.picture.id;
        // TODO this is a little weird
        apiState = 'loaded';
        props.fluxStore.emitChange();
        break;
      }

      case 'SET_INVALID_PICTURE_STATE': {
        activePictureId = null;
        apiState = 'picture.invalid';
        props.fluxStore.emitChange();
        break;
      }

      case 'NOTEBOOK_NOT_FOUND': {
        apiState = 'notebook.invalid';
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADING_NOTEBOOK': {
        apiState = 'loading';
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADED_NOTEBOOK': {
        let {id, name, pictures} = payload.notebook;
        updateNotebook({id, name, pictures});
        // Reset history
        pictureHistories = OrderedMap();
        notebook.pictures.forEach(updatePicture);

        // Set active picture
        let picture = notebook.pictures.find(p => p.id === payload.activePictureId);
        if (picture) {
          apiState = 'loaded';
          activePictureId = picture.id;
        } else {
          // TODO - need to decouple states for valid picture vs. valid notebook
          apiState = 'picture.invalid';
          activePictureId = null;
        }
        props.fluxStore.emitChange();
        break;
      }
    }
  }

  return {
    accessors: {
      getNotebook,
      getApiState,
      getActivePicture,
      getPictures
    },
    actionHandler: handleAction
  };
}

export default class {
  constructor (dispatcher) {
    //TODO: Come up with a better wrapper around Biff or use a different Flux
    //library.  This is pretty janky.
    let props = {};
    let store = pictureStore(props);

    // this assignment is necessary so that we have acess to the result of
    // dispatcher.createStore()
    props.fluxStore = dispatcher.createStore(store.accessors,
                                             store.actionHandler);
    return props.fluxStore;
  }
}
