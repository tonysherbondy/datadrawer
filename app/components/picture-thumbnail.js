import Ember from 'ember';
import layout from '../templates/components/picture-thumbnail';

export default Ember.Component.extend({
  layout: layout,

  draw: function() {
    this.selectChart().remove();

    d3.select("svg.draw-panel").append("g").attr("class", "chart");

    // Make table and scalar data available to the chart, these are used inside attr
    // functions
    var table = [];
    if (!Ember.isEmpty(this.get("table.columns"))) {
      table = this.get("table.columns").map((column) => {
        return column.get("columnHash");
      });
    }
    var scalars = {};
    if (!Ember.isEmpty(this.get("scalars"))) {
      this.get("scalars").forEach((scalar) => {
        scalars[scalar.get("name")] = scalar.get("value");
      });
    }

    try {
      eval(this.get("d3Code"));
    } catch (error) {
      console.log("D3 CODE EVAL ERROR: " + error);
    }

    this.setupAdjustListeners();
    this.drawMarkControls();

  }.observes("d3Code", "table.columns.@each.columnHash", "scalars.@each.value", "scalars.@each.name")

});
