import DrawInstruction from './DrawInstruction';

export default class DrawCircleInstruction extends DrawInstruction {
  constructor(props) {
    super(props);
    // TODO Handle that they can either set the destination to a
    // point or a radius
    this.radius = props.radius;
  }

  getRadiusJs() {
    // This can be one of the following, a point specified by the to parameter,
    // a radius number or a radius variable
    if (this.to) {
      // assume utility function like distanceBetweenPoints(pt1, pt1)
      let {cx, cy} = this.getCenterJs();
      let fromPt = `{x: ${cx}, y: ${cy}}`;
      let toPt = this.getPointVarJs(this.to);
      return `utils.distanceBetweenPoints(${fromPt}, ${toPt})`;
    } else if (this.radius.id) {
      return `variables.data.${this.radius.id}`;
    }
    return this.radius;
  }

  getCenterJs() {
    // Center can either refer to a reference point or explicit point
    if (this.from.id) {
      let fromPt = this.getPointVarJs(this.from);
      return {
        cx: `${fromPt}.x`,
        cy: `${fromPt}.y`,
      };
    }
    return {
      cx: this.from.x,
      cy: this.from.y,
    };
  }

  getJsCode(varPrefix) {
    let {cx, cy} = this.getCenterJs();
    let create = `${varPrefix} = {}`;
    let setup = [
      'type = "circle"',
      `cx = ${cx}`,
      `cy = ${cy}`,
      `r = ${this.getRadiusJs()}`
    ].map(js => `${varPrefix}.${js}`);
    return [create].concat(setup).join(';\n');
  }

  getShapeFromVariables(variables) {
    let {cx, cy, r} = variables;
    return {
      type: 'circle',
      props: {r, cx, cy}
    };
  }

  getRadiusUi() {
    if (this.radius.id) {
      return `${this.radius.id}`;
    }
    return this.radius;
  }


  // TODO This belongs in the UI most likely
  getUISentence() {
    let fromUi = `Draw circle around ${this.getFromUi()}`;
    if (this.to) {
      return `${fromUi} until ${this.to.id}-${this.to.point}`;
    }
    return `${fromUi} with radius ${this.getRadiusUi()}`;
  }

}
