import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'td',

  value: function() {
    return this.get('model')[this.get('column')];
  }.property('model', 'column'),

  isURL: function() {
    return /^http.+/.test(this.get('value'));
  }.property('value'),

  isImage: function() {
    return /^http.+(\.jpg|\.png|\.jpeg|\.gif)$/.test(this.get('value'));
  }.property('value')
});
