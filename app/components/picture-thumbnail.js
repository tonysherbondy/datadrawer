import Ember from 'ember';
import layout from '../templates/components/picture-thumbnail';

export default Ember.Component.extend({
  layout: layout,

  picture: Ember.required(),

  wholeClass: Ember.computed(function() {
    return "noselect " + this.get("svgClass");
  }).property("picture.id"),

  viewBox: "0 0 640 480",

  svgClass: Ember.computed(function() {
    return "picture-thumbnail-" + this.get("gClass");
  }).property("picture.id"),

  gClass: Ember.computed(function() {
    return "baby-chart-" + this.get("picture.id");
  }).property("picture.id"),

  selectChart: function() {
    return d3.select(this.$("." + this.get("gClass"))[0]);
  },

  draw: function() {
    this.selectChart().remove();

    d3.select("svg." + this.get("svgClass"))
      .append("g").attr("class", this.get("gClass"));

    // Make table and scalar data available to the chart, these are used
    // inside attr functions
    var table = [];
    if (!Ember.isEmpty(this.get("picture.table.columns"))) {
      table = this.get("picture.table.columns").map((column) => {
        return column.get("columnHash");
      });
    }
    var scalars = {};
    if (!Ember.isEmpty(this.get("picture.scalars"))) {
      this.get("picture.scalars").forEach((scalar) => {
        scalars[scalar.get("name")] = scalar.get("value");
      });
    }

    try {
      eval(this.get("picture.d3Code"));
    } catch (error) {
      console.log("D3 CODE EVAL ERROR: " + error);
    }
  }.observes("picture.d3Code").on('didInsertElement')

});
