import React from 'react';
import _ from 'lodash';

import computeVariableValues from '../utils/computeVariableValues';
import InstructionTreeNode from '../models/InstructionTreeNode';
import NotebookPictureCompiler from '../utils/NotebookPictureCompiler';
import DrawPictureInstruction from '../models/DrawPictureInstruction';

import {RouteHandler} from 'react-router';

class App extends React.Component {

  render() {
    let {pictures, drawingState, apiState} = this.props;

    if (apiState === 'loading') {
      return ( <h1>LOADING...</h1>);
    } else if (apiState === 'picture.invalid') {
      return ( <h1>INVALID PICTURE.</h1>);
    } else if (apiState === 'notebook.invalid') {
      return ( <h1>INVALID NOTEBOOK.</h1>);
    } else if (apiState === 'init') {
      return ( <h1>LOADING NOTEBOOK...</h1>);
    }

    let activePicture = this.props.notebook.pictures.find(p => {
      return p.id === this.props.drawingState.activePictureId;
    });

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
    let {notebook, pictures, apiState} = nextProps;

    // 1. We just finished forking and need to go to new notebook
    // 2. We are transitioning to new notebook id and need to load new notebook
    // 3. Switching pictures within a notebook
    // 4. Picture was not part of the notebook, so we go to the first picture in notebook
    // 5. Notebook was not found so transition to notebook-not-found page
    if (apiState === 'loaded' && this.props.apiState === 'forking') {
      let firstPicture = nextProps.notebook.pictures.first();
      this.context.router.transitionTo(`/notebook/${nextProps.notebook.id}/picture/${firstPicture.id}/`);

    } else if (nextProps.params.notebookId !== notebook.id && apiState !== 'loading' && apiState !== 'forking') {
      // TODO - this check is a stand-in for intercepting when the route changes
      // it would be better to have a direct hook into the router transition
      // that actually works so that willreceiveprops does not have to issue
      // an action and we don't have to do weird checks like the
      // apiState != loading below
      this.context.actions.picture.loadNotebookAndSetActivePicture(nextProps.params.notebookId, nextProps.params.pictureId);

    } else if (nextProps.params.pictureId !== this.props.params.pictureId) {
      // After transitioning to a new picture
      this.context.actions.picture.setActivePicture(nextProps.params.pictureId);

    } else if (apiState === 'picture.invalid') {
      // If our picture state is invalid, we need should transition to the first picture
      // in the notebook
      let pathElements = this.router.getCurrentPath().split('/');
      let pathIndex = pathElements.indexOf(nextProps.params.pictureId);
      pathElements[pathIndex] = _.first(pictures).id;
      this.router.transitionTo(pathElements.join('/'));

    } else if (apiState === 'notebook.invalid') {
      // If the notebook is invalid (not found) go to not found page
      this.router.replaceWith('/notebook-not-found');
    }
  }
}

App.propTypes = {
  notebook: React.PropTypes.object.isRequired,
  pictures: React.PropTypes.array.isRequired,
  apiState: React.PropTypes.string.isRequired,
  drawingState: React.PropTypes.object.isRequired
};

App.contextTypes = {
  actions: React.PropTypes.shape({
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

export default App;
