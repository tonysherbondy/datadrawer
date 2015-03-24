import Ember from 'ember';

var Attribute = Ember.Object.extend({
  name: Ember.required(),
  variable: Ember.required(),
  value: Ember.computed.alias('variable.value')
});

Attribute.reopenClass({
  attributesFromHash: function(attrsHash) {
    return Object.keys(attrsHash).map((attrName) => {
      return Attribute.create({
        name: attrName,
        variable: attrsHash[attrName]
      });
    });
  }
});

export default Attribute;
