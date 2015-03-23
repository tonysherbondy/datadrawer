import Ember from "ember";
import Instruction from "tukey/models/instruction";

export default Ember.Object.extend({
  instructionTree: Ember.required(),
  instruction: null,
  startingX: null,
  startingY: null,

  click: function(mousePos) {
    if (!!this.get("instruction")) {
      this.set("instruction", null);
    } else {
      this.set("startingX", mousePos[0]);
      this.set("startingY", mousePos[1]);
      var operation = this.get("operation");
      var mark = this.get("markType");
      var attrs = this.getAttrs(mousePos);
      var instruction = Instruction.create({
        operation: operation,
        mark: mark,
        attrs: attrs
      });
      this.get("instructionTree").addSubInstruction(instruction);
      this.set("instruction", instruction);
    }
  },

  mouseMove: function(mousePos) {
    var instruction = this.get("instruction");
    if (!!instruction) {
      // TODO: make instruction have a way to evaluate itself instead of getting
      // string representation
      var endingAttrs = this.getEndingAttrs(mousePos);
      var attrs = Ember.merge({}, instruction.get("attrs"));
      instruction.set("attrs", Ember.merge(attrs, endingAttrs));
    }
  }
});

