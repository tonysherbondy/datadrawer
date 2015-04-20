import biff from '../dispatcher/dispatcher';
import DrawInstruction from '../models/DrawInstruction';

let instructions = [
  new DrawInstruction({
    id: 1,
    operation: 'draw',
    shape: 'circle',
    from: {x: 20, y: 20},
    to: {x: 40, y: 20}}),
  new DrawInstruction({
    id: 2,
    operation: 'draw',
    shape: 'circle',
    from: {x: 100, y: 60},
    to: {x: 130, y: 60}})
];

const InstructionStore = biff.createStore({
  getInstructions() {
    return instructions;
  }
}, (payload) => {

  switch (payload.actionType) {
    case 'ADD_INSTRUCTION_START': {
      InstructionStore._clearErrors();
      InstructionStore._setPending(true);
      InstructionStore.emitChange();
      break;
    }
    case 'ADD_INSTRUCTION_SUCCESS': {
      instructions = instructions.push(payload.data);
      InstructionStore._setPending(false);
      InstructionStore.emitChange();
      break;
    }
    case 'ADD_INSTRUCTION_ERROR': {
      InstructionStore._setPending(false);
      InstructionStore._setError('Instruction must have data');
      InstructionStore.emitChange();
      break;
    }
    case 'REMOVE_INSTRUCTION': {
      InstructionStore._setPending(false);
      InstructionStore._clearErrors();
      instructions = instructions.delete(payload.data);
      InstructionStore.emitChange();
      break;
    }
  }

});

export default InstructionStore;
