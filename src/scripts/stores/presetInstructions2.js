import DrawRectInstruction from '../models/DrawRectInstruction';

// Scatter point
const instructions = [
  new DrawRectInstruction({
    id: 'i1',
    from: {id: 'canvas', point: 'bottomLeft'},
    to: {id: 'canvas', point: 'topRight'}
  })
];

export default instructions;
