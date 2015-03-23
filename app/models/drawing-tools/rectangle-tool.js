import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "rect",

  getAttrs: function(mousePos) {
    return {
      top: e(`${mousePos[1]}`),
      left: e(`${mousePos[0]}`),
      width: e('0'),
      height: e('0'),
      opacity: e("0.3")
    };
  },

  getEndingAttrs: function(mousePos) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");
    var width = mousePos[0] - startingX;
    var height = mousePos[1] - startingY;
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

    return newAttrs;
  }
});
