import Ember from 'ember';
import Environment from 'tukey/models/environment';
var v = Environment.v;

export default Ember.Component.extend({
  classNames: ['victor-data-panel'],

  scalars: Ember.computed.alias('model.scalars'),

  table: Ember.computed.alias('model.table'),


  columns: Ember.computed.alias('table.columns'),
  numberOfColumns: Ember.computed.alias('columns.length'),
  tableHeaders: function() {
    var headers = this.get('columns').map((col, index) => index);
    return ['Property'].concat(headers);
  }.property('columns'),
  numberOfHeaders: Ember.computed.alias('tableHeaders.length'),

  rowNames: function() {
    return this.get('columns.firstObject.rowNames');
  }.property('columns.firstObject.rowNames.[]'),

  rows: function() {
    var rows = this.get("table.rows");
    return rows.map((row) => {
      var name = row.get("firstObject.name");
      var firstCell = {name: "Property", value: name};
      return [firstCell].concat(row);
    });
  }.property("table.columns.@each.columnHash"),


  actions: {
    updateTable: function() {
      this.get('table').notifyPropertyChange('columns');
      return false;
    },

    addScalar: function() {
      var scalar = v('', 0);
      scalar.set('name', `variable ${scalar.get('id')}`);
      this.get('model').get('scalars').pushObject(scalar);
    },
    addTableRow: function() {
      console.log('add table row');
    }
  }
});
