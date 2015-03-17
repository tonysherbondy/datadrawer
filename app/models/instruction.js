import Ember from "ember";

export default Ember.Object.extend({
  operation: null,

  parentInstruction: null,
  subInstructions: function() {
    return [];
  }.property(),

  addSubInstruction: function(instruction) {
    this.get("subInstructions").pushObject(instruction);
    instruction.set("parentInstruction", this);
  },

  flattenedList: function() {
    var ret = [];
    ret.pushObject(this);
    this.get('subInstructions').mapBy('flattenedList').forEach(function (instructionList) {
      ret.pushObjects(instructionList);
    });
    return ret;
  }.property('subInstructions.@each.flattenedList'),

  availableLoopVariables: function() {
    if (this.get("operation") === "root") {
      return [];
    }

    var ret = [];
    ret.pushObjects(this.get("parentInstruction.availableLoopVariables"));

    if (this.get("operation") === "loop") {
      ret.pushObject(this.get("loopVariable"));
    }

    return ret;
  }.property("parentInstruction.availableLoopVariables", "operation", "loopVariable"),

  loopVariable: function() {
    return this.get("loopData.name");
  }.property("loopData.name")
});
