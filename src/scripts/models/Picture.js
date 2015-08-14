import {OrderedMap} from 'immutable';
import _ from 'lodash';
import InstructionTreeNode from './InstructionTreeNode';
import DataVariable from './DataVariable';
import DrawInstruction from './DrawInstruction';
import DrawPictureInstruction from './DrawPictureInstruction';
import Expression from './Expression';
import {guid} from '../utils/utils';

export default class Picture {
  constructor(id, instructions=[], variables=[]) {
    this._id = id || guid();

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

  // Variable map has keys of variable name and values of array of values
  importVariables(variableMap) {
    let picture = this;
    variableMap.forEach((value, key) => {
      // First see if we already have a variable with this rows name
      let variable = picture.variables.find(v => v.name === key);
      let jsonVal = JSON.stringify(value);

      if (variable) {
        // Modify the existing variable with this definition
        variable = variable.cloneWithDefinition(new Expression(jsonVal));
        picture = picture.updateVariable(variable);
      } else {
        // Create a new variable
        variable = picture.generateNewVariable({
          name: key,
          isRow: true,
          definition: jsonVal
        });
        picture = picture.addVariable(variable);
      }
    });
    return picture;
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

  replaceInstructions(toRemove, toAdd) {
    let instructions = this.instructions;
    instructions = InstructionTreeNode.replaceInstructions(instructions, toRemove, toAdd);
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

  getVariableForFragment(fragment) {
    let variable;
    if (fragment.prop) {
      // It is a shape variable
      let name = `${this.getShapeNameMap()[fragment.id]}'s ${fragment.prop}`;
      variable = new DataVariable({
        id: fragment.id,
        name,
        prop: fragment.prop,
        definition: new Expression(fragment)
      });
    } else {
      // DataVariable
      return this.getAllPictureVariables(this).find(v => v.id === fragment.id);
    }
    return variable;
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
