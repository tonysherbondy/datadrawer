import biff from '../dispatcher/dispatcher';
import scatterPreset from './presetScatteryPlotInstructions';
import randoPreset from './randoPresetInstructions';
import barsPreset from './barsPresetInstructions';
import InstructionTreeNode from '../models/InstructionTreeNode';
//import DrawRectInstruction from '../models/DrawRectInstruction';
import Instruction from '../models/Instruction';
import firebaseConnection from '../Syncing';

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
      //firebaseConnection.child('instructions').set(instructions.map((i) => i.serialize()));
      var instructionsRef = firebaseConnection.child('instructions');
      var newInstruction = instructionsRef.push(payload.data.serialize());
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
      //firebaseConnection.child('instructions').set(instructions.map((i) => i.serialize()));
      InstructionStore.emitChange();
      break;
    }
    case 'MODIFY_INSTRUCTION': {
      let instruction = payload.data;
      instructions = InstructionTreeNode.replaceById(instructions, instruction.id, instruction);
      //firebaseConnection.child('instructions').set(instructions.map((i) => i.serialize()));
      InstructionStore.emitChange();
      break;
    }
    case 'INSERT_INSTRUCTION': {
      let {instruction, index, parent} = payload.data;
      instructions = InstructionTreeNode.insertInstruction(instructions, instruction, index, parent);
      //firebaseConnection.child('instructions').set(instructions.map((i) => i.serialize()));
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
      firebaseConnection.child('name').set(payload.data);
      InstructionStore.emitChange();
      break;
    }
  }

});

firebaseConnection.child('name').on('value', function(dataSnapshot) {
  name = dataSnapshot.val();
  InstructionStore.emitChange();
});

firebaseConnection.child('instructions').on('value', function(dataSnapshot) {
  var instructionsFromFirebase = dataSnapshot.val();
  if (instructionsFromFirebase === null || (instructionsFromFirebase.length === 1 && instructionsFromFirebase[0] === null)) {
    return;
  }
  dataSnapshot.val().forEach((serializedInstruction) => {
    if (serializedInstruction) {
      let key = serializedInstruction.key();
      var existingInstruction = instructions.find((i) => i.key === key);
      let instruction = Instruction.deserialize(serializedInstruction);
      if (instruction) {
        if (existingInstruction) {
          var index = instructions.indexOf(existingInstruction);
          instructions[index] = instruction;
        } else {
          instructions.push(instruction);
        }
      }
    }
  });
  InstructionStore.emitChange();
});

export default InstructionStore;
