import biff from '../dispatcher/dispatcher';
import Immutable from 'immutable';
import Picture from '../models/Picture';
import barsPicture from './barsPresetPicture';
import scatterPicture from './scatterPresetPicture';
import {guid} from '../utils/utils';

let OrderedMap = Immutable.OrderedMap;
let List = Immutable.List;

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


let pictures = OrderedMap();

let addPicture = function(picture) {
  pictures = pictures.set(picture.id, History.of(picture));
};

let updatePicture = function(picture) {
  pictures = pictures.update(picture.id, history => history.append(picture));
};

addPicture(barsPicture);
addPicture(scatterPicture);

if (pictures.size === 0) {
  // Can't have an empty picture list as we always need one picture
  addPicture(new Picture(guid(), [], []));
}

const PictureStore = biff.createStore({
  getPictures() {
    return pictures.map(history => history.currentState())
      .valueSeq().toArray();
  },

  getPicture(id) {
    return pictures.get(id).currentState();
  }
}, (payload) => {
  switch (payload.actionType) {
    case 'ADD_NEW_PICTURE': {
      addPicture(new Picture(guid(), [], []));
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
  }
});

export default PictureStore;
