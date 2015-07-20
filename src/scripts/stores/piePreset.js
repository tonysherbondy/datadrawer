import DataVariable from '../models/DataVariable';
import Picture from '../models/Picture';

import DrawCircleInstruction from '../models/DrawCircleInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import Expression from '../models/Expression';
import DrawLineInstruction from '../models/DrawLineInstruction';
import RotateInstruction from '../models/RotateInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import ExtendPathInstruction from '../models/ExtendPathInstruction';
import LoopInstruction from '../models/LoopInstruction';

let variables = [
  new DataVariable({
    name: 'letters',
    isRow: true,
    definition: [`['h', 'e', 'l', 'o', 'w', 'r', 'd']`]
  }),
  new DataVariable({
    id: 'angle',
    name: 'angle',
    isRow: true,
    definition: [{id: 'frequency', asVector: true}, '.map(function(d){ return 360 * d / ', {id: 'sum'}, '; })']
  }),
  new DataVariable({
    id: 'frequency',
    name: 'frequency',
    isRow: true,
    definition: [`[1, 1, 3, 2, 1, 1, 1]`]
  }),
  new DataVariable({
    id: 'sum',
    name: 'sum',
    definition: ['_.sum(', {id: 'frequency', asVector: true}, ')']
  }),
  new DataVariable({
    id: 'column',
    name: 'column',
    isRow: true,
    definition: [{id: 'frequency', asVector: true}, '.map(function(d, i){ return i + 1; })']
  }),
  new DataVariable({
    id: 'slice_opacity',
    name: 'slice_opacity',
    isRow: true,
    definition: [{id: 'column', asVector: true}, '.map(function(d){ return _.round(d /', {id: 'frequency', asVector: true}, '.length, 2); })']
  }),
  new DataVariable({
    id: 'slice_color',
    name: 'slice_color',
    isRow: true,
    definition: [{id: 'slice_opacity', asVector: true}, `.map(function(d){ return 'rgba(77, 144, 221, ' + d + ')'; })`]
  })
];

let instructions = [
  new DrawCircleInstruction({
    id: 'circle',
    isGuide: true,
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
    isGuide: true,
    from: {id: 'shape_circle', point: 'center'},
    to: {id: 'shape_circle', point: 'right'}
  }),
  new LoopInstruction({
    instructions: [
      new DrawPathInstruction({
        id: 'path',
        propertyVariables: [
          new DataVariable({name: 'fill', definition: [{id: 'slice_color'}]}),
          new DataVariable({name: 'strokeWidth', definition: [`0`]})
        ],
        from: {id: 'shape_line', point: 'left'},
        to: [
          {id: 'shape_line', point: 'right', isLine: true}
        ],
        isClosed: true
      }),
      new RotateInstruction({
        shape: {id: 'shape_line'},
        point: {id: 'shape_line', point: 'left'},
        to: new Expression({id: 'angle'})
      }),
      new ExtendPathInstruction({
        shape: {id: 'shape_path'},
        to: {id: 'shape_line', point: 'right'},
        isArc: true,
        arcRadius: new Expression({id: 'shape_circle', prop: 'radius'})
      })
    ]
  })

];

export default new Picture('pie', instructions, variables);
