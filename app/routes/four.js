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

    var scalarItem = Ember.Object.create({
      name: "years",
      type: "scalar",
      value: 10
    });

    var vectorItem = Ember.Object.create({
      name: "ages",
      type: "vector",
      value: [21, 14, 25, 17, 49, 30]
    });

    return {
      // Set of instructions to draw
      //instructions: [drawOp, setOp]
      dataItems: [scalarItem, vectorItem],
      instructions: [drawOp]
    };
  }
});
