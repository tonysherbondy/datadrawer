import Mark from 'tukey/models/mark/mark';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Mark.extend({
  type: "circle",

  getControlPoints: function() {
    var cx = this.getAttrByName('cx').get('value');
    var cy = this.getAttrByName('cy').get('value');
    return [
      {name: "center", position: [cx, cy]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    return this.get('drawInstruction').attributesFromHash({
      cx: v('cx', point.position[0]),
      cy: v('cy', point.position[1])
    });
  },

  updateAttrsWithControlPoint: function(point) {
    this.getAttrByName('cx').set('variable.definition', point.position[0]);
    this.getAttrByName('cy').set('variable.definition', point.position[1]);
  },

  attrsMap: [
    {name: "radius", d3Name: "r"},
    {name: "cx", d3Name: "cx"},
    {name: "cy", d3Name: "cy"}
  ]
});
