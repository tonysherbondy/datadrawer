export default class DrawCanvas {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  getJsCode() {
    // Even canvas instructions need color properties
    return `utils.rect({\n` +
           `id: 'canvas',\n` +
           `fill: 'rgba(0, 0, 0, 0)',\n` +
           `stroke: '#000000',\n` +
           `strokeWidth: 0,\n` +
           `x: 0,\n` +
           `y: 0,\n` +
           `width: ${this.width},\n` +
           `height: ${this.height}\n` +
           `}, 'canvas');\n`;
  }
}
