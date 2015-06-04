import _ from 'lodash';
import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';
import Expression from './Expression';

export default class DrawPathInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.to = props.to || [this.getLinePt(1, 1)];
    this.name = props.name || 'path';
    this.isClosed = props.isClosed;
  }

  modifyInstructionWithProps(props) {
    InstructionActions.modifyInstruction(new DrawPathInstruction(props));
  }

  getCloneProps() {
    let props = super.getCloneProps();
    props.isClosed = this.isClosed;
    return props;
  }

  getCloneWithFrom(from, magnets) {
    let props = this.getCloneProps();
    props.from = from;
    props.fromMagnets = magnets;
    // TODO - Shouldn't we do our own modify here?
    return new DrawPathInstruction(props);
  }

  // Update the last to point in the array
  getCloneWithTo(to, pictureResult, magnets) {
    let props = this.getCloneProps();
    let newPt = to;
    if (to.id) {
      newPt.isLine = true;
      props.toMagnets = magnets;
    } else {
      let from = this.getFromValue(pictureResult);
      newPt = this.getLinePt(to.x - from.x, to.y - from.y);
    }
    props.to = _.initial(props.to).concat([newPt]);
    return new DrawPathInstruction(props);
  }

  getLinePt(x, y) {
    return {x: new Expression(x), y: new Expression(y), isLine: true};
  }

  getToJs(index) {
    // An array of points, each with a flag indicating whether
    // we draw a line or just move to that point
    let {x, y} = this.getFromJs(index);
    let allTosJs = this.to.map(to => {
      let isLine = to.isLine;
      if (to.id) {
        let toPt = this.getPointVarJs(to, index);
        return `{x: ${toPt}.x - ${x}, y: ${toPt}.y - ${y}, isLine: ${isLine}},`;
      } else {
        let xJs = to.x.getJsCode(index);
        let yJs = to.y.getJsCode(index);
        return `{x: ${xJs}, y: ${yJs}, isLine: ${isLine}},`;
      }
    });
    return ['['].concat(allTosJs, [']']).join('\n');
  }

  getJsCode(index) {
    let propsJs = super.getPropsJs(index).join(',\n');
    let from = this.getFromJs(index);
    return `utils.path({\n` +
           `${propsJs},\n` +
           `from: {x: ${from.x}, y: ${from.y}},\n` +
           `points: ${this.getToJs(index)},\n` +
           `isClosed: ${this.isClosed},\n` +
           `}, '${this.shapeId}', ${index});\n`;
  }

  //getUiSentence(variables, variableValues) {
    //let allTosUi = this.to.map(to => {
      //if (to.id) {
      //return `to (to.id)`;
      //}
      //return `to (${to.x}, ${to.y})`;
    //});
    //return (
      //<span className='instruction-sentence'>
        //{this.getFromUi(variableValues.shapes)}
        //{' ' + allTosUi.join(' ')}
      //</span>
    //);
  //}
}
