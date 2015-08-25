import {OrderedMap} from 'immutable';
import _ from 'lodash';

import History from '../models/History';
import Notebook from '../models/Notebook';

// maintains the history of states of an immutable object
// used for supporting undo/redo

function pictureStore(props) {
  let notebook = new Notebook();
  let pictureHistories = OrderedMap();

  function getNotebook() {
    return notebook;
  }

  function getPictures() {
    return notebook.pictures.valueSeq().toArray();
  }

  function updateNotebook(properties) {
    notebook = new Notebook({
      id: properties.id || notebook.id,
      ownerId: properties.ownerId || notebook.ownerId,
      name: _.isString(properties.name) ? properties.name : notebook.name,
      pictures: properties.pictures || notebook.pictures
    });
  }

  function addPicture(picture) {
    updatePicture(picture);
  }

  function updatePicture(picture, historyModifier) {
    historyModifier = historyModifier || (history => history.append(picture));

    if (pictureHistories.has(picture.id)) {
      pictureHistories = pictureHistories.update(picture.id, historyModifier);
    } else {
      pictureHistories = pictureHistories.set(picture.id, History.of(picture));
    }

    let updatedState = pictureHistories.get(picture.id).currentState();
    updateNotebook({ pictures: notebook.pictures.set(picture.id, updatedState) });
  }

  function deletePicture(picture) {
    updateNotebook({ pictures: notebook.pictures.remove(picture.id) });
    pictureHistories = pictureHistories.remove(picture.id);
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

      case 'DELETE_PICTURE': {
        deletePicture(payload.picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'ADD_VARIABLE': {
        let picture = payload.picture.addVariable(payload.variable);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'IMPORT_VARIABLES': {
        let picture = payload.picture.importVariables(payload.variableMap);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      case 'SET_SPREADSHEET_ID': {
        updatePicture(payload.picture.cloneWith({
          googleSpreadsheetId: payload.id
        }));
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

      // TODO - need to pass picture ID
      case 'INSERT_INSTRUCTION': {
        let {instruction, index, parent, pictureId} = payload;
        let picture = notebook.pictures.find(p => p.id === pictureId);
        picture = picture.insertInstructionAtIndexWithParent(
          index, parent, instruction);
        updatePicture(picture);
        props.fluxStore.emitChange();
        break;
      }

      // TODO - need to pass picture ID
      case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
        let {instruction, instructionToInsert, pictureId} = payload;
        let picture = notebook.pictures.find(p => p.id === pictureId);
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

      //case 'SAVING_PICTURE': {
        //props.fluxStore.emitChange();
        //break;
      //}

      //case 'SAVED_PICTURE': {
        //props.fluxStore.emitChange();
        //break;
      //}

      case 'NOTEBOOK_NOT_FOUND': {
        // we use this notebook to represent the fact that the call to fetch
        // the notebook returned so that we don't attempt to do it again
        notebook = new Notebook({id: payload.notebookId});
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADED_NOTEBOOK': {
        let {id, ownerId, name, pictures} = payload.notebook;
        updateNotebook({id, ownerId, name, pictures});
        // Reset history
        pictureHistories = OrderedMap();
        notebook.pictures.forEach(updatePicture);
        props.fluxStore.emitChange();
        break;
      }
    }
  }

  return {
    accessors: {
      getNotebook,
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
