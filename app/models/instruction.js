import Ember from "ember";
import RectangleMark from 'tukey/models/mark/rectangle-mark';

export default Ember.Object.extend({
  operation: null,

  parentInstruction: null,
  subInstructions: function() {
    return [];
  }.property(),

  addSubInstruction: function(instruction) {
    this.get("subInstructions").pushObject(instruction);
    instruction.set("parentInstruction", this);
  },

  flattenedList: function() {
    var ret = [];
    ret.pushObject(this);
    this.get('subInstructions').mapBy('flattenedList').forEach(function (instructionList) {
      ret.pushObjects(instructionList);
    });
    return ret;
  }.property('subInstructions.@each.flattenedList'),

  // Any loop or draw instruction should be able to return
  // a list of marks
  // TODO(Tony) not sure how we are going to handle adjust
  // instructions
  marks: function() {
    var operation = this.get("operation");
    var marks;
    if (operation === "root" || operation === "loop") {
      marks = this.get("subInstructions").getEach("marks");
    } else if (operation === "draw") {
      var attrs = this.get("attrs");
      marks = [RectangleMark.create(attrs)];
    } else {
      console.log("should not be asked to mark this instruction");
      return [];
    }
    // Flatten the marks before returning
    return marks.reduce((prev, item) => {
      if (Ember.isArray(item)) {
        return prev.concat(item);
      }
      return prev.concat([item]);
    }, []);
  }.property(""),
  //}.property("subInstrunctions.@each.marks"),

  // TODO(Tony) These should go away now because we just have one table
  availableLoopVariables: function() {
    if (this.get("operation") === "root") {
      return [];
    }

    var ret = [];
    ret.pushObjects(this.get("parentInstruction.availableLoopVariables"));

    if (this.get("operation") === "loop") {
      ret.pushObject(this.get("loopVariable"));
    }

    return ret;
  }.property("parentInstruction.availableLoopVariables", "operation", "loopVariable"),

  // TODO(Tony) These should go away now because we just have one table
  loopVariable: function() {
    return this.get("loopData.name");
  }.property("loopData.name")
});
