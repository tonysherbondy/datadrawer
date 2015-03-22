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
        mark: "rect",
        attrs: {
          top: e(`${event.offsetY}`),
          left: e(`${event.offsetX}`),
          width: e('0'),
          height: e('0'),
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
      var width = event.offsetX - startingX;
      var height = event.offsetY - startingY;

      var newAttrs = {};
      if (width < 0) {
        width = -width;
        newAttrs.left = e(`${startingX - width}`);
      }
      if (height < 0) {
        height = -height;
        newAttrs.top = e(`${startingY - height}`);
      }
      newAttrs.width = e(`${width}`);
      newAttrs.height = e(`${height}`);

      var attrs = Ember.merge({}, instruction.get("attrs"));
      instruction.set("attrs", Ember.merge(attrs, newAttrs));
    }
  }
});
