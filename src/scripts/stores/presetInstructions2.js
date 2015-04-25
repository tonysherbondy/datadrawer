import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';

// Scatter point
const instructions = [
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
    id: 'i2',
    shapeId: 'shape_i1',
    prop: 'height',
    point: 'top',
    to: {id: 'sy'}
  })
];

export default instructions;
