import Ember from 'ember';
import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  variable: DS.belongsTo('variable'),

  value: Ember.computed.alias('variable.value')
});
