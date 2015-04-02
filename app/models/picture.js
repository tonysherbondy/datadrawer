import DS from 'ember-data';
import Environment from 'tukey/models/environment';

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
    var marks = this.get('currentInstruction.marks');
    this.updateMarkVariablesEnvironment(marks);
    return marks.getEach('d3Code').join('\n\n');
  }.property('currentInstruction.description'),

  updateMarkVariablesEnvironment: function(marks) {
    // Anytime d3Code changes we will change the value of the mark variables in the environment

    // For each mark
    marks.forEach((mark) => {
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
  }


  // TODO Only need to do this right now because of the way that I am modifying
  // the marks returned from the draw step in a loop step, if I just copied marks
  // and modified those copies we'd be fine without
  //dirtyMarks: function() {
    //function notifyAllMarks(instruction) {
      //instruction.notifyPropertyChange("marks");
      //instruction.get("subInstructions").forEach(notifyAllMarks);
    //}
    //notifyAllMarks(this.get("instructionTree"));
  //}.observes("currentInstruction"),

  //marks: function() {
    //var currentInstruction = this.get("currentInstruction");
    //if (currentInstruction) {
      //return currentInstruction.get("marks");
    //}
    //return this.get("instructionTree.marks");
  //}.property("instructionTree.marks", "currentInstruction", "currentInstruction.marks"),


});
