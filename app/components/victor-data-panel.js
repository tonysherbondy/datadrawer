import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['victor-data-panel'],

  columns: Ember.computed.alias('table.columns'),
  numberOfColumns: Ember.computed.alias('columns.length'),

  rowNames: function() {
    return Object.keys(this.get('columns.firstObject'));
  }.property('columns.firstObject'),

  rows: function() {
    var names = this.get('rowNames');
    var columns = this.get('columns');
    return names.map((name) => {
      return columns.reduce((prev, item, index) => {
        return prev.concat({value: item[name], index: index});
      }, [{value: name, index: 'property'}]);
    });
  }.property('rowNames', 'columns'),

  numberOfHeaders: Ember.computed.alias('tableHeaders.length'),
  tableHeaders: function() {
    var headers = this.get('columns').map((col, index) => index);
    return ['Property'].concat(headers);
  }.property('columns'),

  actions: {
    updateTable: function() {
      this.get('table').notifyPropertyChange('columns');
      return false;
    },

    addScalar: function() {
      console.log('add scalar');
    },
    addTableRow: function() {
      console.log('add table row');
    },
    beginValueEditing: function() {
      console.log('hello');
      this.sendAction('beginValueEditing');
    }
  }
});
