import _ from 'lodash';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import InstructionTreeNode from '../models/InstructionTreeNode';

// TODO - Move this somewhere better. Can't be in Picture because
// of some annoying circular dependency crap... need to check what
// the hell webpack is doing

export default function getAllPictureVariables(picture) {
  return picture.variables.concat(
    _.flatten(InstructionTreeNode
    .flatten(picture.instructions)
    .filter(i => i instanceof DrawPictureInstruction)
    .map(i => i.pictureVariables))
  );
}

