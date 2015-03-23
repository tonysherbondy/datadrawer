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
        mark: mark,
        attrs: attrs
      });
      this.get("instructionTree").then(function(tree) {
        tree.addSubInstruction(instruction);
      });
      this.set("instruction", instruction);
    }
  },

  mouseMove: function(mousePos) {
    if (this.get("hasStarted")) {
      // TODO: make instruction have a way to evaluate itself instead of getting
      // string representation
      var endingAttrs = this.getEndingAttrs(mousePos);
      var attrs = Ember.merge({}, this.get("instruction.attrs"));
      this.set("instruction.attrs", Ember.merge(attrs, endingAttrs));
    }
  }
});

