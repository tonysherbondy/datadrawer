import Ember from 'ember';
import Expression from "tukey/models/expression";
var e = Expression.e;

export default Ember.Component.extend({
  tagName: 'span',
  classNames: ['instruction-attr'],

  updateAttrs: function(value) {
    var instruction = this.get("instruction");
    var attrs = Ember.merge({}, instruction.get("attrs"));
    // Update attrs with new value
    attrs[this.get("attr.name")] = e(value);
    this.set("instruction.attrs", attrs);
  },

  actions: {
    editAttrValue: function(value) {
      this.updateAttrs(value);
    }
  }
});
