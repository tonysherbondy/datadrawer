import Ember from "ember";
import RectangleMark from 'tukey/models/mark/rectangle-mark';
import CircleMark from 'tukey/models/mark/circle-mark';
import LineMark from 'tukey/models/mark/line-mark';
import TextMark from 'tukey/models/mark/text-mark';

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

  addSubInstructionAtIndex: function(instruction, index) {
    var subInstructions = this.get("subInstructions");
    var beforeIndex = subInstructions.slice(0, index);
    var afterIndex = subInstructions.slice(index, subInstructions.get("length"));
    this.set("subInstructions", beforeIndex.concat([instruction], afterIndex));
    instruction.set("parentInstruction", this);
  },

  // TODO, cumbersome to have these multiple sources of topology truth
  // Remove self from parent
  removeInstruction: function() {
    var parentInstruction = this.get("parentInstruction");
    if (parentInstruction) {
      var subInstructions = parentInstruction.get("subInstructions");
      parentInstruction.set("subInstructions", subInstructions.reject((item) => item === this));
    }
    this.set("parentInstruction", null);
  },

  // Any loop or draw instruction should be able to return
  // a list of marks
  marks: function() {
    var operation = this.get("operation");
    var marks;
    var subInstructions = this.get("subInstructions");

    if (operation === "root" || operation === "loop") {
      marks = subInstructions.getEach("marks");
    } else if (operation === "draw") {
      var attrs = Ember.merge({}, this.get("attrs"));
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
      } else if (mark === "line") {
        markClass = LineMark;
      } else if (mark === "text") {
        markClass = TextMark;
      } else {
        console.log("Don't know mark", mark);
      }
      marks = [markClass.create(attrs)];
    } else {
      console.log("should not be asked to mark this instruction");
      return [];
    }
    // Flatten the marks before returning
    var flatMarks = marks.reduce((prev, item) => {
      if (Ember.isArray(item)) {
        return prev.concat(item);
      }
      return prev.concat([item]);
    }, []);
    if (operation === "loop") {
      flatMarks.setEach("loopOver", "table");
    }
    return flatMarks;
  }.property("attrs", "operation", "mark", "subInstructions.[]", "subInstructions.@each.{attrs,marks}")

});
