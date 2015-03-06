import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    var instructions = [{
        operation: "draw",
        mark: "rect"
      }, {
        operation: "set",
        property: "height",
        propertyValue: 50
      }].map(i => Ember.Object.create(i));
    return {
      // Set of instructions to draw
      instructions: instructions
    };
  }
});
