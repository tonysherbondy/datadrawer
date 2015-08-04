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
    pictureForPictureTool: null
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

  function setSelectedInstructions(picture, selectedInstructions) {
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

  function insertedInstruction(picture, instruction) {
    drawingState.editingInstructionId = instruction.id;
    setSelectedInstructions(picture, [instruction]);
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
        setSelectedInstructions(payload.picture, [payload.instruction]);
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
        setSelectedInstructions(payload.picture, payload.instructions);
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
        insertedInstruction(payload.picture, payload.instruction);
        props.fluxStore.emitChange();
        break;
      }
      case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
        insertedInstruction(payload.picture, payload.instructionToInsert);
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
  constructor (dispatcher) {
    //TODO: Come up with a better wrapper around Biff or use a different Flux
    //library.  This is pretty janky.
    let props = {};
    let store = drawingStateStore(props);

    // this assignment is necessary so that we have acess to the result of
    // dispatcher.createStore()
    props.fluxStore = dispatcher.createStore(store.accessors,
                                             store.actionHandler);
    return props.fluxStore;
  }
}
