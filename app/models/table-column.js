import Ember from "ember";

export default Ember.Object.extend({
  column: null,

  cellByName: function(name) {
    return this.get("column").findBy("name", name);
  },

  rowNames: function() {
    return this.get("column").getEach("name");
  }.property('column.@each.{name}'),

  columnHash: function(key, newHash) {
    if (arguments.length === 1) {
      var hash = {};
      this.get('column').forEach((cell) => {
        hash[cell.get("name")] = cell.get("value");
      });
      return hash;
    } else {
        var column = Object.keys(newHash).map((key) => {
          return Ember.Object.create({
            name: key,
            value: newHash[key]
          });
        });
        this.set("column", column);
      return newHash;
    }
  }.property("column.@each.{value,name}")
});
