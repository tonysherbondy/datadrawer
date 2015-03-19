import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';

export default Mark.extend({
  type: "circle",

  radius: Ember.required(),
  cx: Ember.required(),
  cy: Ember.required(),

  displayString: function() {
    var radius = this.get("radius.stringRepresentation");
    var cy = this.get("cy.stringRepresentation");
    var cx = this.get("cx.stringRepresentation");

    return `draw cirlce at [${cx}], [${cy}] with radius ${radius}`;
  }.property("radius", "cx", "cy"),

  attrsMap: [
    {name: "radius", d3Name: "r"},
    {name: "cx", d3Name: "cx"},
    {name: "cy", d3Name: "cy"},
    {name: "fill", d3Name: "fill"}
  ],

  d3Code: function() {
    return this.getD3Code();
  }.property("radius", "cx", "cy", "fill")

});