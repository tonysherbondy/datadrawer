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

    // TODO These points apply to every rectangle, need to abstract this
    let points = [
      `function canvasTop() { return {x: ${pre}.x + ${pre}.width/2, y: ${pre}.y} }`,
      `function canvasCenter() { return {x: ${pre}.x + ${pre}.width/2, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasLeftTop() { return {x: ${pre}.x, y: ${pre}.y} }`,
      `function canvasLeft() { return {x: ${pre}.x, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasRight() { return {x: ${pre}.x + ${pre}.width, y: ${pre}.y + ${pre}.height/2} }`,
      `function canvasRightBottom() { return {x: ${pre}.x + ${pre}.width, y: ${pre}.y + ${pre}.height} }`
    ];
    return [create].concat(setup).join('\n');
  }
}