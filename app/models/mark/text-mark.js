import Ember from 'ember';
import Mark from 'tukey/models/mark/mark';
import {Environment} from 'tukey/objects/variable';
import Attribute from 'tukey/objects/attribute';
var v = Environment.v;

export default Mark.extend({
  type: "text",

  x: Ember.required(),
  y: Ember.required(),
  text: Ember.required(),

  getTransformFromRotation: function(rotation) {
    var x = this.getAttrByName('x').get('value');
    var y = this.getAttrByName('y').get('value');
    return Attribute.attributesFromHash({
      transform: v('transform', `translate(${x},${y}) rotate(${rotation}) translate(${-x},${-y})`)
    });
  },

  getControlPoints: function() {
    var x = this.getAttrByName('x').get('value');
    var y = this.getAttrByName('y').get('value');
    return [
      {name: "point", position: [x, y]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    return Attribute.attributesFromHash({
      x: v('x', point.position[0]),
      y: v('y', point.position[1])
    });
  },

  updateAttrsWithControlPoint: function(point) {
    this.getAttrByName('x').set('variable.definition', point.position[0]);
    this.getAttrByName('y').set('variable.definition', point.position[1]);
  },

  attrsMap: [
    {name: "x", d3Name: "x"},
    {name: "y", d3Name: "y"},
    {name: "text", d3Name: "text"},
    {name: "textAnchor", d3Name: "text-anchor"},
    {name: "fontSize", d3Name: "font-size"},
    {name: "fontFamily", d3Name: "font-family"}
  ]
});
