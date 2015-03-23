import Expression from "tukey/models/expression";
import MarkTool from "tukey/models/drawing-tools/mark-tool";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "line",

  getAttrs: function(mousePos) {
    return {
      x1: e(`${mousePos[0]}`),
      y1: e(`${mousePos[1]}`),
      x2: e(`${mousePos[0]}`),
      y2: e(`${mousePos[1]}`),
      opacity: e("0.3"),
      stroke: e("'blue'"),
      strokeWidth: e("5")
    };
  },

  getEndingAttrs: function(mousePos) {
    return {
      x2: e(`${mousePos[0]}`),
      y2: e(`${mousePos[1]}`)
    };
  }
});
