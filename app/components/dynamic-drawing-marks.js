import Ember from 'ember';

export default Ember.Component.extend({

  // Drawing mode stuff, it is here because I want to
  // share the mode across panels and also because I want
  // to be able to generally click the keyboard from anywhere
  charToModeMap: {
    r: { modeName: "drawRect", name: "rect" },
    x: { modeName: "drawLine", name: "line" },
    t: { modeName: "drawText", name: "text" },
    c: { modeName: "drawCircle", name: "circle" },
    v: { modeName: "adjustMove", name: "move" },
    s: { modeName: "adjustScale", name: "scale" },
    e: { modeName: "adjustRotate", name: "rotate" },
    i: { modeName: "flowIf", name: "if" },
    l: { modeName: "flowLoop", name: "loop" }
  },
  modeList: function() {
    var modeMap = this.get("charToModeMap");
    return Object.keys(modeMap).map((key) => Ember.merge({key}, modeMap[key]));
  }.property("charToModeMap"),
  activeDrawingMode: null,

  // Value sliding
  valueSlider: Ember.inject.service('value-slider'),

  // TODO(Tony) Bring back value sliders but for variables
  //mouseUp: function() {
    //this.valueSlider.set('isEditingValue', false);
  //},

  //mouseMove: function(e) {
    //if (this.valueSlider.get('isEditingValue')) {
      //this.valueSlider.get('editingFunc')(e);
    //}
  //},

  actions: {
    setCurrentInstruction: function(instruction) {
      var currentInstruction = this.get("model.currentInstruction");
      if (currentInstruction === instruction) {
        instruction = null;
      }
      this.set("model.currentInstruction", instruction);
    },

    savePicture: function() {
      var picture = this.get("model");
      var recordsToSave = [picture];

      function addAttrToRecords(attr) {
        var variable = attr.get('variable');
        recordsToSave.pushObject(attr);
        addVariableToRecords(variable);
      }

      function addVariableToRecords(variable) {
        var expression = variable.get('expression');
        recordsToSave.pushObject(variable);
        recordsToSave.pushObject(expression);
        recordsToSave.pushObjects(expression.get('persistedFragments').toArray());
      }

      // Save all scalars
      (picture.get('scalars') || []).forEach(addVariableToRecords);

      // Save table
      (picture.get('table.rows') || []).forEach(addVariableToRecords);

      var instructionsToSave = [picture.get("instructionTree")];
      while (instructionsToSave.length > 0) {
        var currentInstruction = instructionsToSave.pop();
        (currentInstruction.get('attrs') || []).forEach(addAttrToRecords);
        instructionsToSave.pushObjects(currentInstruction.get("subInstructions").toArray());
      }
      Ember.RSVP.all([
        picture.get("instructionTree").then(function(tree) {
          recordsToSave.push(tree);
        }),
        picture.get("table").then(function(table) {
          recordsToSave.push(table);
        })
      ]).then(function() {
        Ember.RSVP.all(recordsToSave.map(function(record) {
          return record.save();
        }));
      }).then(function() {
        console.log("saved the picture!");
      });
    }
  },

});
