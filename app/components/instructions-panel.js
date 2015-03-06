import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    addInstruction: function() {
      // Find last draw
      var instructions = this.get('instructions');
      var lastDraw = instructions.filterBy("operation", "draw").get("lastObject");
      var newInstruction;
      if (lastDraw) {
        newInstruction = {
          operation: "set",
          drawParent: lastDraw
        };
      } else {
        newInstruction = {
          operation: "draw"
        };
      }
      instructions.pushObject(Ember.Object.create(newInstruction));
    }
  }
});
