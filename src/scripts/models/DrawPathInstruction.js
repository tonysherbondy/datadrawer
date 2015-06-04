import DrawInstruction from './DrawInstruction';
import InstructionActions from '../actions/InstructionActions';

export default class DrawPathInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    this.to = props.to;
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

  //getCloneWithTo(to, pictureResult, magnets) {
    //let props = this.getCloneProps();
    //// TODO - if to is a magnet, we set to otherwise, width & height
    //if (to.id) {
      //props.to = to;
      //props.toMagnets = magnets;
      //props.radius = null;
    //} else {
      //let from = this.getFromValue(pictureResult);
      //props.to = null;
      //let radius = Math.round(distanceBetweenPoints(to, from) * 100) / 100;
      //props.radius = new Expression(radius);
    //}
    //// TODO - Shouldn't we do our own modify here?
    //return new DrawCircleInstruction(props);
  //}

  getToJs(index) {
    // An array of points, each with a flag indicating whether
    // we draw a line or just move to that point
    let {x, y} = this.getFromJs(index);
    let allTosJs = this.to.map(to => {
      let isLine = to.isLine;
      if (to.id) {
        let toPt = this.getPointVarJs(this.to, index);
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
