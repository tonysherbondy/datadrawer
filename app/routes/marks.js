import Ember from 'ember';
import Table from 'tukey/models/table';
import TableColumn from 'tukey/models/table-column';
import Expression from 'tukey/models/expression';
import RectangleMark from 'tukey/models/mark/rectangle-mark';
import CircleMark from 'tukey/models/mark/circle-mark';
import Instruction from "tukey/models/instruction";

var e = Expression.e;

var MarksToD3Compiler = Ember.Object.extend({
  marks: Ember.required(),
  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n");
    // TODO this probably should depend on mark attributes which should also be ember objects
  }.property("marks.[]", "marks.@each.d3Code")
});

function getMarks() {
  var rectMark = RectangleMark.create({
    width: e("1/table.length * scalars.canvasWidth"),
    height: e("element.age"),
    top: e("scalars.canvasHeight - element.age"),
    left: e("index * (1/table.length * scalars.canvasWidth + scalars.padding)"),
    opacity: e("0.3")
  });

  var scatterMark = CircleMark.create({
    radius: e("5"),
    cy: e("element.age"),
    cx: e("element.weight"),
    fill: e("'#49B08D'")
  });
  return [rectMark, scatterMark];
}

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
  var drawOp = Instruction.create({
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
      property: "height",
      propertyValue: 50,
  });
  drawOp.addSubInstruction(setOp);

  var root = Instruction.create({
      operation: "root",
  });
  root.addSubInstruction(drawOp);
  root.addSubInstruction(Instruction.create({
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
  }));

  return root;
}

export default Ember.Route.extend({
  model: function() {

    // The Data
    var {table, scalars} = getData();

    // The Instructions
    var rootInstruction = getInstructionTree();

    // The Marks
    var marks = getMarks();

    // TODO remove once instructions can calculate marks
    //rootInstruction.set("marks", marks);

    // The Marks Compiler
    // TODO: move this binding to component or controller
    var compiler = MarksToD3Compiler.extend({
      marks: Ember.computed.alias("instructionTree.marks"),
    }).create({
      instructionTree: rootInstruction,
      table: table,
      scalars: scalars,
    });

    return compiler;
  }
});
