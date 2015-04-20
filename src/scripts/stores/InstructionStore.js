import biff from '../dispatcher/dispatcher';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import DrawRectInstruction from '../models/DrawRectInstruction';

const instructions1 = [
  new DrawCircleInstruction({
    id: 'i1',
    from: {x: 20, y: 20},
    radius: 20
  }),
  new DrawCircleInstruction({
    id: 'i2',
    from: {x: 50, y:50},
    radius: {id: 'd3'}
  }),
  new DrawCircleInstruction({
    id: 'i3',
    from: {id: 'canvasRight'},
    to: {id: 'canvasCenter'}
  })
];

const instructions2 = [
  new DrawRectInstruction({
    id: 'i1',
    from: {id: 'canvasBottomLeft'},
    width: 100,
    height: 200
  }),
  new DrawRectInstruction({
    id: 'i2',
    from: {id: 'canvasBottomLeft'},
    to: 'canvasTopRight'
  }),
  new DrawRectInstruction({
    id: 'i3',
    from: {id: 'canvasBottomLeft'},
    width: {id: 'd3'},
    height: 200
  }),
];


let instructions = instructions1;

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
      instructions = instructions.filter((_,i) => i !== payload.data);
      InstructionStore.emitChange();
      break;
    }
  }

});

export default InstructionStore;
