import Ember from "ember";

export default Ember.Component.extend({
  tagName: 'li',
  classNameBindings: ["isCurrent"],
  hasSubInstructions: Ember.computed.gt("instruction.subInstructions.length", 0),
  isCurrent: function() {
    return this.get("currentInstruction") === this.get("instruction");
  }.property("instruction", "currentInstruction"),

  click: function(event) {
    // Don't select the instruction if we clicked in the expression editor
    if (!Ember.$(event.target).hasClass('expression-editor')) {
      this.sendAction("setParentCurrentInstruction", this.get("instruction"));
    }
    event.preventDefault();
    return false;
  },

  actions: {
    setCurrentInstruction: function(instruction) {
      this.sendAction("setParentCurrentInstruction", instruction);
    },
    removeInstruction: function() {
      var instruction = this.get("instruction");
      var parent = instruction.get("parentInstruction");
      instruction.removeInstruction();
      if (instruction.get("operation") === "loop") {
        // promote loop children
        var add = parent.addSubInstruction.bind(parent);
        instruction.get("subInstructions").forEach(add);
      }
      return false;
    }
  }

});
