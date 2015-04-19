import React from 'react/addons';
import Canvas from '../drawing/Canvas';
import InstructionCode from './InstructionCode';
import Immutable from 'immutable';

export default class InstructionResults extends React.Component {

  mutateVariableValues(variables, jsCode) {
    try {
      eval(jsCode); //jshint ignore:line
    } catch (error) {
      console.log("EVAL JSCODE ERROR " + error);
    }
  }

  getDataValues() {
    // TODO We will want to pass variables in from a store
    // TODO Needs to be a difference between variable definition and value
    // TODO Data variables are separate map from shape variables
    // TODO Data variable values get calculated first
    return {};
  }

  computeFromInstructions(instructions) {
    // Compute shapes and variable values

    // Get JS from instructions
    let jsCode = instructions.map(instruction => {
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      let prefix = `variables.shapes.${instruction.getShapeName()}`;
      return instruction.getJsCode(prefix);
    }).join('\n');

    // This should be a variableValues map that gets used
    let variableValues = this.getDataValues();
    variableValues.shapes = {};
    this.mutateVariableValues(variableValues, jsCode);

    // TODO we will need to filter by draw instructions
    let shapes = instructions.map(instruction => {
      let varName = instruction.getShapeName();
      let shapeVariables = variableValues.shapes[varName];
      return instruction.getShapeFromVariables(shapeVariables);
    });

    return {shapes, variableValues, jsCode};
  }

  render() {
    let {shapes, variableValues, jsCode} = this.computeFromInstructions(this.props.instructions);
    return (
      <div>
        <Canvas shapes={shapes}/>
        <InstructionCode code={jsCode} />
      </div>
    );
  }

}

InstructionResults.propTypes = {
  instructions: React.PropTypes.object
};
