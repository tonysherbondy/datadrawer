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
//import LoopInstruction from '../models/LoopInstruction';


class App extends React.Component {

  handlePresetClick(name) {
    InstructionActions.loadPresetInstructions(name);
  }

  getNewInstructionID() {
    let {instructions} = this.props;
    let size = InstructionTreeNode.getListSize(instructions);
    return `i${size++}`;
  }

  selectNextShape() {
    // Get all available shape ids
    let shapes = _.chain(this.props.instructions)
                  .map(i => i.getShapeIds())
                  .flatten()
                  .unique()
                  .value();
    let {selectedShapeId} = this.props.drawingState;

    // If the selectedShape wasn't found or didn't have one go to first
    // otherwise next
    let nextIndex = shapes.indexOf(selectedShapeId) + 1;
    if (nextIndex >= shapes.length || nextIndex < 0) {
      DrawingStateActions.setSelectedShape(null);
    }
    DrawingStateActions.setSelectedShape(shapes[nextIndex]);
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
          id: this.getNewInstructionID()
        });
        InstructionActions.addInstruction(instruction);
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
        let selectedInstructions = this.getSelectedInstructions();
        let parent = InstructionTreeNode.findParent(selectedInstructions[0]);
        let firstIndex = parent.instructions.findIndex(i => i.id === selectedInstructions[0]);
        // TODO - Remove the selected instructions from the list
        console.log('will delete selectedInstructions', selectedInstructions);
        // TODO - Add a loop instruction after the id with the selected instructions
        console.log('will insert instructions after', firstIndex - 1);
        //let instruction = new LoopInstruction({
          //id: this.getNewInstructionID(),
          //instructions: this.getSelectedInstructions()
        //});
        //InstructionActions.addInstruction(instruction);
        break;
      }
      case 27: { //esc
        DrawingStateActions.setDrawingMode('normal');
        break;
      }
      default:
        //console.log('unknown code', code);
        break;
    }
  }

  getEditingInstruction() {
    return this.props.instructions.find(i => {
      return i.id === this.props.drawingState.editingInstructionId;
    });
  }

  // Either the one the user selected or the last instruction
  getSelectedInstructions() {
    let {selectedInstructions} = this.props.drawingState;
    let {instructions} = this.props;
    if (selectedInstructions && selectedInstructions.length > 0) {
      return _.compact(selectedInstructions.map(i => {
        return InstructionTreeNode.findById(instructions, i.id);
      }));
    }
    let lastInstruction = _.last(this.props.instructions);
    return lastInstruction ? [lastInstruction] : [];
  }

  getCurrentInstruction() {
    return _.last(this.getSelectedInstructions());
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
          drawingState={this.props.drawingState}
          instructions={this.props.instructions}
          dataVariables={this.props.variables}
          editingInstruction={this.getEditingInstruction()}
          selectedShapeId={this.getSelectedShapeId()}
          selectedInstructions={selectedInstructions}
          currentInstruction={currentInstruction}
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
