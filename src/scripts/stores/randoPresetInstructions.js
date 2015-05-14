import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawRectInstruction from '../models/DrawRectInstruction';
import MoveInstruction from '../models/MoveInstruction';
import Expression from '../models/Expression';

const instructions = [
  new LoopInstruction({
    id: 'iloop',
    count: 6,
    instructions: [
      new DrawCircleInstruction({
        id: 'iloop1',
        from: {x: 20, y: 20},
        radius: new Expression(20)
      }),
      new ScaleInstruction({
        id: 'iloop2',
        shape: {id: 'shape_iloop1'},
        prop: 'r',
        to: new Expression({id: 'd7'})
      })
    ]
  }),
  new DrawCircleInstruction({
    id: 'i2',
    from: {x: 50, y: 50},
    radius: new Expression({id: 'd5'})
  }),
  new DrawCircleInstruction({
    id: 'i3',
    from: {id: 'canvas', point: 'right'},
    to: {id: 'canvas', point: 'center'}
  }),
  new MoveInstruction({
    id: 'imove1',
    shape: {id: 'shape_i3'},
    point: 'center',
    x: new Expression(-20),
    y: new Expression(0)
  }),
  new DrawRectInstruction({
    id: 'i4',
    from: {id: 'canvas', point: 'left'},
    width: new Expression(100),
    height: new Expression(120)
  }),
  new ScaleInstruction({
    id: 'i8',
    shape: {id: 'shape_i4'},
    prop: 'height',
    point: 'bottom',
    to: new Expression(0.9)
  }),
  new ScaleInstruction({
    id: 'i9',
    shape: {id: 'shape_i4'},
    prop: 'height',
    point: 'bottom',
    to: new Expression({id: 'd4'})
  }),
  new DrawRectInstruction({
    id: 'i5',
    from: {id: 'canvas', point: 'top'},
    width: new Expression({id: 'd3'}),
    height: new Expression({id: 'd1'})
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
