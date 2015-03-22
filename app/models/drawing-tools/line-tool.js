import Expression from "tukey/models/expression";
import MarkTool from "tukey/models/drawing-tools/mark-tool";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "line",

  getAttrs: function(event) {
    return {
      x1: e(`${event.offsetX}`),
      y1: e(`${event.offsetY}`),
      x2: e(`${event.offsetX}`),
      y2: e(`${event.offsetY}`),
      opacity: e("0.3"),
      stroke: e("'blue'"),
      strokeWidth: e("5")
    };
  },

  getEndingAttrs: function(event) {
    return {
      x2: e(`${event.offsetX}`),
      y2: e(`${event.offsetY}`)
    };
  }
});
