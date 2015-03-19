import Ember from 'ember';
import Table from 'tukey/models/table';
import Expression from 'tukey/models/expression';
import RectangleMark from 'tukey/models/mark/rectangle-mark';
import CircleMark from 'tukey/models/mark/circle-mark';

var e = Expression.e;

var MarksToD3Compiler = Ember.Object.extend({
  marks: Ember.required(),
  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n");
  }.property("marks.@each.d3Code")
});

export default Ember.Route.extend({
  model: function() {
    var table =  Table.create({
      columns: [
        {name: "Nhan", age: 27, weight: 120},
        {name: "Zack", age: 30, weight: 160},
        {name: "Anthony", age: 37, weight: 180}
      ]
    });

    var rectMark = RectangleMark.create({
      width: e("1/table.length * 200"),
      height: e("element.age"),
      top: e("120 - element.age"),
      left: e("index * (1/table.length * 200 + 3)")
    });

    var scatterMark = CircleMark.create({
      radius: e("5"),
      cy: e("element.age"),
      cx: e("element.weight"),
      fill: e("'#49B08D'")
    });

    // TODO: move this binding to component or controller
    var compiler = MarksToD3Compiler.create({
      marks: [rectMark, scatterMark],
      table: table,
      scalars: {}
    });

    return compiler;
  }
});
