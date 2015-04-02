import DS from 'ember-data';

export default DS.Model.extend({

  instructionTree: DS.belongsTo('instruction', {async: true}),
  scalars: DS.hasMany('variable', {async: true}),
  table: DS.belongsTo('table', {async: true}),

  // is either set to instructionTree or some sub-tree
  currentInstruction: function(k,v) {
    if (arguments.length === 1) {
      return this.get('instructionTree');
    } else {
      if (v === null) {
        // Setting to null just sets to instruction tree root
        return this.get('instructionTree');
      }
      return v;
    }
  }.property('instructionTree'),

  // The instruction description is a hash that changes if we need to render
  d3Code: function() {
    // Have to access these values to continue to be able to listen
    this.get('currentInstruction.description');
    //console.log('description', this.get('currentInstruction.description'));
    var marks = this.get('currentInstruction.marks');
    this.updateMarkVariablesEnvironment(marks);
    return marks.getEach('d3Code').join('\n\n');
  }.property('currentInstruction.description'),

  updateMarkVariablesEnvironment: function(marks) {
    // Anytime d3Code changes we will change the value of the mark variables in the environment
    this.get('currentInstruction.content').getVariableListFromMarks(marks);
  }

});
