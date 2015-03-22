import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

export default Mark.extend({
  type: "line",

  x1: Ember.required(),
  y1: Ember.required(),
  x2: Ember.required(),
  y2: Ember.required(),

  displayString: function() {
    var x1 = this.get("x1.stringRepresentation");
    var y1 = this.get("y1.stringRepresentation");
    var x2 = this.get("x2.stringRepresentation");
    var y2 = this.get("y2.stringRepresentation");

    return `draw line from [${x1}], [${y1}] to [${x2}], [${y2}]`;
  }.property("x1", "y1", "x2", "y2"),

  attrsMap: [
    {name: "x1", d3Name: "x1"},
    {name: "y1", d3Name: "y1"},
    {name: "x2", d3Name: "x2"},
    {name: "y2", d3Name: "y2"}
  ]
});
