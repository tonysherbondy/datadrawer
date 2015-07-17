import _ from 'lodash';
import Addons from 'react/addons';
let {update} = Addons.addons;

export default class InstructionTreeNode {
  constructor(props={}) {
    this.instructions = props.instructions;
  }

  //
  // API for tree like interface
  getSize() {
    if (this.instructions) {
      return this.instructions
              .map(i => i.getSize())
              .reduce((sum,n) => { return sum + n; }, 1);
    }
    return 1;
  }

  getAllInstructions() {
    let subInstructions = (this.instructions || []).map(i => i.getAllInstructions());
    return [this].concat(_.flatten(subInstructions));
  }

}

// The below functions operate on a list of instructions that may contain children,
// these probably won't be necessary when we have a picture object
InstructionTreeNode.getListSize = function(instructions) {
  let node = new InstructionTreeNode({instructions});
  return node.getSize() - 1;
};

InstructionTreeNode.flatten = function(instructions) {
  let node = new InstructionTreeNode({instructions});
  return node.getAllInstructions();
};

InstructionTreeNode.find = function(instructions, func) {
  return InstructionTreeNode.flatten(instructions).find(func);
};

InstructionTreeNode.findById = function(instructions, id) {
  if (id === undefined || id === null) { return null; }
  return InstructionTreeNode.flatten(instructions).find(i => i.id === id);
};

InstructionTreeNode.findParent = function(instructions, instruction) {
  if (!instruction) {
    return null;
  }
  let all = InstructionTreeNode.flatten(instructions);
  return all.find(i => {
    // find the instruction that has this instruction as a child
    if (!i.instructions) {
      return false;
    }
    return !!i.instructions.find(child => child.id === instruction.id);
  });
};

InstructionTreeNode.findParentWithIndex = function(instructions, instruction) {
  // Get the parent of this instruction and our index within the parent
  let parent = InstructionTreeNode.findParent(instructions, instruction);
  let index = parent.instructions.findIndex(i => i.id === instruction.id);
  return {parent, index};
};

InstructionTreeNode.insertInstruction = function(instructions, instruction, index, parent) {
  let spliceParams = {$splice: [[index, 0, instruction]]};
  return InstructionTreeNode.spliceParent(instructions, spliceParams, parent);
};

InstructionTreeNode.spliceParent = function(instructions, spliceParams, parent) {
  let newInstructions;
  if (parent.id) {
    // clone the parent instruction
    let cloneParent = parent.clone();
    // Splice the new instruction into the previous array of instructions that had the parent
    cloneParent.instructions = update(cloneParent.instructions, spliceParams);

    // Keep splicing up the instruction tree
    let {parent: nextParent, index} = InstructionTreeNode.findParentWithIndex(instructions, parent);
    newInstructions = InstructionTreeNode.spliceParent(instructions, {$splice: [[index, 1, cloneParent]]}, nextParent);
  } else {
    newInstructions = update(instructions, spliceParams);
  }
  return newInstructions;
};

InstructionTreeNode.replaceInstructions = function(instructions, instructionsToRemove, instructionsToAdd) {
  // Assumption is that the instructionsToRemove are contiguous and only have one parent
  // so that we can easily perform a slice
  // Assume instructions toAdd is an array
  let firstRemove = _.first(instructionsToRemove);
  let numToRemove = instructionsToRemove.length;
  let {parent, index} = InstructionTreeNode.findParentWithIndex(instructions, {id: firstRemove.id});
  let spliceArray = instructionsToAdd ? [index, numToRemove, ...instructionsToAdd] : [index, numToRemove];
  let spliceParams = {$splice: [spliceArray]};
  return InstructionTreeNode.spliceParent(instructions, spliceParams, parent);
};

InstructionTreeNode.replaceById = function(instructions, idToRemove, newInstruction) {
  // Currently we assume that there is either no parent or one parent
  // No parent is represented as a parent with no ID because find parent always
  // constructs a root node
  let {parent, index} = InstructionTreeNode.findParentWithIndex(instructions, {id: idToRemove});
  let spliceArray = newInstruction ? [index, 1, newInstruction] : [index, 1];
  let spliceParams = {$splice: [spliceArray]};
  return InstructionTreeNode.spliceParent(instructions, spliceParams, parent);
};

InstructionTreeNode.removeById = function(instructions, idToRemove) {
  return InstructionTreeNode.replaceById(instructions, idToRemove);
};

// Find a set of instructions between two instructions. The set must
// be at the same level, so we walk the tree of instructions
InstructionTreeNode.findBetweenRange = function(instructions, instruction1, instruction2) {
  // First see if the two instructions are both at the first level
  let findById1 = i => i.id === instruction1.id;
  let findById2 = i => i.id === instruction2.id;
  let findBetween = instruction => {
    let curInstructions = instruction.instructions;
    if (!curInstructions) {
      return [];
    }

    let i1 = curInstructions.findIndex(findById1);
    let i2 = curInstructions.findIndex(findById2);
    if (i1 > -1 && i2 > -1) {
      if (i1 > i2) {
        return _.range(i2, i1 + 1).map(idx => curInstructions[idx]);
      }
      return _.range(i1, i2 + 1).map(idx => curInstructions[idx]);
    }

    return [];
  };

  // First get all instructions
  let allInstructions = InstructionTreeNode.flatten(instructions);

  // See if any instruction contains an array with these instructions in them
  let parentOfRange = allInstructions.find(i => findBetween(i).length > 0);
  if (parentOfRange) {
    return findBetween(parentOfRange);
  }

  // return empty array if we couldn't find a suitable set
  return [];
};

// Determines if the second instruction comes after the first
InstructionTreeNode.isInstructionAfter = function(instructions, first, second) {
  // Assume the flatten is depth first??
  let all = InstructionTreeNode.flatten(instructions);
  // If we don't find first index, second will always be after
  let firstIndex = all.findIndex(i => i.id === first.id);
  let secondIndex = all.findIndex(i => i.id === second.id);
  return secondIndex > firstIndex;
};

