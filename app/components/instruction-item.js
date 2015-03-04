import Ember from "ember";

export default Ember.Component.extend({

  operations: ["draw", "modify", "loop"],
  selectedOperation: "loop",
  isDrawOp: Ember.computed.equal("selectedOperation", "draw"),
  isModifyOp: Ember.computed.equal("selectedOperation", "modify"),
  isLoopOp: Ember.computed.equal("selectedOperation", "loop"),

  loopStart: 1,
  loopEnd: 4,
  loopStep: 1,
  loopOver: function() {
    return `from ${this.get('loopStart')} to ${this.get('loopEnd')} by ${this.get('loopStep')}`;
  }.property('loopStart', 'loopEnd', 'loopStep'),

  marks: ["rect", "circle"],
  selectedMark: "rect",

  // TODO there needs to be a component for each mark responsible for this
  properties: ["width", "height", "top", "left", "fill"],
  selectedProperty: "width",
  selectedProeprtyValue: 0

});
