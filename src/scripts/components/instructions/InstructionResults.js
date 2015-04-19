import React from 'react/addons';
import Canvas from '../drawing/Canvas';
import Immutable from 'immutable';

export default class InstructionResults extends React.Component {

  computeFromInstructions(instructions) {
    // Compute shapes and variables from instructions
    let variables = Immutable.List.of();

    let shapes = instructions.map(i => {
      console.log('shape type', i.shape);
      return i.getShapeFromVariables(variables);
    });

    return {shapes, variables};
  }

  render() {
    let {shapes, variables} = this.computeFromInstructions(this.props.instructions);
    return (
      <Canvas shapes={shapes}/>
    );
  }

}

InstructionResults.propTypes = {
  instructions: React.PropTypes.object
};
