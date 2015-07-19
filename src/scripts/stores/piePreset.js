import DataVariable from '../models/DataVariable';
import Picture from '../models/Picture';

import DrawCircleInstruction from '../models/DrawCircleInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Expression from '../models/Expression';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';

let variables = [
  new DataVariable({
    name: 'letters',
    isRow: true,
    definition: [`['h', 'e', 'l', 'o', 'w', 'r', 'd']`]
  }),
  new DataVariable({
    name: 'frequency',
    isRow: true,
    definition: [`[1, 1, 3, 2, 1, 1, 1]`]
  })
];

let instructions = [
  new DrawCircleInstruction({
    id: 'circle',
    from: {id: 'canvas', point: 'center'},
    to: {id: 'canvas', point: 'top'}
  }),
  new ScaleInstruction({
    shape: {id: 'shape_circle'},
    prop: 'radius',
    point: 'top',
    to: new Expression('0.7')
  }),
  new DrawLineInstruction({
    id: 'line',
    from: {id: 'shape_circle', point: 'center'},
    to: {id: 'shape_circle', point: 'right'}
  }),
  new DrawPathInstruction({
    id: 'path',
    from: {id: 'shape_line', point: 'left'},
    to: [
      {id: 'shape_line', point: 'right', isLine: true}
    ],
    isClosed: true
  })

];

export default new Picture('pie', instructions, variables);
