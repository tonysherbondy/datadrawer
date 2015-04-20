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
      `function canvasCenter() { return {x: ${pre}.x + ${pre}.width/2, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasLeftTop() { return {x: ${pre}.x, y: ${pre}.y} }`,
      `function canvasLeft() { return {x: ${pre}.x, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasRight() { return {x: ${pre}.x + ${pre}.width, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasRightBottom() { return {x: ${pre}.x + ${pre}.width, y: ${pre}.y + ${pre}.height} }`
    ];
    return [create].concat(setup, points).join('\n');
  }
}
