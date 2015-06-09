import {OrderedMap} from 'immutable';
import InstructionTreeNode from '../models/InstructionTreeNode';
import DataVariable from '../models/DataVariable';

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
  set instructions(v) { throw `Use addVariable, updateVariable, \
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

  //TODO: this should be done automatically for you by the store
  generateNewVariable({name, isRow, definition}) {
    let id = `v_${this.variables.length + 1}`;
    name = name || id;
    return new DataVariable({id, name, isRow, definition});
  }

  //updateInstruction(instruction) {
    //let instructions = this._instructions.set(instruction.id, instruction);
    //return new Picture(this._id, instructions, this._variables);
  //}

  //removeInstruction(instruction) {
    //let instructions = this._instructions.delete(instruction.id);
    //return new Picture(this._id, instructions, this._variables);
  //}

  //removeInstruction(instructionsToRemove) {
    //let instructions = this._instructions.withMutations(_instructions => {
      //return instructionsToRemove.reduce((updatedInstructions, instruction) => {
        //return updatedInstructions.delete(instruction.id);
      //}, _instructions);
    //});

    //return new Picture(this._id, instructions, this._variables);
  //}
}