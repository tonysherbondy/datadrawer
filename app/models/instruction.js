import Ember from "ember";
import DS from 'ember-data';
import RectangleMark from 'tukey/models/mark/rectangle-mark';
import CircleMark from 'tukey/models/mark/circle-mark';
import LineMark from 'tukey/models/mark/line-mark';
import TextMark from 'tukey/models/mark/text-mark';

var markCounter = 0;

export default DS.Model.extend({
  operation: DS.attr('string'),
  mark: DS.attr('string'),
  attrs: DS.hasMany('attribute'),
  parentInstruction: DS.belongsTo('instruction', {inverse: 'subInstructions'}),
  subInstructions: DS.hasMany('instruction', {embedded: true}),

  markName: function() {
    return `mark${++markCounter}`;
  }.property("operation"),

  addSubInstruction: function(instruction) {
    this.get("subInstructions").pushObject(instruction);
    instruction.set("parentInstruction", this);
  },

  addSubInstructionAtIndex: function(instruction, index) {
    var subInstructions = this.get("subInstructions");
    var beforeIndex = subInstructions.slice(0, index);
    var afterIndex = subInstructions.slice(index, subInstructions.get("length"));
    subInstructions.clear();
    subInstructions.pushObjects(beforeIndex.concat([instruction], afterIndex));
    instruction.set("parentInstruction", this);
  },

  // TODO, cumbersome to have these multiple sources of topology truth
  // Remove self from parent
  removeInstruction: function() {
    var parentInstruction = this.get("parentInstruction");
    if (parentInstruction) {
      var subInstructions = parentInstruction.get("subInstructions");
      var instructionsToRemove = subInstructions.filter((item) => item === this);
      subInstructions.removeObjects(instructionsToRemove);
    }
    this.set("parentInstruction", null);
  },

  getAttrByName: function(name) {
    return this.get('attrs').findBy('name', name);
  },

  _mergeAttributes: function(attributes1, attributes2) {
    var attrs = attributes1.map((x) => x);

    attributes2.forEach((attribute) => {
      var index = attrs.getEach('name').indexOf(attribute.get('name'));
      if (index >= 0) {
        attrs.replace(index, 1, attribute);
      } else {
        attrs.pushObject(attribute);
      }
    });
    return attrs;
  },

  attrValues: function() {
    // return a hash of values so that anytime a value changes on the attr the hash changes
    // Only have to do this because Ember can't listen to nested properties after @each
    var xform = (attr) => `${attr.get('name')}: ${attr.get('value')}`;
    return this.get('attrs').map(xform).join(', ');
  }.property('attrs.@each.value'),

  // Any loop or draw instruction should be able to return
  // a list of marks
  marks: function() {
    // attrValues is created only for the purpose of working around listening to
    // nested structures within arrays, so we have to access it to start the
    // observing process
    this.get('subInstructions').getEach('attrValues');

    var operation = this.get("operation");
    var marks;
    var subInstructions = this.get("subInstructions");


    if (operation === "root" || operation === "loop") {
      marks = subInstructions.getEach("marks");
    } else if (operation === "draw") {


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

      var attrs = subInstructions.getEach('attrs')
        .reduce(this._mergeAttributes, this.get('attrs'));


      var markObject = markClass.create({
        drawInstruction: this,
        name: this.get('markName'),
        attrs: attrs
      });

      marks = [markObject];
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
  }.property("attrValues", "operation", "mark",
             "subInstructions.@each.{marks,attrValues}"),

  attributesFromHash: function(attrsHash) {
    return Object.keys(attrsHash).map((attrName) => {
      return this.store.createRecord('attribute', {
        name: attrName,
        variable: attrsHash[attrName]
      });
    });
  }

});
