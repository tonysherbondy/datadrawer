import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default MarkTool.extend({
  operation: "draw",
  markType: "line",

  getAttrs: function(mousePos) {
    return this.get('instruction').attributesFromHash({
      x1: v('x1', mousePos[0]),
      y1: v('y1', mousePos[1]),
      x2: v('x2', mousePos[0]),
      y2: v('y2', mousePos[1]),
      opacity: v('opacity', 0.3),
      stroke: v('stroke', 'blue'),
      strokeWidth: v('strokeWidth', 5)
    });
  },

  updateAttrs: function(mousePos) {
    this.get('instruction').getAttrByName('x2')
      .set('variable.definition', mousePos[0]);
    this.get('instruction').getAttrByName('y2')
      .set('variable.definition', mousePos[1]);
  }
});
