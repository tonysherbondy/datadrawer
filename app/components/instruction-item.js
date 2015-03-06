import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['list-group-item'],

  operations: [{
    value: "draw",
    label: "Draw"
  }, {
    value: "set",
    label: "Set"
  }, {
    value: "loop",
    label: "Loop"
  }],

  selectedOperation: Ember.computed.alias("instruction.operation"),
  isDrawOp: Ember.computed.equal("selectedOperation", "draw"),
  isModifyOp: Ember.computed.equal("selectedOperation", "set"),
  isLoopOp: Ember.computed.equal("selectedOperation", "loop"),

  loopStart: 1,
  loopEnd: 4,
  loopStep: 1,
  loopOver: function() {
    return `from ${this.get('loopStart')} to ${this.get('loopEnd')} by ${this.get('loopStep')}`;
  }.property('loopStart', 'loopEnd', 'loopStep'),

  marks: ["rect", "circle", "line"],
  selectedMark: Ember.computed.alias("instruction.mark"),

  // TODO there needs to be an object for each
  properties: ["width", "height", "top", "left", "fill"],
  selectedProperty: Ember.computed.alias("instruction.property"),
  selectedPropertyValue: Ember.computed.alias("instruction.propertyValue")

});
