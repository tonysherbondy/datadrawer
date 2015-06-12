import _ from 'lodash';
import CircleShape from '../models/shapes/CircleShape';
import RectShape from '../models/shapes/RectShape';
import LineShape from '../models/shapes/LineShape';
import PathShape from '../models/shapes/PathShape';
import TextShape from '../models/shapes/TextShape';
import DrawCanvas from '../models/DrawCanvas';

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
    },
    picture(params, name, index, depth) {
      depth = depth;
      // Need to do a deep clone here since we don't want to mutate the original variables
      // TODO: (nhan) a clone won't be necessary here once we switch to immutable data structures
      let subPictureVariables = _.cloneDeep(variables.pictureVariablesMap[params.pictureId]);
      subPictureVariables.pictureCodeMap = variables.pictureCodeMap;
      subPictureVariables.pictureVariablesMap = variables.pictureVariablesMap;
      subPictureVariables.shapes = {};

      let utils = evaluationUtils(subPictureVariables);
      let canvasDraw = new DrawCanvas({width: 800, height: 600});
      let canvasJs = canvasDraw.getJsCode();

      /* eslint-disable */
      eval(canvasJs + variables.pictureCodeMap[params.pictureId] + '(depth + 1);');
      /* eslint-enable */

      // TODO: (nhan) write a separate picture shape to encapsulate this logic
      let pictureShape = new RectShape(params);
      pictureShape.type = 'picture';
      pictureShape.shapes = subPictureVariables.shapes;

      variables.shapes[this.getNewShapeName(name, index)] = pictureShape;
    }
  };
}

// Evaluate JS and MOST LIKELY mutate variables passed in
export default function evalutateJs(jsCode, variables) {
  try {
    if (!_) {
      console.warn('Lodash required for evaluation environment!');
    }

    // TODO: this repeats some logic from the picture util above, we should
    // probably refactor this so that what we are evaling here is a
    // utils.picture(...) command
    let utils = evaluationUtils(variables);

    /* eslint-disable */
    return eval(jsCode);
    /* eslint-enable */

  } catch (error) {
    console.log('EVAL JSCODE ERROR ' + error);
    return error;
  }
}
