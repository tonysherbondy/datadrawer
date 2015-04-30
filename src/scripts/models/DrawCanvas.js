export default class DrawCanvas {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  getJsCode() {
    return `utils.rect({\n` +
           `name: 'canvas',\n` +
           `x: 0,\n` +
           `y: 0,\n` +
           `width: ${this.width},\n` +
           `height: ${this.height}\n` +
           `}, 'canvas');\n`;
  }
}
