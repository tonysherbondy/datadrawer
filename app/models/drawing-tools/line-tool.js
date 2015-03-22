import Ember from "ember";
import Expression from "tukey/models/expression";
import Instruction from "tukey/models/instruction";

var e = Expression.e;

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
      var instruction = Instruction.create({
        operation: "draw",
        mark: "line",
        attrs: {
          x1: e(`${event.offsetX}`),
          y1: e(`${event.offsetY}`),
          x2: e(`${event.offsetX}`),
          y2: e(`${event.offsetY}`),
          opacity: e("0.3"),
          stroke: e("'blue'"),
          strokeWidth: e("5")
        }
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
      var endingX = event.offsetX;
      var endingY = event.offsetY;

      var attrs = Ember.merge({}, instruction.get("attrs"));
      instruction.set("attrs", Ember.merge(attrs, {x2: e(`${endingX}`), y2: e(`${endingY}`)}));
    }
  }
});
