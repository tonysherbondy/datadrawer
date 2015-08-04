import Immutable from 'immutable';
let {OrderedMap, List} = Immutable;

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

function pictureStore(props) {
  let activePictureId = null;
  // states can be 'loading', 'loaded', 'saving', 'invalid'
  let apiState = 'invalid';
  // TODO - merge with loadingState
  let pictures = OrderedMap();

  function getApiState() {
    return apiState;
  }

  function getActivePicture() {
    let activePictureHistory = pictures.get(activePictureId);
    if (activePictureHistory) {
      return activePictureHistory.currentState();
    }
    return null;
  }

  function getPictures() {
    return pictures.map(history => history.currentState())
      .valueSeq().toArray();
  }

  function addPicture(picture) {
    pictures = pictures.set(picture.id, History.of(picture));
  }

  function updatePicture(picture) {
    pictures = pictures.update(
      picture.id, history => history.append(picture));
  }

  function handleAction(payload) {
    switch (payload.actionType) {
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
        pictures = pictures.update(
          picture.id, history => history.replaceCurrent(picture));
        props.fluxStore.emitChange();
        break;
      }

      case 'INSERT_INSTRUCTION': {
        let {picture, instruction, index, parent} = payload;
        picture = picture.insertInstructionAtIndexWithParent(
          index, parent, instruction);
          updatePicture(picture);
          props.fluxStore.emitChange();
          break;
      }

      case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
        let {picture, instruction, instructionToInsert} = payload;
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
        pictures = pictures.update(payload.picture.id, history => history.undo());
        props.fluxStore.emitChange();
        break;
      }

      case 'REDO_CHANGE_TO_PICTURE': {
        pictures = pictures.update(payload.picture.id, history => history.redo());
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
        apiState = 'invalid';
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADING_PICTURES': {
        apiState = 'loading';
        props.fluxStore.emitChange();
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
        props.fluxStore.emitChange();
        break;
      }
    }
  }

  return {
    accessors: {
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
