import Ember from "ember";
import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Instruction from "tukey/models/instruction";

export default MarkTool.extend({
  operation: "adjust",

  // For adjust operations expect that the user gives us:
  // - draw instruction to append adjusts to
  // - control point that we are modifying
  // - markID
  drawInstruction: null,
  controlPoint: null,
  markId: null,

  mark: function(key, value) {
    if (arguments.length === 1) {
      return this.get("drawInstruction.marks").findBy("name", this.get("markId"));
    } else {
      if (value) {
        this.set("drawInstruction", value.get("drawInstruction"));
        this.set("markId", value.get("name"));
      } else {
        this.set("drawInstruction", null);
        this.set("markId", null);
      }
      return value;
    }
  }.property("drawInstruction.marks.@each.name", "markId"),

  startAdjust: function(controlPoint, mark) {
    this.set("mark", mark);
    this.set("controlPoint", controlPoint);
    if (!this.get("hasStarted")) {
      var attrs = mark.getAttrsForControlPoint(controlPoint);
      var instruction = Instruction.create({
        operation: this.get("operation"),
        attrs: attrs
      });
      this.get("drawInstruction").addSubInstruction(instruction);
      this.set("instruction", instruction);
    }
  },

  click: function(mousePos) {
    if (this.get("hasStarted")) {
      this.mouseMove(mousePos);
      this.set("instruction", null);
    }
  },

  mouseMove: function(mousePos) {
    if (this.get("hasStarted")) {
      var controlPoint = Ember.merge({}, this.get("controlPoint"));
      controlPoint.position = mousePos;
      var attrs = this.get("mark").getAttrsForControlPoint(controlPoint);
      this.set("instruction.attrs", attrs);
    }
  }

});
