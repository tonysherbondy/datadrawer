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

      var instruction = this.get("store").createRecord("instruction", {
        operation: operation,
        mark: mark
      });
      this.set("instruction", instruction);

      var attrs = this.getAttrs(mousePos);
      instruction.get('attrs').clear();
      instruction.get('attrs').pushObjects(attrs);

      this.get("instructionTree").then(function(tree) {
        tree.addSubInstruction(instruction);
      });
    }
  },

  mouseMove: function(mousePos) {
    if (this.get("hasStarted")) {
      this.updateAttrs(mousePos);
    }
  }
});

