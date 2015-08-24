import React, { Component, PropTypes } from 'react';

import {computeShapes, compileAllPicturesToJsMap} from '../utils/compileUtils';
import ShapesMap from '../models/shapes/ShapesMap';

export default function ShapesCompiler({
  ignoreCurrentInstruction
} = {}) {
  return function(DecoratedComponent) {
    return class ShapesCompilerContainer extends Component {
      static DecoratedComponent = DecoratedComponent;

      static propTypes = {
        notebook: PropTypes.object.isRequired,
        activePicture: PropTypes.object.isRequired,
        variableValues: PropTypes.object.isRequired,
        currentInstruction: PropTypes.object,
        currentLoopIndex: PropTypes.number
      };

      constructor(props) {
        super(props);
        this.state = this.getStateFromProps(props);
      }

      componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromProps(nextProps));
      }

      getStateFromProps(props) {
        // TODO - if there is an error compiling the shapes set a compiler
        // state and leave the shapes alone, that way the previous shapes are still
        // being rendered until error is fixed
        let shapes, shapesCompilerStatus;
        try {
          shapes = this.getShapes(props);
          shapesCompilerStatus = 'ok';
        } catch(err) {
          // Set to previous shapes and notify error
          shapes = this.state.shapes;
          shapesCompilerStatus = 'error';
        }
        return { shapes, shapesCompilerStatus };
      }

      render() {
        return (
          <DecoratedComponent {...this.props} {...this.state} />
        );
      }

      getShapes(props) {
        let { notebook, activePicture, variableValues,
              currentInstruction, currentLoopIndex } = props;
        let pictures = notebook.pictures.valueSeq().toArray();

        let allPicturesJs = ignoreCurrentInstruction ?
          compileAllPicturesToJsMap(pictures, variableValues, activePicture)
          :
          compileAllPicturesToJsMap(pictures, variableValues, activePicture, currentInstruction, currentLoopIndex);

        return new ShapesMap(
          computeShapes(activePicture, variableValues, allPicturesJs).shapes
        );
      }

    };
  };
}
