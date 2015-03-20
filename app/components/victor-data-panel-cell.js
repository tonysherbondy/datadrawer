import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'td',
  classNames: ['victor-data-panel-cell'],

  mouseDown: function(e) {
    let cell = this.get("cell");
    let startingValue = cell.get("value");
    this.valueSlider.set('editingFunc', (moveEvent) => {
      var distance = e.pageY - moveEvent.pageY;
      var newValue = Math.round(100 * (startingValue + distance / 10)) / 100;
      cell.set("value", newValue);
    });
    e.preventDefault();
  }
});
