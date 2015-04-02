import Ember from 'ember';

export default Ember.Component.extend({
  operation: Ember.computed.alias("instruction.operation"),
  mark: Ember.computed.alias("instruction.mark"),
  attrs: Ember.computed.alias("instruction.attrs"),

  isLoop: Ember.computed.equal("operation", "loop"),
  isDraw: Ember.computed.equal("operation", "draw"),

  displayableAttrs: function() {
    // we won't have any attrs for loops or root
    if (!this.get("instruction.attrs")) {
      return [];
    }

    // TODO: we may will want to do filter out some of these
    // probably want to move this 'displayable attrs' thing to
    // the instruction level
    return this.get('attrs').getEach('variable');
  }.property("attrs"),

  markVariables: Ember.computed.alias('instruction.markVariables'),

  attrsText: function() {
    return this.get("displayableAttrs").map((attr) => {
      return `${attr.get("name")}: ${attr.get("stringRepresentation")}`;
    }).join(", ");
  }.property("displayableAttrs")

});
