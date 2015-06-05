import React from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import Flux from '../dispatcher/dispatcher';
import InstructionStore from '../stores/InstructionStore';
import DataVariableStore from '../stores/DataVariableStore';
import DrawingStateStore from '../stores/DrawingStateStore';
import InstructionActions from '../actions/InstructionActions';
import DrawingStateActions from '../actions/DrawingStateActions';
import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawInstruction from '../models/DrawInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';
import PictureResult from '../models/PictureResult';
import InstructionStepper from '../utils/InstructionStepper';

import InstructionList from './instructions/InstructionList';
import DataVariableList from './instructions/DataVariableList';
import DataTable from './instructions/DataTable';
import InstructionTitle from './instructions/InstructionTitle';
import InstructionCode from './instructions/InstructionCode';
import Canvas from './drawing/Canvas';
import Popover from './Popover';

class App extends React.Component {
  constructor(props) {
    super(props);
    // TODO - the only reason i moved this to state is because i want it
    // to be computed only once when props change and then use it for functionality
    // like moving the current steps etc., you could imagine that functionality
    // actually moving down to the instructions list or something like that instead
    // then we could just calculate the picture in the render for this app

    this.state = this._stateForProps(props);
    this.state.isDebugging = false;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this._stateForProps(nextProps));
  }

  _stateForProps(props) {
    let pictureResult = this.getPictureResult(props);
    let stepper = new InstructionStepper(
      this.props.instructions, pictureResult);
    return { pictureResult, stepper };
  }

  getPictureResult(props) {
    return new PictureResult({ instructions: props.instructions,
                               dataVariables: props.variables,
                               currentInstruction: this.getCurrentInstruction(props),
                               currentLoopIndex: props.drawingState.currentLoopIndex });
  }

  handlePresetClick(name) {
    InstructionActions.loadPresetInstructions(name);
  }

  selectNextShape() {
    // Get all available shape ids
    let shapes = this.state.pictureResult.getAllShapesForLoopIndex(this.props.drawingState.currentLoopIndex);
    let {selectedShapeId} = this.props.drawingState;

    // If the selectedShape wasn't found or didn't have one go to first
    // otherwise next
    let nextIndex = shapes.findIndex(shape => shape.id === selectedShapeId) + 1;
    let nextShapeId;
    if (nextIndex >= 0 && nextIndex < shapes.length) {
      nextShapeId = shapes[nextIndex].id;
    }
    DrawingStateActions.setSelectedShapeId(nextShapeId);
  }

  handleKeyDown(e) {
    let code = e.keyCode || e.which;
    switch (code) {
      case 65: { //a
        DrawingStateActions.setDrawingMode('path');
        let instruction = new DrawPathInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions),
          isClosed: true
        });
        this.state.pictureResult.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 71: { //g
        // Toggle guide setting on selected shape
        let drawInstruction = this.getDrawInstructionForSelectedShape();
        if (drawInstruction) {
          drawInstruction = drawInstruction.clone();
          drawInstruction.isGuide = !drawInstruction.isGuide;
          InstructionActions.modifyInstruction(drawInstruction);
        }
        break;
      }
      case 78: { //n
        if (e.shiftKey) {
          this.selectNextShape();
          return;
        }
        // Edit the selected instruction by cycling through overlapping
        // magnet points
        // Toggle guide setting on selected shape
        let instruction = this.getCurrentInstruction();
        if (instruction && instruction.isValid() &&
            (instruction instanceof DrawInstruction ||
            instruction instanceof ScaleInstruction)) {

          // If the point is valid we have either a scale or draw instruction
          // and either way we access the to point.
          // An invalid instruction means we have the draw instruction and the
          // from point is the one we are cycling.

          let pointName = 'to';
          if (instruction instanceof DrawInstruction &&
              instruction.id === this.props.drawingState.editingInstructionId) {
            pointName = 'from';
          }
          let point = instruction[pointName];
          let magnets = instruction[pointName + 'Magnets'];
          if (point && point.id && magnets.length > 1) {
            // Grab possible magnets for this draw instruction
            let index = magnets.findIndex(m => {
              return m.shapeId === point.id && m.pointName === point.point;
            });
            index++;
            if (index === magnets.length) {
              index = 0;
            }
            let magnetPoint = Canvas.convertMagnetToPoint(magnets[index]);
            if (pointName === 'from') {
              instruction = instruction.getCloneWithFrom(magnetPoint, magnets);
            } else {
              instruction = instruction.getCloneWithTo(magnetPoint, this.state.pictureResult, magnets);
            }
            InstructionActions.modifyInstruction(instruction);
          }
        }
        break;
      }
      case 82: { //r
        DrawingStateActions.setDrawingMode('rect');
        let instruction = new DrawRectInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions)
        });
        this.state.pictureResult.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 83: { //s
        DrawingStateActions.setDrawingMode('scale');
        break;
      }
      case 84: { //t
        DrawingStateActions.setDrawingMode('text');
        let instruction = new DrawTextInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions)
        });
        this.state.pictureResult.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 86: { //v
        DrawingStateActions.setDrawingMode('move');
        break;
      }
      case 88: { //x
        DrawingStateActions.setDrawingMode('line');
        let instruction = new DrawLineInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions)
        });
        this.state.pictureResult.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 67: { //c
        DrawingStateActions.setDrawingMode('circle');
        let instruction = new DrawCircleInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions)
        });
        this.state.pictureResult.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 76: { //l
        // TODO We allow multiple looping levels, but other assumptions don't support that
        let selectedInstructions = this.getSelectedInstructions();
        let {instructions} = this.props;

        // Get the parent and index of first instruction
        let {parent, index} = InstructionTreeNode.findParentWithIndex(instructions, selectedInstructions[0]);

        // Remove selected instructions from list
        InstructionActions.removeInstructions(selectedInstructions);

        // Create a new loop instruction with selected instructions as children
        let instruction = new LoopInstruction({
          id: InstructionTreeNode.getNextInstructionId(instructions),
          instructions: selectedInstructions
        });

        // Insert loop instruction before previous instruction index
        InstructionActions.insertInstruction(instruction, index, parent);
        // We need to set the drawing mode to normal because we don't want to edit the newly inserted instruction
        DrawingStateActions.setDrawingMode('normal');
        break;
      }
      case 37: { //left arrow
        // If we are in a loop decrement the loop counter
        // don't cycle back around
        this.stepLoopIndex(-1);
        e.preventDefault();
        break;
      }
      case 39: { //right arrow
        // If we are in a loop increment the loop counter
        // don't cycle back around
        this.stepLoopIndex(1);
        e.preventDefault();
        break;
      }
      case 38: { //up arrow
        let loopIndex = this.props.drawingState.currentLoopIndex;
        let {nextInstruction, nextLoopIndex} = this.state.stepper.
          stepBackwards(this.getCurrentInstruction(), loopIndex);

        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction);
          DrawingStateActions.setLoopIndex(nextLoopIndex);
        }

        e.preventDefault();
        break;
      }
      case 40: { //down arrow
        let loopIndex = this.props.drawingState.currentLoopIndex;
        let {nextInstruction, nextLoopIndex} = this.state.stepper.
          stepForwards(this.getCurrentInstruction(), loopIndex);

        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction);
          DrawingStateActions.setLoopIndex(nextLoopIndex);
        }

        e.preventDefault();
        break;
      }
      case 27: { //esc
        DrawingStateActions.setDrawingMode('normal');
        break;
      }
      case 112: { // F1 to enter debug mode
        this.setState({isDebugging: !this.state.isDebugging});
        break;
      }
      default:
        console.log('unknown code', code);
        break;
    }
  }

  isLoopIndexAtEnd() {
    let {currentLoopIndex} = this.props.drawingState;
    let currentInstruction = this.getCurrentInstruction();
    let {instructions} = this.props;
    let parent = InstructionTreeNode.findParent(instructions, currentInstruction);

    if (!(parent instanceof LoopInstruction)) {
      return false;
    }

    let count = parent.getMaxLoopCount(this.state.pictureResult.getTable());
    return !_.isNumber(currentLoopIndex) || currentLoopIndex === count - 1;
  }

  stepLoopIndex(step) {
    let {currentLoopIndex} = this.props.drawingState;
    let currentInstruction = this.getCurrentInstruction();
    let {instructions} = this.props;
    let parent = InstructionTreeNode.findParent(instructions, currentInstruction);

    // If the current instruction is not in a loop, then index = null
    if (!(parent instanceof LoopInstruction)) {
      DrawingStateActions.setLoopIndex(null);
      return;
    }

    let count = parent.getMaxLoopCount(this.state.pictureResult.getTable());
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

    DrawingStateActions.setLoopIndex(currentLoopIndex);
  }

  getEditingInstruction() {
    let {instructions} = this.props;
    let {editingInstructionId} = this.props.drawingState;
    return InstructionTreeNode.findById(instructions, editingInstructionId);
  }

  // Either the one the user selected or the last instruction
  getSelectedInstructions(props) {
    props = props || this.props;
    let {selectedInstructions} = props.drawingState;
    let {instructions} = props;
    if (selectedInstructions && selectedInstructions.length > 0) {
      selectedInstructions = _.compact(selectedInstructions.map(i => {
        return InstructionTreeNode.findById(instructions, i.id);
      }));

      // TODO figure out why Sometimes we don't find the instructions that we have selected,
      if (selectedInstructions.length > 0) {
        return selectedInstructions;
      }
    }
    let lastInstruction = _.last(props.instructions);
    return lastInstruction ? [lastInstruction] : [];
  }

  getCurrentInstruction(props) {
    return _.last(this.getSelectedInstructions(props));
  }

  // Either the one the user selected or the shape from the selected
  // shape
  getSelectedShapeId() {
    let {selectedShapeId} = this.props.drawingState;
    let currentInstruction = this.getCurrentInstruction();
    if (!_.isString(selectedShapeId) && currentInstruction) {
      selectedShapeId = currentInstruction.shapeId;
    }
    return selectedShapeId;
  }

  getDrawInstructionForSelectedShape() {
    let selectedShapeId = this.getSelectedShapeId();
    return this.props.instructions.find(i => {
      return i.shapeId === selectedShapeId && i instanceof DrawInstruction;
    });
  }

  componentDidMount() {
    // Loading keyboard shortcuts
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
  }

  componentWillUnmount() {
    // Remove keyboard shortcuts
    window.removeEventListener('keydown');
  }

  render() {
    // Selected instructions were selected by user or are the last instruction in set of all
    let selectedInstructions = this.getSelectedInstructions();
    // Current instruction is the last instruction of the selected set
    let currentInstruction = this.getCurrentInstruction();
    // When the user selects a shape, there is no current instruction
    if (_.isString(this.props.drawingState.selectedShapeId)) {
      currentInstruction = null;
    }


    let pictureResult = this.state.pictureResult;
    let shapeNameMap = pictureResult.getShapeNameMap();
    let selectedShape = pictureResult.getShapeById(this.getSelectedShapeId());

    let {scalars} = this.props.variables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    return (
      <div className='main'>
        <div className='top-bar'>
          <h1>Tukey App</h1>
          <button onClick={this.handlePresetClick.bind(this, 'rando')}>Rando</button>
          <button onClick={this.handlePresetClick.bind(this, 'scatter')}>Scatter</button>
          <button onClick={this.handlePresetClick.bind(this, 'bars')}>Bars</button>
          <button onClick={this.handlePresetClick.bind(this, '')}>Blank</button>
        </div>

        <div className='editor-area'>
          <div className='left-panel'>
            <div className='left-panel-header'>Data</div>
            <DataVariableList
              scalars={scalars}
              dataVariables={this.props.variables}
              dataValues={pictureResult.variableValues} />

            <DataTable
              currentLoopIndex={this.props.drawingState.currentLoopIndex}
              table={pictureResult.getTable()}
              dataVariables={this.props.variables}
              dataValues={pictureResult.variableValues} />

            <div className='left-panel-header'>Steps</div>
            <InstructionList
              currentInstruction={currentInstruction}
              selectedInstructions={selectedInstructions}
              dataVariables={this.props.variables}
              variableValues={pictureResult.variableValues}
              shapeNameMap={shapeNameMap}
              instructions={this.props.instructions} />
          </div>

          <div className='drawing-area'>
            <div className='canvas-container'>
              <InstructionTitle
                dataVariables={this.props.variables}
                variableValues={pictureResult.variableValues}
                shapeNameMap={shapeNameMap}
                instruction={currentInstruction} />
              <Canvas
                drawingState={this.props.drawingState}
                // TODO - Only need this to create new instruction ID :/
                instructions={this.props.instructions}
                selectedShape={selectedShape}
                pictureResult={pictureResult}
                editingInstruction={this.getEditingInstruction()} />
              <div>Mode: {this.props.drawingState.mode}</div>
              <InstructionCode
                className={classNames({'hidden': !this.state.isDebugging})}
                code={pictureResult.jsCode} />
            </div>
          </div>

          <Popover
            position={this.props.drawingState.dataPopupPosition}
            show={this.props.drawingState.showDataPopup} />

        </div>
      </div>
    );
  }
}

App.propTypes = {
  drawingState: React.PropTypes.object,
  instructions: React.PropTypes.array,
  variables: React.PropTypes.array,
  pending: React.PropTypes.bool,
  errors: React.PropTypes.array
};

App.defaultProps = {
  instructions: []
};

let stores = [InstructionStore, DrawingStateStore, DataVariableStore];
let propsAccessor = () => ({
  drawingState: DrawingStateStore.getDrawingState(),
  instructions: InstructionStore.getInstructions(),
  variables: DataVariableStore.getVariables(),
  pending: InstructionStore.getPending(),
  errors: InstructionStore.getErrors()
});
App = Flux.connect(App, stores, propsAccessor);


export default App;
