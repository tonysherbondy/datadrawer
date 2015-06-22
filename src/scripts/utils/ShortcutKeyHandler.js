import PictureActions from '../actions/PictureActions';
import DrawingStateActions from '../actions/DrawingStateActions';
import DrawPathInstruction from '../models/DrawPathInstruction';
import DrawInstruction from '../models/DrawInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Canvas from '../components/drawing/Canvas';
import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import InstructionTreeNode from '../models/InstructionTreeNode';
import InstructionStepper from '../utils/InstructionStepper';
import KeyEventManager from '../utils/KeyEventManager';

export default class ShortcutKeyHandler {
  constructor(props) {
    this.notebook = props.notebook;
    this.manager = this._getEventManager();
  }

  _getEventManager() {
    let manager = new KeyEventManager();
    // TODO: (nhan) for now there should always be an active picture
    // probably want to move this logic and some of the key handling logic
    // to a more specific component
    //let activePicture = this.props.drawingState.activePicture;
    //let activeInstructions = activePicture.instructions;

    manager = manager.registerHandler({
      keyCode: 65,
      keyDescription: 'a',
      description: 'path',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('path');
        PictureActions.insertInstructionAfterInstruction(
          this.notebook.props.activePicture,
          new DrawPathInstruction(),
          this.notebook.props.currentInstruction);
      }
    });

    manager = manager.registerHandler({
      keyCode: 71,
      keyDescription: 'g',
      description: 'guide',
      group: 'modifiers',
      keyDown: () => {
        // Toggle guide setting on selected shape
        let drawInstruction = this.notebook.getDrawInstructionForSelectedShape();
        if (drawInstruction) {
          drawInstruction.modifyProps(this.notebook.props.activePicture, {isGuide: !drawInstruction.isGuide});
        }
      }
    });

    manager = manager.registerHandler({
      keyCode: 78,
      shiftKey: true,
      keyDescription: 'Shift+n',
      description: 'next shape',
      group: 'modifiers',
      keyDown: () => {
        this.notebook.selectNextShape();
      }
    });

    manager = manager.registerHandler({
      keyCode: 78,
      keyDescription: 'n',
      description: 'next snap point',
      group: 'modifiers',
      keyDown: () => {
        // Edit the selected instruction by cycling through overlapping
        // magnet points
        // Toggle guide setting on selected shape
        let instruction = this.notebook.props.currentInstruction;
        if (instruction && instruction.isValid() &&
            (instruction instanceof DrawInstruction ||
            instruction instanceof ScaleInstruction)) {

          // If the point is valid we have either a scale or draw instruction
          // and either way we access the to point.
          // An invalid instruction means we have the draw instruction and the
          // from point is the one we are cycling.

          let pointName = 'to';
          if (instruction instanceof DrawInstruction &&
              instruction.id === this.notebook.props.editingInstructionId) {
            pointName = 'from';
          }
          let point = instruction[pointName];
          let magnets = instruction[pointName + 'Magnets'];
          if (point && point.id && magnets.length > 1) {
            // Grab possible magnets for this draw instruction
            let index = magnets.findIndex(m => {
              return m.shapeId === point.id && m.pointName === point.point;
            });
            index++;
            if (index === magnets.length) {
              index = 0;
            }
            let magnetPoint = Canvas.convertMagnetToPoint(magnets[index]);
            if (pointName === 'from') {
              instruction = instruction.getCloneWithFrom(magnetPoint, magnets);
            } else {
              instruction = instruction.getCloneWithTo(magnetPoint, this.shapes, magnets);
            }
            PictureActions.modifyInstruction(this.notebook.props.activePicture, instruction);
          }
        }
      }
    });

