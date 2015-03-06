import Ember from 'ember';

export default Ember.Component.extend({
  // Compiled d3 from instruction list
  d3Instructions: function() {
    // TODO probably have to do @each on operation, mark, etc.
    //
    // For now assume we can compile each instruction independently
    var theCode = this.get('instructions').map( instruction => {

      if (instruction.operation === 'draw') {
        // assume context is the correct selection
        var initAttrs = this.getDrawAttrs(instruction);
        return `context.append('${instruction.mark}').attr(${initAttrs});`;
      } else if (instruction.operation === 'set') {
        return "";
      } else {
        console.log("Don't know this instruction");
        return "";
      }
    }).join('\n');
    return theCode;

  }.property('instructions.[]', 'instructions.@each.mark'),

  getDrawAttrs: function(instruction) {
    switch (instruction.mark) {
      case "rect":
        return "{width: 100, height: 100, opacity: 0.3}";
      case "circle":
        return "{cx: 50, cy: 50, r: 50, opacity: 0.3}";
      case "line":
        return "{x1: 0, y1: 0, x2: 100, y2: 100, opacity: 0.3, stroke: 'black', 'stroke-width': 2}";
      default:
        return "";
    }
  },

  d3CodeText: function(key, value) {
    if (arguments.length === 1) {
      return this.get('d3Instructions');
    } else {
      return value;
    }
  }.property('d3Instructions')

});
