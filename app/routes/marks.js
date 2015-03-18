import Ember from 'ember';

var Table = Ember.Object.extend({
  rows: Ember.required()
});

var Mark = Ember.Object.extend({
  table: Ember.required(),
  displayString: function() {
    return "Empty Mark";
  }
});

var Expression = Ember.Object.extend({
  stringRepresentation: Ember.required(),

  //jshint unused:false
  evaluate: function(scalars, table, element, index) {
    return eval(this.get("stringRepresentation"));
  }
});

function e(stringRep) {
  return Expression.create({
    stringRepresentation: stringRep
  });
}


var RectangleMark = Mark.extend({
  width: Ember.required(),
  height: Ember.required(),
  top: Ember.required(),
  left: Ember.required(),

  displayString: function() {
    var left = this.get("left.stringRepresentation");
    var top = this.get("top.stringRepresentation");
    var width = this.get("width.stringRepresentation");
    var height = this.get("height.stringRepresentation");

    return `draw rectangle from [${left}], [${top}]` +
      ` with width: [${width}], and height: [${height}]`;

  }.property("width", "height", "top", "left")
});


// TODO: move this logic to a model class

var MarksToD3Compiler = Ember.Object.extend({
  marks: Ember.required(),
  d3Code: function() {
    return "hello world";
  }.property("marks.[]")
});

export default Ember.Route.extend({
  model: function() {
    var table =  Table.create({
      rows: {
        name: ['Nhan', 'Zack', 'Anthony'],
        age: [27, 30, 37]
      }
    });

    var rectMark = RectangleMark.create({
      width: e("1/table.length * 300"),
      height: e("element.age * 5"),
      top: e("200 - element.age * 5"),
      left: e("index * 1/table.length * 300")
    });

    // TODO: move this binding to component or controller
    var compiler = MarksToD3Compiler.create({
      marks: [rectMark],
    });

    return compiler;
  }
});
