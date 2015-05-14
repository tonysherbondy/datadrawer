import Instruction from './Instruction';

export default class AdjustInstruction extends Instruction {
  constructor(props) {
    super({id: props.id, shapeId: props.shape.id});
    this.prop = props.prop;
    this.point = props.point;
    this.to = props.to;
    this.toMagnets = props.toMagnets;
    this.shape = props.shape;
  }

  getCloneProps() {
    let props = super.getCloneProps();
    let {point, prop, to, shape, toMagnets} = this;
    props.point = point;
    props.prop = prop;
    props.to = to;
    props.toMagnets = toMagnets;
    props.shape = shape;
    return props;
  }

}
