import _ from 'lodash';
import LoopInstruction from '../models/LoopInstruction';
import IfInstruction from '../models/IfInstruction';
import {guid} from '../utils/utils';


/*eslint no-use-before-define: 0*/
// we have mutual-recursion: expandInstructions is called before it is defined
let expandLoop = function(loopInstruction) {
  let startMark = {
    id: guid(),
    isLoopStart: true,
    loopInstruction: loopInstruction
  };
  let endMark = {
    id: guid(),
    isLoopEnd: true,
    loopInstruction: loopInstruction
  };
  startMark.loopEnd = endMark;
  endMark.loopStart = startMark;

  return [
    startMark,
    ...expandInstructions(loopInstruction.instructions),
    endMark,
    loopInstruction
  ];
};

let expandIf = function(ifInstruction) {
  let startMark = {
    id: guid(),
    isIfStart: true,
    ifInstruction: ifInstruction
  };
  let endMark = {
    id: guid(),
    isIfEnd: true,
    ifInstruction: ifInstruction
  };
  startMark.ifEnd = endMark;
  endMark.ifStart = startMark;

  return [
    startMark,
    ...expandInstructions(ifInstruction.instructions),
    endMark,
    ifInstruction
  ];
};

let expandInstruction = function(instruction) {
  if (instruction instanceof LoopInstruction) {
    return expandLoop(instruction);
  } else if (instruction instanceof IfInstruction) {
    return expandIf(instruction);
  } else {
    return [instruction];
  }
};

let expandInstructions = function(instructionsList) {
  let instructions = instructionsList || [];
  return _.flatten(instructions.map(expandInstruction));
};

export default class InstructionsStepper {
  constructor(pictureResult) {
    this.originalList = pictureResult.instructions;
    this.expandedList = expandInstructions(this.originalList);
    this.pictureResult = pictureResult;
  }

  _previousInExpanded(currentInstruction) {
    let index = _.findIndex(this.expandedList, {id: currentInstruction.id});
    return index > 0 ? this.expandedList[index - 1] : undefined;
  }

  _nextInExpanded(currentInstruction) {
    let index = _.findIndex(this.expandedList, {id: currentInstruction.id});
    if (index >= 0 && index + 1 < this.expandedList.length) {
      return this.expandedList[index + 1];
    }
    return undefined;
  }

  stepForwards(currentInstruction, currentLoopIndex) {
    let next = this._nextInExpanded(currentInstruction);

    if (next && next.isLoopStart) {
      return this.stepForwards(next, 0);
    }

    if (next && next.isLoopEnd) {
      let loop = next.loopInstruction;
      let loopLength = loop.getMaxLoopCount(this.pictureResult.getTable());
      if (currentLoopIndex + 1 < loopLength) {
        return this.stepForwards(next.loopStart, currentLoopIndex + 1);
      } else {
        return this.stepForwards(next, undefined);
      }
    }

    // TODO: step based on whether the if condition was true
    if (next && (next.isIfStart || next.isIfEnd)) {
      return this.stepForwards(next, currentLoopIndex);
    }

    return {
      nextInstruction: next,
      nextLoopIndex: currentLoopIndex
    };
  }

  stepBackwards(currentInstruction, currentLoopIndex) {
    let prev = this._previousInExpanded(currentInstruction);

    if (prev && prev.isLoopStart) {
      if (currentLoopIndex > 0) {
        return this.stepBackwards(prev.loopEnd, currentLoopIndex - 1);
      } else {
        return this.stepBackwards(prev, undefined);
      }
    }

    if (prev && prev.isLoopEnd) {
      let loop = prev.loopInstruction;
      let loopLength = loop.getMaxLoopCount(this.pictureResult.getTable());
      return this.stepBackwards(prev, loopLength - 1);
    }

    // TODO: step based on whether the if condition was true
    if (prev && (prev.isIfStart || prev.isIfEnd)) {
      return this.stepBackwards(prev, currentLoopIndex);
    }

    return {
      nextInstruction: prev,
      nextLoopIndex: currentLoopIndex
    };
  }
}
