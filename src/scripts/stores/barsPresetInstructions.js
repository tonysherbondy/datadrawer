import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';

// Bar Chart Plot
const instructions = [
  new DrawRectInstruction({
    id: 'rect1',
    isGuide: true,
    from: {id: 'canvas', point: 'bottomLeft'},
    to: {id: 'canvas', point: 'topRight'}
  }),
  new ScaleInstruction({
    id: 'scale1',
    shape: {id: 'shape_rect1'},
    prop: 'width',
    point: 'right',
    to: {id: 'barWidth'}
  }),
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
    to: {id: 'norm_energy_in_mwh'}
  })
];

export default instructions;
