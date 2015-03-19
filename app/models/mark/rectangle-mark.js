import Ember from "ember";
import Mark from "tukey/models/mark/mark";

export default Mark.extend({
  type: "rect",

  width: Ember.required(),
  height: Ember.required(),
  top: Ember.required(),
  left: Ember.required(),

  displayString: function() {
    var left = this.get("left.stringRepresentation");
    var top = this.get("top.stringRepresentation");
    var width = this.get("width.stringRepresentation");
    var height = this.get("height.stringRepresentation");

    return `draw rectangle from [${left}], [${top}]` +
      ` with width: [${width}], and height: [${height}]`;

  }.property("width", "height", "top", "left"),

  attrsMap: [
    {name: "width", d3Name: "width"},
    {name: "height", d3Name: "height"},
    {name: "left", d3Name: "x"},
    {name: "top", d3Name: "y"},
    {name: "fill", d3Name: "fill"}
  ],

  d3Code: function() {
    return this.getD3Code();
  }.property("width", "height", "top", "left", "fill")
});
