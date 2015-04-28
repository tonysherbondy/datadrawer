import DrawRectInstruction from '../models/DrawRectInstruction';
import DrawCircleInstruction from '../models/DrawCircleInstruction';
import LoopInstruction from '../models/LoopInstruction';
import DrawLineInstruction from '../models/DrawLineInstruction';
import MoveInstruction from '../models/MoveInstruction';
import ScaleInstruction from '../models/ScaleInstruction';
import DrawPathInstruction from '../models/DrawPathInstruction';
import RotateInstruction from '../models/RotateInstruction';

// Crazy scatterish plot
const instructions = [
  new DrawCircleInstruction({
    id: 'i0',
    from: {id: 'canvas', point: 'bottomLeft'},
    isGuide: true,
    radius: 20
  }),
  new LoopInstruction({
    instructions: [
      new DrawRectInstruction({
        id: 'i1',
        isGuide: true,
        from: {id: 'canvas', point: 'bottomLeft'},
        to: {id: 'canvas', point: 'topRight'}
      }),
      new ScaleInstruction({
        id: 'i2',
        shape: {id: 'shape_i1', isLoop: true},
        prop: 'width',
        point: 'right',
        to: {id: 'sx'}
      }),
      new ScaleInstruction({
        id: 'i3',
        shape: {id: 'shape_i1', isLoop: true},
        prop: 'height',
        point: 'top',
        to: {id: 'sy'}
      }),
      new DrawCircleInstruction({
        id: 'i4',
        isGuide: true,
        from: {id: 'shape_i1', point: 'topRight', isLoop: true},
        radius: 10
      }),
      new DrawLineInstruction({
        id: 'i5',
        stroke: 'rgb(236, 194, 116)',
        strokeWidth: 2,
        from: {id: 'shape_i0', point: 'center'},
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      new MoveInstruction({
        id: 'imove1',
        shape: {id: 'shape_i0'},
        point: 'center',
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      new DrawLineInstruction({
        id: 'i6',
        strokeWidth: 2,
        from: {id: 'canvas', point: 'left'},
        to: {id: 'canvas', point: 'right'}
      }),
      new ScaleInstruction({
        id: 'i7',
        shape: {id: 'shape_i6', isLoop: true},
        prop: 'x2',
        point: 'right',
        to: {id: 'swidth'}
      }),
      new MoveInstruction({
        id: 'imove2',
        shape: {id: 'shape_i6', isLoop: true},
        point: 'center',
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      // TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i8',
        strokeWidth: 2,
        from: {id: 'shape_i6', point: 'right', isLoop: true},
        width: 0,
        height: 9.5
      }),
      new MoveInstruction({
        id: 'imove3',
        shape: {id: 'shape_i8', isLoop: true},
        point: 'center',
        to: {id: 'shape_i6', point: 'right', isLoop: true}
      }),
      // TODO missing ability to draw a line centered about a point
      new DrawLineInstruction({
        id: 'i9',
        strokeWidth: 2,
        from: {id: 'shape_i6', point: 'left', isLoop: true},
        width: 0,
        height: 9.5
      }),
      new MoveInstruction({
        id: 'imove4',
        shape: {id: 'shape_i9', isLoop: true},
        point: 'center',
        to: {id: 'shape_i6', point: 'left', isLoop: true}
      }),
      new DrawRectInstruction({
        id: 'i10',
        fill: 'rgba(255, 127, 0, 0.25)',
        stroke: 'rgba(255, 127, 0, 0.25)',
        from: {id: 'shape_i8', point: 'center', isLoop: true},
        to: {id: 'shape_i9', point: 'center', isLoop: true}
      }),
      new MoveInstruction({
        id: 'imove5',
        shape: {id: 'shape_i10', isLoop: true},
        point: 'top',
        to: {id: 'canvas', point: 'top'}
      }),
      new MoveInstruction({
        id: 'imove6',
        shape: {id: 'shape_i10', isLoop: true},
        point: 'bottom',
        to: {id: 'canvas', point: 'bottom'}
      }),
      new MoveInstruction({
        id: 'imove6',
        shape: {id: 'shape_i10', isLoop: true},
        point: 'bottom',
        to: {id: 'canvas', point: 'bottom'}
      }),
      new DrawPathInstruction({
        id: 'i11',
        fill: 'rgba(238, 141, 40, 1)',
        stroke: 'rgba(238, 141, 40, 1)',
        from: {id: 'canvas', point: 'center'},
        to: [
          {x: -40, y: -15, isLine: true},
          {x: 0, y: 30, isLine: true}
        ],
        isClosed: true
      }),
      new MoveInstruction({
        id: 'imove7',
        shape: {id: 'shape_i11', isLoop: true},
        point: 'from',
        to: {id: 'shape_i4', point: 'center', isLoop: true}
      }),
      new RotateInstruction({
        id: 'irotate1',
        shape: {id: 'shape_i11', isLoop: true},
        point: {id: 'shape_i11', point: 'from', isLoop: true},
        to: {id: 'shape_i5', prop: 'angle', isLoop: true}
      }),
      new ScaleInstruction({
        id: 'i12',
        shape: {id: 'shape_i11', isLoop: true},
        prop: 'edge',
        point: 'from',
        to: 0.5
      }),
      new DrawLineInstruction({
        id: 'i13',
        strokeWidth: 1,
        from: {id: 'shape_i10', point: 'bottom', isLoop: true},
        width: 0,
        height: -15
      }),
      new DrawLineInstruction({
        id: 'i14',
        strokeWidth: 1,
        from: {id: 'shape_i1', point: 'topLeft', isLoop: true},
        width: 15,
        height: 0
      })
    ]
  })
];

export default instructions;
