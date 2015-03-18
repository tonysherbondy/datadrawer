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

    // Make table and scalar data available to the chart, these are used inside attr
    // functions
    var table = this.get("table.rows");
    var scalars = this.get("scalars");

    try {
      eval(this.get("d3Code"));
    } catch (error) {
      console.log("D3 CODE EVAL ERROR: " + error);
    }

    this.drawMarkControls();

  }.observes("d3Code"),

  selectedMarkId: null,

  selectMark: function(id) {
    if (this.get('selectedMarkId') === id) {
      this.set('selectedMarkId', null);
    } else {
      this.set('selectedMarkId', id);
    }
  },

  drawMarkControls: function() {
    // If a mark is selected we will have blue control
    // dots for things we can do to the mark,e.g.,
    // move, size, etc.

    // Clear previous overlay
    var gLayer = this.selectChart().select('g.control-layer');
    if (gLayer) {
      gLayer.remove();
    }
    var markId = this.get('selectedMarkId');
    if (!markId) {
      return;
    }

    gLayer = this.selectChart().append('g').attr('class', 'control-layer');
    let {topLeft, bottomRight} = this.get('controlPoints')[0];
    gLayer.selectAll('.control-points').data([topLeft, bottomRight]).enter()
      .append('circle')
      .attr({
        r: 5,
        opacity: 0.5,
        fill: 'blue',
        stroke: 'black',
        'stroke-width': 1,
        cx: (d) => d[0],
        cy: (d) => d[1]
      });


    console.log('selected', markId);
    console.log('points', this.get('controlPoints'));
  }.observes('selectedMarkId')
});
