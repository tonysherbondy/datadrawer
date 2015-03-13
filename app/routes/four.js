import Ember from 'ember';
import Instruction from '../models/instruction';

export default Ember.Route.extend({
  model: function() {
    var drawOp = Instruction.create({
        operation: "draw",
        mark: "rect",
        markId: 1
    });
    var setOp = Instruction.create({
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
      rootInstruction: Instruction.create({
        operation: "root",
        subInstructions: [drawOp, setOp]
      }),
      lastInstruction: setOp
    };
  }
});
