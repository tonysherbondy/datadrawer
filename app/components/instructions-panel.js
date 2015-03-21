import Ember from 'ember';

export default Ember.Component.extend({

  instructions: function() {
    return this.get("rootInstruction.flattenedList").filter(function(instruction) {
      return instruction.get("operation") !== "root";
    });
  }.property("rootInstruction.flattenedList"),

  hiddenRoot: Ember.computed.equal("rootInstruction.operation", "root"),

  printTree: function(root, indentLevel, index) {
    var line = "";
    for (var i = 0; i < indentLevel; ++i) {
      line += '----';
    }
    line += `${root.operation} ${index}`;
    console.log(line);

    var self = this;
    root.get("subInstructions").forEach(function(instruction, index) {
      self.printTree(instruction, indentLevel + 1, index);
    });
  }
});
