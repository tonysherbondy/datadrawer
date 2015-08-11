import React from 'react';
import _ from 'lodash';

import computeVariableValues from '../utils/computeVariableValues';
import InstructionTreeNode from '../models/InstructionTreeNode';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';
import DrawPictureInstruction from '../models/DrawPictureInstruction';

import {RouteHandler} from 'react-router';

class App extends React.Component {

  render() {
    let {pictures, drawingState, pictureApiState} = this.props;

    if (pictureApiState === 'loading') {
      return ( <h1>LOADING...</h1>);
    } else if (pictureApiState === 'picture.invalid') {
      return ( <h1>INVALID PICTURE.</h1>);
    } else if (pictureApiState === 'notebook.invalid') {
      return ( <h1>INVALID NOTEBOOK.</h1>);
    } else if (pictureApiState === 'init') {
      return ( <h1>LOADING NOTEBOOK...</h1>);
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
        notebook={this.props.notebook}
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
    let {notebook, pictures, pictureApiState} = nextProps;

    // 1. We just finished forking and need to go to new notebook
    // 2. We are transitioning to new notebook id and need to load new notebook
    // 3. Switching pictures within a notebook
    // 4. Picture was not part of the notebook, so we go to the first picture in notebook
    // 5. Notebook was not found so transition to notebook-not-found page
    if (pictureApiState === 'loaded' && this.props.pictureApiState === 'forking') {
      let firstPicture = nextProps.notebook.pictures.first();
      this.context.router.transitionTo(`/notebook/${nextProps.notebook.id}/picture/${firstPicture.id}/`);

    } else if (nextProps.params.notebookId !== notebook.id) {
      // TODO - this check is a stand-in for intercepting when the route changes
      // it would be better to have a direct hook into the router transition
      // that actually works so that willreceiveprops does not have to issue
      // an action and we don't have to do weird checks like the
      // pictureApiState != loading below
      if (pictureApiState !== 'loading') {
        this.context.actions.picture.loadNotebookAndSetActivePicture(nextProps.params.notebookId, nextProps.params.pictureId);
      }

    } else if (nextProps.params.pictureId !== this.props.params.pictureId) {
      // This is like checking if we have the right notebook, but for now we are
      // just seeing if all pictures have been loaded
      let picture = pictures.find(p => p.id === nextProps.params.pictureId);
      if (picture) {
        this.context.actions.picture.setActivePicture(picture);
      } else {
        this.context.actions.picture.setInvalidPictureState();
        // TODO - need to transition to somewhere else
      }

    } else if (pictureApiState === 'picture.invalid') {
      let pathElements = this.router.getCurrentPath().split('/');
      let pathIndex = pathElements.indexOf(nextProps.params.pictureId);
      pathElements[pathIndex] = _.first(pictures).id;
      this.router.transitionTo(pathElements.join('/'));

    } else if (pictureApiState === 'notebook.invalid') {
      this.router.replaceWith('/notebook-not-found');
    }
  }
}

App.propTypes = {
  notebook: React.PropTypes.object.isRequired,
  activePicture: React.PropTypes.object,
  pictureApiState: React.PropTypes.string.isRequired,
  pictures: React.PropTypes.array.isRequired,
  drawingState: React.PropTypes.object.isRequired
};

App.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

export default App;
