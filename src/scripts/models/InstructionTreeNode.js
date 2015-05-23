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
  return InstructionTreeNode.flatten(instructions).find(i => i.id === id);
};

InstructionTreeNode.findParent = function(instructions, instruction) {
  let all = InstructionTreeNode.flatten(instructions);
  return all.find(i => {
    // find the instruction that has this instruction as a child
    if (!i.instructions) {
      return false;
    }
    return !!i.instructions.find(child => child.id === instruction.id);
  });
};

InstructionTreeNode.removeById = function(instructions, idToRemove) {
  // Currently we assume that there is either no parent or one parent
  // No parent is represented as a parent with no ID because find parent always
  // constructs a root node
  let parent = InstructionTreeNode.findParent(instructions, {id: idToRemove});
  let index = parent.instructions.findIndex(i => i.id === idToRemove);
  let spliceParams = {$splice: [[index, 1]]};
  let newInstructions;
  if (parent.id) {
    // For now assume a parent can only be nested one level deep
    // First find the parent's parent
    let pParent = InstructionTreeNode.findParent(instructions, parent);
    let pIndex = pParent.instructions.findIndex(i => i.id === parent.id);
    // Next, clone the parent instruction
    let cloneParent = parent.clone();
    // Splice the new instruction into the previous array of instructions that had the parent
    cloneParent.instructions = update(cloneParent.instructions, spliceParams);
    newInstructions = update(instructions, {$splice: [[pIndex, 1, cloneParent]]});
  } else {
    newInstructions = update(instructions, spliceParams);

  }
  return newInstructions;
};

//InstructionTreeNode.replaceInstruction = function(instructions, instruction) {
  //// Replace instruction with same id
//};

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
        return _.range(i2, i1+1).map(idx => curInstructions[idx]);
      }
      return _.range(i1, i2+1).map(idx => curInstructions[idx]);
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
