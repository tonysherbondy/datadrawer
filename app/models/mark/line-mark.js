import Mark from 'tukey/models/mark/mark';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Mark.extend({
  type: "line",

  getControlPoints: function() {
    var x1 = this.getAttrByName("x1").get('value');
    var y1 = this.getAttrByName("y1").get('value');
    var x2 = this.getAttrByName("x2").get('value');
    var y2 = this.getAttrByName("y2").get('value');

    return [
      {name: "first", position: [x1, y1]},
      {name: "second", position: [x2, y2]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    var attrs = {};

    var x = point.position[0];
    var y = point.position[1];

    if (point.name === "first") {
      attrs.x1 = v('x1', x);
      attrs.y1 = v('y1', y);
    } else if (point.name === "second") {
      attrs.x2 = v('x2', x);
      attrs.y2 = v('y2', y);
    }

    return this.get('drawInstruction').attributesFromHash(attrs);
  },

  updateAttrsWithControlPoint: function(point) {

    var xName, yName;
    if (point.name === "first") {
      xName = 'x1';
      yName = 'y1';
    } else if (point.name === "second") {
      xName = 'x2';
      yName = 'y2';
    }

    this.getAttrByName(xName).set('variable.definition', point.position[0]);
    this.getAttrByName(yName).set('variable.definition', point.position[1]);
  },

  attrsMap: [
    {name: "x1", d3Name: "x1"},
    {name: "y1", d3Name: "y1"},
    {name: "x2", d3Name: "x2"},
    {name: "y2", d3Name: "y2"}
  ]
});
