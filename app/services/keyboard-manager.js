import Ember from 'ember';

export default Ember.Service.extend({
  componentHoldingKeyboard: null,
  isKeyboardHeld: Ember.computed.notEmpty("componentHoldingKeyboard")
});
