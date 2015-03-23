import Ember from 'ember';
import Table from 'tukey/models/table';
import TableColumn from 'tukey/models/table-column';
import Expression from 'tukey/models/expression';
import Instruction from "tukey/models/instruction";

var e = Expression.e;

var MarksToD3Compiler = Ember.Object.extend({
  instructionTree: Ember.required(),
  currentInstruction: null,

  // TODO Only need to do this right now because of the way that I am modifying
  // the marks returned from the draw step in a loop step, if I just copied marks
  // and modified those copies we'd be fine without
  dirtyMarks: function() {
    function notifyAllMarks(instruction) {
      instruction.notifyPropertyChange("marks");
      instruction.get("subInstructions").forEach(notifyAllMarks);
    }
    notifyAllMarks(this.get("instructionTree"));
  }.observes("currentInstruction"),

  marks: function() {
    var currentInstruction = this.get("currentInstruction");
    if (currentInstruction) {
      return currentInstruction.get("marks");
    }
    return this.get("instructionTree.marks");
  }.property("instructionTree.marks", "currentInstruction", "currentInstruction.marks"),

  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n\n");
    // TODO this probably should depend on mark attributes which should also be ember objects
  }.property("marks.[]", "marks.@each.d3Code")
});

function getData() {
  var scalars = [
    Ember.Object.create({name: 'canvasHeight', value: 200}),
    Ember.Object.create({name: 'canvasWidth', value: 200}),
    Ember.Object.create({name: 'padding', value: 3})
  ];
  var columns = [
      {name: "Nhan", age: 27, weight: 120},
      {name: "Zack", age: 30, weight: 160},
      {name: "Anthony", age: 37, weight: 180}
  ];
  var tableColumns = columns.map((hash) => {
    return TableColumn.create().set("columnHash", hash);
  });
  var table =  Table.create({
    columns: tableColumns
  });
  return {table, scalars};
}

function getInstructionTree() {
  var singleDrawOp = Instruction.create({
      operation: "draw",
      mark: "rect",
      attrs: {
        top: e("10"),
        left: e("10"),
        width: e("100"),
        height: e("100"),
        opacity: e("0.3")
      },
      markId: 1
  });
  var setOp = Instruction.create({
      operation: "set",
      // TODO - these are probably computed from something
      attrs: {
        height: e("50"),
      },
      property: "height",
      propertyValue: 50
  });
  singleDrawOp.addSubInstruction(setOp);

  var loopedDrawOp = Instruction.create({
    operation: "draw",
    mark: "circle",
    attrs: {
      radius: e("5"),
      cy: e("element.age"),
      cx: e("element.weight"),
      opacity: e("0.7"),
      fill: e("'#49B08D'")
    },
    markId: 2
  });

  var loopOp = Instruction.create({
    operation: "loop"
  });
  loopOp.addSubInstruction(loopedDrawOp);

  var root = Instruction.create({
      operation: "root",
  });
  root.addSubInstruction(singleDrawOp);
  root.addSubInstruction(loopOp);

  return root;
}

export default Ember.Route.extend({
  model: function() {

    // The Data
    var {table, scalars} = getData();

    // The Instructions
    var rootInstruction = getInstructionTree();

    // The Marks Compiler
    // TODO: move this binding to component or controller
    var compiler = MarksToD3Compiler.create({
      instructionTree: rootInstruction,
      table: table,
      scalars: scalars,
    });
    this.set("compiler", compiler);

    return compiler;
  }
});
