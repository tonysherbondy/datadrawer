import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default MarkTool.extend({
  operation: "draw",
  markType: "circle",

  getAttrs: function(mousePos) {
    return this.get('instruction').attributesFromHash({
      cx: v('cx', mousePos[0]),
      cy: v('cy', mousePos[1]),
      radius: v('radius', 1),
      opacity: v('opacity', 0.3)
    });
  },

  updateAttrs: function(mousePos) {
    var startingX = this.get("startingX");
    var startingY = this.get("startingY");

    var x = mousePos[0] - startingX;
    var y = mousePos[1] - startingY;

    var distance = Math.round(Math.sqrt(x*x + y*y));

    this.get('instruction.attrs').findBy('name', 'radius')
      .set('variable.definition', distance);
  }
});
