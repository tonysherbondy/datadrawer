export default class DrawCanvas {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  getJsCode() {
    let varPrefix = 'variables.shapes.canvas';
    return `${varPrefix} = utils.rect({\n` +
           `x: 0,\n` +
           `y: 0,\n` +
           `width: ${this.width},\n` +
           `height: ${this.height}\n` +
           `});\n`;
  }
}
