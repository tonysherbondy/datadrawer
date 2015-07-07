import Expression from '../models/Expression';
import Picture from '../models/Picture';
import DataVariable from '../models/DataVariable';
import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import ExtendPathInstruction from '../models/ExtendPathInstruction';
import MoveInstruction from '../models/MoveInstruction';
import LoopInstruction from '../models/LoopInstruction';

let variables = [
  new DataVariable({
    id: 'line_max',
    name: 'max',
    definition: ['_.max(', {id: 'line_item', asVector: true}, ')']
  }),
  new DataVariable({
    id: 'line_number_items',
    name: 'number of items',
    definition: [{id: 'line_item', asVector: true}, '.length']
  }),
  new DataVariable({
    id: 'line_item',
    name: 'item',
    isRow: true,
    definition: ['[2, 3, 4, 1, 3, 6, 2]']
  })
];

const instructions = [
  new DrawRectInstruction({
    id: 'line_rect1',
    isGuide: false,
    propertyVariables: [
      new DataVariable({name: 'fill', definition: `'aliceblue'`})
    ],
    from: {id: 'canvas', point: 'bottomLeft'},
    to: {id: 'canvas', point: 'topRight'}
  }),
  new ScaleInstruction({
    id: 'line_scale1',
    shape: {id: 'shape_line_rect1'},
    prop: 'width',
    point: 'right',
    to: new Expression(['1 /(', {id: 'line_number_items'}, ' - 1)'])
  }),
  new DrawPathInstruction({
    id: 'line_path',
    propertyVariables: [
      new DataVariable({name: 'fill', definition: `'rgba(0, 0, 0, 0)'`}),
      new DataVariable({name: 'strokeWidth', definition: 2})
    ],
    from: {id: 'shape_line_rect1', point: 'bottomLeft'},
    to: [
      {x: new Expression(1), y: new Expression(1), isLine: true}
    ],
    isClosed: false
  }),
  new LoopInstruction({
    id: 'loop',
    instructions: [
      new DrawRectInstruction({
        id: 'line_rect2',
        isGuide: true,
        from: {id: 'shape_line_rect1', point: 'bottomLeft'},
        to: {id: 'shape_line_rect1', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'line_scale2',
        shape: {id: 'shape_line_rect2'},
        prop: 'height',
        point: 'top',
        to: new Expression([{id: 'line_item'}, '/', {id: 'line_max'}])
      }),
      new ExtendPathInstruction({
        id: 'line_extend',
        shape: {id: 'shape_line_path'},
        to: {id: 'shape_line_rect2', point: 'topLeft'}
      }),
      new MoveInstruction({
        id: 'line_move_guide',
        shape: {id: 'shape_line_rect1'},
        point: 'bottomLeft',
        to: {id: 'shape_line_rect2', point: 'bottomRight'}
      })
    ]
  })
];

export default new Picture('line', instructions, variables);
