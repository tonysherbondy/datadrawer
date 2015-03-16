import Ember from 'ember';
import Instruction from 'tukey/models/instruction';

export default Ember.Component.extend({

  instructions: function() {
    return this.get("rootInstruction.flattenedList").filter(function(instruction) {
      return instruction.get("operation") !== "root";
    });
  }.property("rootInstruction.flattenedList"),

  printTree: function(root, indentLevel, index) {
    var line = "";
    for (var i = 0; i < indentLevel; ++i) {
      line += '----';
    }
    line += `${root.operation} ${index}`;
    console.log(line);

    var self = this;
    root.get("subInstructions").forEach(function(instruction, index) {
      self.printTree(instruction, indentLevel + 1, index);
    });
  },

  lastInstruction: function() {
    return this.get("instructions.lastObject");
  }.property("instructions"),

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

      this.printTree(this.get("rootInstruction"), 0, 0);
    }
  }
});
