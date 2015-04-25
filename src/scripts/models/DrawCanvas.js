export default class DrawCanvas {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  getJsCode() {
    let pre = 'variables.shapes.canvas';
    let create = `${pre} = {};`;
    let setup = [
      'type = "rect"',
      `x = 0`,
      `y = 0`,
      `width = ${this.width}`,
      `height = ${this.height}`
    ].map(js => `${pre}.${js};`);

    return [create].concat(setup).join('\n');
  }
}
