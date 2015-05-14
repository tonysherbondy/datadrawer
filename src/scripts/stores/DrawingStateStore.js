import biff from '../dispatcher/dispatcher';

let drawingState = {
  mode: 'normal',
  selectedShapeId: null,
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
    case 'ADD_INSTRUCTION_SUCCESS': {
      drawingState.editingInstructionId = payload.data.id;
      // Remove any selecte shape state when we've just added an instruction
      drawingState.selectedShapeId = null;
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_SELECTED_SHAPE': {
      drawingState.selectedShapeId = payload.data.id;
      DrawingStateStore.emitChange();
      break;
    }
  }

});

export default DrawingStateStore;
