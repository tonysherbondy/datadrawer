import _ from 'lodash';
import evaluateJs from '../utils/evaluateJs';
import DrawCanvas from './DrawCanvas';
import InstructionTreeNode from './InstructionTreeNode';
import LoopInstruction from './LoopInstruction';
import DrawInstruction from './DrawInstruction';
import PictureActions from '../actions/PictureActions';

// Transforms variables and instructions into shapes, values and javascript
export default class PictureResult {
  constructor(props) {
    this.picture = props.picture;
    this.allPictures = props.allPictures;
    this.instructions = props.picture.instructions;
    this.currentInstruction = props.currentInstruction;
    this.currentLoopIndex = props.currentLoopIndex;
    // Compute will assign shapes, variableValues and js
    let {shapes, variableValues, jsCode} = this._compute();
    this.shapes = shapes;
    this.variableValues = variableValues;
    // TODO - Only reason we need to export JS is to give it to the JS
    // viewer for debugging
    this.jsCode = jsCode;
  }

  insertNewInstructionAfterCurrent(instruction) {
    PictureActions.insertInstructionAfterInstruction(this.picture, instruction, this.currentInstruction);
  }

  getTable(pictureId) {
    pictureId = pictureId ? pictureId : this.picture.id;
    let picture = _.find(this.allPictures, {id: pictureId});
    let variables = picture.variables;
    let variableValues = this.pictureVariablesMap[pictureId];

    let rows = variables.filter(v => v.isRow);
    let rowValues = rows.map(row => {
      return row.getValue(variableValues);
    });
    let maxLength = rowValues.reduce((max, row) => {
      return row.length > max ? row.length : max;
    }, 0);
    return {rows, rowValues, maxLength};
  }

  getShapeByIdAndIndex(id, index) {
    if (!_.isString(id)) {
      return null;
    }
    // Get selected shape based on ID for any current loop index
    return _.values(this.shapes)
            .filter(this.isVisibleToIndex.bind(this, index))
            .find(shape => shape.id === id);
  }

  getShapeById(id) {
    return this.getShapeByIdAndIndex(id, this.currentLoopIndex);
  }

  getDrawInstructionForShapeId(shapeId) {
    return InstructionTreeNode.find(this.instructions, i => {
      // TODO may need to account for looping
      return i instanceof DrawInstruction && i.shapeId === shapeId;
    });
  }

  isVisibleToCurrentIndex(shape) {
    return this.isVisibleToIndex(this.currentLoopIndex, shape);
  }

  isVisibleToIndex(index, shape) {
    // return all shapes that matches index
    // or has no index (thus was drawn outside of loop)
    if (!_.isString(shape.index)) {
      return true;
    }
    return parseInt(shape.index, 10) === index;
  }

  getAllShapesForLoopIndex(index) {
    return _.values(this.shapes).filter(this.isVisibleToIndex.bind(this,index));
  }

  getAllShapesForCurrentLoopIndex() {
    return this.getAllShapesForLoopIndex(this.currentLoopIndex);
  }

  getAllShapes() {
    return _.values(this.shapes);
  }

  // Create map from shapeId to shapeName, this has to be done so that all possible shapes
  // even the ones not currently drawn are in the map
  getShapeNameMap() {
    let nameMap = {canvas: 'canvas'};
    InstructionTreeNode
      .flatten(this.instructions)
      .filter(i => i instanceof DrawInstruction)
      .forEach(i => {
        nameMap[i.shapeId] = i.name || i.id;
      });
    return nameMap;
  }

  _initVariableValuesWithData(picture) {
    // Take the immutable dataVariable definitions
    let varDoneMap = {};
    let isDone = v => varDoneMap[v.id];
    let variables = picture.variables;
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

  _compilePictures() {
    return this.allPictures.map(picture => {
      return {
        id: picture.id,
        compiledCode: this._compilePicture(picture)
      };
    }).reduce(function(pictureCodeMap, compiledPicture) {
      pictureCodeMap[compiledPicture.id] = compiledPicture.compiledCode;
      return pictureCodeMap;
    }, {});
  }

  _compilePicture(picture) {
    let instructions = picture.instructions;
    // Get JS from instructions
    let validInstructions = instructions.filter(i => i.isValid());
    let instructionsUpToCurrent = validInstructions;

    let currentInstruction;
    if (picture.id === this.picture.id) {
      currentInstruction = this.currentInstruction;
      if (currentInstruction) {
        let isAfter = InstructionTreeNode.isInstructionAfter.bind(null, instructions, currentInstruction);
        instructionsUpToCurrent = validInstructions.filter(i => !isAfter(i));
      }
    }

    let jsCode = instructionsUpToCurrent.map(instruction => {
      // TODO, a loop instructions total iterations can be calculated
      // at this point because loops can only depend on data variables, this will
      // allow us to change our context, loop prefix only affects shape variables
      // within the loop though...
      // TODO Loop instructions don't have a shapeName, but perhaps we can just ignore
      if (instruction instanceof LoopInstruction) {
        let table = this.getTable(picture.id);
        return instruction.getJsCode(table, currentInstruction, this.currentLoopIndex);
      }
      return instruction.getJsCode();
    }).join('\n');

    return '(function(depth) {' +
      //'console.log("drawing eval code ", depth);' +
      'if (depth > 4) { return; } ' +
      `\n${jsCode}\n})`;
  }

  _initVariablesForAllPictures() {
    return this.allPictures.map(picture => {
      return {
        id: picture.id,
        variables: this._initVariableValuesWithData(picture).variableValues
      };
    }).reduce(function(pictureVariablesMap, variablesForPicture) {
      pictureVariablesMap[variablesForPicture.id] = variablesForPicture.variables;
      return pictureVariablesMap;
    }, {});
  }

  _compute() {
    let instructions = this.instructions;
    // Compute shapes and variable values
    let pictureVariablesMap = this._initVariablesForAllPictures();

    // need to set this in order to get table for loop:/
    this.pictureVariablesMap = pictureVariablesMap;

    // TODO: (nhan) these two weird looking lines are needed right now since
    // old code was written to expect variables for THIS picture in variableValues
    // this should change once we rework the compilation pipeline
    let variableValues = pictureVariablesMap[this.picture.id];
    variableValues.pictureVariablesMap = pictureVariablesMap;

    variableValues.pictureCodeMap = this._compilePictures(this.allPictures);
    variableValues.shapes = {};

    // TODO: (nhan) this should be moved to utils.picture(...)
    // Treat canvas like another shape
    let canvasDraw = new DrawCanvas({width: 800, height: 600});
    let canvasJs = canvasDraw.getJsCode();

    let rootPictureCodeString = variableValues.pictureCodeMap[this.picture.id];
    let jsCode = canvasJs + rootPictureCodeString + '(0); \n';

    evaluateJs(jsCode, variableValues);

    // TODO we will need to filter by draw instructions
    // TODO we should probably actually traverse by variables in the variables.shape scope
    let shapes = variableValues.shapes;

    //jsCode = dataJsCode + '\n\n' + jsCode;
    return {shapes, variableValues, jsCode};
  }
}

