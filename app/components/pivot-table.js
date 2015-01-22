import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['pivot-table'],
  didInsertElement: function() {
    // TODO(Tony): Wait until model isFulfilled and then render once
    var model = this.get('model');
    var keys = this.get('keys');
    Ember.$('#' + this.get('elementId')).pivotUI(
      model,
      {
        rows: [keys[0]],
        cols: [keys[1]]
      }
    );
  }
});
