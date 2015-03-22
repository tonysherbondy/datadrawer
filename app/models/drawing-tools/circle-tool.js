import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "circle",

  getAttrs: function(event) {
    return {
      cy: e(`${event.offsetY}`),
      cx: e(`${event.offsetX}`),
      radius: e("10"),
      opacity: e("0.3")
    };
  },

  getEndingAttrs: function(event) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");
    var x = event.offsetX - startingX;
    var y = event.offsetY - startingY;
    var distance = Math.sqrt(x*x + y*y);
    return {
      radius: e(`${distance}`)
    };
  }
});
