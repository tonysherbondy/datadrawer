import React from 'react';
import Canvas from '../drawing/Canvas';
import InstructionCode from './InstructionCode';
import DataVariableList from './DataVariableList';
import DataTable from './DataTable';
import DrawCanvas from '../../models/DrawCanvas';
import LoopInstruction from '../../models/LoopInstruction';

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
    let jsCode = instructions.map(instruction => {
      // TODO, a loop instructions total iterations can be calculated
      // at this point because loops can only depend on data variables, this will
      // allow us to change our context, loop prefix only affects shape variables
      // within the loop though...
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      //let prefix = `variables.shapes.${instruction.getShapeName()}`;
      if (instruction instanceof LoopInstruction) {
        return instruction.getJsCode(this.getTable(variableValues));
      }
      return instruction.getJsCode();
    }).join('\n\n');

    jsCode = canvasJs + '\n' + jsCode;

    this.mutateVariableValues(variableValues, jsCode);

    // TODO we will need to filter by draw instructions
    // TODO we should probably actually traverse by variables in the variables.shape scope
    let shapes = Object.keys(variableValues.shapes)
                .filter(name => name !== 'canvas')
                .map(name => {
                  let shapeVariable = variableValues.shapes[name];
                  return this.getShapeFromVariables(shapeVariable);
                });

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

  getShapeFromVariables(shapeVariable) {
    return {
      type: shapeVariable.type,
      props: shapeVariable
    };
  }

  mutateVariableValues(variables, jsCode) {
    try {
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
    var getShape = function(id) {
      return variables.shapes[id] ||
        {type: 'rect', x: 0, y: 0, width: 0, height: 0};
    };
    var pointFuncs = {
      rect: {
        left: function(s) {
          return {x: s.x, y: s.y + s.height / 2};
        },
        center: function(s) {
          return {x: s.x + s.width / 2, y: s.y + s.height / 2};
        }
      },
      circle: {
        left: function(s) {
          return {x: s.cx - s.r, y: s.cy};
        },
        center: function(s) {
          return {x: s.cx, y: s.cy};
        }
      }
    };

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
      top: function(id) {
        var s = getShape(id);
        return {x: s.x + s.width / 2, y: s.y};
      },
      setPoint(id, name, value) {
        var s = getShape(id);
        if (s.type === 'circle') {
          if (name === 'center') {
            s.cx = value.x;
            s.cy = value.y;
          }
        } else {
          if (name === 'center') {
            s.x = value.x;
            s.y = value.y;
          }
        }
      },
      movePoint(id, name, value) {
        var s = getShape(id);
        if (s.type === 'circle') {
          if (name === 'center') {
            s.cx += value.x;
            s.cy += value.y;
          }
        } else {
          if (name === 'center') {
            s.x += value.x;
            s.y += value.y;
          }
        }
      },
      leftTop: function(id) {
        var s = getShape(id);
        return {x: s.x, y: s.y};
      },
      center: function(id) {
        var s = getShape(id);
        return pointFuncs[s.type].center(s);
      },
      right: function(id) {
        var s = getShape(id);
        return {x: s.x + s.width, y: s.y + s.height / 2};
      },
      left: function(id) {
        var s = getShape(id);
        return pointFuncs[s.type].left(s);
      },
      bottomRight: function(id) {
        var s = getShape(id);
        return {x: s.x + s.width, y: s.y + s.height};
      },
      bottom: function(id) {
        var s = getShape(id);
        return {x: s.x + s.width / 2, y: s.y + s.height};
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
