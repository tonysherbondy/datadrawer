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


class App extends React.Component {

  handlePresetClick(name) {
    InstructionActions.loadPresetInstructions(name);
  }

  getNewInstructionID() {
    return 'i' + this.props.instructions.length + 1;
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
        // TODO - Should just sent out a loop action
        DrawingStateActions.setDrawingMode('loop');
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

  getEditingInstruction() {
    return this.props.instructions.find(i => {
      return i.id === this.props.drawingState.editingInstructionId;
    });
  }

  // TODO - Right now it is the last instruction
  getSelectedInstruction() {
    return _.last(this.props.instructions);
  }

  getDrawInstructionForSelectedShape() {
    let shapeId = this.getSelectedInstruction().shapeId;
    return this.props.instructions.find(i => {
      return i.shapeId === shapeId && i instanceof DrawInstruction;
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
          selectedInstruction={this.getSelectedInstruction()}
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
