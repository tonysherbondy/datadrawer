import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ["isCurrent"],
  hasSubInstructions: Ember.computed.gt("instruction.subInstructions.length", 0),
  isCurrent: function() {
    return this.get("currentInstruction") === this.get("instruction");
  }.property("instruction", "currentInstruction"),

  click: function(event) {
    this.sendAction("setParentCurrentInstruction", this.get("instruction"));
    event.preventDefault();
  },

  actions: {
    setCurrentInstruction: function(instruction) {
      this.sendAction("setParentCurrentInstruction", instruction);
    }
  }

});
