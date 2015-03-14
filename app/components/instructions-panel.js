import Ember from 'ember';
import Instruction from '../models/instruction';

export default Ember.Component.extend({

  instructions: Ember.computed(function() {
    return this.get("rootInstruction.flattenedList").filter(function(instruction) {
      return instruction.get("operation") !== "root";
    });
  }).property("rootInstruction.flattenedList"),

  printTree: function(root, indentLevel) {
    var line = "";
    for (var i = 0; i < indentLevel; ++i) {
      line += "----";
    }
    line += root.operation;
    console.log(line);

    var self = this;
    root.get("subInstructions").forEach(function(instruction) {
      self.printTree(instruction, indentLevel + 1);
    });
  },

  actions: {
    addInstruction: function() {
      var lastInstruction = this.get("lastInstruction");
      var lastOperation = lastInstruction.get("operation");
      var newInstruction;
      var parentInstruction = lastInstruction;

      if (lastOperation === "draw") {
        newInstruction = Instruction.create({
          operation: "set"
        });
      } else if (lastOperation === "set") {
        parentInstruction = lastInstruction.get("parentInstruction");
        newInstruction = Instruction.create({
          operation: "set"
        });
      } else if (lastOperation === "loop") {
        newInstruction = Instruction.create({
          operation: "draw",
          mark: "rect"
        });
      }

      parentInstruction.addSubInstruction(newInstruction);

      this.set("lastInstruction", newInstruction);
      this.printTree(this.get("rootInstruction"), 0);
    }
  }
});
