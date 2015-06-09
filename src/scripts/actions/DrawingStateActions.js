import biff from '../dispatcher/dispatcher';

const DrawingStateActions = biff.createActions({
  setActivePicture(picture) {
    this.dispatch({
      actionType: 'SET_ACTIVE_PICTURE',
      picture: picture
    });
  },

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

  setSelectedInstruction(instruction, loopIndex) {
    this.dispatch({
      actionType: 'SET_SELECTED_INSTRUCTION',
      data: instruction,
      // TODO: (nhan) this is perf hack for now so that we don't rerender
      // everytime we step forward  inside a loop
      loopIndex: loopIndex
    });
  },

  setSelectedInstructions(instructions) {
    this.dispatch({
      actionType: 'SET_SELECTED_INSTRUCTIONS',
      data: instructions
    });
  },

  setLoopIndex(index) {
    this.dispatch({
      actionType: 'SET_LOOP_INDEX',
      data: index
    });
  },

  setSelectedShapeId(id) {
    this.dispatch({
      actionType: 'SET_SELECTED_SHAPE',
      data: {id}
    });
  },

  showDataPopup(position) {
    this.dispatch({
      actionType: 'SHOW_DATA_POPUP',
      data: position
    });
  },

  hideDataPopup() {
    this.dispatch({
      actionType: 'HIDE_DATA_POPUP',
      data: null
    });
  }
});

export default DrawingStateActions;

