import MarkTool from 'tukey/models/drawing-tools/mark-tool';

export default MarkTool.extend({
  operation: 'adjust',

  // For adjust operations expect that the user gives us:
  // - draw instruction to append adjusts to
  // - control point that we are modifying
  // - markID
  drawInstruction: null,
  controlPoint: null,
  startingRotation: 0,

  startAdjust: function(mousePos, controlPoint, drawInstruction) {
    this.set('drawInstruction', drawInstruction);
    if (!this.get('hasStarted')) {
      var startingRotation = drawInstruction.getRotation();
      this.set('startingRotation', startingRotation);
      this.set('startingMousePos', mousePos);
      var attrs = drawInstruction.getTransformFromRotation(startingRotation);
      var instruction = this.get('store').createRecord('instruction', {
        operation: this.get('operation'),
      });
      instruction.get('attrs').clear();
      instruction.get('attrs').pushObjects(attrs);
      this.get('drawInstruction').addSubInstruction(instruction);
      this.set('instruction', instruction);
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
      var startingMousePos = this.get('startingMousePos');
      var startingRotation = this.get('startingRotation');
      var rotation = Math.round(startingRotation + (mousePos[0] - startingMousePos[0]));
      var attrs = this.get('drawInstruction').getTransformFromRotation(rotation);
      this.get('instruction.attrs').clear();
      this.get('instruction.attrs').pushObjects(attrs);
    }
  }

});
