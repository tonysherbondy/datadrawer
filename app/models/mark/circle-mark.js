import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

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

  attrsMap: [
    {name: "radius", d3Name: "r"},
    {name: "cx", d3Name: "cx"},
    {name: "cy", d3Name: "cy"}
  ]
});
