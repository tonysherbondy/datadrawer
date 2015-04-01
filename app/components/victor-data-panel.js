import Ember from 'ember';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Ember.Component.extend({
  classNames: ['victor-data-panel'],

  scalars: Ember.computed.alias('model.scalars'),

  table: Ember.computed.alias('model.table'),

  tableHeaders: function() {
    var ret = ['Hello'];
    for (var i = 0; i < this.get('table.numColumns'); ++i) {
      ret.push(`${i}`);
    }
    return ret;
  }.property('table.numColumns'),

  numberOfHeaders: Ember.computed.alias('tableHeaders.length'),

  actions: {
    addScalar: function() {
      var scalar = v('', 0);
      scalar.set('name', `variable ${scalar.get('id')}`);
      this.get('model.scalars').pushObject(scalar);
    },

    addTableRow: function() {
      var vector = v('', []);
      vector.set('name', `row ${vector.get('id')}`);
      this.get('model.table.rows').pushObject(vector);
    }
  }
});
