import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';
import Expression from 'tukey/models/expression';
var e = Expression.e;

export default Mark.extend({
  type: "circle",

  radius: Ember.required(),
  cx: Ember.required(),
  cy: Ember.required(),

  getControlPoints: function() {
    var cx = this.get("cx").cheapoEval();
    var cy = this.get("cy").cheapoEval();
    return [
      {name: "center", position: [cx, cy]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    var attrs = {};
    if (point.name === "center") {
      attrs.cx = e(""+point.position[0]);
      attrs.cy = e(""+point.position[1]);
    }
    return attrs;
  },

  attrsMap: [
    {name: "radius", d3Name: "r"},
    {name: "cx", d3Name: "cx"},
    {name: "cy", d3Name: "cy"}
  ]
});
