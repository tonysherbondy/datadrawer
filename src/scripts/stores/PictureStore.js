import biff from '../dispatcher/dispatcher';
import Immutable from 'immutable';
/*eslint no-unused-vars:0*/
import Picture from '../models/Picture';

let OrderedMap = Immutable.OrderedMap;
let List = Immutable.List;

let activePictureId = null;
// states can be 'loading', 'loaded', 'saving', 'invalid'
let apiState = 'invalid';
// TODO - merge with loadingState
let isSaving = false;


// maintains the history of states of an immutable object
// used for supporting undo/redo
class History {
  constructor(states, currentIndex) {
    this.states = states;
    this.currentIndex = currentIndex;
  }

  currentState() {
    return this.states.get(this.currentIndex);
  }

  redo() {
    if (this.currentIndex + 1 < this.states.size) {
      return new History(this.states, this.currentIndex + 1);
    }
    return this;
  }

  undo() {
    if (this.currentIndex > 0) {
      return new History(this.states, this.currentIndex - 1);
    }
    return this;
  }

  // overwrite current state without adding to history
  replaceCurrent(state) {
    let states = this.states.take(this.currentIndex).push(state);
    return new History(states, this.currentIndex);
  }

  append(state) {
    let states = this.states.take(this.currentIndex + 1).push(state);
    return new History(states, this.currentIndex + 1);
  }
}

History.of = function(initialState) {
  return new History(List.of(initialState), 0);
};

let notebookName = 'Untitled';

let pictures = OrderedMap();

let addPicture = function(picture) {
  pictures = pictures.set(picture.id, History.of(picture));
};

let updatePicture = function(picture) {
  pictures = pictures.update(picture.id, history => history.append(picture));
};

const PictureStore = biff.createStore({
  getApiState() {
    return apiState;
  },

  getActivePicture() {
    let activePictureHistory = pictures.get(activePictureId);
    if (activePictureHistory) {
      return activePictureHistory.currentState();
    }
    return null;
  },

  getStoreState() {
    return {isSaving};
  },

  getPictures() {
    return pictures.map(history => history.currentState())
      .valueSeq().toArray();
  },

  getPicture(id) {
    return pictures.get(id).currentState();
  },

  getNotebookName() {
    return notebookName;
  }
}, (payload) => {
  switch (payload.actionType) {
    case 'SET_NOTEBOOK_NAME': {
      notebookName = payload.notebookName;
      PictureStore.emitChange();
      break;
    }

    case 'ADD_NEW_PICTURE': {
      addPicture(payload.picture);
      PictureStore.emitChange();
      break;
    }

    case 'ADD_VARIABLE': {
      let picture = payload.picture.addVariable(payload.variable);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'MODIFY_VARIABLE': {
      let picture = payload.picture.addVariable(payload.variable);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'REMOVE_VARIABLE': {
      let picture = payload.picture.removeVariable(payload.variable);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'ADD_INSTRUCTION': {
      let picture = payload.picture.addInstruction(payload.instruction);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'REMOVE_INSTRUCTIONS': {
      let picture = payload.picture.removeInstructions(payload.instructions);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'REPLACE_INSTRUCTIONS': {
      let picture = payload.picture.replaceInstructions(payload.toRemove, payload.toAdd);
      updatePicture(picture);
      PictureStore.emitChange();
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
      pictures = pictures.update(picture.id,
                                 history => history.replaceCurrent(picture));
      PictureStore.emitChange();
      break;
    }

    case 'INSERT_INSTRUCTION': {
      let {picture, instruction, index, parent} = payload;
      picture = picture.insertInstructionAtIndexWithParent(
        index, parent, instruction);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
      let {picture, instruction, instructionToInsert} = payload;
      picture = picture.insertInstructionAfterInstruction(
        instructionToInsert, instruction);
      updatePicture(picture);
      PictureStore.emitChange();
      break;
    }

    case 'UNDO_CHANGE_TO_PICTURE': {
      pictures = pictures.update(payload.picture.id, history => history.undo());
      PictureStore.emitChange();
      break;
    }

    case 'REDO_CHANGE_TO_PICTURE': {
      pictures = pictures.update(payload.picture.id, history => history.redo());
      PictureStore.emitChange();
      break;
    }

    case 'SAVING_PICTURE': {
      isSaving = true;
      PictureStore.emitChange();
      break;
    }

    case 'SAVED_PICTURE': {
      isSaving = false;
      PictureStore.emitChange();
      break;
    }

    case 'SET_ACTIVE_PICTURE': {
      activePictureId = payload.picture.id;
      // TODO this is a little weird
      apiState = 'loaded';
      PictureStore.emitChange();
      break;
    }

    case 'SET_INVALID_PICTURE_STATE': {
      activePictureId = null;
      apiState = 'invalid';
      PictureStore.emitChange();
      break;
    }

    case 'LOADING_PICTURES': {
      apiState = 'loading';
      PictureStore.emitChange();
      break;
    }

    case 'LOADED_PICTURES': {
      payload.pictures.forEach(addPicture);
      let picture = payload.pictures.find(p => p.id === payload.activePictureId);
      if (picture) {
        apiState = 'loaded';
        activePictureId = picture.id;
      } else {
        apiState = 'invalid';
        activePictureId = null;
      }
      PictureStore.emitChange();
      break;
    }
  }
});

export default PictureStore;
