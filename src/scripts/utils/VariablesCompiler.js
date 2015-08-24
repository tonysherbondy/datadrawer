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
        notebook: PropTypes.object.isRequired
      };

      constructor(props) {
        super(props);
        this.state = this.getStateFromProps(props);
      }

      componentWillReceiveProps(nextProps) {
        this.setState(this.getStateFromProps(nextProps));
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
