import Ember from 'ember';

var Table = Ember.Object.extend({
  rows: Ember.required()
});

var markCounter = 0;

var Mark = Ember.Object.extend({
  name: function() {
    return `mark${++markCounter}`;
  }.property(),

  displayString: function() {
    return "Empty Mark";
  },

  getAttrFuncD3: function(attr) {
    if (!this.get(attr)) {
      return null;
    }
    return `function(element, index) { return ${this.get(attr + '.stringRepresentation')}; }`;
  },

  getD3DrawPrefix: function(type) {
    return `this.selectChart().selectAll('${type}').filter('.${this.get("name")}')` +
      `.data(table).enter().append('${type}')`;
  },

  getD3Attrs: function(attrsMap) {
    return `\n.attr('class', '${this.get("name")}')\n` + attrsMap.map((item) => {
      let attrFunc = this.getAttrFuncD3(item.name);
      if (!attrFunc) {
        return "";
      }
      return `.attr('${item.d3Name}', ${attrFunc})`;
    }).join("\n");
  },

  getD3Code: function() {
    var attrsMap = this.get("attrsMap");
    return this.getD3DrawPrefix(this.get("type")) + this.getD3Attrs(attrsMap) + ";";
  }

});


var Expression = Ember.Object.extend({
  stringRepresentation: Ember.required(),

  //jshint unused:false
  evaluate: function(scalars, table, element, index) {
    return eval(this.get("stringRepresentation"));
  }
});

export function e(stringRep) {
  return Expression.create({
    stringRepresentation: stringRep
  });
}

var RectangleMark = Mark.extend({
  type: "rect",

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

  }.property("width", "height", "top", "left"),

  attrsMap: [
    {name: "width", d3Name: "width"},
    {name: "height", d3Name: "height"},
    {name: "left", d3Name: "x"},
    {name: "top", d3Name: "y"},
    {name: "fill", d3Name: "fill"}
  ],

  d3Code: function() {
    return this.getD3Code();
  }.property("width", "height", "top", "left", "fill")
});

var CircleMark = Mark.extend({
  type: "circle",

  radius: Ember.required(),
  cx: Ember.required(),
  cy: Ember.required(),

  displayString: function() {
    var radius = this.get("radius.stringRepresentation");
    var cy = this.get("cy.stringRepresentation");
    var cx = this.get("cx.stringRepresentation");

    return `draw cirlce at [${cx}], [${cy}] with radius ${radius}`;
  }.property("radius", "cx", "cy"),

  attrsMap: [
    {name: "radius", d3Name: "r"},
    {name: "cx", d3Name: "cx"},
    {name: "cy", d3Name: "cy"},
    {name: "fill", d3Name: "fill"}
  ],

  d3Code: function() {
    return this.getD3Code();
  }.property("radius", "cx", "cy", "fill")

});

export var rectangleMark = RectangleMark;

// TODO: move this logic to a model class

var MarksToD3Compiler = Ember.Object.extend({
  marks: Ember.required(),
  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n");
  }.property("marks.@each.d3Code")
});

export default Ember.Route.extend({
  model: function() {
    var table =  Table.create({
      rows: [
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
