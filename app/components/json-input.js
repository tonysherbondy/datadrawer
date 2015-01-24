import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['json-input'],
  jsonOutput: function(key, value) {
    if (arguments.length === 1) {
      try {
        return JSON.parse(this.get('jsonInput'));
      }
      catch (err) {
        return {};
      }
    }
  }.property('jsonInput')
});
