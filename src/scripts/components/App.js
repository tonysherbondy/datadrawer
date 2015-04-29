import React from 'react';
import Flux from '../dispatcher/dispatcher';
import InstructionStore from '../stores/InstructionStore';
import DataVariableStore from '../stores/DataVariableStore';
import InstructionList from './instructions/InstructionList';
import InstructionResults from './instructions/InstructionResults';
import InstructionActions from '../actions/InstructionActions';


class App extends React.Component {

  handlePresetClick(name) {
    InstructionActions.loadPresetInstructions(name);
  }

  render() {
    return (
      <div className='main'>
        <h1>Tukey App</h1>
        <button onClick={this.handlePresetClick.bind(this, 'rando')}>Rando</button>
        <button onClick={this.handlePresetClick.bind(this, 'scatter')}>Scatter</button>
        <button onClick={this.handlePresetClick.bind(this, 'bars')}>Bars</button>
        <InstructionResults instructions={this.props.instructions} dataVariables={this.props.variables} />
        <InstructionList instructions={this.props.instructions} />
      </div>
    );
  }
}

App.propTypes = {
  instructions: React.PropTypes.array,
  variables: React.PropTypes.array,
  pending: React.PropTypes.bool,
  errors: React.PropTypes.array
};

App.defaultProps = {
  instructions: []
};

App = Flux.connect(App, [InstructionStore], () => ({
  instructions: InstructionStore.getInstructions(),
  variables: DataVariableStore.getVariables(),
  pending: InstructionStore.getPending(),
  errors: InstructionStore.getErrors()
}));


export default App;
