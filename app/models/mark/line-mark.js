import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';
import Expression from 'tukey/models/expression';
var e = Expression.e;

export default Mark.extend({
  type: "line",

  x1: Ember.required(),
  y1: Ember.required(),
  x2: Ember.required(),
  y2: Ember.required(),

  getControlPoints: function() {
    var x1 = this.get("x1").cheapoEval();
    var y1 = this.get("y1").cheapoEval();
    var x2 = this.get("x2").cheapoEval();
    var y2 = this.get("y2").cheapoEval();
    return [
      {name: "first", position: [x1, y1]},
      {name: "second", position: [x2, y2]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    var attrs = {};
    var x = e(""+point.position[0]);
    var y = e(""+point.position[1]);
    if (point.name === "first") {
      attrs.x1 = x;
      attrs.y1 = y;
    } else if (point.name === "second") {
      attrs.x2 = x;
      attrs.y2 = y;
    }
    return attrs;
  },


  attrsMap: [
    {name: "x1", d3Name: "x1"},
    {name: "y1", d3Name: "y1"},
    {name: "x2", d3Name: "x2"},
    {name: "y2", d3Name: "y2"}
  ]
});
