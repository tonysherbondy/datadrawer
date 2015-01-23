import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'td',

  value: function() {
    return this.get('model')[this.get('column')];
  }.property('model', 'column')
});
