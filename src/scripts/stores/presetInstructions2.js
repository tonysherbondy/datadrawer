import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import MoveInstruction from '../models/MoveInstruction';
import ScaleInstruction from '../models/ScaleInstruction';

// Scatter point
const instructions = [
  new DrawCircleInstruction({
    id: 'i0',
    from: {id: 'canvas', point: 'bottomLeft'},
    isGuide: true,
    radius: 20
  }),
  new LoopInstruction({
    instructions: [
      new DrawRectInstruction({
        id: 'i1',
        isGuide: true,
        from: {id: 'canvas', point: 'bottomLeft'},
        to: {id: 'canvas', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'i2',
        shape: {id: 'shape_i1', isLoop: true},
        prop: 'width',
        point: 'right',
        to: {id: 'sx'}
      }),
      new ScaleInstruction({
        id: 'i3',
        shape: {id: 'shape_i1', isLoop: true},
        prop: 'height',
        point: 'top',
        to: {id: 'sy'}
      }),
      new DrawCircleInstruction({
        id: 'i4',
        from: {id: 'shape_i1', point: 'topRight', isLoop: true},
        radius: 10
      }),
      new DrawLineInstruction({
        id: 'i5',
        stroke: 'rgb(236, 194, 116)',
        strokeWidth: 2,
        from: {id: 'shape_i0', point: 'center'},
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_i0'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      new DrawLineInstruction({
        id: 'i6',
        strokeWidth: 2,
        from: {id: 'canvas', point: 'left'},
        to: {id: 'canvas', point: 'right'}
      })
    ]
  })
];

export default instructions;
