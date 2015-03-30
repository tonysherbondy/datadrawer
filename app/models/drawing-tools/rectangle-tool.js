import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default MarkTool.extend({
  operation: "draw",
  markType: "rect",

  getAttrs: function(mousePos) {
    return this.get('instruction').attributesFromHash({
      top: v('top', mousePos[1]),
      left: v('left', mousePos[0]),
      width: v('width', 0),
      height: v('height', 0),
      opacity: v('opacity', 0.3)
    });
  },

  updateAttrs: function(mousePos) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");
    var width = mousePos[0] - startingX;
    var height = mousePos[1] - startingY;
    var attrs = this.get('instruction.attrs');

    if (width < 0) {
      width = -width;
      attrs.findBy('name', 'left').set('variable.definition',
                                       startingX - width);
    }

    if (height < 0) {
      height = -height;
      attrs.findBy('name', 'top').set('variable.definition',
                                       startingY - height);
    }

    attrs.findBy('name', 'width').set('variable.definition', width);
    attrs.findBy('name', 'height').set('variable.definition', height);
  }
});
