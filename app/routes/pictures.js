import Ember from 'ember';

export default Ember.Route.extend({
  model: function() {
    return this.get("store").find("picture");
  },

  afterModel: function() {
    var store = this.get("store");
    return Ember.RSVP.all([
      store.find("instruction"),
      store.find("table"),
      store.find("tableColumn"),
      store.find("tableCell")
    ]);
  }
});
