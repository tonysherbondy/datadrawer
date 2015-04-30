import biff from '../dispatcher/dispatcher';

let drawingState = {
  mode: 'normal',
  editingInstruction: null
};

const DrawingStateStore = biff.createStore({
  getDrawingState() {
    return drawingState;
  }
}, (payload) => {

  switch (payload.actionType) {
    case 'SET_DRAWING_MODE': {
      drawingState.mode = payload.data;
      DrawingStateStore.emitChange();
      break;
    }
    case 'SET_EDITING_INSTRUCTION': {
      drawingState.editingInstruction = payload.data;
      DrawingStateStore.emitChange();
      break;
    }
    case 'ADD_INSTRUCTION_SUCCESS': {
      drawingState.editingInstruction = payload.data;
      DrawingStateStore.emitChange();
      break;
    }
  }

});

export default DrawingStateStore;