    manager = manager.registerHandler({
      keyCode: 82,
      keyDescription: 'r',
      description: 'rect',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('rect');
        PictureActions.insertInstructionAfterInstruction(
          this.notebook.props.activePicture,
          new DrawRectInstruction(),
          this.notebook.props.currentInstruction);
      }
    });

    manager = manager.registerHandler({
      keyCode: 80,
      keyDescription: 'p',
      description: 'picture',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('picture');
      }
    });

    manager = manager.registerHandler({
      keyCode: 83,
      keyDescription: 's',
      description: 'scale',
      group: 'adjust',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('scale');
      }
    });

    manager = manager.registerHandler({
      keyCode: 84,
      keyDescription: 't',
      description: 'text',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('text');
        PictureActions.insertInstructionAfterInstruction(
          this.notebook.props.activePicture,
          new DrawTextInstruction(),
          this.notebook.props.currentInstruction);
      }
    });

    manager = manager.registerHandler({
      keyCode: 86,
      keyDescription: 'v',
      description: 'move',
      group: 'adjust',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('move');
      }
    });

    manager = manager.registerHandler({
      keyCode: 88,
      keyDescription: 'x',
      description: 'line',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('line');
        PictureActions.insertInstructionAfterInstruction(
          this.notebook.props.activePicture,
          new DrawLineInstruction(),
          this.notebook.props.currentInstruction);
      }
    });

    manager = manager.registerHandler({
      keyCode: 67,
      keyDescription: 'c',
      description: 'circle',
      group: 'draw',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('circle');
        PictureActions.insertInstructionAfterInstruction(
          this.notebook.props.activePicture,
          new DrawCircleInstruction(),
          this.notebook.props.currentInstruction);
      }
    });

    manager = manager.registerHandler({
      keyCode: 69,
      keyDescription: 'e',
      description: 'rotate',
      group: 'adjust',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('rotate');
      }
    });

    manager = manager.registerHandler({
      keyCode: 76,
      keyDescription: 'l',
      description: 'loop',
      group: 'flow',
      keyDown: () => {
        // TODO We allow multiple looping levels, but other assumptions don't support that
        let selectedInstructions = this.notebook.props.selectedInstructions;

        // Get the parent and index of first instruction
        let {parent, index} = InstructionTreeNode.findParentWithIndex(
          this.notebook.props.activePicture.instructions, selectedInstructions[0]);

        // TODO - this should simply call an action that is changePicture and feed it a new picture that it makes
        // based on removing and inserting new instructions
        // Remove selected instructions from list
        PictureActions.removeInstructions(this.notebook.props.activePicture, selectedInstructions);

        // Create a new loop instruction with selected instructions as children
        let instruction = new LoopInstruction({instructions: selectedInstructions});

        // Insert loop instruction before previous instruction index
        // TODO - need to grab the new activePicture because the one we were pointing to before has changed
        // since we removed the pictures, really this needs to be done with a replace operation because otherwise we
        // should wait async for the return of the remove
        PictureActions.insertInstruction(this.notebook.props.activePicture, instruction, index, parent);
        // We need to set the drawing mode to normal because we don't want to edit the newly inserted instruction
        DrawingStateActions.setDrawingMode('normal');
      }
    });

    manager = manager.registerHandler({
      keyCode: 37,
      keyDescription: '\u2190', // left-arrow
      description: 'next loop step',
      keyDown: (e) => {
        this.notebook.stepLoopIndex(-1);
        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 39,
      keyDescription: '\u2192', // right-arrow
      description: 'prev loop step',
      keyDown: (e) => {
        this.notebook.stepLoopIndex(1);
        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 38,
      keyDescription: '\u2191', // up-arrow
      description: 'prev instruction',
      keyDown: (e) => {
        let loopIndex = this.notebook.props.currentLoopIndex;
        let stepper = new InstructionStepper({
          picture: this.notebook.props.activePicture,
          variableValues: this.notebook.props.variableValues});
        let {nextInstruction, nextLoopIndex} = stepper.
          stepBackwards(this.notebook.props.currentInstruction, loopIndex);

        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction, nextLoopIndex);
        }

        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 40,
      keyDescription: '\u2193', // down-arrow
      description: 'next instruction',
      keyDown: (e) => {
        let loopIndex = this.notebook.props.currentLoopIndex;
        let stepper = new InstructionStepper({
          picture: this.notebook.props.activePicture,
          variableValues: this.notebook.props.variableValues});
        let {nextInstruction, nextLoopIndex} = stepper.
          stepForwards(this.notebook.props.currentInstruction, loopIndex);

        if (nextInstruction) {
          DrawingStateActions.setSelectedInstruction(nextInstruction, nextLoopIndex);
        }

        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 27,
      keyDescription: 'esc',
      description: 'cancel drawing mode',
      keyDown: () => {
        DrawingStateActions.setDrawingMode('normal');
      }
    });

    manager = manager.registerHandler({
      keyCode: 90,
      metaKey: true,
      keyDescription: '\u2318 + z',
      description: 'undo',
      keyDown: () => {
        console.log('undo');
        PictureActions.undoChange(this.notebook.props.activePicture);
      }
    });

    manager = manager.registerHandler({
      keyCode: 90,
      metaKey: true,
      shiftKey: true,
      keyDescription: '\u2318 + \u21e7 + z',
      description: 'redo',
      keyDown: () => {
        console.log('redo');
        PictureActions.redoChange(this.notebook.props.activePicture);
      }
    });

    return manager;
  }

}
