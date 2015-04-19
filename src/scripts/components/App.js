import React from 'react';
import Immutable from 'immutable';
import Flux from '../dispatcher/dispatcher';
import InstructionStore from '../stores/InstructionStore';
import InstructionList from './instructions/InstructionList';
import InstructionResults from './instructions/InstructionResults';


class App extends React.Component {

  render() {
    return (
      <div className='main'>
        <h1>Tukey App</h1>
        <InstructionResults instructions={this.props.instructions} />
        <InstructionList instructions={this.props.instructions} />
      </div>
    );
  }
}

App.propTypes = {
  instructions: React.PropTypes.object,
  pending: React.PropTypes.bool,
  errors: React.PropTypes.array
};

App.defaultProps = {
  instructions: Immutable.List()
};

App = Flux.connect(App, [InstructionStore], props => ({
  instructions: InstructionStore.getInstructions(),
  pending: InstructionStore.getPending(),
  errors: InstructionStore.getErrors()
}));


export default App;
