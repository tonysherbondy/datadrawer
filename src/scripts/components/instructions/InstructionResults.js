import React from 'react';
import Canvas from '../drawing/Canvas';
import InstructionCode from './InstructionCode';
import DataVariable from '../../models/DataVariable';
import DataVariableList from './DataVariableList';

export default class InstructionResults extends React.Component {

  initVariableValuesWithData() {
    // Take the immutable dataVariable definitions
    let varDoneMap = {};
    let isDone = v => varDoneMap[v.id];
    let variables = this.props.dataVariables;
    let toJsQueue = [];
    let jsLines = [];

    function processQueue() {
      // Assume cycles are prevented at construction
      while (toJsQueue.length > 0) {
        let top = toJsQueue.pop();

        // Skip this variable if its done
        if (!isDone(top)) {

          // Get the actual variable
          let topV = variables.filter(v => v.id === top.id)[0];

          // See if we have any dependent variables to push onto the queue
          let depVars = topV.getDependentVariables();
          // Don't add any that are already done
          let toAdd = depVars.filter(v => !isDone(v));

          if (toAdd.length > 0) {
            toJsQueue.push(top, ...toAdd);
          } else {
            varDoneMap[top.id] = 'done';
            jsLines.push(topV.getJsCode());
          }
        }

      }
    }

    variables.forEach(variable => {
      if (!isDone(variable)) {
        toJsQueue.push(variable);
        processQueue();
      }
    });

    let jsCode = jsLines.join('\n');
    let variableValues = this.mutateVariableValues({data:{}}, jsCode);

    return {jsCode, variableValues};
  }

  computeFromInstructions(instructions) {
    // Compute shapes and variable values

    // Get JS from instructions
    let jsCode = instructions.map(instruction => {
      // TODO, a loop instructions total iterations can be calculated
      // at this point because loops can only depend on data variables, this will
      // allow us to change our context, loop prefix only affects shape variables
      // within the loop though...
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      let prefix = `variables.shapes.${instruction.getShapeName()}`;
      return instruction.getJsCode(prefix);
    }).join('\n');

    // This should be a variableValues map that gets used
    let {variableValues, jsCode: dataJsCode} = this.initVariableValuesWithData();
    variableValues.shapes = {};
    this.mutateVariableValues(variableValues, jsCode);

    // TODO we will need to filter by draw instructions
    let shapes = instructions.map(instruction => {
      let varName = instruction.getShapeName();
      let shapeVariables = variableValues.shapes[varName];
      return instruction.getShapeFromVariables(shapeVariables);
    });

    jsCode = dataJsCode + '\n\n' + jsCode;
    return {shapes, variableValues, jsCode};
  }

  mutateVariableValues(variables, jsCode) {
    try {
      eval(jsCode); //jshint ignore:line
    } catch (error) {
      console.log("EVAL JSCODE ERROR " + error);
    }
    return variables;
  }

  render() {
    let {shapes, variableValues, jsCode} = this.computeFromInstructions(this.props.instructions);
    return (
      <div>
        <DataVariableList
          dataVariables={this.props.dataVariables}
          dataValues={variableValues} />

        <Canvas shapes={shapes}/>

        <InstructionCode code={jsCode} />
      </div>
    );
  }

}

InstructionResults.propTypes = {
  instructions: React.PropTypes.array,
  dataVariables: React.PropTypes.array
};

InstructionResults.defaultProps = {
  instructions: [],
  dataVariables: []
};
