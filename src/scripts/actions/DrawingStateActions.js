import biff from '../dispatcher/dispatcher';

const DrawingStateActions = biff.createActions({
  setDrawingMode(name) {
    this.dispatch({
      actionType: 'SET_DRAWING_MODE',
      data: name
    });
  },

  setEditingInstruction(instruction) {
    this.dispatch({
      actionType: 'SET_EDITING_INSTRUCTION',
      data: instruction
    });
  },

  setSelectedInstruction(instruction) {
    this.dispatch({
      actionType: 'SET_SELECTED_INSTRUCTION',
      data: instruction
    });
  },

  setSelectedShape(id) {
    this.dispatch({
      actionType: 'SET_SELECTED_SHAPE',
      data: {id}
    });
  }
});

export default DrawingStateActions;

