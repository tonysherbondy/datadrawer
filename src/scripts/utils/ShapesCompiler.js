import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

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

      shouldRecomputeShapes(nextProps) {
        // always recompute if the picture has changed
        if (nextProps.activePicture !== this.props.activePicture) {
          return true;
        }

        // if we are using the current instruction, recompute if the current
        // instruction or loop index has changed
        if (!ignoreCurrentInstruction) {
          if ((nextProps.currentInstruction !== this.props.currentInstruction)
              || (nextProps.currentLoopIndex !== this.props.currentLoopIndex)) {
            return true;
          }
        }

        return false;
      }

      componentWillReceiveProps(nextProps) {
        if (this.shouldRecomputeShapes(nextProps)) {
          this.setState(this.getStateFromProps(nextProps));
        }
      }

      getStateFromProps(props) {
        // TODO - if there is an error compiling the shapes set a compiler
        // state and leave the shapes alone, that way the previous shapes are still
        // being rendered until error is fixed
        let shapes, shapesCompilerStatus, variableValues;
        try {
          let shapesCompilationResult = this.compileShapes(props);
          shapes = shapesCompilationResult.shapes;
          variableValues = shapesCompilationResult.variableValues;
          shapesCompilerStatus = 'ok';
        } catch(err) {
          // Set to previous shapes and notify error
          shapes = this.state.shapes;
          shapesCompilerStatus = 'error';
        }
        return { shapes, shapesCompilerStatus, variableValues };
      }

      render() {
        // we want to pass down the variableValues from state
        // create a shallow clone of props and delete variableValues so we can use spread
        let propsWithOutVariableValues = _.clone(this.props);
        delete propsWithOutVariableValues.variableValues;

        return (
          <DecoratedComponent ref='theComponent' {...propsWithOutVariableValues} {...this.state} />
        );
      }

      // TODO - need to access svg from above to take png of it, but wrapped
      // component doesn't export refs of internal component.
      getRefs() {
        return this.refs.theComponent.refs;
      }

      compileShapes(props) {
        //console.log('compiling shapes for ', this.props.activePicture.id);
        let { notebook, activePicture, variableValues,
              currentInstruction, currentLoopIndex } = props;

        // create a our own copy variableValues, since we'll be mutating it
        variableValues = {data: variableValues.data};

        let pictures = notebook.pictures.valueSeq().toArray();

        let allPicturesJs = ignoreCurrentInstruction ?
          compileAllPicturesToJsMap(pictures, variableValues, activePicture)
          :
          compileAllPicturesToJsMap(pictures, variableValues, activePicture, currentInstruction, currentLoopIndex);

        let shapes = computeShapes(activePicture, variableValues, allPicturesJs).shapes;
        return {shapes: new ShapesMap(shapes), variableValues};
      }

    };
  };
}
