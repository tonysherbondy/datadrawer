import React from 'react';
import _ from 'lodash';
import Flux from '../dispatcher/dispatcher';
import PictureStore from '../stores/PictureStore';
import DrawingStateStore from '../stores/DrawingStateStore';
import computeVariableValues from '../utils/computeVariableValues';
import Notebook from './Notebook';
import InstructionTreeNode from '../models/InstructionTreeNode';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';

class App extends React.Component {

  render() {
    let variableValues = this.getAllDataVariableValues();
    let {pictures, drawingState} = this.props;

    // Compute shapes for the active picture
    let {activePicture} = drawingState;
    let currentInstruction = this.getCurrentInstruction();
    let pictureCompiler = new NotebookPictureCompiler({
      variableValues, pictures, activePicture, currentInstruction,
      currentLoopIndex: drawingState.currentLoopIndex});
    let shapes = pictureCompiler.getShapesForPicture(activePicture);

    return (
      <Notebook
        activePicture={drawingState.activePicture}
        editingInstructionId={drawingState.editingInstructionId}
        selectedInstructions={this.getSelectedInstructions()}
        currentInstruction={currentInstruction}
        variableValues={variableValues}
        drawingMode={drawingState.mode}
        pictureForPictureTool={drawingState.pictureForPictureTool}
        currentLoopIndex={drawingState.currentLoopIndex}
        selectedShapeId={drawingState.selectedShapeId}
        showDataPopup={drawingState.showDataPopup}
        dataPopupPosition={drawingState.dataPopupPosition}
        shapes={shapes}
        pictures={pictures} />
    );
  }

  // Compute data variable values used across all pictures. This assumes
  // that variables are unique across all pictures
  // Output is a Map between variable ID and the value of that variable
  getAllDataVariableValues() {
    let allVariables = _(this.props.pictures.map(p => p.variables))
                        .flatten()
                        .unique()
                        .value();
    return computeVariableValues(allVariables).variableValues;
  }

  // Either a range that the user selected or the last instruction
  getSelectedInstructions() {
    let {selectedInstructions} = this.props.drawingState;
    let {instructions} = this.props.drawingState.activePicture;
    if (selectedInstructions && selectedInstructions.length > 0) {
      selectedInstructions = _.compact(selectedInstructions.map(i => {
        return InstructionTreeNode.findById(instructions, i.id);
      }));

      // TODO figure out why Sometimes we don't find the instructions that we have selected,
      if (selectedInstructions.length > 0) {
        return selectedInstructions;
      }
    }
    let lastInstruction = _.last(instructions);
    return lastInstruction ? [lastInstruction] : [];
  }

  // The last instruction in the selected instructions
  getCurrentInstruction() {
    return _.last(this.getSelectedInstructions());
  }

}

let stores = [PictureStore, DrawingStateStore];
let propsAccessor = () => ({
  pictures: PictureStore.getPictures(),
  drawingState: DrawingStateStore.getDrawingState()
});

App = Flux.connect(App, stores, propsAccessor);


export default App;
