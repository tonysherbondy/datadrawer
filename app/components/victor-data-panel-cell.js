import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'td',
  classNames: ['victor-data-panel-cell'],

  valueSlider: Ember.inject.service('value-slider'),

  mouseDown: function(e) {
    console.log('starting value editing');
    this.valueSlider.set('editingFunc', (moveEvent) => {
      var distance = e.pageY - moveEvent.pageY;
      this.set('cellValue', this.get('cellValue') + distance / 10);
    });
    e.preventDefault();
  },

  cellValue: function(key, value) {
    if (arguments.length === 1) {
      return this.get('column.value');
    } else {
      console.log('setting');
      let rowName = this.get('row.firstObject.value');
      let columnIndex = this.get('column.index');
      let columns = this.get('table.columns');
      columns.objectAt(columnIndex).set(rowName, value);
      this.get('table').notifyPropertyChange('columns');
      return value;
    }
  }.property('column')

});
