import Ember from 'ember';

export default Ember.Component.extend({
  // Compiled d3 from instruction list
  d3Code: function() {
    // TODO probably have to do @each on operation, mark, etc.
    //
    // For now assume we can compile each instruction independently
    var theCode = this.get('instructions').map( () => {
      // assume context is the correct selection
      return "context.append('rect').attr('width', 100).attr('height', 100);";
    }).join('\n');
    return theCode;
  }.property('instructions.[]'),

  d3CodeText: function(key, value) {
    if (arguments.length === 1) {
      return this.get('d3Code');
    } else {
      return value;
    }
  }.property('d3Code')

});
