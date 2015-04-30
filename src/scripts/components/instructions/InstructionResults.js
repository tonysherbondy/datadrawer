import React from 'react';
import Canvas from '../drawing/Canvas';
import InstructionTitle from './InstructionTitle';
import InstructionCode from './InstructionCode';
import DataVariableList from './DataVariableList';
import DataTable from './DataTable';
import DrawCanvas from '../../models/DrawCanvas';
import LoopInstruction from '../../models/LoopInstruction';
import CircleShape from '../../models/shapes/CircleShape';
import RectShape from '../../models/shapes/RectShape';
import LineShape from '../../models/shapes/LineShape';
import PathShape from '../../models/shapes/PathShape';
import TextShape from '../../models/shapes/TextShape';
import _ from 'lodash';

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
    let variableValues = this.mutateVariableValues({data: {}}, jsCode);

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
    let jsCode = validInstructions.map(instruction => {
      // TODO, a loop instructions total iterations can be calculated
      // at this point because loops can only depend on data variables, this will
      // allow us to change our context, loop prefix only affects shape variables
      // within the loop though...
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      if (instruction instanceof LoopInstruction) {
        return instruction.getJsCode(this.getTable(variableValues));
      }
      return instruction.getJsCode();
    }).join('\n');

    jsCode = canvasJs + '\n' + jsCode;

    this.mutateVariableValues(variableValues, jsCode);

    // TODO we will need to filter by draw instructions
    // TODO we should probably actually traverse by variables in the variables.shape scope
    let shapes = Object.keys(variableValues.shapes)
                .map(name => variableValues.shapes[name]);

    jsCode = dataJsCode + '\n\n' + jsCode;
    return {shapes, variableValues, jsCode};
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

  mutateVariableValues(variables, jsCode) {
    try {
      if (!_) {
        console.warn('Lodash required for evaluation environment!');
      }
      /* eslint-disable */
      let utils = this.valueContextUtils(variables);
      eval(jsCode);
      /* eslint-enable */

    } catch (error) {
      console.log('EVAL JSCODE ERROR ' + error);
    }
    return variables;
  }

  // Utility functions needed in the context, need to close
  // over variables
  valueContextUtils(variables) {
    return {
      distanceBetweenPoints: function(a,b) {
        let x = a.x - b.x;
        let y = a.y - b.y;
        return Math.sqrt(x * x + y * y);
      },
      getData(name, index=0) {
        let variable = variables.data[name];
        return variable instanceof Array ? variable[index] : variable;
      },
      getShapeVariable(name, index=0) {
        // TODO, perhaps the looping shapes should be an array like data
        let variable = variables.shapes[name] || variables.shapes[`${name}_${index}`];
        if (!variable) {
          console.error('Unable to find shape variable', name);
        }
        return variable;
      },
      getNewShapeName(name, index) {
        return isFinite(index) ? `${name}_${index}` : name;
      },
      circle(params, name, index) {
        variables.shapes[this.getNewShapeName(name, index)] = new CircleShape(params);
      },
      rect(params, name, index) {
        variables.shapes[this.getNewShapeName(name, index)] = new RectShape(params);
      },
      path(params, name, index) {
        variables.shapes[this.getNewShapeName(name, index)] = new PathShape(params);
      },
      text(params, name, index) {
        variables.shapes[this.getNewShapeName(name, index)] = new TextShape(params);
      },
      line(params, name, index) {
        variables.shapes[this.getNewShapeName(name, index)] = new LineShape(params);
      }
    };
  }

  render() {
    let {shapes, variableValues, jsCode} = this.computeFromInstructions(this.props.instructions);
    let {scalars} = this.props.dataVariables.reduce((map, d) => {
      let type = d.isRow ? 'vectors' : 'scalars';
      map[type].push(d);
      return map;
    }, {scalars: [], vectors: []});
    return (
      <div>
        <DataVariableList
          dataVariables={scalars}
          dataValues={variableValues} />

        <DataTable
          table={this.getTable(variableValues)} />

        <InstructionTitle instruction={this.props.editingInstruction} />

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
