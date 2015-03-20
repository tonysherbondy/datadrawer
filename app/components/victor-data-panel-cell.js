import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'td',
  classNames: ['victor-data-panel-cell'],

  valueSlider: Ember.inject.service('value-slider'),

  mouseDown: function(e) {
    console.log('starting value editing');
    let startingValue = this.get('cellValue');
    let editTable = this.curriedEditingFunc();
    this.valueSlider.set('editingFunc', (moveEvent) => {
      var distance = e.pageY - moveEvent.pageY;
      var newValue = startingValue + distance / 10;
      editTable(newValue);
    });
    e.preventDefault();
  },

  cellValue: Ember.computed.alias('column.value'),

  curriedEditingFunc: function() {
    let rowName = this.get('row.firstObject.value');
    let columnIndex = this.get('column.index');
    let table = this.get('table');
    return function(value) {
      table.get('columns').objectAt(columnIndex).set(rowName, value);
      table.notifyPropertyChange('columns');
    };
  }
});
