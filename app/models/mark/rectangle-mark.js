import Ember from "ember";
import Mark from "tukey/models/mark/mark";
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Mark.extend({
  type: "rect",

  width: Ember.required(),
  height: Ember.required(),
  top: Ember.required(),
  left: Ember.required(),

  getTransformFromRotation: function(rotation) {
    var top = this.getAttrByName("top").get('value');
    var left = this.getAttrByName("left").get('value');
    var width = this.getAttrByName("width").get('value');
    var height = this.getAttrByName("height").get('value');
    var x = left + width/2;
    var y = top + height/2;
    return this.get('drawInstruction').attributesFromHash({
      transform: v('transform', `translate(${x},${y}) rotate(${rotation}) translate(${-x},${-y})`)
    });
  },

  getControlPoints: function() {
    var top = this.getAttrByName("top").get('value');
    var left = this.getAttrByName("left").get('value');
    var width = this.getAttrByName("width").get('value');
    var height = this.getAttrByName("height").get('value');
    return [
      {name: "top-left", position: [left, top]},
      {name: "bottom-right", position: [left+width, top+height]}
    ];
  },

  getAttrsForControlPoint: function(point) {
    var attrs = {};

    if (point.name === "top-left") {
      attrs.left = v('left', point.position[0]);
      attrs.top = v('top', point.position[1]);
    } else if (point.name === "bottom-right") {
      var width = this.getAttrByName("width").get('value');
      var height = this.getAttrByName("height").get('value');

      attrs.left = v('left', point.position[0] - width);
      attrs.top = v('top', point.position[1] - height);
    }

    return this.get('drawInstruction').attributesFromHash(attrs);
  },

  updateAttrsWithControlPoint: function(point) {
    var leftAttr = this.getAttrByName('left');
    var topAttr = this.getAttrByName('top');

    if (point.name === "top-left") {
      leftAttr.set('variable.definition', point.position[0]);
      topAttr.set('variable.definition', point.position[1]);
    } else if (point.name === "bottom-right") {
      var width = this.getAttrByName("width").get('value');
      var height = this.getAttrByName("height").get('value');

      leftAttr.set('variable.definition', point.position[0] - width);
      topAttr.set('variable.definition', point.position[1] - height);
    }
  },

  attrsMap: [
    {name: "width", d3Name: "width"},
    {name: "height", d3Name: "height"},
    {name: "left", d3Name: "x"},
    {name: "top", d3Name: "y"}
  ]
});
