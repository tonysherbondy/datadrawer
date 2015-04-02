import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  variable: DS.belongsTo('variable'),
  definition: Ember.computed.alias('variable.definition'),
  value: Ember.computed.alias('variable.value')
});
