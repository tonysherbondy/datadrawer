import MarkTool from "tukey/models/drawing-tools/mark-tool";

export default MarkTool.extend({
  operation: "adjust",

  // For adjust operations expect that the user gives us:
  // - draw instruction to append adjusts to
  // - control point that we are modifying
  // - markID
  drawInstruction: null,
  controlPoint: null,
  markId: null,
  startingRotation: 0,

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

  startAdjust: function(mousePos, controlPoint, mark) {
    this.set("mark", mark);
    if (!this.get("hasStarted")) {
      var startingRotation = mark.get("rotation");
      this.set("startingRotation", startingRotation);
      this.set("startingMousePos", mousePos);
      var attrs = mark.getTransformFromRotation(startingRotation);
      var instruction = this.get("store").createRecord("instruction", {
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
      var startingMousePos = this.get("startingMousePos");
      var startingRotation = this.get("startingRotation");
      var rotation = Math.round(startingRotation + (mousePos[0] - startingMousePos[0]));
      var attrs = this.get("mark").getTransformFromRotation(rotation);
      this.set("instruction.attrs", attrs);
    }
  }

});
