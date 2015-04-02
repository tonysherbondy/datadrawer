import Ember from 'ember';
import MarkTool from 'tukey/models/drawing-tools/mark-tool';

export default MarkTool.extend({
  operation: 'adjust',

  // For adjust operations expect that the user gives us:
  // - draw instruction to append adjusts to
  // - control point that we are modifying
  // - markID
  drawInstruction: null,
  controlPoint: null,

  startAdjust: function(mousePos, controlPoint, drawInstruction) {
    this.set('controlPoint', controlPoint);
    this.set('drawInstruction', drawInstruction);
    if (!this.get('hasStarted')) {
      var instruction = this.get('store').createRecord('instruction', {
        operation: this.get('operation'),
      });
      this.set('instruction', instruction);

      var attrs = drawInstruction.getAttrsForControlPoint(controlPoint);
      instruction.get('attrs').clear();
      instruction.get('attrs').pushObjects(attrs);

      this.get('drawInstruction').addSubInstruction(instruction);
    }
  },

  endAdjust: function(mousePos) {
    if (this.get('hasStarted')) {
      this.mouseMove(mousePos);
      this.set('instruction', null);
    }
  },

  mouseMove: function(mousePos) {
    if (this.get('hasStarted')) {
      var controlPoint = Ember.merge({}, this.get('controlPoint'));
      controlPoint.position = mousePos;
      this.get('drawInstruction').updateAttrsWithControlPoint(controlPoint);
    }
  }

});
