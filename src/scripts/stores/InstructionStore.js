import biff from '../dispatcher/dispatcher';
import scatterPreset from './presetScatteryPlotInstructions';
import randoPreset from './randoPresetInstructions';
import barsPreset from './barsPresetInstructions';

let presetInstructions = {
  scatter: scatterPreset,
  bars: barsPreset,
  rando: randoPreset
};

let instructions = presetInstructions.bars;

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
    case 'LOAD_PRESET_INSTRUCTIONS': {
      instructions = presetInstructions[payload.data] || [];
      InstructionStore.emitChange();
      break;
    }
  }

});

export default InstructionStore;
