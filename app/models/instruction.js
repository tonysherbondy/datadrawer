import Ember from "ember";
import RectangleMark from 'tukey/models/mark/rectangle-mark';
import CircleMark from 'tukey/models/mark/circle-mark';

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
  marks: function() {
    var operation = this.get("operation");
    var marks;
    var subInstructions = this.get("subInstructions");
    if (operation === "root" || operation === "loop") {
      marks = subInstructions.getEach("marks");
    } else if (operation === "draw") {
      var attrs = this.get("attrs");
      // Get all subInstruction attrs as they are all sets
      attrs = subInstructions.getEach("attrs").reduce((prev, item) => {
        return Ember.merge(prev, item);
      }, attrs);

      var mark = this.get("mark");
      var markClass;
      if (mark === "rect") {
        markClass = RectangleMark;
      } else if (mark === "circle") {
        markClass = CircleMark;
      } else {
        console.log("Don't know mark", mark);
      }
      marks = [markClass.create(attrs)];
      if (this.get("parentInstruction.operation") === "loop") {
        marks.setEach("loopOver", "table");
      }
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
