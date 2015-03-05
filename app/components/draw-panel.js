import Ember from "ember";

export default Ember.Component.extend({
  classNames: ["draw-panel"],

  didInsertElement: function() {
    this.draw();
  },

  selectChart: function() {
    return d3.select(this.$(".chart")[0]);
  },

  draw: function() {
    this.selectChart().remove();
    d3.select("svg").append("g").attr("class", "chart");

    eval(this.get("d3Code"));
  }.observes("d3Code")
});
