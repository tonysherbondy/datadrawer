import React from 'react';
import Canvas from '../drawing/Canvas';
import InstructionCode from './InstructionCode';
import DataVariable from '../../models/DataVariable';

export default class InstructionResults extends React.Component {

  initVariableValuesWithData() {
    // Take the immutable dataVariable definitions
    let variableDoneMap = {};
    let variables = this.props.dataVariables;
    let toJsQueue = [];
    let jsLines = [];

    function processQueue() {
      let isCycle = false;
      while (toJsQueue.length > 0 && !isCycle) {
        let top = toJsQueue.pop();
        let depVars = top.getDependentVariables();
        // Don't add any that are already done
        let toAdd = depVars.filter(v => variableDoneMap[v.id] !== 'done');
        // And break because of a cycle if any are inQ
        isCycle = !toAdd.every(v => variableDoneMap[v.id] !== 'inQ');
        if (isCycle) {
          console.error('Cycle detected in data variables');
        }

        if (toAdd.length > 0) {
          toJsQueue.push(top, ...toAdd);
        } else {
          variableDoneMap[top.id] = 'done';
          jsLines.push(top.getJsCode());
        }
      }
    }

    variables.forEach(variable => {
      if (!variableDoneMap[variable.id]) {
        variableDoneMap[variable.id] = 'inQ';
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

// TODO We will want to pass variables in from a store
let alphaVar = new DataVariable({name: 'alpha', definition: 42});
InstructionResults.defaultProps = {
  dataVariables: [
    alphaVar,
    new DataVariable({name: 'beta', definition: alphaVar})
  ]
};
