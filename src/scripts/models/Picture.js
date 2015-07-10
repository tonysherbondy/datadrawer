import {OrderedMap} from 'immutable';
import _ from 'lodash';
import InstructionTreeNode from './InstructionTreeNode';
import DataVariable from './DataVariable';
import DrawInstruction from './DrawInstruction';
//import getAllPictureVariables from '../utils/getAllPictureVariables';
import DrawPictureInstruction from './DrawPictureInstruction';

export default class Picture {
  constructor(id, instructions, variables) {
    this._id = id;

    if (instructions instanceof OrderedMap) {
      this._instructions = instructions;
    } else {
      this._instructions = OrderedMap(instructions.map(i => [i.id, i]));
    }

    if (variables instanceof OrderedMap) {
      this._variables = variables;
    } else {
      this._variables = OrderedMap(variables.map(v => [v.id, v]));
    }
  }

  get id() { return this._id; }
  set id(v) { throw `Cannot change id. (Tried to set to ${v})`; }

  get instructions() { return this._instructions.valueSeq().toArray(); }
  set instructions(v) { throw `Use addInstruction, updateInstruction, \
    or removeInstruction. (Tried to set to ${v})`; }

  get variables() { return this._variables.valueSeq().toArray(); }
  set variables(v) { throw `Use addVariable, updateVariable, \
    or removeVariable.  (Tried to set to ${v})`; }

  addVariable(variable) {
    // TODO: check that variable doesn't exist
    let variables = this._variables.set(variable.id, variable);
    return new Picture(this._id, this._instructions, variables);
  }

  updateVariable(variable) {
    let variables = this._variables.set(variable.id, variable);
    return new Picture(this._id, this._instructions, variables);
  }

  removeVariable(variable) {
    let variables = this._variables.delete(variable.id);
    return new Picture(this._id, this._instructions, variables);
  }

  addInstruction(instruction) {
    // TODO: check that instruction doesn't exist
    let instructions = this._instructions.set(instruction.id, instruction);
    return new Picture(this._id, instructions, this._variables);
  }

  //: TODO write better immutable versions of these methods
  updateInstruction(instruction) {
    let instructions = InstructionTreeNode.replaceById(this.instructions, instruction.id, instruction);
    return new Picture(this._id, instructions, this._variables);
  }

  removeInstructions(instructionsToRemove) {
    let instructions = this.instructions;
    instructionsToRemove.forEach(iToRemove => {
      instructions = InstructionTreeNode.removeById(instructions, iToRemove.id);
    });
    return new Picture(this._id, instructions, this._variables);
  }

  insertInstructionAtIndexWithParent(index, parent, instruction) {
    let instructions = this.instructions;
    instructions = InstructionTreeNode.insertInstruction(instructions, instruction, index, parent);
    return new Picture(this._id, instructions, this._variables);
  }

  insertInstructionAfterInstruction(instructionToInsert, instruction) {
    let {parent, index} = InstructionTreeNode.findParentWithIndex(this.instructions, instruction);
    return this.insertInstructionAtIndexWithParent(index + 1, parent, instructionToInsert);
  }

  //TODO: this should be done automatically for you by the store
  generateNewVariable({name, isRow, definition}) {
    let id = `v_${this.variables.length + 1}`;
    name = name || id;
    return new DataVariable({id, name, isRow, definition});
  }

  getDrawInstructionForShapeId(shapeId) {
    return InstructionTreeNode.find(this.instructions, i => {
      // TODO may need to account for looping
      return i instanceof DrawInstruction && i.shapeId === shapeId;
    });
  }

  // TODO - Do we even need this anymore??
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

  getAllPictureVariables() {
    return this.variables.concat(
      _.flatten(InstructionTreeNode
      .flatten(this.instructions)
      .filter(i => i instanceof DrawPictureInstruction)
      .map(i => i.pictureVariables))
    );
  }

  getVariableById(id) {
    return this.getAllPictureVariables(this).find(v => v.id === id);
  }

  getVariableTableWithValues(variableValues, variables) {
    variables = variables || this.variables;
    let rows = variables.filter(v => v.isRow);
    let rowValues = rows.map(row => {
      return row.getValue(variableValues);
    });
    let maxLength = rowValues.reduce((max, row) => {
      return row.length > max ? row.length : max;
    }, 0);
    return {rows, rowValues, maxLength};
  }

}
