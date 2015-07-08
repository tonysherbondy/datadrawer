import DrawTextInstruction from '../models/DrawTextInstruction';
import Expression from '../models/Expression';
import Picture from '../models/Picture';
import DataVariable from '../models/DataVariable';

let variables = [];

const instructions = [
  new DrawTextInstruction({
    id: 'text',
    propertyVariables: [
      new DataVariable({name: 'fontSize', definition: 32})
    ],
    text: new Expression(`'Hello World'`),
    from: {id: 'canvas', point: 'left'},
    to: {id: 'canvas', point: 'right'}
  })
];

export default new Picture('simple', instructions, variables);
