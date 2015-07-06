import _ from 'lodash';
import CircleShape from '../models/shapes/CircleShape';
import RectShape from '../models/shapes/RectShape';
import LineShape from '../models/shapes/LineShape';
import PathShape from '../models/shapes/PathShape';
import TextShape from '../models/shapes/TextShape';
import DrawCanvas from '../models/DrawCanvas';
import PictureShape from '../models/shapes/PictureShape';

function evaluationUtils(variables, picturesJs) {
  return {
    // Initialize global function call depth
    depth: 0,
    maxDepth: 4,
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
      let {shapes} = variables.picture;
      let variable = shapes[name] || shapes[`${name}_${index}`];
      if (!variable) {
        console.error('Unable to find shape variable', name);
      }
      return variable;
    },
    getNewShapeName(name, index) {
      return isFinite(index) ? `${name}_${index}` : name;
    },
    circle(params, name, index) {
      variables.picture.shapes[this.getNewShapeName(name, index)] = new CircleShape(params);
    },
    rect(params, name, index) {
      variables.picture.shapes[this.getNewShapeName(name, index)] = new RectShape(params);
    },
    path(params, name, index) {
      variables.picture.shapes[this.getNewShapeName(name, index)] = new PathShape(params);
    },
    text(params, name, index) {
      variables.picture.shapes[this.getNewShapeName(name, index)] = new TextShape(params);
    },
    line(params, name, index) {
      variables.picture.shapes[this.getNewShapeName(name, index)] = new LineShape(params);
    },
    picture(params, name, index, utils) {
      if (utils.depth > utils.maxDepth) {
        return;
      }
      // Besides updating depth, the utils context will be the same for the next eval'd JS
      utils.depth++;

      // Store previous picture context where shape calls would be stored
      let prevPicture = variables.picture;

      // Create new picture context
      let picture = new PictureShape(params);
      variables.picture = picture;

      // Canvas for this picture
      let {width, height} = params;
      let canvasDraw = new DrawCanvas({width, height});
      let canvasJs = canvasDraw.getJsCode();

      // Call picture code
      /* eslint-disable */
      eval(canvasJs + picturesJs[params.pictureId]);
      /* eslint-enable */

      // Pop back to previous picture context if it existed
      // This allows the first picture to remain
      if (prevPicture) {
        // Store new picture in previous picture
        prevPicture.shapes[this.getNewShapeName(name, index)] = picture;
        variables.picture = prevPicture;
      }
    }
  };
}

// Evaluate JS and MOST LIKELY mutate variables passed in
export default function evalutateJs(jsCode, variables, picturesJs) {
  try {
    if (!_) {
      console.warn('Lodash required for evaluation environment!');
    }

    let utils = evaluationUtils(variables, picturesJs);

    /* eslint-disable */
    return eval(jsCode);
    /* eslint-enable */

  } catch (error) {
    console.log('EVAL JSCODE ERROR ' + error);
    return error;
  }
}
