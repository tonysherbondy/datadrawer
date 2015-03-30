import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'li',
  classNames: ['victor-data-panel-scalar-item'],

  // TODO(Tony) Bring back value sliders but for variables
  //mouseDown: function(e) {
    //let startingValue = this.get('scalar.value');
    //this.valueSlider.set('editingFunc', (moveEvent) => {
      //var distance = e.pageY - moveEvent.pageY;
      //var newValue = Math.round(100 * (startingValue + distance / 10)) / 100;
      //this.set('scalar.value', newValue);
    //});
    //e.preventDefault();
  //}

});
