import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    addInstruction: function() {
      this.get('instructions').pushObject({operation: 'draw'});
    }
  }
});
