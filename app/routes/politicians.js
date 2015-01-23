import Ember from 'ember';

export default Ember.Route.extend({
  templateName: 'pivot',

  // TODO Make this just an ember object with payload
  // TODO Tree component will just know about pivot and feed it
  // data
  model: function() {
    return Ember.$.get('api/politicians').then(function(data) {
      var politicians = data.politicians;
      var keys = Ember.keys(politicians[0]);
      return {
        data: politicians,
        keys: keys
      };
    });
  }
});
