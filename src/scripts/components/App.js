import React from 'react';
import _ from 'lodash';
import Flux from '../dispatcher/dispatcher';
import PictureStore from '../stores/PictureStore';
import DrawingStateStore from '../stores/DrawingStateStore';
import computeVariableValues from '../utils/computeVariableValues';
import InstructionTreeNode from '../models/InstructionTreeNode';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import PictureActions from '../actions/PictureActions';
import {RouteHandler} from 'react-router';

class App extends React.Component {

  render() {
    let {pictures, drawingState, pictureApiState} = this.props;

    if (pictureApiState === 'loading') {
      return ( <h1>LOADING...</h1>);
    } else if (pictureApiState === 'invalid') {
      return ( <h1>INVALID.</h1>);
    }

    let activePicture = this.props.activePicture;

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

  componentWillMount() {
    this.router = this.context.router;
  }

  componentWillReceiveProps(nextProps) {
    let {pictures, pictureApiState} = nextProps;
    if (_.isEmpty(pictures)) {
      if ( pictureApiState !== 'loading') {
        PictureActions.loadAllPicturesAndSetActive(nextProps.params.pictureId);
      }
    } else if (nextProps.params.pictureId !== this.props.params.pictureId) {
      // This is like checking if we have the right notebook, but for now we are
      // just seeing if all pictures have been loaded
      let picture = pictures.find(p => p.id === nextProps.params.pictureId);
      if (picture) {
        PictureActions.setActivePicture(picture);
      } else {
        PictureActions.setInvalidPictureState();
        // TODO - need to transition to somewhere else
        //let pathElements = this.router.getCurrentPath().split('/');
        //let pathIndex = pathElements.indexOf(pictureId);
        //pathElements[pathIndex] = _.first(nextProps.pictures).id;
        //this.router.transitionTo(pathElements.join('/'));
        //this.setState({isTransitioning: true});
      }
    }
  }
}


App.contextTypes = {
  router: React.PropTypes.func.isRequired
};

let stores = [PictureStore, DrawingStateStore];
let propsAccessor = () => ({
  activePicture: PictureStore.getActivePicture(),
  pictureApiState: PictureStore.getApiState(),
  pictures: PictureStore.getPictures(),
  drawingState: DrawingStateStore.getDrawingState()
});

App = Flux.connect(App, stores, propsAccessor);

export default App;
