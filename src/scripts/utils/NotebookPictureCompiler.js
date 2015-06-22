import {computeShapes, compileAllPicturesToJsMap} from '../utils/compileUtils';
import ShapesMap from '../models/shapes/ShapesMap';

// For a picture will generate shapes
export default class NotebookPictureCompiler {
  // TODO - Should refactor so that only shapes computation cares about current instruction and
  // current loop index
  constructor({variableValues, pictures, activePicture, currentInstruction, currentLoopIndex}) {
    this.variableValues = variableValues;
    this.pictures = pictures;
    // Precompile all pictures JS that is necessary for generating any picture's shapes
    this.allPicturesJs = compileAllPicturesToJsMap(
      pictures, variableValues, activePicture, currentInstruction, currentLoopIndex);
  }

  // Returns a ShapesMap object for the picture that is input
  getShapesForPicture(picture) {
    // Compile JS code for all pictures
    // Compute shapes for picture
    let {shapes} = computeShapes(picture, this.variableValues, this.allPicturesJs);
    return new ShapesMap(shapes);
  }
}
