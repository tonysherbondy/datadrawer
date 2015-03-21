import Ember from 'ember';
import layout from 'tukey/components/variable-pill';

var VariablePill = Ember.Component.extend({
  layout: layout,
  tagName: 'span',
  classNames: ['variable-pill'],
  attributeBindings: ['contenteditable', 'draggable', 'data-variable-id'],
  contenteditable: 'false',
  draggable: 'true',
  'data-variable-id': Ember.computed.alias('variable.id'),
  isRenaming: false,

  dragStart: function(event) {
    event.dataTransfer.setData('text/html',
      `${this.$()[0].outerHTML}&nbsp;` +
      `<span id="${VariablePill.cursorLocationId}"></span>`);
  },

  doubleClick: function() {
    console.log('hello');
    this.set('isRenaming', true);
  },

  focusOut: function() {
    this.set('isRenaming', false);
  }
});

VariablePill.reopenClass({
  cursorLocationId: 'cursorLocation'
});

export default VariablePill;
