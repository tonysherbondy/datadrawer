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

  selectedOperation: "loop",
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
  selectedMark: "rect",

  // TODO there needs to be a component for each mark responsible for this
  properties: ["width", "height", "top", "left", "fill"],
  selectedProperty: "width",
  selectedProeprtyValue: 0

});
