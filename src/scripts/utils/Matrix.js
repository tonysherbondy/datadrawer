import _ from 'lodash';

// Matrix assumes a 3x3 in row primary form,
// [ [r1c1, r1c2, r1c3],
//   [r2c1, r2c2, r2c3],
//   [r3c1, r3c2, r3c3] ]

export default class Matrix {
  constructor(props) {
    // defaults to identity matrix;
    let elements = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    if (Matrix.isElementMatrix(props)) {
      elements = props;
    }
    this.elements = elements;
  }

  multiply(elements) {
    elements = Matrix.getElementsFromMatrixOrElements(elements);
    if (!elements) { return null; }

    let newElements = [[], [], []];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        let row = this.elements[r];
        let col = Matrix.column(elements, c);
        newElements[r][c] = Matrix.vdot(row, col);
      }
    }

    return new Matrix(newElements);
  }

  vecMultiply(vec) {
    let newVec = [];
    for (let r = 0; r < 3; r++) {
      let row = this.elements[r];
      newVec[r] = Matrix.vdot(row, vec);
    }
    return newVec;
  }

  isIdentity() {
    return this.isEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ]);
  }

  isEqual(elements) {
    elements = Matrix.getElementsFromMatrixOrElements(elements);
    if (!elements) { return null; }
    return _.isEqual(this.elements, elements);
  }

  getSvgTransform() {
    if (this.isIdentity()) {
      return '';
    }

    let params = [
      this.elements[0][0],
      this.elements[1][0],
      this.elements[0][1],
      this.elements[1][1],
      this.elements[0][2],
      this.elements[1][2]
    ].join(' ');
    return `matrix(${params})`;
  }
}

Matrix.getElementsFromMatrixOrElements = function(elements) {
  if (elements instanceof Matrix) {
    elements = elements.elements;
  }
  if (!Matrix.isElementMatrix(elements)) {
    console.error('bad matrix', elements);
    return null;
  }

  return elements;
};

Matrix.column = function(elements, c) {
  return [elements[0][c], elements[1][c], elements[2][c]];
};

Matrix.vdot = function(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
};

// Check to see if argument is a correctly formatted matrix
Matrix.isElementMatrix = function(props) {
    return _.isArray(props) &&
           props.length === 3 &&
           _.all(props, row => row.length === 3);
};

Matrix.translation = function(point) {
  return new Matrix([
    [1, 0, point[0]],
    [0, 1, point[1]],
    [0, 0, 1]
  ]);
};

// Angle is in degrees
Matrix.rotation = function(angle) {
  let radians = (Math.PI / 180) * angle;
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);
  return new Matrix([
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1]
  ]);
};

// Return a matrix for rotation about a point
// Angle is in degrees
Matrix.rotationAroundPoint = function(angle, point) {
  let rotation = Matrix.rotation(angle);
  let t1 = Matrix.translation([-point[0], -point[1]]);
  let t2 = Matrix.translation(point);
  // this is T2*R*T1
  return t2.multiply(rotation).multiply(t1);
};
