import Ember from "ember";

export default Ember.Object.extend({
  operation: null,

  subInstructions: Ember.computed(function() { return []; }),

  addSubInstruction: function(instruction) {
    this.get("subInstructions").pushObject(instruction);
  },

  flattenedList: function() {
    var ret = [];
    ret.pushObject(this);
    this.get('subInstructions').mapBy('flattenedList').forEach(function (instructionList) {
      ret.pushObjects(instructionList);
    });
    return ret;
  }.property('subInstructions.@each.flattenedList')
  
});
