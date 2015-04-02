import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  variable: DS.belongsTo('variable'),
  definitionString: Ember.computed.alias('variable.definition.jsString'),
  value: Ember.computed.alias('variable.value')
});
