import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";
import Instruction from "tukey/models/instruction";

var e = Expression.e;

export default MarkTool.extend({
  operation: "adjust",

  // For adjust operations expect that the user gives us:
  // - draw instruction to append adjusts to
  // - control point that we are modifying
  // - markID
  drawInstruction: null,
  controlPoint: null,
  markId: null,

  getMark: function() {
    return this.get("drawInstruction.marks").findBy("name", this.get("markId"));
  },

  startAdjust: function(controlPoint, markId, drawInstruction) {
    this.set("markId", markId);
    this.set("drawInstruction", drawInstruction);
    this.set("controlPoint", controlPoint);
    var mark = this.getMark();
    if (!this.get("instruction")) {
      var attrs = mark.getAttrsForControlPoint(controlPoint);
      var instruction = Instruction.create({
        operation: this.get("operation"),
        attrs: attrs
      });
      drawInstruction.addSubInstruction(instruction);
      this.set("instruction", instruction);
    }
  },

  //mouseMove: function(mousePos) {
    //var instruction = this.get("instruction");
    //if (!!instruction) {
      //// TODO: make instruction have a way to evaluate itself instead of getting
      //// string representation
      //var endingAttrs = this.getEndingAttrs(mousePos);
      //var attrs = Ember.merge({}, instruction.get("attrs"));
      //instruction.set("attrs", Ember.merge(attrs, endingAttrs));
    //}
  //}

});
