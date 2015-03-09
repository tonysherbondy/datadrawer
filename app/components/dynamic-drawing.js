import Ember from 'ember';

export default Ember.Component.extend({

  // Compiled d3 from instruction list
  d3Instructions: function() {
    // For now assume we can compile each instruction independently
    var theCode = this.get('instructions').map( instruction => {

      switch (instruction.get("operation")) {
        case "draw":
          // assume context is the correct selection
          var initAttrs = JSON.stringify(this.getDrawAttrs(instruction));
          var drawMark = `context = this.selectChart().append('${instruction.get('mark')}').attr(${initAttrs});`;

          var listeners = `context.on('click', function() { self.selectMark(${instruction.get('markId')}); });`;
          return ["var context;", "var self = this;", drawMark, listeners].join("\n");
        case "set":
          return `context.attr('${instruction.get('property')}', ${instruction.get('propertyValue')});`;
        case "loop":
          //return `context = this.selectChart().select('${loopMarkID}').data(${loopData})`;
          return "";
        default:
          console.log("Don't know this instruction");
          return "";
      }

    }).join("\n");
    return theCode;

  }.property('instructions.[]', 'instructions.@each.mark', 'instructions.@each.operation',
             //'instructions.@each.{mark,property,propertyValue}'
            'instructions.@each.property', 'instructions.@each.propertyValue'),

  getDrawAttrs: function(instruction) {
    switch (instruction.mark) {
      case "rect":
        return {x: 20, y: 20, width: 100, height: 100, opacity: 0.3};
      case "circle":
        return {cx: 50, cy: 50, r: 50, opacity: 0.3};
      case "line":
        return {x1: 0, y1: 0, x2: 100, y2: 100, opacity: 0.3, stroke: 'black', 'stroke-width': 2};
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
  }.property('d3Instructions'),

  controlPoints: function() {
    // TODO this seems like there is an obvious object representation for shape where
    // this would be stored
    // returns a list of objects with markId, mark, & control points

    var points = this.get('instructions').reduce( (prev, instruction) => {
      var lastMark = prev.get('lastObject');
      var operation = instruction.get('operation');
      if (operation === "draw") {
        var points = {
          markId: instruction.get('markId'),
          mark: instruction.get('mark')
        };
        switch (instruction.get('mark')) {
          case 'rect':
            let {x, y, width, height} = this.getDrawAttrs(instruction);
            points.topLeft = [x, y];
            points.topRight = [x + width, y];
            points.bottomLeft = [x, y + height];
            points.bottomRight = [x + width, y + height];
            break;
          case 'line':
            let {x1, y1, x2, y2} = this.getDrawAttrs(instruction);
            points.first = [x1, y1];
            points.second = [x2, y2];
            break;
          case 'circle':
            break;
        }
        return prev.concat([points]);
      } else if (operation === "set" && lastMark) {
        // TODO Change lastMark's points
        // temporary placeholder so it doesn't crash
        return prev;
      }
    },[]);
    return points;
  }.property('instructions.[]', 'instructions.@each.mark', 'instructions.@each.operation',
             //'instructions.@each.{mark,property,propertyValue}'
            'instructions.@each.property', 'instructions.@each.propertyValue'),

});
