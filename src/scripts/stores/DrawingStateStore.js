import _ from 'lodash';
import biff from '../dispatcher/dispatcher';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';
import PictureStore from './PictureStore';

let drawingState = {
  mode: 'normal',
  selectedShapeId: null,
  selectedInstructions: null,
  currentLoopIndex: null,
  editingInstructionId: null,
  dataPopupPosition: null,
  showDataPopup: false,
  activePicture: null,
  pictureForPictureTool: null
};

function resetState() {
  drawingState.editingInstructionId = null;
  drawingState.selectedInstructions = null;
  drawingState.selectedShapeId = null;
  drawingState.currentLoopIndex = null;
}

function setSelectedInstructions(selectedInstructions) {
  let instructions = drawingState.activePicture.instructions;
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
  drawingState.editingInstructionId = instruction.id;
  setSelectedInstructions([instruction]);
}

const DrawingStateStore = biff.createStore({
  getDrawingState() {
    // TODO (nhan): This logic might be better placed in the App
    if (!drawingState.activePicture) {
      drawingState.activePicture = _.first(PictureStore.getPictures());
    } else {
      drawingState.activePicture = PictureStore.getPicture(drawingState.activePicture.id);
    }
    return drawingState;
  }
}, (payload) => {
  switch (payload.actionType) {
    case 'SHOW_DATA_POPUP': {
      drawingState.dataPopupPosition = payload.data;
      drawingState.showDataPopup = true;
      DrawingStateStore.emitChange();
      break;
    }

    case 'HIDE_DATA_POPUP': {
      drawingState.showDataPopup = false;
      DrawingStateStore.emitChange();
      break;
    }

    case 'ADD_NEW_PICTURE': {
      // TODO (nhan): can probably get rid of this dependency on PictureStore
      drawingState.activePicture = _.last(PictureStore.getPictures());
      break;
    }

    case 'SET_ACTIVE_PICTURE': {
      drawingState.activePicture = payload.picture;
      DrawingStateStore.emitChange();
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

      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_EDITING_INSTRUCTION': {
      drawingState.editingInstructionId = payload.data.id;
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_INSTRUCTION': {
      setSelectedInstructions([payload.data]);
      // TODO: (nhan) this is a perf hack for now so that we don't emit
      // multiple changes in case we need to set both (e.g. when stepping
      // to next instruction inside a loop);
      if (payload.loopIndex !== null && payload.loopIndex !== undefined) {
        drawingState.currentLoopIndex = payload.loopIndex;
      }
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_INSTRUCTIONS': {
      // TODO - perhaps rename to instructionIds??
      setSelectedInstructions(payload.data);
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_SHAPE': {
      drawingState.selectedShapeId = payload.data.id;
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_LOOP_INDEX': {
      drawingState.currentLoopIndex = payload.data;
      DrawingStateStore.emitChange();
      break;
    }
    // Respond to changes to instruction store
    case 'ADD_INSTRUCTION': {
      insertedInstruction(payload.instruction);
      DrawingStateStore.emitChange();
      break;
    }
    case 'INSERT_INSTRUCTION': {
      insertedInstruction(payload.instruction);
      DrawingStateStore.emitChange();
      break;
    }
    case 'INSERT_INSTRUCTION_AFTER_INSTRUCTION': {
      insertedInstruction(payload.instructionToInsert);
      DrawingStateStore.emitChange();
      break;
    }
    case 'LOAD_PRESET_INSTRUCTIONS': {
      resetState();
      DrawingStateStore.emitChange();
      break;
    }
    case 'REMOVE_INSTRUCTIONS': {
      // TODO - probably only want to remove selected state
      // if we have matching ID, but for now this is safest
      resetState();
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_PICTURE_FOR_PICTURE_TOOL': {
      drawingState.pictureForPictureTool = payload.picture;
      DrawingStateStore.emitChange();
      break;
    }
  }

});

export default DrawingStateStore;
