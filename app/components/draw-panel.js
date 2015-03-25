import Ember from "ember";
import Instruction from "tukey/models/instruction";
import RectangleTool from "tukey/models/drawing-tools/rectangle-tool";
import CircleTool from "tukey/models/drawing-tools/circle-tool";
import LineTool from "tukey/models/drawing-tools/line-tool";
import TextTool from "tukey/models/drawing-tools/text-tool";
import AdjustMoveTool from "tukey/models/drawing-tools/adjust-move-tool";
import AdjustRotateTool from "tukey/models/drawing-tools/adjust-rotate-tool";

export default Ember.Component.extend({
  classNames: ["draw-panel"],

  svgWidth: 640,
  svgHeight: 480,

  activeTool: function() {
    var instructionTree = this.get("instructionTree");
    var activeDrawingMode = this.get("activeDrawingMode");
    if (!activeDrawingMode) {
      return null;
    }
    var store = this.get("store");

    switch(activeDrawingMode) {
      case "drawRect":
        return RectangleTool.create({instructionTree: instructionTree, store: store});
      case "drawCircle":
        return CircleTool.create({instructionTree: instructionTree, store: store});
      case "drawLine":
        return LineTool.create({instructionTree: instructionTree, store: store});
      case "drawText":
        return TextTool.create({instructionTree: instructionTree, store: store});
      case "adjustMove":
        return AdjustMoveTool.create({store: store});
      case "adjustScale":
        console.log('trying to adjust scale');
        return null;
      case "adjustRotate":
        return AdjustRotateTool.create({store: store});
      default:
        console.log("don't know mode");
        return null;
    }
  }.property("activeDrawingMode"),

  keyPress: function(event) {
    // TODO so HACKY, but if another component is viewing the keyboard I don't
    // want this component to be changing the tool
    if (this.keyboardManager.get("isKeyboardHeld")) {
      return;
    }
    var charPressed = String.fromCharCode(event.keyCode).toLowerCase();
    var mode = this.charToModeMap[charPressed];
    mode = mode ? mode.modeName : null;
    if (mode) {
      if (mode.match(/flow/)) {
        // All flow tools are simply actions to take
        this.send(mode);
      } else {
        if (this.get("activeDrawingMode") === mode) {
          this.set("activeDrawingMode", null);
        } else {
          this.set("activeDrawingMode", mode);
        }
      }
    }
  },

  didInsertElement: function() {
    // TODO hacky bringing focus to this view to intercept keyboard
    this.$().attr({ tabindex: 1 });
    this.$().focus();
    this.setupSVGListeners();
    this.draw();
  },

  selectChart: function() {
    return d3.select(this.$(".chart")[0]);
  },

  getMousePos: function() {
    var mousePos = d3.mouse(this.$('svg.draw-panel')[0]);
    return mousePos.map(Math.round);
  },

  setupSVGListeners: function() {
    d3.select("svg.draw-panel")
      .on("click", () => {
        var tool = this.get("activeTool");
        if (tool) {
          var operation = tool.get("operation");
          if (operation === "draw") {
            tool.click(this.getMousePos());
          } else if (operation === "adjust") {
            var isControlPoint = d3.select(d3.event.target).classed("control-point");
            if (tool.get("hasStarted")) {
              tool.click(this.getMousePos());
            } else if (isControlPoint) {
              tool.startAdjust(this.getMousePos(), d3.event.target.__data__, this.get("selectedMark"));
            }
          }
        }
        d3.event.stopPropagation();
      })
      .on("mousemove", () => {
        var tool = this.get("activeTool");
        if (tool && tool.mouseMove) {
          tool.mouseMove(this.getMousePos());
        }
      });
  },

  setupAdjustListeners: function() {
    var self = this;
    d3.selectAll(".selectable-mark")
      .on("click", function() {
        // Ignore if activeTool is a drawing
        if (self.get("activeTool.operation") === "draw") {
          return;
        }
        let markID;
        for (let cc=0; cc<this.classList.length; cc++) {
          let className = this.classList[cc];
          if (className.match(/^mark/)) {
            markID = className;
          }
        }
        Ember.assert("selected a mark id", markID);
        self.selectMarkById(markID);
        d3.event.stopPropagation();
      });
  },

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

  }.observes("d3Code", "table.columns.@each.columnHash", "scalars.@each.value", "scalars.@each.name"),

  selectedMarkId: null,
  selectedMark: function() {
    return this.get("marks").findBy("name", this.get("selectedMarkId"));
  }.property("marks.@each.name", "selectedMarkId"),

  selectMarkById: function(id) {
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
    var mark = this.get("selectedMark");
    if (!mark) {
      return;
    }

    gLayer = this.selectChart().append('g')
      .attr('class', 'control-layer')
      .attr('transform', () => {
        var transform = mark.get("transform");
        if (transform) {
          return transform.evaluate();
        }
        return "";
      });
    var controlPoints = mark.getControlPoints();
    gLayer.selectAll('.control-points').data(controlPoints).enter()
      .append('circle')
      .classed("control-point", true)
      .attr({
        r: 5,
        opacity: 0.5,
        fill: 'blue',
        stroke: 'black',
        'stroke-width': 1,
        cx: (d) => d.position[0],
        cy: (d) => d.position[1]
      });

  }.observes('selectedMarkId'),

  actions: {
    flowIf: function() {
      console.log('trying to add conditional');
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
