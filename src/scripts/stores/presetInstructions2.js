import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';

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
        shapeId: 'shape_i1',
        prop: 'width',
        point: 'right',
        to: {id: 'sx'}
      }),
      new ScaleInstruction({
        id: 'i3',
        shapeId: 'shape_i1',
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
        from: {id: 'shape_i0', point: 'center'},
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      })
    ]
  })
];

export default instructions;
