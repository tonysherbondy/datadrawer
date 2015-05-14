import biff from '../dispatcher/dispatcher';

const DrawingStateActions = biff.createActions({
  setDrawingMode(name) {
    this.dispatch({
      actionType: 'SET_DRAWING_MODE',
      data: name
    });
  },

  setEditingInstruction(id) {
    this.dispatch({
      actionType: 'SET_EDITING_INSTRUCTION',
      data: id
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

