import _ from 'lodash';

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
