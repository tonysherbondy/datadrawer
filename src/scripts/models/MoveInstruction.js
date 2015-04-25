import Instruction from './Instruction';

export default class MoveInstruction extends Instruction {
  constructor({id, shapeId, prop, to}) {
    super({id, shapeId});
    this.prop = prop;
    this.to = to;
  }

  getJsCode(index) {
    let varName = this.getVarName(this.shapeId, index);
    if (this.to.id) {
      // When setting to a variable we will move the point = to the variable
      let pointJs = `utils['${this.to.point}']('${this.to.id}')`;
      return `${varName}.moveToPoint(${pointJs});\n`;
    } else {
      // Otherwise, we will move the point relative to the current position
      let getVarJs = v => {
        if (v.id) {
          return `utils.getData('${v.id}', ${index})`;
        }
        return v;
      };
      // Each dimension can either be a constant or a data variable
      let xJs = getVarJs(this.to.x);
      let yJs = getVarJs(this.to.y);
      let pointJs = `{x: ${xJs}, y: ${yJs}}`;
      return `${varName}.moveRelative(${pointJs});\n`;
    }
  }

  getToUi() {
    if (this.to.id) {
      return this.to.id;
    }
    return this.to;
  }

  getVarUi(v) {
    return v.id ? v.id : v;
  }

  // TODO This belongs in the UI most likely
  getUISentence() {
    if (this.to.id) {
      return `Move ${this.shapeId}'s ${this.prop} to meet ${this.to.id}'s ${this.to.point}`;
    }
    let xUi = this.getVarUi(this.to.x);
    let yUi = this.getVarUi(this.to.y);
    return `Move ${this.shapeId}, ${xUi} horizontally, ${yUi} vertically`;
  }
}
