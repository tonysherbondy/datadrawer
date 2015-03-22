import Ember from "ember";
import Instruction from "tukey/models/instruction";
import RectangleTool from "tukey/models/drawing-tools/rectangle-tool";
import CircleTool from "tukey/models/drawing-tools/circle-tool";
import LineTool from "tukey/models/drawing-tools/line-tool";

export default Ember.Component.extend({
  classNames: ["draw-panel"],

  svgWidth: 640,
  svgHeight: 480,

  charToActionMap: {
    r: "drawRect",
    x: "drawLine",
    t: "drawText",
    c: "drawCircle",
    v: "adjustMove",
    s: "adjustScale",
    e: "adjustRotate",
    i: "flowIf",
    l: "flowLoop"
  },

  activeTool: null,

  keyPress: function(event) {
    var charPressed = String.fromCharCode(event.keyCode).toLowerCase();
    var action = this.charToActionMap[charPressed];
    if (!!action) {
      this.send(action);
    }
  },

  didInsertElement: function() {
    // TODO hacky bringing focus to this view to intercept keyboard
    this.$().attr({ tabindex: 1 });
    this.$().focus();
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

    this.drawMarkControls();

  }.observes("d3Code", "table.columns.@each.columnHash", "scalars.@each.value", "scalars.@each.name"),

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
    var tool = this.get("activeTool");
    if (tool) {
      tool.click(event);
    }
  },

  mouseMove: function(event) {
    var tool = this.get("activeTool");
    if (tool) {
      tool.mouseMove(event);
    }
  },

  actions: {
    drawRect: function() {
      var instructionTree = this.get("instructionTree");
      this.set("activeTool", RectangleTool.create({instructionTree: instructionTree}));
    },
    drawCircle: function() {
      var instructionTree = this.get("instructionTree");
      this.set("activeTool", CircleTool.create({instructionTree: instructionTree}));
    },
    drawLine: function() {
      var instructionTree = this.get("instructionTree");
      this.set("activeTool", LineTool.create({instructionTree: instructionTree}));
    },
    flowLoop: function() {
      var currentInstruction = this.get("currentInstruction");
      if (currentInstruction &&
          currentInstruction.get("operation") === "draw" &&
          currentInstruction.get("parentInstruction.operation") !== "loop") {
        var parentInstruction = currentInstruction.get("parentInstruction");
        var indexOfStep = parentInstruction.get("subInstructions").indexOf(currentInstruction);
        // remove instruction from the tree
        currentInstruction.removeInstruction();
        // add to the loop
        var loopOp = Instruction.create({
          operation: "loop"
        });
        loopOp.addSubInstruction(currentInstruction);
        // add loop to parent
        // TODO might want to add in the same place we removed rather than at the end
        parentInstruction.addSubInstructionAtIndex(loopOp, indexOfStep);
        this.set("currentInstruction", loopOp);
        return false;
      }
    }
  }
});
