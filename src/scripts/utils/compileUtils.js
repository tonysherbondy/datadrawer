import evaluateJs from './evaluateJs';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import Expression from '../models/Expression';

// Compiling transforms a picture into JS, up to currentInstruction and currentInstructionLoop
// The picture function is accessible by calling utils.picture with picture ID
function compilePictureToJs(variableValues, activePicture, currentInstruction, currentLoopIndex, picture) {
  let instructions = picture.instructions;
  // Get JS from instructions
  let validInstructions = instructions.filter(i => i.isValid());
  let instructionsUpToCurrent = validInstructions;

  if (activePicture && activePicture.id === picture.id) {
    if (currentInstruction) {
      let isAfter = InstructionTreeNode.isInstructionAfter.bind(null, instructions, currentInstruction);
      instructionsUpToCurrent = validInstructions.filter(i => !isAfter(i));
    }
  }

  let jsCode = instructionsUpToCurrent.map(instruction => {
    // TODO, a loop instructions total iterations can be calculated
    // at this point because loops can only depend on data variables, this will
    // allow us to change our context, loop prefix only affects shape variables
    // within the loop though...
    // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
    if (instruction instanceof LoopInstruction) {
      let table = picture.getVariableTableWithValues(variableValues);
      return instruction.getJsCode(table, currentInstruction, currentLoopIndex);
    }
    return instruction.getJsCode();
  }).join('\n');

  return jsCode + '\n';
}

// Return a map from picture ID to picture JS for all pictures
function compileAllPicturesToJsMap(pictures, variableValues, activePicture, currentInstruction, currentLoopIndex) {
  let compile = compilePictureToJs.bind(null, variableValues, activePicture, currentInstruction, currentLoopIndex);
  let picturesJs = {};
  pictures.forEach(picture => picturesJs[picture.id] = compile(picture));
  return picturesJs;
}

// Input:
// - variableValues
// - which Picture to create shapes for
// - js code map for all pictures
// Output:
// - ShapesMap that Canvas requires to draw picture
function computeShapes(picture, variableValues, allPicturesJs) {

  // Create a DrawPicture instruction to draw the desired picture
  let jsCode = new DrawPictureInstruction({
    from: {x: 0, y: 0},
    width: new Expression(800),
    height: new Expression(600),
    pictureId: picture.id,
    variables: picture.variables
  }).getJsCode();

  evaluateJs(jsCode, variableValues, allPicturesJs);

  // Get the shapes for this picture
  let shapes = variableValues.picture.shapes;

  // TODO - So picture is used as the current picture context that we change as we are calling
  // js within any picture. This is necessary because right now picture drawing involves mutating
  // whatever the picture value context is... So here we reset the picture context which was the
  // root picture instruction we made here.
  variableValues.picture = undefined;

  return {shapes, jsCode};
}

export default {
  compileAllPicturesToJsMap,
  computeShapes
};
