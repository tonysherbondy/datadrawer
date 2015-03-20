import Ember from 'ember';

export default Ember.Service.extend({
  isEditingValue: function(key, value) {
    if (arguments.length === 1) {
      return this.get('editingFunc') !== null;
    } else {
      this.set('editingFunc', null);
      return value;
    }
  }.property('editingFunc'),

  editingFunc: null
});
