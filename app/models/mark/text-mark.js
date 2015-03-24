import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';
import Expression from 'tukey/models/expression';
var e = Expression.e;

export default Mark.extend({
  type: "text",

  x: Ember.required(),
  y: Ember.required(),
  text: Ember.required(),

  getTransformFromRotation: function(rotation) {
    var x = this.get("x").cheapoEval();
    var y = this.get("y").cheapoEval();
    return {
      transform: e(`"translate(${x},${y}) rotate(${rotation}) translate(${-x},${-y})"`)
    };
  },

  getControlPoints: function() {
    var x = this.get("x").cheapoEval();
    var y = this.get("y").cheapoEval();
    return [
      {name: "point", position: [x, y]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    return {
      x: e(""+point.position[0]),
      y: e(""+point.position[1])
    };
  },

  attrsMap: [
    {name: "x", d3Name: "x"},
    {name: "y", d3Name: "y"},
    {name: "text", d3Name: "text"},
    {name: "textAnchor", d3Name: "text-anchor"},
    {name: "fontSize", d3Name: "font-size"},
    {name: "fontFamily", d3Name: "font-family"}
  ]
});
