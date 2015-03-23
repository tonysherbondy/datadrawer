import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

export default Mark.extend({
  type: "line",

  x1: Ember.required(),
  y1: Ember.required(),
  x2: Ember.required(),
  y2: Ember.required(),

  attrsMap: [
    {name: "x1", d3Name: "x1"},
    {name: "y1", d3Name: "y1"},
    {name: "x2", d3Name: "x2"},
    {name: "y2", d3Name: "y2"}
  ]
});
