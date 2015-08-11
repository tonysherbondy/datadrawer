import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import $ from 'jquery';

import ThumbnailsBar from './ThumbnailsBar';
import DrawPictureInstruction from '../models/DrawPictureInstruction';
import InstructionTreeNode from '../models/InstructionTreeNode';
import Picture from '../models/Picture';
import LoopInstruction from '../models/LoopInstruction';
import Instruction from '../models/Instruction';
import DrawInstruction from '../models/DrawInstruction';

import DataTable from './instructions/DataTable';
import DataVariableList from './instructions/DataVariableList';
import InstructionList from './instructions/InstructionList';

import KeyboardControlsList from './KeyboardControlsList';
import InstructionTitle from './instructions/InstructionTitle';
import Canvas from './drawing/Canvas';
import InstructionCode from './instructions/InstructionCode';
import ShapesMap from '../models/shapes/ShapesMap';

import NotebookEditorMenuBar from './NotebookEditorMenuBar';
import Popover from './Popover';
import ShapeDataList from './ShapeDataList';

import ShortcutKeyHandler from '../utils/ShortcutKeyHandler';

class Notebook extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      leftPanelWidth: 300,
      isDebugging: false,
      isShowingPictures: true,
      hideKeyMap: false
    };

    this.keyDownListener = this.handleKeyDown.bind(this);
  }

  render() {
    let {activePicture,
         variableValues,
         selectedInstructions,
         currentInstruction,
         currentLoopIndex} = this.props;

    let selectedShape = this.props.shapes.getShapeByIdAndIndex(this.getSelectedShapeId(), this.props.currentLoopIndex);
    let shapeNameMap = activePicture.getShapeNameMap();

    return (
      <div className='main'>

        <NotebookEditorMenuBar
          notebook={this.props.notebook}
          isShowingPictures={this.state.isShowingPictures}
          isShowingShortcuts={!this.state.hideKeyMap}
          onToggleShortcuts={this.handleToggleShortcuts.bind(this)}
          onTogglePictures={this.handleTogglePictures.bind(this)} />

        {this.state.isShowingPictures ?
          <ThumbnailsBar
            notebook={this.props.notebook}
            variableValues={variableValues}
            activePicture={this.props.activePicture}
            pictureForPictureTool={this.props.pictureForPictureTool}
            onThumbnailClick={this.handleThumbnailClick.bind(this)}
          /> : ''
        }

        <div className='editor-area'>
          <div className='left-panel' style={{width: this.state.leftPanelWidth}}>
            <div className='left-panel-header'>
              Data
              <i
                onMouseDown={this.handleMouseDownPanelResize.bind(this)}
                className="resize-panel-arrow fa fa-arrows-h"></i>
            </div>

            <DataVariableList
              picture={activePicture}
              asVector={true}
              dataVariables={activePicture.variables}
              dataValues={variableValues} />

            <DataTable
              picture={activePicture}
              currentLoopIndex={this.props.currentLoopIndex}
              dataVariables={activePicture.variables}
              dataValues={variableValues} />

            <div className='left-panel-header'>Steps</div>
            <InstructionList
              picture={activePicture}
              currentInstruction={currentInstruction}
              selectedInstructions={selectedInstructions}
              variableValues={variableValues}
              shapeNameMap={shapeNameMap}
              instructions={activePicture.instructions} />
          </div>

          <div className="drawing-area-scroll-wrapper">
            <div className='drawing-area'>

              <KeyboardControlsList
                className={classNames('keyboard-controls-list', {hidden: this.state.hideKeyMap})}
                keyEventManager={this.keyEventManager}
                drawingMode={this.props.drawingMode}/>

              <div className='canvas-container'>
                <InstructionTitle
                  picture={activePicture}
                  dataVariables={activePicture.variables}
                  variableValues={variableValues}
                  shapeNameMap={shapeNameMap}
                  instruction={currentInstruction} />

                <Canvas
                  className='canvas'
                  activePicture={this.props.activePicture}
                  drawingMode={this.props.drawingMode}
                  currentInstruction={currentInstruction}
                  currentLoopIndex={currentLoopIndex}
                  selectedShape={selectedShape}
                  editingInstruction={this.getEditingInstruction()}
                  shapes={this.props.shapes} />

                <InstructionCode
                  className={classNames({'hidden': !this.state.isDebugging})}
                  code={this.props.jsCode} />
              </div>

              <div style={{clear: 'both'}}></div>
            </div>
          </div>

          <Popover
            picture={activePicture}
            handleClose={this.handlePopoverClose.bind(this)}
            position={this.props.dataPopupPosition}
            isDraggable={true}
            isShown={this.props.showDataPopup}>
            <ShapeDataList
              picture={activePicture}
              variableValues={this.props.variableValues}
              currentLoopIndex={currentLoopIndex}
              shape={selectedShape}
              shapes={this.props.shapes} />
          </Popover>

          <div style={{clear: 'both'}}></div>
        </div>
      </div>
    );
  }

  componentWillMount() {
    // TODO: move this to a better place
    // need to happen after initialization in order to have context.actions
    if (!this.keyEventManager) {
      this.keyEventManager = this.getKeyEventManager();
    }
  }

  componentDidMount() {
    // Loading keyboard shortcuts
    window.addEventListener('keydown', this.keyDownListener);
  }

  componentWillUnmount() {
    // Remove keyboard shortcuts
    window.removeEventListener('keydown', this.keyDownListener);
  }

  handleKeyDown(e) {
    let targetClass = e.target.getAttribute('class');
    if (/notebook-name-input/.test(targetClass)) {
      return;
    }
    this.keyEventManager.handleKeyDown(e);
  }

  handleNotebookFork() {
    console.log('fork notebook');
  }

  handleNewNotebook() {
    console.log('new notebook');
  }

  handleTogglePictures() {
    this.setState({isShowingPictures: !this.state.isShowingPictures});
  }

  handleToggleShortcuts() {
    this.setState({hideKeyMap: !this.state.hideKeyMap});
  }

  handleMouseDownPanelResize(evt) {
    this.resizeStartScreenX = evt.screenX;
    this.resizeStartWidth = this.state.leftPanelWidth;
    this.resizeMoveHandler = this.handleResizeMouseMove.bind(this);
    this.resizeUpHandler = this.handleResizeMouseUp.bind(this);
    window.addEventListener('mousemove', this.resizeMoveHandler);
    window.addEventListener('mouseup', this.resizeUpHandler);
    $('body').css('cursor', 'ew-resize');
    evt.preventDefault();
  }

  handleResizeMouseMove(evt) {
    let delta = evt.screenX - this.resizeStartScreenX;
    this.setState({leftPanelWidth: this.resizeStartWidth + delta});
  }

  handleResizeMouseUp() {
    window.removeEventListener('mousemove', this.resizeMoveHandler);
    window.removeEventListener('mouseup', this.resizeUpHandler);
    $('body').css('cursor', 'default');
  }

  getKeyEventManager() {
    let {manager} = new ShortcutKeyHandler({
      pictureActions: this.context.actions.picture,
      drawingStateActions: this.context.actions.drawingState,
      notebook: this
    });

    //manager = manager.registerHandler({
      //keyCode: 112,
      //keyDescription: 'F1',
      //description: 'debug mode',
      //keyDown: () => {
        //this.setState({isDebugging: !this.state.isDebugging});
      //}
    //});

    //manager = manager.registerHandler({
      //keyCode: 113,
      //keyDescription: 'F2',
      //description: 'hide this list',
      //keyDown: () => {
        //this.setState({hideKeyMap: !this.state.hideKeyMap});
      //}
    //});

    return manager;
  }

  handleThumbnailClick(picture) {
    if (this.props.drawingMode === 'picture') {
      this.context.actions.drawingState.setPictureForPictureTool(picture);
      let instruction = new DrawPictureInstruction({
        pictureId: picture.id,
        pictureVariables: picture.variables
      });
      this.context.actions.picture.insertInstructionAfterInstruction(
        this.props.activePicture.id,
        instruction,
        this.props.currentInstruction);
    } else {
      let {notebookId} = this.context.router.getCurrentParams();
      this.context.router.transitionTo(`/notebook/${notebookId}/picture/${picture.id}/edit`);
    }
  }

  handlePopoverClose() {
    this.context.actions.drawingState.hideDataPopup();
  }

  // Either the one the user selected or the shape from the selected
  // shape
  getSelectedShapeId() {
    let {selectedShapeId, currentInstruction} = this.props;
    if (!_.isString(selectedShapeId) && currentInstruction) {
      selectedShapeId = currentInstruction.shapeId;
    }
    return selectedShapeId;
  }

  getEditingInstruction() {
    let {instructions} = this.props.activePicture;
    let {editingInstructionId} = this.props;
    return InstructionTreeNode.findById(instructions, editingInstructionId);
  }

  selectNextShape() {
    let {selectedShapeId} = this.props;

    // Get all available shape ids
    let shapes = this.props.shapes.getAllShapesForLoopIndex(this.props.currentLoopIndex);

    // If the selectedShape wasn't found or didn't have one go to first
    // otherwise next
    let nextIndex = shapes.findIndex(shape => shape.id === selectedShapeId) + 1;
    let nextShapeId;
    if (nextIndex >= 0 && nextIndex < shapes.length) {
      nextShapeId = shapes[nextIndex].id;
    }
    this.context.actions.drawingState.setSelectedShapeId(nextShapeId);
  }

  isLoopIndexAtEnd() {
    let {currentLoopIndex, activePicture, currentInstruction} = this.props;
    let {instructions} = activePicture;
    let parent = InstructionTreeNode.findParent(instructions, currentInstruction);

    if (!(parent instanceof LoopInstruction)) {
      return false;
    }

    let count = parent.getMaxLoopCount(activePicture.getVariableTableWithValues(this.props.variableValues));
    return !_.isNumber(currentLoopIndex) || currentLoopIndex === count - 1;
  }

  stepLoopIndex(step) {
    let {currentLoopIndex, activePicture, currentInstruction} = this.props;
    let {instructions} = activePicture;
    let parent = InstructionTreeNode.findParent(instructions, currentInstruction);

    // If the current instruction is not in a loop, then index = null
    if (!(parent instanceof LoopInstruction)) {
      this.context.actions.drawingState.setLoopIndex(null);
      return;
    }

    let count = parent.getMaxLoopCount(activePicture.getVariableTableWithValues(this.props.variableValues));
    if (!_.isNumber(currentLoopIndex)) {
      // If loop index == null is same as last index
      currentLoopIndex = count - 1;
    }

    // Step loop index
    currentLoopIndex += step;
    if (currentLoopIndex < 0) {
      currentLoopIndex = 0;
    } else if (currentLoopIndex > count - 1) {
      currentLoopIndex = count - 1;
    }

    this.context.actions.drawingState.setLoopIndex(currentLoopIndex);
  }

  getDrawInstructionForSelectedShape() {
    let selectedShapeId = this.getSelectedShapeId();
    let {instructions} = this.props.activePicture;
    return InstructionTreeNode.find(instructions, i => {
      return i.shapeId === selectedShapeId && i instanceof DrawInstruction;
    });
  }

}

Notebook.propTypes = {
  notebook: React.PropTypes.object.isRequired,
  variableValues: React.PropTypes.object.isRequired,
  currentInstruction: React.PropTypes.instanceOf(Instruction),
  selectedInstructions: React.PropTypes.arrayOf(React.PropTypes.instanceOf(Instruction)),
  shapes: React.PropTypes.instanceOf(ShapesMap).isRequired,
  // Previous Drawing State
  activePicture: React.PropTypes.instanceOf(Picture).isRequired,
  editingInstructionId: React.PropTypes.string,
  drawingMode: React.PropTypes.string.isRequired,
  pictureForPictureTool: React.PropTypes.instanceOf(Picture),
  currentLoopIndex: React.PropTypes.number,
  selectedShapeId: React.PropTypes.string,
  // For Popup... maybe move up to App
  showDataPopup: React.PropTypes.bool,
  dataPopupPosition: React.PropTypes.object
};

Notebook.contextTypes = {
  actions: React.PropTypes.shape({
    drawingState: React.PropTypes.object.isRequired,
    picture: React.PropTypes.object.isRequired
  }),
  router: React.PropTypes.func.isRequired
};

export default Notebook;
