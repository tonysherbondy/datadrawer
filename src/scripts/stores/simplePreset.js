import DrawTextInstruction from '../models/DrawTextInstruction';
import Expression from '../models/Expression';
import Picture from '../models/Picture';

let variables = [];

const instructions = [
  new DrawTextInstruction({
    id: 'text',
    fontSize: 32,
    text: new Expression(`'Hello World'`),
    from: {id: 'canvas', point: 'left'},
    to: {id: 'canvas', point: 'right'}
  })
];

export default new Picture('simple', instructions, variables);
