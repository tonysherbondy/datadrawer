import Ember from 'ember';

export default Ember.Component.extend({
  rows: Ember.computed.alias('model'),
  columns: function() {
    var row = this.get('rows.firstObject') || {};
    return Ember.keys(row);
  }.property('rows.firstObject')
});
