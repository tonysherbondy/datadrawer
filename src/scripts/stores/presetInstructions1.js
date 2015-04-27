import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawRectInstruction from '../models/DrawRectInstruction';
import MoveInstruction from '../models/MoveInstruction';

const instructions = [
  new LoopInstruction({
    id: 'iloop',
    instructions: [
      new DrawCircleInstruction({
        id: 'iloop1',
        from: {x: 20, y: 20},
        radius: 20
      }),
      new ScaleInstruction({
        id: 'iloop2',
        shape: {id: 'shape_iloop1'},
        prop: 'r',
        to: {id: 'd7'}
      })
    ]
  }),
  new DrawCircleInstruction({
    id: 'i2',
    from: {x: 50, y: 50},
    radius: {id: 'd5'}
  }),
  new DrawCircleInstruction({
    id: 'i3',
    from: {id: 'canvas', point: 'right'},
    to: {id: 'canvas', point: 'center'}
  }),
  new MoveInstruction({
    id: 'imove1',
    shape: {id: 'shape_i3'},
    prop: 'center',
    to: {x: -20, y: 0}
  }),
  new DrawRectInstruction({
    id: 'i4',
    from: {id: 'canvas', point: 'left'},
    width: 100,
    height: 120
  }),
  new ScaleInstruction({
    id: 'i8',
    shape: {id: 'shape_i4'},
    prop: 'height',
    to: 0.9
  }),
  new ScaleInstruction({
    id: 'i8',
    shape: {id: 'shape_i4'},
    prop: 'height',
    to: {id: 'd4'}
  }),
  new DrawRectInstruction({
    id: 'i5',
    from: {id: 'canvas', point: 'top'},
    width: {id: 'd3'},
    height: {id: 'd1'}
  }),
  new DrawRectInstruction({
    id: 'i6',
    from: {id: 'shape_i4', point: 'bottomRight'},
    to: {id: 'canvas', point: 'bottom'}
  }),
  new DrawRectInstruction({
    id: 'i7',
    from: {id: 'shape_i2', point: 'center'},
    to: {id: 'shape_i3', point: 'left'}
  })
];

export default instructions;
