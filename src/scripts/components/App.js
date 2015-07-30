import React from 'react';
import _ from 'lodash';
import Flux from '../dispatcher/dispatcher';
import PictureStore from '../stores/PictureStore';
import DrawingStateStore from '../stores/DrawingStateStore';
import computeVariableValues from '../utils/computeVariableValues';
import InstructionTreeNode from '../models/InstructionTreeNode';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import DrawingStateActions from '../actions/DrawingStateActions';

import {RouteHandler} from 'react-router';

class App extends React.Component {

  render() {
    let {pictures, drawingState} = this.props;
    let {pictureId} = this.router.getCurrentParams();

    // TODO - Use willTransitionTo to make sure that the ID is legitimate
    let activePicture = this.props.pictures.find(p => p._id === pictureId);

    // Instead of defaulting to first, we should transition to the right route... but I don't
    // want to do this in render
    let variableValues = this.getAllDataVariableValues(activePicture);

    // Compute shapes for the active picture
    let currentInstruction = this.getCurrentInstruction(activePicture);
    let pictureCompiler = new NotebookPictureCompiler({
      variableValues, pictures, activePicture, currentInstruction,
      currentLoopIndex: drawingState.currentLoopIndex});
    let shapes = pictureCompiler.getShapesForPicture(activePicture);

    // Either go to a picture viewer or editor
    return (
      <RouteHandler
        activePicture={activePicture}
        editingInstructionId={drawingState.editingInstructionId}
        selectedInstructions={this.getSelectedInstructions(activePicture)}
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
    let {pictures} = this.props;
    let pictureVariables = pictures.map(p => p.variables);
    let instVariables = pictures.map(p => {
      return _.flatten(InstructionTreeNode.flatten(p.instructions)
                                .filter(i => i instanceof DrawPictureInstruction)
                                .map(i => i.pictureVariables));
    });
    let allVariables = _(pictureVariables.concat(instVariables))
                        .flatten()
                        .unique()
                        .value();
    return computeVariableValues(allVariables).variableValues;
  }

  // Either a range that the user selected or the last instruction
  getSelectedInstructions(activePicture) {
    let {selectedInstructions} = this.props.drawingState;
    let {instructions} = activePicture;
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
  getCurrentInstruction(activePicture) {
    return _.last(this.getSelectedInstructions(activePicture));
  }

  componentWillMount(){
    this.router = this.context.router;
  }

}

App.contextTypes = {
  router: React.PropTypes.func.isRequired
};


let stores = [PictureStore, DrawingStateStore];
let propsAccessor = () => ({
  pictures: PictureStore.getPictures(),
  drawingState: DrawingStateStore.getDrawingState()
});

App = Flux.connect(App, stores, propsAccessor);

App.willTransitionTo = function(transition, params, query) {
  console.log('will transition to', transition, params, query);
  let pictures = PictureStore.getPictures();
  let {pictureId} = params;
  let activePicture = pictures.find(p => p._id === pictureId);
  if (!activePicture) {
    // It is annoying that I need to specify the exact path I want rather
    // than just changing the parameters
    let pathElements = transition.path.split('/');
    let pathIndex = pathElements.indexOf(pictureId);
    pictureId = pictures[0]._id;
    pathElements[pathIndex] = pictureId;
    transition.redirect(pathElements.join('/'), Object.assign(params, {pictureId}), query);
  } else {
    DrawingStateActions.setActivePicture(activePicture);
  }
  //NotebookActions.fetchNotebook(params.notebookId);
};


export default App;
