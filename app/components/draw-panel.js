import Ember from "ember";
import Expression from "tukey/models/expression";
import RectangleMark from "tukey/models/mark/rectangle-mark";

var e = Expression.e;

var RectangleTool = Ember.Object.extend({
  marks: Ember.required(),
  mark: null,
  click: function(event) {
    if (!!this.get("mark")) {
      this.set("mark", null);
    } else {
      var newMark = RectangleMark.create({
        top: e(`${event.offsetY}`),
        left: e(`${event.offsetX}`),
        width: e('0'),
        height: e('0')
      });

      this.set("mark", newMark);
      this.get("marks").pushObject(newMark);
    }
  },

  mouseMove: function(event) {
    var mark = this.get("mark");
    if (!!mark) {
      // TODO: make mark have a way to evaluate itself instead of getting
      // string representation
      var width = event.offsetX - mark.get("left.stringRepresentation");
      var height = event.offsetY - mark.get("top.stringRepresentation");
      mark.set('width', e(`${width}`));
      mark.set('height', e(`${height}`));
    }
  }
});

export default Ember.Component.extend({
  classNames: ["draw-panel"],

  didInsertElement: function() {
    this.draw();
  },

  selectChart: function() {
    return d3.select(this.$(".chart")[0]);
  },

  tools: function() {
    var marks = this.get("marks");
    return [RectangleTool.create({marks: marks})];
  }.property(),

  activeTool: function() {
    return this.get("tools.firstObject");
  }.property(),

  draw: function() {
    this.selectChart().remove();

    d3.select("svg").append("g").attr("class", "chart");

    // Make table and scalar data available to the chart, these are used inside attr
    // functions
    var table = this.get("table.columns"); // jshint ignore:line
    var scalars = this.get("scalars");  // jshint ignore:line

    try {
      eval(this.get("d3Code"));
    } catch (error) {
      console.log("D3 CODE EVAL ERROR: " + error);
    }

    this.drawMarkControls();

  }.observes("d3Code", "table.columns", "scalars"),

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
  }.observes('selectedMarkId'),

  click: function(event) {
    this.get("activeTool").click(event);
  },

  mouseMove: function(event) {
    this.get("activeTool").mouseMove(event);
  }
});
