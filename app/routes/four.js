import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var drawOp = Ember.Object.create({
        operation: "draw",
        mark: "rect",
        markId: 1
    });
    var setOp = Ember.Object.create({
        operation: "set",
        drawParent: drawOp,
        property: "height",
        propertyValue: 50
    });
    return {
      // Set of instructions to draw
      //instructions: [drawOp, setOp]
      instructions: [drawOp]
    };
  }
});
