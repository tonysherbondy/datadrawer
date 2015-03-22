import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Expression from "tukey/models/expression";

var e = Expression.e;

export default MarkTool.extend({
  operation: "draw",
  markType: "rect",

  getAttrs: function(event) {
    return {
      top: e(`${event.offsetY}`),
      left: e(`${event.offsetX}`),
      width: e('0'),
      height: e('0'),
      opacity: e("0.3")
    };
  },

  getEndingAttrs: function(event) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");
    var width = event.offsetX - startingX;
    var height = event.offsetY - startingY;
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
