import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

export default Mark.extend({
  type: "text",

  x: Ember.required(),
  y: Ember.required(),
  text: Ember.required(),

  attrsMap: [
    {name: "x", d3Name: "x"},
    {name: "y", d3Name: "y"},
    {name: "text", d3Name: "text"},
    {name: "fontSize", d3Name: "font-size"},
    {name: "fontFamily", d3Name: "font-family"}
  ]
});
