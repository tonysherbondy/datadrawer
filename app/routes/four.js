import Ember from 'ember';
import Instruction from '../models/instruction';

export default Ember.Route.extend({
  model: function() {
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

    var drawOp = Instruction.create({
        operation: "draw",
        mark: "rect",
        markId: 1
    });
    var setOp = Instruction.create({
        operation: "set",
        property: "height",
        propertyValue: 50,
    });

    drawOp.addSubInstruction(setOp);

    var root = Instruction.create({
        operation: "root",
    });

    root.addSubInstruction(drawOp);

    return {
      // Set of instructions to draw
      //instructions: [drawOp, setOp]
      dataItems: [scalarItem, vectorItem],
      rootInstruction: root
    };
  }
});
