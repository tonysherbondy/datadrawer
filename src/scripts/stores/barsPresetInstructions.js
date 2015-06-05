import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import MoveInstruction from '../models/MoveInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import IfInstruction from '../models/IfInstruction';
import Expression from '../models/Expression';

// Bar Chart Plot
const instructions = [
  new DrawRectInstruction({
    id: 'rect1',
    isGuide: false,
    fill: new Expression(`'aliceblue'`),
    from: {id: 'canvas', point: 'bottomLeft'},
    to: {id: 'canvas', point: 'topRight'}
  }),
  new ScaleInstruction({
    id: 'scale1',
    shape: {id: 'shape_rect1'},
    prop: 'width',
    point: 'right',
    to: new Expression({id: 'barWidth'})
  }),
  new LoopInstruction({
    id: 'loop',
    instructions: [
      new DrawRectInstruction({
        id: 'rect2',
        from: {id: 'shape_rect1', point: 'bottomLeft'},
        to: {id: 'shape_rect1', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'scale2',
        shape: {id: 'shape_rect2'},
        prop: 'height',
        point: 'top',
        to: new Expression({id: 'norm_energy_in_mwh'})
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_rect1'},
        point: 'bottomLeft',
        to: {id: 'shape_rect2', point: 'bottomRight'}
      }),
      new DrawTextInstruction({
        id: 'text1',
        fontSize: 13,
        text: new Expression({id: 'energy_in_mwh'}),
        from: {id: 'shape_rect2', point: 'topLeft'},
        to: {id: 'shape_rect2', point: 'topRight'}
      }),
      new MoveInstruction({
        id: 'imove2',
        shape: {id: 'shape_text1'},
        point: 'center',
        x: new Expression(0),
        y: new Expression(14)
      }),
      new DrawLineInstruction({
        id: 'line1',
        isGuide: true,
        from: {id: 'shape_text1', point: 'center'},
        to: {id: 'shape_rect2', point: 'bottom'}
      }),
      new IfInstruction({
        id: 'if',
        condition: [{id: 'shape_line1', prop: 'dy'}, ' < ', '1'],
        instructions: [
          new MoveInstruction({
            id: 'imove3',
            shape: {id: 'shape_text1'},
            point: 'center',
            x: new Expression(0),
            y: new Expression(-18)
          })
        ]
      })
    ]
  })
];

export default instructions;
