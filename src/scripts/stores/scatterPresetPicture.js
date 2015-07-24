import DrawRectInstruction from '../models/DrawRectInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import MoveInstruction from '../models/MoveInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import RotateInstruction from '../models/RotateInstruction';
import Expression from '../models/Expression';
import DataVariable from '../models/DataVariable';
import Picture from '../models/Picture';

let variables = [
  new DataVariable({
    id: 'd3',
    name: 'gamma',
    definition: [{id: 'd1'}, '+', {id: 'd2'}]
  }),
  new DataVariable({
    id: 'd1',
    name: 'alpha',
    definition: ['42']
  }),
  new DataVariable({
    id: 'd2',
    name: 'beta',
    definition: [{id: 'd1'}]
  }),
  new DataVariable({
    id: 'sx',
    name: 'sx',
    isRow: true,
    definition: ['[0.08, 0.32, 0.7, 0.97, 0.81, 0.44, 0.18, 0.24]']
  }),
  new DataVariable({
    id: 'sy',
    name: 'sy',
    isRow: true,
    definition: ['[0.27, 0.63, 0.93, 0.65, 0.42, 0.12, 0.2, 0.37]']
  }),
  new DataVariable({
    id: 'swidth',
    name: 'swidth',
    isRow: true,
    definition: ['[0.04, 0.04, 0.11, 0.1, 0.09, 0.1, 0.07, 0.1]']
  })
];

const instructions = [
  new DrawCircleInstruction({
    id: 'i0',
    from: {id: 'canvas', point: 'bottomLeft'},
    isGuide: true,
    radius: new Expression(20)
  }),
  new LoopInstruction({
    id: 'loop',
    count: 8,
    instructions: [
      new DrawRectInstruction({
        id: 'i1',
        isGuide: true,
        from: {id: 'canvas', point: 'bottomLeft'},
        to: {id: 'canvas', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'i2',
        shape: {id: 'shape_i1'},
        prop: 'width',
        point: 'right',
        to: new Expression({id: 'sx'})
      }),
      new ScaleInstruction({
        id: 'i3',
        shape: {id: 'shape_i1'},
        prop: 'height',
        point: 'top',
        to: new Expression({id: 'sy'})
      }),
      new DrawCircleInstruction({
        id: 'i4',
        isGuide: true,
        from: {id: 'shape_i1', point: 'topRight'},
        radius: new Expression(10)
      }),
      new DrawLineInstruction({
        id: 'i5',
        propertyVariables: [
          new DataVariable({name: 'stroke', definition: `'rgb(236, 194, 116)'`}),
          new DataVariable({name: 'strokeWidth', definition: 2})
        ],
        from: {id: 'shape_i0', point: 'center'},
        to: {id: 'shape_i4', point: 'center'}
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_i0'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center'}
      }),
      new DrawLineInstruction({
        id: 'i6',
        propertyVariables: [
          new DataVariable({name: 'strokeWidth', definition: 2})
        ],
        from: {id: 'canvas', point: 'left'},
        to: {id: 'canvas', point: 'right'}
      }),
      new ScaleInstruction({
        id: 'i7',
        shape: {id: 'shape_i6'},
        prop: 'x2',
        point: 'right',
        to: new Expression({id: 'swidth'})
      }),
      new MoveInstruction({
        id: 'imove2',
        shape: {id: 'shape_i6'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center'}
      }),
      //// TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i8',
        propertyVariables: [
          new DataVariable({name: 'strokeWidth', definition: 2})
        ],
        from: {id: 'shape_i6', point: 'right'},
        width: new Expression(0),
        height: new Expression(9.5)
      }),
      new MoveInstruction({
        id: 'imove3',
        shape: {id: 'shape_i8'},
        point: 'center',
        to: {id: 'shape_i6', point: 'right'}
      }),
      //// TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i9',
        propertyVariables: [
          new DataVariable({name: 'strokeWidth', definition: 2})
        ],
        from: {id: 'shape_i6', point: 'left'},
        width: new Expression(0),
        height: new Expression(9.5)
      }),
      new MoveInstruction({
        id: 'imove4',
        shape: {id: 'shape_i9'},
        point: 'center',
        to: {id: 'shape_i6', point: 'left'}
      }),
      new DrawRectInstruction({
        id: 'i10',
        propertyVariables: [
          new DataVariable({name: 'fill', definition: `'rgba(255, 127, 0, 0.25)'`}),
          new DataVariable({name: 'stroke', definition: `'rgba(255, 127, 0, 0.25)'`})
        ],
        from: {id: 'shape_i8', point: 'center'},
        to: {id: 'shape_i9', point: 'center'}
      }),
      new MoveInstruction({
        id: 'imove5',
        shape: {id: 'shape_i10'},
        point: 'top',
        isReshape: true,
        axis: 'y',
        to: {id: 'canvas', point: 'top'}
      }),
      new MoveInstruction({
        id: 'imove6',
        shape: {id: 'shape_i10'},
        point: 'bottom',
        isReshape: true,
        axis: 'y',
        to: {id: 'canvas', point: 'bottom'}
      }),
      new DrawPathInstruction({
        id: 'i11',
        propertyVariables: [
          new DataVariable({name: 'fill', definition: `'rgba(238, 141, 40, 1)'`}),
          new DataVariable({name: 'stroke', definition: `'rgba(238, 141, 40, 1)'`})
        ],
        from: {id: 'canvas', point: 'center'},
        to: [
          {x: new Expression(-40), y: new Expression(-15), isLine: true},
          {x: new Expression(0), y: new Expression(30), isLine: true}
        ],
        isClosed: true
      }),
      new MoveInstruction({
        id: 'imove7',
        shape: {id: 'shape_i11'},
        point: 'from',
        to: {id: 'shape_i4', point: 'center'}
      }),
      new RotateInstruction({
        id: 'irotate1',
        shape: {id: 'shape_i11'},
        point: {id: 'shape_i11', point: 'from'},
        to: new Expression({id: 'shape_i5', prop: 'angle'})
      }),
      new ScaleInstruction({
        id: 'i12',
        shape: {id: 'shape_i11'},
        prop: 'edge',
        point: 'from',
        to: new Expression(0.5)
      }),
      new DrawLineInstruction({
        id: 'i13',
        propertyVariables: [
          new DataVariable({name: 'strokeWidth', definition: 1})
        ],
        from: {id: 'shape_i10', point: 'bottom'},
        width: new Expression(0),
        height: new Expression(-15)
      }),
      new DrawLineInstruction({
        id: 'i14',
        propertyVariables: [
          new DataVariable({name: 'strokeWidth', definition: 1})
        ],
        from: {id: 'shape_i1', point: 'topLeft'},
        width: new Expression(15),
        height: new Expression(0)
      })
    ]
  })
];

function get() {
  return new Picture('scatter', instructions, variables);
}

export default {get};
