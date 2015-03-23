import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

export default Mark.extend({
  type: "text",

  x: Ember.required(),
  y: Ember.required(),
  text: Ember.required(),

  displayString: function() {
    var x = this.get("x.stringRepresentation");
    var y = this.get("y.stringRepresentation");
    var text = this.get("text.stringRepresentation");

    return `draw text [${text}] at [${x}], [${y}]`;
  }.property("width", "height", "top", "left"),

  attrsMap: [
    {name: "x", d3Name: "x"},
    {name: "y", d3Name: "y"},
    {name: "text", d3Name: "text"}
  ]
});
