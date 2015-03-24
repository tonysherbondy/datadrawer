import Ember from "ember";

export default Ember.Object.extend({
  instructionTree: Ember.required(),
  instruction: null,
  startingX: null,
  startingY: null,
  store: null, // Ember Data store

  hasStarted: Ember.computed.notEmpty("instruction"),

  click: function(mousePos) {
    if (this.get("hasStarted")) {
      this.set("instruction", null);
    } else {

      this.set("startingX", mousePos[0]);
      this.set("startingY", mousePos[1]);

      var operation = this.get("operation");
      var mark = this.get("markType");

      var attrs = this.getAttrs(mousePos);
      var instruction = this.get("store").createRecord("instruction", {
        operation: operation,
        mark: mark
      });
      instruction.set("attrs", attrs);
      this.get("instructionTree").then(function(tree) {
        tree.addSubInstruction(instruction);
      });
      this.set("instruction", instruction);
    }
  },

  mouseMove: function(mousePos) {
    if (this.get("hasStarted")) {
      this.updateAttrs(mousePos);
    }
  }
});

