import DS from 'ember-data';
import {isString} from 'tukey/utils/common';

export default DS.Model.extend({
  stringFragment: DS.attr('string'),
  variableFragment: DS.belongsTo('variable'),

  payload: function(key, value) {
    if (arguments.length > 1) {
      if (isString(value)) {
        this.set('stringFragment', value);
        this.set('variableFragment', null);
      } else {
        this.set('stringFragment', null);
        this.set('variableFragment', value);
      }
      return value;
    }
    return this.get('stringFragment') || this.get('variableFragment');
  }.property('stringFragment', 'variableFragment')

});
