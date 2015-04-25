import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';

// Scatter point
const instructions = [
  new LoopInstruction({
    instructions: [
      new DrawRectInstruction({
        id: 'i1',
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
      })
    ]
  })
];

export default instructions;
