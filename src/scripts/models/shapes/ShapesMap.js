import _ from 'lodash';

// TODO - Make immutable
export default class ShapesMap {
  constructor(shapes) {
    this.shapes = shapes;
  }

  isVisibleToIndex(index, shape) {
    // return all shapes that matches index
    // or has no index (thus was drawn outside of loop)
    if (!_.isString(shape.index)) {
      return true;
    }
    return parseInt(shape.index, 10) === index;
  }


  getShapeByIdAndIndex(id, index) {
    if (!_.isString(id)) {
      return null;
    }
    // Get selected shape based on ID for any current loop index
    return _.values(this.shapes)
            .filter(this.isVisibleToIndex.bind(this, index))
            .find(shape => shape.id === id);
  }

  getAllShapesForLoopIndex(index) {
    return this.getAllShapes().filter(this.isVisibleToIndex.bind(this,index));
  }

  getAllShapes() {
    return _.values(this.shapes);
  }

}

