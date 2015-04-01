import DS from 'ember-data';
import Environment from 'tukey/models/environment';

export default DS.Model.extend({

  instructionTree: DS.belongsTo('instruction', {async: true}),
  scalars: DS.hasMany('variable', {async: true}),
  table: DS.belongsTo('table', {async: true}),

  currentInstruction: null,

  // TODO Only need to do this right now because of the way that I am modifying
  // the marks returned from the draw step in a loop step, if I just copied marks
  // and modified those copies we'd be fine without
  dirtyMarks: function() {
    function notifyAllMarks(instruction) {
      instruction.notifyPropertyChange("marks");
      instruction.get("subInstructions").forEach(notifyAllMarks);
    }
    notifyAllMarks(this.get("instructionTree"));
  }.observes("currentInstruction"),

  marks: function() {
    var currentInstruction = this.get("currentInstruction");
    if (currentInstruction) {
      return currentInstruction.get("marks");
    }
    return this.get("instructionTree.marks");
  }.property("instructionTree.marks", "currentInstruction", "currentInstruction.marks"),

  d3Code: function() {
    return this.get("marks").getEach("d3Code").join("\n\n");
    // TODO this probably should depend on mark attributes which should also be ember objects
  }.property("marks.[]", "marks.@each.d3Code"),

  updateMarkVariablesEnvironment: function() {
    // Anytime d3Code changes we will change the value of the mark variables in the environment

    // For each mark
    this.get('marks').forEach((mark) => {
      // For each control point of mark
      var markName = mark.get('name');
      mark.getControlPoints().forEach((point) => {
        // Create or update variable with var_markName_nameControlPoint
        var pointName = point.name;
        // Check for x and y
        ['x', 'y'].forEach((axis, index) => {
          var variableName = `${markName}_${pointName}_${axis}`;
          var variable = Environment.defaultEnvironment.getVariableByName(variableName);
          // TODO make point type or at least make it an object
          var axisPosition = point.position[index];
          if (!variable) {
            // Don't really need variable just needed to add it to environment
            variable = Environment.v(variableName, axisPosition);
            console.log('created variable', variableName);
          } else {
            variable.set('definition', axisPosition);
          }
        });

      });
    });
  }.observes('d3Code')
});
