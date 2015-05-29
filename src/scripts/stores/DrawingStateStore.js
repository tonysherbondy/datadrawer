import biff from '../dispatcher/dispatcher';
import InstructionStore from './InstructionStore';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';

let drawingState = {
  mode: 'normal',
  selectedShapeId: null,
  selectedInstructions: null,
  currentLoopIndex: null,
  editingInstructionId: null
};

function resetState() {
  drawingState.editingInstructionId = null;
  drawingState.selectedInstructions = null;
  drawingState.selectedShapeId = null;
  drawingState.currentLoopIndex = null;
}

function setSelectedInstructions(selectedInstructions) {
  let instructions = InstructionStore.getInstructions();
  let parent = InstructionTreeNode.findParent(instructions, selectedInstructions[0]);
  // TODO (nhan): this should check whether an ancestor is a loop instruction
  // instead of the parent
  let isInLoop = parent && parent instanceof LoopInstruction;
  if (!isInLoop) {
    drawingState.currentLoopIndex = null;
  } else {
    // TODO (nhan): we need to do something more sophisticated here like change
    // the currentLoopIndex only if it is null or out of bounds
    drawingState.currentLoopIndex = 0;
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
      setSelectedInstructions([payload.data]);
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
    case 'ADD_INSTRUCTION_SUCCESS': {
      insertedInstruction(payload.data);
      DrawingStateStore.emitChange();
      break;
    }
    case 'INSERT_INSTRUCTION': {
      let {instruction} = payload.data;
      insertedInstruction(instruction);
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
  }

});

export default DrawingStateStore;
