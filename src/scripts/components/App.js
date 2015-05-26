import React from 'react';
import _ from 'lodash';
import Flux from '../dispatcher/dispatcher';
import InstructionStore from '../stores/InstructionStore';
import DataVariableStore from '../stores/DataVariableStore';
import DrawingStateStore from '../stores/DrawingStateStore';
import InstructionResults from './instructions/InstructionResults';
import InstructionActions from '../actions/InstructionActions';
import DrawingStateActions from '../actions/DrawingStateActions';
import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawInstruction from '../models/DrawInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Canvas from './drawing/Canvas';
import InstructionTreeNode from '../models/InstructionTreeNode';
import LoopInstruction from '../models/LoopInstruction';
import PictureResult from '../models/PictureResult';

class App extends React.Component {
  constructor(props) {
    super(props);
    // TODO - the only reason i moved this to state is because i want it
    // to be computed only once when props change and then use it for functionality
    // like moving the current steps etc., you could imagine that functionality
    // actually moving down to the instructions list or something like that instead
    // then we could just calculate the picture in the render for this app
    this.state = {
      pictureResult: this.getPictureResult(props)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.state = {
      pictureResult: this.getPictureResult(nextProps)
    };
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
              return m.shapeName === point.id && m.pointName === point.point;
            });
            index++;
            if (index === magnets.length) {
              index = 0;
            }
            let magnetPoint = Canvas.convertMagnetToPoint(magnets[index]);
            if (pointName === 'from') {
              instruction = instruction.getCloneWithFrom(magnetPoint, magnets);
            } else {
              instruction = instruction.getCloneWithTo(magnetPoint, {}, magnets);
            }
            InstructionActions.modifyInstruction(instruction);
          }
        }
        break;
      }
      case 82: { //r
        DrawingStateActions.setDrawingMode('rect');
        // TODO Need to decide when we allow invalid instructions,
        // this currently assumes we just add it to the list...
        let instruction = new DrawRectInstruction({
          id: InstructionTreeNode.getNextInstructionId(this.props.instructions)
        });
        this.insertNewInstructionAfterCurrent(instruction);
        break;
      }
      case 83: { //s
        DrawingStateActions.setDrawingMode('scale');
        break;
      }
      case 86: { //v
        DrawingStateActions.setDrawingMode('move');
        break;
      }
      case 67: { //c
        DrawingStateActions.setDrawingMode('circle');
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
        let nextInstruction = this.stepFromInstruction(this.getCurrentInstruction(), -1);
        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction);
        }
        e.preventDefault();
        break;
      }
      case 40: { //down arrow
        let nextInstruction = this.stepFromInstruction(this.getCurrentInstruction(), 1);
        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction);
        }
        e.preventDefault();
        break;
      }
      case 27: { //esc
        DrawingStateActions.setDrawingMode('normal');
        break;
      }
      default:
        console.log('unknown code', code);
        break;
    }
  }

  insertNewInstructionAfterCurrent(instruction) {
    // TODO We allow multiple looping levels, but other assumptions don't support that
    let currentInstruction = this.getCurrentInstruction();
    if (!currentInstruction) {
      // Just add it to the end of the top of the list
      InstructionActions.addInstruction(instruction);
    } else {
      let {parent, index} = InstructionTreeNode.findParentWithIndex(this.props.instructions, currentInstruction);
      // Insert into the parent after the current index
      InstructionActions.insertInstruction(instruction, index + 1, parent);
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

  // step should either be 1 or -1
  // will move that step amount forward or backwards
  stepFromInstruction(currentInstruction, step) {
    if (!currentInstruction) {
      return null;
    }
    let {instructions} = this.props;
    let {parent, index} = InstructionTreeNode.findParentWithIndex(instructions, currentInstruction);

    // Possible States
    // -- Step from one instruction to the next in same parent
    // -- Step forwards onto a loop instruction and go to the first instruction of the loop
    // -- Step forwards at the end of a loop and need to step out of the loop to the next instruction of the parent
    // -- Step backwards at the beginning of a loop and need to step out of the loop to the previous instruction of the parent
    // -- Step backwards from a non-loop instruction to a loop instruction and go to the last instruction of the loop

    let nextIndex = index + step;
    if (step > 0) {
      // step forwards

      if (nextIndex > parent.instructions.length - 1) {
        // have stepped forward past the end of instructions
        if (parent instanceof LoopInstruction && this.isLoopIndexAtEnd()) {
          // we were in a loop so take a step forward from our parent
          return this.stepFromInstruction(parent, 1);
        } else {
          // go back to beginning of instruction set because we are either
          // incrementing a loop or just not in a loop
          nextIndex = 0;
          this.stepLoopIndex(1);
        }
      }

      // Stepping forwards within bounds
      let nextInstruction = parent.instructions[nextIndex];
      if (nextInstruction.instructions && nextInstruction.instructions.length > 0) {
        // stepping forwards onto a loop we go to first instruction of loop
        return _.first(nextInstruction.instructions);
      }

      // Normal forward move to the next instruction
      return nextInstruction;

    } else {
      // step backwards

      if (nextIndex < 0) {
        // have stepped backwards before the beginning of a set of instructions
        if (parent instanceof LoopInstruction && this.props.drawingState.currentLoopIndex === 0) {
          // we were in a loop so take a step backward from our parent
          return this.stepFromInstruction(parent, -1);
        } else {
          // we were not in a loop so cycle to try to step to the last index in this set
          nextIndex = parent.instructions.length - 1;
          this.stepLoopIndex(-1);
        }
      }

      // We are stepping backwards within bounds
      let nextInstruction = parent.instructions[nextIndex];
      if (nextInstruction.instructions && nextInstruction.instructions.length > 0) {
        // stepping backwards onto a loop we go to last instruction of loop
        return _.last(nextInstruction.instructions);
      }

      // Simply stepping to a previous instruction
      return nextInstruction;
    }
    console.error('Not a valid step state');
  }

  getEditingInstruction() {
    return this.props.instructions.find(i => {
      return i.id === this.props.drawingState.editingInstructionId;
    });
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

    return (
      <div onKeyDown={this.handleKeyPress} className='main'>
        <h1>Tukey App</h1>
        <button onClick={this.handlePresetClick.bind(this, 'rando')}>Rando</button>
        <button onClick={this.handlePresetClick.bind(this, 'scatter')}>Scatter</button>
        <button onClick={this.handlePresetClick.bind(this, 'bars')}>Bars</button>
        <button onClick={this.handlePresetClick.bind(this, '')}>Blank</button>
        <InstructionResults
          // TODO - uhhh, I forgot why we are passing whole drawing state to results :/
          drawingState={this.props.drawingState}
          editingInstruction={this.getEditingInstruction()}
          selectedShapeId={this.getSelectedShapeId()}
          selectedInstructions={selectedInstructions}
          pictureResult={this.state.pictureResult}
          // TODO - do I need all these now that I have PictureResult?
          currentInstruction={currentInstruction}
          currentLoopIndex={this.props.drawingState.currentLoopIndex}
          instructions={this.props.instructions}
          dataVariables={this.props.variables}
        />
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
