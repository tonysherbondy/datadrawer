import biff from '../dispatcher/dispatcher';
import scatterPreset from './presetScatteryPlotInstructions';
import randoPreset from './randoPresetInstructions';
import barsPreset from './barsPresetInstructions';
import InstructionTreeNode from '../models/InstructionTreeNode';

let presetInstructions = {
  scatter: scatterPreset,
  bars: barsPreset,
  rando: randoPreset
};

let instructions = [];
//let instructions = presetInstructions.rando;
var name = '';

const InstructionStore = biff.createStore({
  getInstructions() {
    return instructions;
  },

  getName() {
    return name;
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
      instructions = instructions.concat([payload.data]);
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
    case 'REMOVE_INSTRUCTIONS': {
      InstructionStore._setPending(false);
      InstructionStore._clearErrors();
      // I don't feel good about this way :(
      payload.data.forEach(iToRemove => {
        instructions = InstructionTreeNode.removeById(instructions, iToRemove.id);
      });
      InstructionStore.emitChange();
      break;
    }
    case 'MODIFY_INSTRUCTION': {
      let instruction = payload.data;
      instructions = InstructionTreeNode.replaceById(instructions, instruction.id, instruction);
      InstructionStore.emitChange();
      break;
    }
    case 'INSERT_INSTRUCTION': {
      let {instruction, index, parent} = payload.data;
      instructions = InstructionTreeNode.insertInstruction(instructions, instruction, index, parent);
      InstructionStore.emitChange();
      break;
    }
    case 'LOAD_PRESET_INSTRUCTIONS': {
      instructions = presetInstructions[payload.data] || [];
      InstructionStore.emitChange();
      break;
    }
    case 'SET_PICTURE_NAME': {
      name = payload.data;
      InstructionStore.emitChange();
      break;
    }
  }

});

export default InstructionStore;
