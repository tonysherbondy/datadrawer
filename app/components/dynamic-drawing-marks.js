import Ember from 'ember';

export default Ember.Component.extend({

  valueSlider: Ember.inject.service('value-slider'),

  mouseUp: function() {
    this.valueSlider.set('isEditingValue', false);
  },

  mouseMove: function(e) {
    if (this.valueSlider.get('isEditingValue')) {
      this.valueSlider.get('editingFunc')(e);
    }
  }

});
