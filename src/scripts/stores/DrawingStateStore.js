import _ from 'lodash';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';

function drawingStateStore(props) {
  let drawingState = {
    mode: 'normal',
    selectedShapeId: null,
    selectedInstructions: null,
    currentLoopIndex: null,
    editingInstructionId: null,
    dataPopupPosition: null,
    showDataPopup: false,
    pictureForPictureTool: null,
    pngUrl: null,

    // Used to be in picture store
    activePictureId: null,
    // states can be 'loading', 'loaded', 'saving',
    // 'picture.invalid', 'notebook.invalid', 'forking', 'should fork'
    apiState: 'init'
  };

  function getDrawingState() {
    return drawingState;
  }

  function resetState() {
    drawingState.editingInstructionId = null;
    drawingState.selectedInstructions = null;
    drawingState.selectedShapeId = null;
    drawingState.currentLoopIndex = null;
  }

  function getPicture(id) {
    let notebook = props.pictureStore.getNotebook();
    return notebook.pictures.find(p => p.id === id);
  }

  function setSelectedInstructions(selectedInstructions) {
    let picture = getPicture(drawingState.activePictureId);
    let instructions = picture.instructions;
    let parent = InstructionTreeNode.findParent(instructions, selectedInstructions[0]);
    // TODO (nhan): this should check whether an ancestor is a loop instruction
    // instead of the parent
    let isInLoop = parent && parent instanceof LoopInstruction;
    if (!isInLoop) {
      drawingState.currentLoopIndex = null;
    } else {
      // If we did not have a valid index before set it to zero, otherwise leave it alone
      let {currentLoopIndex} = drawingState;
      drawingState.currentLoopIndex = _.isNumber(currentLoopIndex) ? currentLoopIndex : 0;
    }

    drawingState.selectedInstructions = selectedInstructions;
    // Remove any selecte shape state when we select instructions
    drawingState.selectedShapeId = null;
  }

  function insertedInstruction(instruction) {
    props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
    drawingState.editingInstructionId = instruction.id;
    setSelectedInstructions([instruction]);
  }

  function setActivePicture(pictureId) {
    let picture = getPicture(pictureId);
    if (picture) {
      drawingState.apiState = 'loaded';
      if (drawingState.activePictureId !== picture.id) {
        drawingState.activePictureId = picture.id;
        resetState();
      }
    } else {
      drawingState.apiState = 'picture.invalid';
      drawingState.activePictureId = null;
      resetState();
    }
  }

  function handleAction(payload) {
    switch (payload.actionType) {
      case 'SHOW_DATA_POPUP': {
        drawingState.dataPopupPosition = payload.data;
        drawingState.showDataPopup = true;
        props.fluxStore.emitChange();
        break;
      }

      case 'HIDE_DATA_POPUP': {
        drawingState.showDataPopup = false;
        props.fluxStore.emitChange();
        break;
      }

      //case 'UPLOAD_PNG': {
        //drawingState.pngUrl = payload.pngUrl;
        //drawingState.showPngUrlPopup = true;
        //props.fluxStore.emitChange();
        //break;
      //}

      case 'SET_DRAWING_MODE': {
        drawingState.mode = payload.data;
        if (drawingState.mode === 'normal') {
          drawingState.editingInstructionId = null;
        }

        if (drawingState.mode !== 'picture') {
          drawingState.pictureForPictureTool = null;
        }

        props.fluxStore.emitChange();
        break;
      }
      case 'SET_EDITING_INSTRUCTION': {
        drawingState.editingInstructionId = payload.data.id;
        props.fluxStore.emitChange();
        break;
      }
      case 'SET_SELECTED_INSTRUCTION': {
        setSelectedInstructions([payload.instruction]);
        // TODO: (nhan) this is a perf hack for now so that we don't emit
        // multiple changes in case we need to set both (e.g. when stepping
        // to next instruction inside a loop);
        if (payload.loopIndex !== null && payload.loopIndex !== undefined) {
          drawingState.currentLoopIndex = payload.loopIndex;
        }
        props.fluxStore.emitChange();
        break;
      }
      case 'SET_SELECTED_INSTRUCTIONS': {
        // TODO - perhaps rename to instructionIds??
        setSelectedInstructions(payload.instructions);
        props.fluxStore.emitChange();
        break;
      }
      case 'SET_SELECTED_SHAPE': {
        drawingState.selectedShapeId = payload.data.id;
        props.fluxStore.emitChange();
        break;
      }
      case 'SET_LOOP_INDEX': {
        drawingState.currentLoopIndex = payload.data;
        props.fluxStore.emitChange();
        break;
      }
      // Respond to changes to instruction store
      case 'INSERT_INSTRUCTION': {
        insertedInstruction(payload.instruction);
        props.fluxStore.emitChange();
        break;
      }
      case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
        insertedInstruction(payload.instructionToInsert);
        props.fluxStore.emitChange();
        break;
      }
      case 'LOAD_PRESET_INSTRUCTIONS': {
        resetState();
        props.fluxStore.emitChange();
        break;
      }
      case 'REMOVE_INSTRUCTIONS': {
        // TODO - probably only want to remove selected state
        // if we have matching ID, but for now this is safest
        resetState();
        props.fluxStore.emitChange();
        break;
      }
      case 'SET_PICTURE_FOR_PICTURE_TOOL': {
        drawingState.pictureForPictureTool = payload.picture;
        props.fluxStore.emitChange();
        break;
      }

      case 'SET_ACTIVE_PICTURE': {
        setActivePicture(payload.pictureId);
        resetState();
        props.fluxStore.emitChange();
        break;
      }

      case 'SET_INVALID_PICTURE_STATE': {
        setActivePicture(null);
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADING_NOTEBOOK': {
        drawingState.apiState = 'loading';
        props.fluxStore.emitChange();
        break;
      }

      case 'FORKING_NOTEBOOK': {
        drawingState.apiState = 'forking';
        props.fluxStore.emitChange();
        break;
      }

      case 'NOTEBOOK_NOT_FOUND': {
        // This should wait because we want to remain in the loading state
        // until the new notfound notebook is set
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
        drawingState.apiState = 'notebook.invalid';
        props.fluxStore.emitChange();
        break;
      }

      case 'LOADED_NOTEBOOK': {
        // This should wait because we want to remain in the loading state
        // until the new notfound notebook is set
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);

        // Set active picture
        setActivePicture(payload.activePictureId);
        props.fluxStore.emitChange();
        break;
      }

      // TODO - See if I can remove for add picture...
      case 'ADD_NEW_PICTURE': {
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
        resetState();
        props.fluxStore.emitChange();
        break;
      }

      case 'DELETE_PICTURE': {
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
        // Need to try to reset to the picture we had before in case we deleted it
        setActivePicture(drawingState.activePictureId);
        props.fluxStore.emitChange();
        break;
      }

      case 'PROMPT_TO_FORK': {
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
        drawingState.apiState = 'should fork';
        props.fluxStore.emitChange();
        break;
      }

      case 'CANCEL_FORK': {
        props.dispatcher.dispatcher.waitFor([props.pictureStore.dispatcherID]);
        // should probably go to the previous state instead of assuming loaded
        drawingState.apiState = 'loaded';
        props.fluxStore.emitChange();
        break;
      }
    }
  }

  return {
    accessors: {
      getDrawingState
    },
    actionHandler: handleAction
  };
}

export default class {
  constructor (dispatcher, pictureStore) {
    //TODO: Come up with a better wrapper around Biff or use a different Flux
    //library.  This is pretty janky.
    let props = {pictureStore, dispatcher};
    let store = drawingStateStore(props);

    // this assignment is necessary so that we have acess to the result of
    // dispatcher.createStore()
    props.fluxStore = dispatcher.createStore(store.accessors,
                                             store.actionHandler);
    return props.fluxStore;
  }
}
