import biff from '../dispatcher/dispatcher';
import scatterPreset from './presetScatteryPlotInstructions';
import randoPreset from './randoPresetInstructions';
import barsPreset from './barsPresetInstructions';

let presetInstructions = {
  scatter: scatterPreset,
  bars: barsPreset,
  rando: randoPreset
};

let instructions = [];
//let instructions = presetInstructions.bars;

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
    case 'REMOVE_INSTRUCTION': {
      InstructionStore._setPending(false);
      InstructionStore._clearErrors();
      instructions = instructions.filter((_,i) => i !== payload.data);
      InstructionStore.emitChange();
      break;
    }
    case 'MODIFY_INSTRUCTION': {
      // TODO - This is not a correct way to search for an existing instruction
      // because the instruction is a tree
      let index = instructions.findIndex(i => i.id === payload.data.id);
      if (index > -1) {
        let before = instructions.slice(0,index);
        let after = instructions.slice(index+1, instructions.length);
        instructions = [...before, payload.data, ...after];
        InstructionStore.emitChange();
      }
      break;
    }
    case 'LOAD_PRESET_INSTRUCTIONS': {
      instructions = presetInstructions[payload.data] || [];
      InstructionStore.emitChange();
      break;
    }
  }

});

export default InstructionStore;
