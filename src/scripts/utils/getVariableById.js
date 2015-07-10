import _ from 'lodash';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import InstructionTreeNode from '../models/InstructionTreeNode';

// TODO - Move this somewhere better. Can't be in Picture because
// of some annoying circular dependency crap... need to check what
// the hell webpack is doing
export default function(picture, id) {
  let variable = picture.variables.find(v => v.id === id);
  if (!variable) {
    // Search the DrawPictureInstructions
    let allPictureVariables = _.flatten(InstructionTreeNode
      .flatten(picture.instructions)
      .filter(i => i instanceof DrawPictureInstruction)
      .map(i => i.pictureVariables));
    variable = allPictureVariables.find(v => v.id === id);
  }
  return variable;
}

