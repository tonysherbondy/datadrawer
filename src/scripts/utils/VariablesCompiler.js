import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import InstructionTreeNode from '../models/InstructionTreeNode';
import computeVariableValues from '../utils/computeVariableValues';
import DrawPictureInstruction from '../models/DrawPictureInstruction';

export default function VariablesCompiler() {
  return function(DecoratedComponent) {
    return class VariablesCompilerContainer extends Component {
      static DecoratedComponent = DecoratedComponent;

      static propTypes = {
        notebook: PropTypes.object.isRequired,
        activePicture: PropTypes.object.isRequired
      };

      constructor(props) {
        super(props);
        this.state = this.getStateFromProps(props);
      }

      componentWillReceiveProps(nextProps) {
        // TODO: This works currently because the only the variables for the
        // active picture can change.  We should really move variable
        // compilation below the notebook editor level by separating the
        // thumbnails bar from the rest of the editor so that we can compile
        // the variables for each picture separately.
        // TODO: we are checking ._variables because .variables is a getter
        // that creates a new array every time, and ._variables is an
        // immutable.js OrderedMap. This won't be an issue once we switch
        // over to immutable.js completely.
        if (this.props.activePicture._variables
            !== nextProps.activePicture._variables) {
          this.setState(this.getStateFromProps(nextProps));
        }
      }

      getStateFromProps(props) {
        // TODO - if there is an error compiling the variables set a compiler
        // state and leave the values alone, that way the previous values are still
        // being rendered until error is fixed
        let variableValues = this.getAllDataVariableValues(props);
        return { variableValues };
      }

      render() {
        return (
          <DecoratedComponent {...this.props} {...this.state} />
        );
      }

      // Compute data variable values used across all pictures. This assumes
      // that variables are unique across all pictures
      // Output is a Map between variable ID and the value of that variable
      getAllDataVariableValues({ notebook }) {
        //console.log('compiling variables for ', this.props.activePicture.id);
        let pictures = notebook.pictures.valueSeq().toArray();
        let pictureVariables = pictures.map(p => p.variables);
        let instVariables = pictures.map(p => {
          return _.flatten(InstructionTreeNode.flatten(p.instructions)
                                    .filter(i => i instanceof DrawPictureInstruction)
                                    .map(i => i.pictureVariables));
        });
        let allVariables = _(pictureVariables.concat(instVariables))
                            .flatten()
                            .unique()
                            .value();
        return computeVariableValues(allVariables).variableValues;
      }
    };
  };
}
