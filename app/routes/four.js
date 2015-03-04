import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return {
      // Set of instructions to draw
      instructions: []
    };
  }
});
