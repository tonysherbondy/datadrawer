import React from 'react';
import _ from 'lodash';
import ExpressionEditor from './ExpressionEditor';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

export default class ExpressionEditorAndScrub extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false
    };
  }

  render() {
    if (this.state.isEditing) {
      return (
        <ExpressionEditor {...this.props} />
      );
    } else {
      let fragments = this.parseDefinition();
      let mappedFragments = fragments.map((fragment, index) => {
        if (_.isNumber(fragment)) {
          return (
            <span className='expression-scrubbable' key={index}>{fragment}</span>
          );
        } else if (_.isString(fragment)) {
          return fragment;
        } else {
          return (
            <VariablePill variable={fragment} key={index} />
          );
        }
      });
      return (
        <span onDoubleClick={this.handleDoubleClick.bind(this)}>{mappedFragments}</span>
      );
    }
  }

  parseDefinition() {
    return this.props.definition.fragments.reduce((fragments, fragment) => {
      return fragments.concat(this.parseFragment(fragment));
    }, []);
  }

  parseFragment(fragment) {
    if (!_.isString(fragment)) {
      let variable = this.props.variables.find(v => v.id === fragment.id);
      return [variable];
    }

    // Parse the string into spans around numbers and other parts of the string
    let r = /\d+(?:\.\d*)?/;
    let parsedFragments = [];
    let nextNumber = r.exec(fragment);
    while(nextNumber) {
      // Find the number and replace with span
      nextNumber = _.first(nextNumber);
      let index = fragment.indexOf(nextNumber);
      if (index > 0) {
        parsedFragments.push(fragment.slice(0, index));
      }
      parsedFragments.push(+nextNumber);
      fragment = fragment.slice(index+nextNumber.length);
      nextNumber = r.exec(fragment);
    }
    // Push the last string fragments on
    parsedFragments.push(fragment);

    return parsedFragments;
  }

  handleDoubleClick() {
    this.setState({isEditing: true});
  }
}

ExpressionEditorAndScrub.propTypes = {
  asVector: React.PropTypes.bool,
  variableValues: React.PropTypes.object.isRequired,
  variables: React.PropTypes.array.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};

