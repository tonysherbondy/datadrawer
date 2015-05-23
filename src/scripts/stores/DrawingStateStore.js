import biff from '../dispatcher/dispatcher';

let drawingState = {
  mode: 'normal',
  selectedShapeId: null,
  selectedInstructions: null,
  editingInstructionId: null
};

const DrawingStateStore = biff.createStore({
  getDrawingState() {
    return drawingState;
  }
}, (payload) => {

  switch (payload.actionType) {
    case 'SET_DRAWING_MODE': {
      drawingState.mode = payload.data;
      if (drawingState.mode === 'normal') {
        drawingState.editingInstructionId = null;
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
      drawingState.selectedInstructions = [payload.data];
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_INSTRUCTIONS': {
      // TODO - perhaps rename to instructionIds??
      drawingState.selectedInstructions = payload.data;
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_SHAPE': {
      drawingState.selectedShapeId = payload.data.id;
      DrawingStateStore.emitChange();
      break;
    }
    // Respond to changes to instruction store
    case 'ADD_INSTRUCTION_SUCCESS': {
      drawingState.editingInstructionId = payload.data.id;
      drawingState.selectedInstructions = [payload.data];
      // Remove any selecte shape state when we've just added an instruction
      drawingState.selectedShapeId = null;
      DrawingStateStore.emitChange();
      break;
    }
    case 'REMOVE_INSTRUCTIONS': {
      // TODO - probably only want to remove selected state
      // if we have matching ID, but for now this is safest
      drawingState.editingInstructionId = null;
      drawingState.selectedInstructions = null;
      drawingState.selectedShapeId = null;
      DrawingStateStore.emitChange();
      break;
    }
  }

});

export default DrawingStateStore;
