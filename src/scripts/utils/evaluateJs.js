import _ from 'lodash';
import CircleShape from '../models/shapes/CircleShape';
import RectShape from '../models/shapes/RectShape';
import LineShape from '../models/shapes/LineShape';
import PathShape from '../models/shapes/PathShape';
import TextShape from '../models/shapes/TextShape';

function evaluationUtils(variables) {
  return {
    distanceBetweenPoints: function(a,b) {
      let x = a.x - b.x;
      let y = a.y - b.y;
      return Math.sqrt(x * x + y * y);
    },
    getData(varRef, index=0) {
      let variable = variables.data[varRef.id];
      // The variable reference will know whether or not we
      // want to refer to a vector as an entire vector or just
      // index of vector, the default is index
      if (varRef.asVector) {
        return variable;
      }
      return variable instanceof Array ? variable[index] : variable;
    },
    getShapeVariable(name, index=0) {
      // TODO, perhaps the looping shapes should be an array like data
      let variable = variables.shapes[name] || variables.shapes[`${name}_${index}`];
      if (!variable) {
        console.error('Unable to find shape variable', name);
      }
      return variable;
    },
    getNewShapeName(name, index) {
      return isFinite(index) ? `${name}_${index}` : name;
    },
    circle(params, name, index) {
      variables.shapes[this.getNewShapeName(name, index)] = new CircleShape(params);
    },
    rect(params, name, index) {
      variables.shapes[this.getNewShapeName(name, index)] = new RectShape(params);
    },
    path(params, name, index) {
      variables.shapes[this.getNewShapeName(name, index)] = new PathShape(params);
    },
    text(params, name, index) {
      variables.shapes[this.getNewShapeName(name, index)] = new TextShape(params);
    },
    line(params, name, index) {
      variables.shapes[this.getNewShapeName(name, index)] = new LineShape(params);
    }
  };
}

// Evaluate JS and MOST LIKELY mutate variables passed in
export default function evalutateJs(jsCode, variables, pictureFunctionsStrings, currentPictureId) {
  try {
    if (!_) {
      console.warn('Lodash required for evaluation environment!');
    }


    console.log('before setup: ', currentPictureId);
    /* eslint-disable */
    let utils = evaluationUtils(variables);

    // evaluate function declarations here

    let pictureFunctions = {};

    for (let pictureId in pictureFunctionsStrings) {
      pictureFunctions[pictureId] = eval(pictureFunctionsStrings[pictureId]);
    }

    if (currentPictureId) {
      console.log('break here');
    }
    console.log('before eval: ', currentPictureId);
    return eval(jsCode);
    console.log('after eval: ', currentPictureId);
    /* eslint-enable */

  } catch (error) {
    console.log('EVAL JSCODE ERROR ' + error);
    return error;
  }
}
