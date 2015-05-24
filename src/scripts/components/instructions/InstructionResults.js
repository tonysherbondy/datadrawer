import React from 'react';
import _ from 'lodash';
import Canvas from '../drawing/Canvas';
import InstructionTitle from './InstructionTitle';
import InstructionCode from './InstructionCode';
import DataVariableList from './DataVariableList';
import DataTable from './DataTable';
import DrawCanvas from '../../models/DrawCanvas';
import LoopInstruction from '../../models/LoopInstruction';
import InstructionList from './InstructionList';
import evaluateJs from '../../utils/evaluateJs';
import InstructionTreeNode from '../../models/InstructionTreeNode';
import DrawInstruction from '../../models/DrawInstruction';

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
    let variableValues = {data: {}};
    evaluateJs(jsCode, variableValues);

    return {jsCode, variableValues};
  }

  computeFromInstructions(instructions) {
    // Compute shapes and variable values

    // This should be a variableValues map that gets used
    let {variableValues, jsCode: dataJsCode} = this.initVariableValuesWithData();
    // Initialize shape variable values container
    variableValues.shapes = {};

    // Treat canvas like another shape
    let canvasDraw = new DrawCanvas({width: 400, height: 400});
    let canvasJs = canvasDraw.getJsCode();

    // Get JS from instructions
    let validInstructions = instructions.filter(i => i.isValid());
    let instructionsUpToCurrent = validInstructions;
    let {currentInstruction} = this.props;
    if (currentInstruction) {
      let isAfter = InstructionTreeNode.isInstructionAfter.bind(null, instructions, currentInstruction);
      instructionsUpToCurrent = validInstructions.filter(i => !isAfter(i));
    }
    let jsCode = instructionsUpToCurrent.map(instruction => {
      // TODO, a loop instructions total iterations can be calculated
      // at this point because loops can only depend on data variables, this will
      // allow us to change our context, loop prefix only affects shape variables
      // within the loop though...
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      if (instruction instanceof LoopInstruction) {
        return instruction.getJsCode(this.getTable(variableValues), currentInstruction, this.props.currentLoopIndex);
      }
      return instruction.getJsCode();
    }).join('\n');

    jsCode = canvasJs + '\n' + jsCode;

    evaluateJs(jsCode, variableValues);

    // TODO we will need to filter by draw instructions
    // TODO we should probably actually traverse by variables in the variables.shape scope
    let shapes = variableValues.shapes;

    jsCode = dataJsCode + '\n\n' + jsCode;
    return {shapes, variableValues, jsCode};
  }

  // Create map from shapeId to shapeName, this has to be done so that all possible shapes
  // even the ones not currently drawn are in the map
  getShapeNameMap(instructions) {
    let nameMap = {canvas: 'canvas'};
    InstructionTreeNode
      .flatten(instructions)
      .filter(i => i instanceof DrawInstruction)
      .forEach(i => {
        nameMap[i.shapeId] = i.name || i.id;
      });
    return nameMap;
  }

  getTable(variableValues) {
    let rows = this.props.dataVariables.filter(v => v.isRow);
    let rowValues = rows.map(row => {
      return row.getValue(variableValues);
    });
    let maxLength = rowValues.reduce((max, row) => {
      return row.length > max ? row.length : max;
    }, 0);
    return {rows, rowValues, maxLength};
  }

  getSelectedShape(id, shapes) {
    if (!_.isString(id)) {
      return null;
    }
    let shape = shapes[id];
    if (!shape) {
      // try adding looping index
      shape = shapes[`${id}_0`];
    }
    return shape;
  }

  render() {
    let {shapes, variableValues, jsCode} = this.computeFromInstructions(this.props.instructions);
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});

    let {currentInstruction} = this.props;
    let {selectedInstructions} = this.props;
    let selectedShape = this.getSelectedShape(this.props.selectedShapeId, shapes);
    let shapeNameMap = this.getShapeNameMap(this.props.instructions);

    return (
      <div>
        <DataVariableList
          scalars={scalars}
          dataVariables={this.props.dataVariables}
          dataValues={variableValues} />

        <DataTable
          table={this.getTable(variableValues)} />

        <InstructionTitle
          dataVariables={this.props.dataVariables}
          variableValues={variableValues}
          shapeNameMap={shapeNameMap}
          instruction={currentInstruction} />

        <Canvas
          shapes={shapes}
          drawingState={this.props.drawingState}
          // TODO - Only need this to create new instruction ID :/
          instructions={this.props.instructions}
          selectedShape={selectedShape}
          editingInstruction={this.props.editingInstruction} />

        <InstructionCode code={jsCode} />

        <div>
          Mode: {this.props.drawingState.mode}
        </div>

        <InstructionList
          currentInstruction={currentInstruction}
          selectedInstructions={selectedInstructions}
          dataVariables={this.props.dataVariables}
          variableValues={variableValues}
          shapeNameMap={shapeNameMap}
          instructions={this.props.instructions} />
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
