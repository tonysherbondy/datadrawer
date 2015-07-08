import LineShape from './LineShape';

export default class TextShape extends LineShape {
  constructor(props) {
    super(props);
    this.text = props.text;
    this.fontSize = props.fontSize || 20;
    this.textAnchor = props.textAnchor || 'middle';
    this.type = 'text';
  }

  getStyle() {
    let {fill, stroke, strokeWidth, fontSize} = this;
    return {fontSize, fill, stroke, strokeWidth};
  }

  getRenderProps() {
    let {x1, y1, x2, y2} = this;
    let x = (x2 + x1) / 2;
    let y = (y2 + y1) / 2;

    // Rotate the shape based on the angle of the line
    // TODO We would have to take any other rotation into
    // account here, could get confusing
    let angle = this.getProp('angle');
    let transform = `rotate(${angle} ${x} ${y})`;

    return {
      x,
      y,
      textAnchor: this.textAnchor,
      transform,
      style: this.getStyle(),
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
