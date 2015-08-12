import DataVariable from '../../models/DataVariable';
import Picture from '../../models/Picture';
import DrawCircleInstruction from '../../models/DrawCircleInstruction';
import ScaleInstruction from '../../models/ScaleInstruction';
import Expression from '../../models/Expression';
import DrawLineInstruction from '../../models/DrawLineInstruction';
import RotateInstruction from '../../models/RotateInstruction';
import DrawPathInstruction from '../../models/DrawPathInstruction';
import ExtendPathInstruction from '../../models/ExtendPathInstruction';
import LoopInstruction from '../../models/LoopInstruction';
import MoveInstruction from '../../models/MoveInstruction';
import DrawTextInstruction from '../../models/DrawTextInstruction';

let variables = () => [
  new DataVariable({
    id: 'label_offset',
    name: 'label offset',
    definition: ['-40']
  }),
  new DataVariable({
    id: 'letters',
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
  })
];

let instructions = () => [
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
  new DrawLineInstruction({
    id: 'label_line',
    name: 'label_line',
    isGuide: true,
    from: {id: 'shape_line', point: 'left'},
    to: {id: 'shape_line', point: 'right'}
  }),
  new MoveInstruction({
    shape: {id: 'shape_label_line'},
    point: 'right',
    isReshape: true,
    x: new Expression({id: 'label_offset'}),
    y: new Expression(0)
  }),
  new LoopInstruction({
    instructions: [
      new DrawPathInstruction({
        id: 'path',
        propertyVariables: [
          new DataVariable({name: 'fill', definition: [`'rgba(77, 144, 221, ' + `, {id: 'slice_opacity'}, ` + ')'`]}),
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
      new RotateInstruction({
        shape: {id: 'shape_label_line'},
        point: {id: 'shape_label_line', point: 'left'},
        to: new Expression([{id: 'angle'}, ' / 2'])
      }),
      new DrawTextInstruction({
        text: new Expression({id: 'letters'}),
        from: {id: 'shape_label_line', point: 'right'},
        width: new Expression(1),
        height: new Expression(0)
      }),
      new RotateInstruction({
        shape: {id: 'shape_label_line'},
        point: {id: 'shape_label_line', point: 'left'},
        to: new Expression([{id: 'angle'}, ' / 2'])
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

export default function() {
  return new Picture({id: 'pie', instructions: instructions(), variables: variables()});
}
