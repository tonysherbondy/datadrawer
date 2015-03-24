import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "text",

  getAttrs: function(mousePos) {
    return {
      x: e(`${mousePos[0]}`),
      y: e(`${mousePos[1]}`),
      fontFamily: e('"sans-serif"'),
      fontSize: e('20'),
      textAnchor: e('"start"'),
      fill: e('"red"'),
      text: e('"Mexico"')
    };
  },

  getEndingAttrs: function(mousePos) {
    return {
      x: e(`${mousePos[0]}`),
      y: e(`${mousePos[1]}`)
    };
  }
});
