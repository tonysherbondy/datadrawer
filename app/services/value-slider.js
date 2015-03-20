import Ember from 'ember';

export default Ember.Service.extend({
  isEditingValue: function(key, value) {
    if (arguments.length === 1) {
      return this.get('editingFunc') !== null;
    } else {
      console.log('isEditing set to', value);
      return value;
    }
  }.property('editingFunc'),

  editingFunc: null
});
