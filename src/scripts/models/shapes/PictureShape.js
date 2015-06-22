import RectShape from './RectShape';

export default class PictureShape extends RectShape {
  constructor(props) {
    super(props);
    this.shapes = props.shapes || {};
    this.type = 'picture';
  }
}
