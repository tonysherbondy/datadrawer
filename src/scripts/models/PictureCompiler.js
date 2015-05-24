import evaluateJs from '../utils/evaluateJs';
import DrawCanvas from './DrawCanvas';
import InstructionTreeNode from './InstructionTreeNode';
import LoopInstruction from './LoopInstruction';
import PictureResult from './PictureResult';

// A PictureCompiler compiles instructions into javascript that can be drawn
export default class PictureCompiler {
  constructor(props) {
    this.dataVariables = props.dataVariables;
    this.currentInstruction = props.currentInstruction;
    this.currentLoopIndex = props.currentLoopIndex;
    this.instructions = props.instructions;
  }

  initVariableValuesWithData() {
    // Take the immutable dataVariable definitions
    let varDoneMap = {};
    let isDone = v => varDoneMap[v.id];
    let variables = this.dataVariables;
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

  computeFromInstructions() {
    let instructions = this.instructions;
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
    let currentInstruction = this.currentInstruction;
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
        let table = PictureResult.getTable(this.dataVariables, variableValues);
        return instruction.getJsCode(table, currentInstruction, this.currentLoopIndex);
      }
      return instruction.getJsCode();
    }).join('\n');

    jsCode = canvasJs + '\n' + jsCode;

    evaluateJs(jsCode, variableValues);

    // TODO we will need to filter by draw instructions
    // TODO we should probably actually traverse by variables in the variables.shape scope
    let shapes = variableValues.shapes;

    jsCode = dataJsCode + '\n\n' + jsCode;
    return new PictureResult({shapes, variableValues, jsCode});
  }

}
