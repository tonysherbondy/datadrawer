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

  mouseUp: function() {
    this.valueSlider.set('isEditingValue', false);
  },

  mouseMove: function(e) {
    if (this.valueSlider.get('isEditingValue')) {
      this.valueSlider.get('editingFunc')(e);
    }
  },

  actions: {
    setCurrentInstruction: function(instruction) {
      var currentInstruction = this.get("model.currentInstruction");
      if (currentInstruction === instruction) {
        instruction = null;
      }
      this.set("model.currentInstruction", instruction);
    },

    savePicture: function() {
      Ember.RSVP.all([
        this.get("model").save(),
        this.get("model.instructionTree").then(function(tree) {
          return tree.save();
        }),
        Ember.RSVP.all(this.get("model.scalars").map(function(scalar) {
          return scalar.save();
        })),
        this.get("model.table").then(function(table) {
          return Ember.RSVP.all([
            table.save(),
            Ember.RSVP.all(table.get("columns").map(function(column) {
              column.save(),
              Ember.RSVP.all(column.get("cells").map(function(cell) {
                return cell.save();
              }))
            }))
          ]);
        }),
      ]).then(function() {
        console.log("saved the picture!");
      });
    }
  },

});
