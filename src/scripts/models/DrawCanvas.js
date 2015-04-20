export default class DrawCanvas {
  constructor({width, height}) {
    this.width = width;
    this.height = height;
  }

  getJsCode() {
    let pre = 'variables.shapes.canvas';
    let create = `${pre} = {};`;
    let setup = [
      `x = 0`,
      `y = 0`,
      `width = ${this.width}`,
      `height = ${this.height}`
    ].map(js => `${pre}.${js};`);

    let points = [
      `function canvasLeftTop() { return {x: ${pre}.x, y: ${pre}.y} }`,
      `function canvasCenter() { return {x: ${pre}.x + ${pre}.width/2, y: ${pre}.y + ${pre}.height/2} }`
    ];
    return [create].concat(setup, points).join('\n');
  }
}
