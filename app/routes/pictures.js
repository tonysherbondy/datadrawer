import Ember from 'ember';
import Environment from 'tukey/models/environment';

export default Ember.Route.extend({
  model: function() {
    Environment.defaultEnvironment.set('store', this.store);
    return this.get("store").find("picture");
  },

  afterModel: function() {
    var store = this.get("store");
    return Ember.RSVP.all([
      store.find('fragment'),
      store.find('expression'),
      store.find('variable'),
      store.find('attribute'),
      store.find('instruction'),
      store.find('table'),
      store.find('tableColumn'),
      store.find('tableCell')
    ]).then((data) => {
      // Load all variables into the environment
      var variables = data[2];
      variables.forEach((variable) => {
        Environment.defaultEnvironment.addVariable(variable);
      });
      return data;
    });
  }
});
