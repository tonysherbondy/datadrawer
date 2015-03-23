import DS from 'ember-data';

export default DS.Model.extend({
  tableColumn: DS.belongsTo('tableColumn', { inverse: 'cells' }),
  name: DS.attr('string'),
  value: DS.attr('string')
});
