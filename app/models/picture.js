import DS from 'ember-data';

export default DS.Model.extend({

  instructionTree: DS.belongsTo('instruction', {async: true}),
  scalars: DS.hasMany('variable', {async: true}),
  table: DS.belongsTo('table', {async: true}),

  currentInstruction: null,

  // TODO Only need to do this right now because of the way that I am modifying
  // the marks returned from the draw step in a loop step, if I just copied marks
  // and modified those copies we'd be fine without
  dirtyMarks: function() {
    console.log('dirty marks');
    function notifyAllMarks(instruction) {
      instruction.notifyPropertyChange("marks");
      instruction.get("subInstructions").forEach(notifyAllMarks);
    }
    notifyAllMarks(this.get("instructionTree"));
  }.observes("currentInstruction"),

  marks: function() {
    console.log('marks');
    var currentInstruction = this.get("currentInstruction");
    if (currentInstruction) {
      return currentInstruction.get("marks");
    }
    return this.get("instructionTree.marks");
  }.property("instructionTree.marks", "currentInstruction", "currentInstruction.marks"),

  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n\n");
    // TODO this probably should depend on mark attributes which should also be ember objects
  }.property("marks.[]", "marks.@each.d3Code")
});
