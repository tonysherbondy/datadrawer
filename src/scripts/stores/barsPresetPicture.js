import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import MoveInstruction from '../models/MoveInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawTextInstruction from '../models/DrawTextInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import IfInstruction from '../models/IfInstruction';
import Expression from '../models/Expression';
import DataVariable from '../models/DataVariable';
import Picture from '../models/Picture';

let variables = [
  // Bar Chart Data
  new DataVariable({
    id: 'numberEnergies',
    name: 'number of energies',
    definition: [{id: 'energy_in_mwh', asVector: true}, '.length']
  }),
  new DataVariable({
    id: 'top_mwh',
    name: 'Top MWh',
    definition: ['40']
  }),
  new DataVariable({
    id: 'bar_color',
    name: 'bar color',
    definition: `'#888888'`
  }),
  new DataVariable({
    id: 'max_energy_in_mwh',
    name: 'Max energy in MWh',
    definition: ['_.max(', {id: 'energy_in_mwh', asVector: true}, ')']
  }),
  new DataVariable({
    id: 'barWidth',
    name: 'barWidth',
    definition: ['1 / ', {id: 'numberEnergies'}]
  }),
  new DataVariable({
    id: 'energy_in_mwh',
    name: 'Energy in MWh',
    isRow: true,
    definition: ['[7.2, 29.47, 26.50, 28.2, 0.61, 6.36, 10.32, 16.08, 18.6, 19.08, 18.6]']
  }),
  new DataVariable({
    id: 'norm_energy_in_mwh',
    name: 'Norm energy in MWh',
    isRow: true,
    definition: [{id: 'energy_in_mwh', asVector: true}, '.map(function(d) { return d / ', {id: 'top_mwh'}, '});']
  })
];

const instructions = [
  new DrawRectInstruction({
    id: 'rect1',
    isGuide: false,
    propertyVariables: [
      new DataVariable({name: 'fill', definition: `'aliceblue'`})
    ],
    from: {id: 'canvas', point: 'bottomLeft'},
    to: {id: 'canvas', point: 'topRight'}
  }),
  new ScaleInstruction({
    id: 'scale1',
    shape: {id: 'shape_rect1'},
    prop: 'width',
    point: 'right',
    to: new Expression({id: 'barWidth'})
  }),
  new LoopInstruction({
    id: 'loop',
    instructions: [
      new DrawRectInstruction({
        id: 'rect2',
        fill: new Expression({id: 'bar_color'}),
        from: {id: 'shape_rect1', point: 'bottomLeft'},
        to: {id: 'shape_rect1', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'scale2',
        shape: {id: 'shape_rect2'},
        prop: 'height',
        point: 'top',
        to: new Expression({id: 'norm_energy_in_mwh'})
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_rect1'},
        point: 'bottomLeft',
        to: {id: 'shape_rect2', point: 'bottomRight'}
      }),
      new DrawTextInstruction({
        id: 'text1',
        propertyVariables: [
          new DataVariable({name: 'fontSize', definition: 13})
        ],
        text: new Expression({id: 'energy_in_mwh'}),
        from: {id: 'shape_rect2', point: 'topLeft'},
        to: {id: 'shape_rect2', point: 'topRight'}
      }),
      new MoveInstruction({
        id: 'imove2',
        shape: {id: 'shape_text1'},
        point: 'center',
        x: new Expression(0),
        y: new Expression(14)
      }),
      new DrawLineInstruction({
        id: 'line1',
        isGuide: true,
        from: {id: 'shape_text1', point: 'center'},
        to: {id: 'shape_rect2', point: 'bottom'}
      }),
      new IfInstruction({
        id: 'if',
        condition: new Expression([{id: 'shape_line1', prop: 'dy'}, ' < ', '1']),
        instructions: [
          new MoveInstruction({
            id: 'imove3',
            shape: {id: 'shape_text1'},
            point: 'center',
            x: new Expression(0),
            y: new Expression(-18)
          })
        ]
      })
    ]
  })
];

export default new Picture('bars', instructions, variables);
