import Ember from "ember";
import Instruction from "tukey/models/instruction";

export default Ember.Object.extend({
  instructionTree: Ember.required(),
  instruction: null,
  startingX: null,
  startingY: null,

  click: function(event) {
    if (!!this.get("instruction")) {
      this.set("instruction", null);
    } else {
      this.set("startingX", event.offsetX);
      this.set("startingY", event.offsetY);
      var operation = this.get("operation");
      var mark = this.get("markType");
      var attrs = this.getAttrs(event);
      var instruction = Instruction.create({
        operation: operation,
        mark: mark,
        attrs: attrs
      });
      this.get("instructionTree").addSubInstruction(instruction);
      this.set("instruction", instruction);
    }
  },

  mouseMove: function(event) {
    var instruction = this.get("instruction");
    if (!!instruction) {
      // TODO: make instruction have a way to evaluate itself instead of getting
      // string representation
      var endingAttrs = this.getEndingAttrs(event);
      var attrs = Ember.merge({}, instruction.get("attrs"));
      instruction.set("attrs", Ember.merge(attrs, endingAttrs));
    }
  }
});

