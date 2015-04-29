import LineShape from './LineShape';

export default class TextShape extends LineShape {
  constructor(props) {
    super(props);
    this.text = props.text;
    this.type = 'text';
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
      textAnchor: 'middle',
      transform,

      // TODO there should definitely be a base shape for this
      fillOpacity: this.isGuide ? 0 : 1,
      strokeOpacity: this.isGuide ? 0 : 1
    };
  }

}
