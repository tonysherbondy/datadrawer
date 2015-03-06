import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    addInstruction: function() {
      this.get('instructions').pushObject(Ember.Object.create({operation: 'draw'}));
    }
  }
});
