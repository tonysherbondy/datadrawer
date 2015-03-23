import Ember from "ember";
import DS from 'ember-data';

export default DS.Model.extend({
  table: DS.belongsTo('table', {inverse: 'columns'}),
  cells: DS.hasMany('tableCell'),

  cellByName: function(name) {
    return this.get("cells").findBy("name", name);
  },

  rowNames: function() {
    return this.get("cells").getEach("name");
  }.property('cells.@each.{name}'),

  columnHash: function() {
    var hash = {};
    this.get('cells').forEach((cell) => {
      hash[cell.get("name")] = cell.get("value");
    });
    return hash;
  }.property("cells.@each.{value,name}")
});
