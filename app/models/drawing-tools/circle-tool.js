import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "circle",

  getAttrs: function(mousePos) {
    return {
      cx: e(`${mousePos[0]}`),
      cy: e(`${mousePos[1]}`),
      radius: e("1"),
      opacity: e("0.3")
    };
  },

  getEndingAttrs: function(mousePos) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");
    var x = mousePos[0] - startingX;
    var y = mousePos[1] - startingY;
    var distance = Math.round(Math.sqrt(x*x + y*y));
    return {
      radius: e(`${distance}`)
    };
  }
});
