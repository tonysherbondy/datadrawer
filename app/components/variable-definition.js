import Ember from 'ember';
import layout from 'tukey/templates/components/variable-definition';
import {Environment} from 'tukey/objects/variable';

export default Ember.Component.extend({
  layout: layout,
  classNames: ['variable-definition'],
  environment: function() {
    return Environment.defaultEnvironment;
  }.property()
});
