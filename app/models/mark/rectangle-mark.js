import Ember from "ember";
import Mark from "tukey/models/mark/mark";

export default Mark.extend({
  type: "rect",

  width: Ember.required(),
  height: Ember.required(),
  top: Ember.required(),
  left: Ember.required(),

  attrsMap: [
    {name: "width", d3Name: "width"},
    {name: "height", d3Name: "height"},
    {name: "left", d3Name: "x"},
    {name: "top", d3Name: "y"}
  ]
});
