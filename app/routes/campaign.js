import Ember from 'ember';

export default Ember.Route.extend({
  templateName: 'json-explorer',

  // TODO Make this just an ember object with payload
  // TODO Tree component will just know about pivot and feed it
  // data
  model: function() {
    return Ember.$.get('api/airprprofiles/12');
  }
});
