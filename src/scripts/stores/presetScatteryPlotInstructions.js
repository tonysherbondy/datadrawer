import DrawCircleInstruction from '../models/DrawCircleInstruction';
import DrawRectInstruction from '../models/DrawRectInstruction';
import LoopInstruction from '../models/LoopInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Expression from '../models/Expression';
import DrawLineInstruction from '../models/DrawLineInstruction';
import MoveInstruction from '../models/MoveInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import RotateInstruction from '../models/RotateInstruction';

// Crazy scatterish plot
const instructions = [
  new DrawCircleInstruction({
    id: 'i0',
    from: {id: 'canvas', point: 'bottomLeft'},
    isGuide: true,
    radius: new Expression(20)
  }),
  new LoopInstruction({
    id: 'loop',
    count: 8,
    instructions: [
      new DrawRectInstruction({
        id: 'i1',
        isGuide: true,
        from: {id: 'canvas', point: 'bottomLeft'},
        to: {id: 'canvas', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'i2',
        shape: {id: 'shape_i1'},
        prop: 'width',
        point: 'right',
        to: new Expression({id: 'sx'})
      }),
      new ScaleInstruction({
        id: 'i3',
        shape: {id: 'shape_i1'},
        prop: 'height',
        point: 'top',
        to: new Expression({id: 'sy'})
      }),
      new DrawCircleInstruction({
        id: 'i4',
        isGuide: true,
        from: {id: 'shape_i1', point: 'topRight'},
        radius: new Expression(10)
      }),
      new DrawLineInstruction({
        id: 'i5',
        stroke: new Expression(`'rgb(236, 194, 116)'`),
        strokeWidth: new Expression(2),
        from: {id: 'shape_i0', point: 'center'},
        to: {id: 'shape_i4', point: 'center'}
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_i0'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center'}
      }),
      new DrawLineInstruction({
        id: 'i6',
        strokeWidth: new Expression(2),
        from: {id: 'canvas', point: 'left'},
        to: {id: 'canvas', point: 'right'}
      }),
      new ScaleInstruction({
        id: 'i7',
        shape: {id: 'shape_i6'},
        prop: 'x2',
        point: 'right',
        to: new Expression({id: 'swidth'})
      }),
      new MoveInstruction({
        id: 'imove2',
        shape: {id: 'shape_i6'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center'}
      }),
      //// TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i8',
        strokeWidth: new Expression(2),
        from: {id: 'shape_i6', point: 'right'},
        width: new Expression(0),
        height: new Expression(9.5)
      }),
      new MoveInstruction({
        id: 'imove3',
        shape: {id: 'shape_i8'},
        point: 'center',
        to: {id: 'shape_i6', point: 'right'}
      }),
      //// TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i9',
        strokeWidth: new Expression(2),
        from: {id: 'shape_i6', point: 'left'},
        width: new Expression(0),
        height: new Expression(9.5)
      }),
      new MoveInstruction({
        id: 'imove4',
        shape: {id: 'shape_i9'},
        point: 'center',
        to: {id: 'shape_i6', point: 'left'}
      }),
      new DrawRectInstruction({
        id: 'i10',
        fill: new Expression(`'rgba(255, 127, 0, 0.25)'`),
        stroke: new Expression(`'rgba(255, 127, 0, 0.25)'`),
        from: {id: 'shape_i8', point: 'center'},
        to: {id: 'shape_i9', point: 'center'}
      }),
      new MoveInstruction({
        id: 'imove5',
        shape: {id: 'shape_i10'},
        point: 'top',
        isReshape: true,
        to: {id: 'canvas', point: 'top'}
      }),
      new MoveInstruction({
        id: 'imove6',
        shape: {id: 'shape_i10'},
        point: 'bottom',
        isReshape: true,
        to: {id: 'canvas', point: 'bottom'}
      }),
      new DrawPathInstruction({
        id: 'i11',
        fill: new Expression(`'rgba(238, 141, 40, 1)'`),
        stroke: new Expression(`'rgba(238, 141, 40, 1)'`),
        from: {id: 'canvas', point: 'center'},
        to: [
          {x: new Expression(-40), y: new Expression(-15), isLine: true},
          {x: new Expression(0), y: new Expression(30), isLine: true}
        ],
        isClosed: true
      }),
      new MoveInstruction({
        id: 'imove7',
        shape: {id: 'shape_i11'},
        point: 'from',
        to: {id: 'shape_i4', point: 'center'}
      }),
      new RotateInstruction({
        id: 'irotate1',
        shape: {id: 'shape_i11'},
        point: {id: 'shape_i11', point: 'from'},
        to: {id: 'shape_i5', prop: 'angle'}
      }),
      new ScaleInstruction({
        id: 'i12',
        shape: {id: 'shape_i11'},
        prop: 'edge',
        point: 'from',
        to: new Expression(0.5)
      }),
      new DrawLineInstruction({
        id: 'i13',
        strokeWidth: new Expression(1),
        from: {id: 'shape_i10', point: 'bottom'},
        width: new Expression(0),
        height: new Expression(-15)
      }),
      new DrawLineInstruction({
        id: 'i14',
        strokeWidth: new Expression(1),
        from: {id: 'shape_i1', point: 'topLeft'},
        width: new Expression(15),
        height: new Expression(0)
      })
    ]
  })
];

export default instructions;
