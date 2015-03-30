import MarkTool from "tukey/models/drawing-tools/mark-tool";
import Attribute from 'tukey/models/attribute';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default MarkTool.extend({
  operation: "draw",
  markType: "text",

  getAttrs: function(mousePos) {
    return Attribute.attributesFromHash({
      x: v('x', mousePos[0]),
      y: v('y', mousePos[1]),
      fontFamily: v('fontFamily', 'sans-serif'),
      fontSize: v('fontSize', 20),
      textAnchor: v('textAnchor', 'start'),
      fill: v('fill', 'red'),
      text: v('text', 'Mexico')
    });
  },

  updateAttrs: function(mousePos) {
    this.get('instruction.attrs').findBy('name', 'x')
      .set('variable.definition', mousePos[0]);
    this.get('instruction.attrs').findBy('name', 'y')
      .set('variable.definition', mousePos[1]);
  }
});
