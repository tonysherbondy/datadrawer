import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    addInstruction: function() {
      console.log('add instruction');
      this.get('instructions').pushObject({operation: 'draw'});
    }
  }
});
