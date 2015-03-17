import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['data-panel'],
  actions: {
    addDataItem: function() {
      var name = `variable${this.get('dataItems.length')}`;
      this.get('dataItems').pushObject(Ember.Object.create({
        name: name,
        type: "scalar",
        value: 17
      }));
    }
  }
});
