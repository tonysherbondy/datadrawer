import Ember from 'ember';
import Instruction from '../models/instruction';

export default Ember.Component.extend({

  instructions: Ember.computed(function() {
    return this.get("rootInstruction.flattenedList").filter(function(instruction) {
      return instruction.get("operation") !== "root";
    });
  }).property("rootInstruction.flattenedList"),

  actions: {
    addInstruction: function() {
      // Find last draw
      var lastInstruction = this.get("lastInstruction");
      var lastOperation = lastInstruction.get("operation");
      var newInstruction;
      if (lastOperation === "draw") {
        newInstruction = Instruction.create({
          drawParent: lastInstruction,
          operation: "set"
        });
      } else if (lastOperation === "set") {
        newInstruction = Instruction.create({
          drawParent: lastInstruction.get("drawParent"),
          operation: "set"
        });
      } else if (lastOperation === "loop") {
        newInstruction = Instruction.create({
          operation: "draw",
          mark: "rect"
        });
      }
      lastInstruction.addSubInstruction(newInstruction);
    }
  }
});
