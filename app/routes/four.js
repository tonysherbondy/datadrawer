import Ember from "ember";
import Instruction from "tukey/models/instruction";

export default Ember.Route.extend({
  model: function() {
    var scalarItem = Ember.Object.create({
      name: "years",
      type: "scalar",
      value: 10
    });

    var indicesVectorItem = Ember.Object.create({
      name: "indices",
      type: "vector",
      value: [0, 60, 120, 180, 240, 300]
    });

    var agesVectorItem = Ember.Object.create({
      name: "ages",
      type: "vector",
      value: [21, 14, 25, 17, 49, 30]
    });

    var loopOp = Instruction.create({
        operation: "loop",
        loopData: indicesVectorItem
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

    loopOp.addSubInstruction(drawOp);
    drawOp.addSubInstruction(setOp);

    var root = Instruction.create({
        operation: "root",
    });

    root.addSubInstruction(loopOp);

    return {
      dataItems: [scalarItem, indicesVectorItem, agesVectorItem],
      rootInstruction: root
    };
  }
});
