import Ember from 'ember';
import Instruction from 'tukey/models/instruction';
import layout from '../templates/components/instructions-tree-panel';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['instructions-subtree'],

  subInstructions: Ember.computed.alias("rootInstruction.subInstructions"),

  isRootOperation: Ember.computed.equal("rootInstruction.operation", "root"),

  canAddSubInstructions: Ember.computed(function() {
    var operation = this.get("rootInstruction.operation");
    return operation !== "set";
  }),

  actions: {
    addInstruction: function() {
      var rootInstruction = this.get("rootInstruction");
      var rootOperation = rootInstruction.get("operation");

      if (rootOperation === "draw") {
        rootInstruction.addSubInstruction(Instruction.create({
          operation: "set"
        }));
      } else if (rootOperation === "root" || rootOperation === "loop") {
        rootInstruction.addSubInstruction(Instruction.create({
          operation: "draw",
          mark: "rect"
        }));
      }
    }
  }
});
