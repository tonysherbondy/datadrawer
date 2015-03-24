import Ember from "ember";
import Mark from "tukey/models/mark/mark";
import Expression from 'tukey/models/expression';
var e = Expression.e;

export default Mark.extend({
  type: "rect",

  width: Ember.required(),
  height: Ember.required(),
  top: Ember.required(),
  left: Ember.required(),

  getControlPoints: function() {
    var top = this.get("top").cheapoEval();
    var left = this.get("left").cheapoEval();
    var width = this.get("width").cheapoEval();
    var height = this.get("height").cheapoEval();
    return [
      {name: "top-left", position: [left, top]},
      {name: "bottom-right", position: [left+width, top+height]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    var attrs = {};
    if (point.name === "top-left") {
      attrs.left = e(""+point.position[0]);
      attrs.top = e(""+point.position[1]);
    } else if (point.name === "bottom-right") {
      var width = this.get("width").cheapoEval();
      var height = this.get("height").cheapoEval();
      attrs.left = e(""+ (point.position[0] - width));
      attrs.top = e(""+ (point.position[1] - height));
    }
    return attrs;
  },


  attrsMap: [
    {name: "width", d3Name: "width"},
    {name: "height", d3Name: "height"},
    {name: "left", d3Name: "x"},
    {name: "top", d3Name: "y"}
  ]
});
