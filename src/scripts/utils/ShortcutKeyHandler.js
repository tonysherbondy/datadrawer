import DrawPathInstruction from '../models/DrawPathInstruction';
import DrawInstruction from '../models/DrawInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Canvas from '../components/drawing/Canvas';
import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import IfInstruction from '../models/IfInstruction';
//import InstructionTreeNode from '../models/InstructionTreeNode';
import InstructionStepper from '../utils/InstructionStepper';
import KeyEventManager from '../utils/KeyEventManager';

export default class ShortcutKeyHandler {
  constructor(props) {
    this.notebook = props.notebook;
    this.pictureActions = props.pictureActions;
    this.drawingStateActions = props.drawingStateActions;
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
        this.drawingStateActions.setDrawingMode('path');
        this.pictureActions.insertInstructionAfterInstruction(
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
          drawInstruction.modifyProps(this.pictureActions, this.notebook.props.activePicture, {isGuide: !drawInstruction.isGuide});
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
            this.pictureActions.modifyInstruction(this.notebook.props.activePicture, instruction);
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
        this.drawingStateActions.setDrawingMode('rect');
        this.pictureActions.insertInstructionAfterInstruction(
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
        this.drawingStateActions.setDrawingMode('picture');
      }
    });

    manager = manager.registerHandler({
      keyCode: 83,
      keyDescription: 's',
      description: 'scale',
      group: 'adjust',
      keyDown: () => {
        this.drawingStateActions.setDrawingMode('scale');
      }
    });

    manager = manager.registerHandler({
      keyCode: 90,
      keyDescription: 'z',
      description: 'extend path',
      group: 'adjust',
      keyDown: () => {
        this.drawingStateActions.setDrawingMode('extend path');
      }
    });

    manager = manager.registerHandler({
      keyCode: 84,
      keyDescription: 't',
      description: 'text',
      group: 'draw',
      keyDown: () => {
        this.drawingStateActions.setDrawingMode('text');
        this.pictureActions.insertInstructionAfterInstruction(
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
        this.drawingStateActions.setDrawingMode('move');
      }
    });

    manager = manager.registerHandler({
      keyCode: 88,
      keyDescription: 'x',
      description: 'line',
      group: 'draw',
      keyDown: () => {
        this.drawingStateActions.setDrawingMode('line');
        this.pictureActions.insertInstructionAfterInstruction(
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
        this.drawingStateActions.setDrawingMode('circle');
        this.pictureActions.insertInstructionAfterInstruction(
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
        this.drawingStateActions.setDrawingMode('rotate');
      }
    });

    function insertNewInstructionContainingSelected(pictureActions, drawingStateActions, notebook, newInstructionFunc) {
      // TODO We allow multiple looping levels, but other assumptions don't support that
      let selectedInstructions = notebook.props.selectedInstructions;

      // TODO - this should simply call an action that is changePicture and feed it a new picture that it makes
      // based on removing and inserting new instructions
      // Remove selected instructions from list
      let newInstruction = newInstructionFunc(selectedInstructions);
      pictureActions.replaceInstructions(notebook.props.activePicture, selectedInstructions, [newInstruction]);

      drawingStateActions.setDrawingMode('normal');
    }

    manager = manager.registerHandler({
      keyCode: 76,
      keyDescription: 'l',
      description: 'loop',
      group: 'flow',
      keyDown: () => {
        insertNewInstructionContainingSelected(
          this.pictureActions, this.drawingStateActions, this.notebook,
          instructions => new LoopInstruction({ instructions })
        );
      }
    });

    manager = manager.registerHandler({
      keyCode: 73,
      keyDescription: 'i',
      description: 'if',
      group: 'flow',
      keyDown: () => {
        insertNewInstructionContainingSelected(
          this.pictureActions, this.drawingStateActions, this.notebook,
          instructions => new IfInstruction({instructions})
        );
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
          this.drawingStateActions.setSelectedInstruction(nextInstruction, nextLoopIndex);
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
          this.drawingStateActions.setSelectedInstruction(nextInstruction, nextLoopIndex);
        }

        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 27,
      keyDescription: 'esc',
      description: 'cancel drawing mode',
      keyDown: () => {
        this.drawingStateActions.setDrawingMode('normal');
      }
    });

    manager = manager.registerHandler({
      keyCode: 83,
      metaKey: true,
      keyDescription: '\u2318 + s',
      description: 'save picture',
      keyDown: (e) => {
        console.log('save');
        this.pictureActions.savePicture(
          this.notebook.props.notebook.id,
          this.notebook.props.activePicture
        );
        e.preventDefault();
      }
    });

    manager = manager.registerHandler({
      keyCode: 90,
      metaKey: true,
      keyDescription: '\u2318 + z',
      description: 'undo',
      keyDown: () => {
        console.log('undo');
        this.pictureActions.undoChange(this.notebook.props.activePicture);
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
        this.pictureActions.redoChange(this.notebook.props.activePicture);
      }
    });

    return manager;
  }

}
