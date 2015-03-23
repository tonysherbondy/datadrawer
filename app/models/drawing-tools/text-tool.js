import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "text",

  getAttrs: function(event) {
    return {
      x: e(`${event.offsetX}`),
      y: e(`${event.offsetY}`),
      fontFamily: e('"sans-serif"'),
      fontSize: e('20'),
      fill: e('"red"'),
      text: e('"Mexico"')
    };
  },

  getEndingAttrs: function(event) {
    return {
      x: e(`${event.offsetX}`),
      y: e(`${event.offsetY}`)
    };
  }
});
