import Ember from 'ember';
import Environment from 'tukey/models/environment';

export default Ember.Component.extend({
  tagName: 'tr',

  isMouseOver: false,
  hasFocus: false,
  shouldShowEditor: Ember.computed.or('isMouseOver', 'hasFocus'),
  environment: function() {
    return Environment.defaultEnvironment;
  }.property(),

  focusIn: function() {
    this.set('hasFocus', true);
  },

  focusOut: function() {
    this.set('hasFocus', false);
  },

  mouseEnter: function() {
    this.set('isMouseOver', true);
  },

  mouseLeave: function() {
    this.set('isMouseOver', false);
  }
});
