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
        mark: "circle",
        attrs: {
          cy: e(`${event.offsetY}`),
          cx: e(`${event.offsetX}`),
          radius: e("10"),
          opacity: e("0.3")
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
      var startingX = this.get("startingX");
      var startingY = this.get("startingY");
      var x = event.offsetX - startingX;
      var y = event.offsetY - startingY;
      var distance = Math.sqrt(x*x + y*y);

      var attrs = Ember.merge({}, instruction.get("attrs"));
      instruction.set("attrs", Ember.merge(attrs, {radius: e(`${distance}`)}));
    }
  }
});
