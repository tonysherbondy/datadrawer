import React from 'react';
import _ from 'lodash';
import ExpressionEditor from './ExpressionEditor';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';
import DataVariable from '../models/DataVariable';

export default class ExpressionEditorAndScrub extends React.Component {
  constructor(props) {
    super(props);
    this.scrubMouseMoveHandler = null;
    this.scrubMouseUpHandler = null;
    this.state = {
      isEditing: false
    };
    this.scrubState = null;
  }

  render() {
    if (this.state.isEditing) {
      return (
        <ExpressionEditor
          {...this.props}
          handleBlur={this.handleEditorBlur.bind(this)} />
      );
    } else {
      let fragments = this.parseDefinition();
      let mappedFragments = fragments.map((fragment, index) => {
        if (_.isNumber(fragment)) {
          return (
            <span
              className='expression-scrubbable'
              key={index}
              onMouseDown={this.handleScrubMouseDown.bind(this, index)}
              >{fragment}</span>
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
        <span onMouseUp={this.handleMouseUp.bind(this)}>{mappedFragments}</span>
      );
    }
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.scrubMouseMoveHandler);
    window.removeEventListener('mouseup', this.scrubMouseUpHandler);
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
    let r = /-?\d+(?:\.\d*)?/;
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

  getDefinitionFromParsed(fragments) {
    let newFragments = fragments.reduce((joined, f) => {
      // Convert number to string
      if (_.isNumber(f)) {
        f = '' + f;
      } else if (f instanceof DataVariable) {
        // Convert variable into simple reference to variable
        // mainly need this for the asVector property
        f = {id: f.id, asVector: this.props.asVector};
      }

      let last = _.last(joined);
      if (!_.isString(last) || !_.isString(f)) {
        // If the last wasn't a string or the next is a variable
        return joined.concat([f]);
      }

      // last and current are strings
      return _.initial(joined).concat(last + f);
    }, []);

    return new Expression(newFragments);
  }

  handleMouseUp() {
    // Only switch to editor if we haven't scrubbed a value
    if (this.scrubState && this.scrubState.hasChanged) {
      return;
    }
    this.setState({isEditing: true});
  }

  handleEditorBlur() {
    this.setState({isEditing: false});
  }

  handleScrubMouseDown(fragmentIndex, evt) {
    let fragments = this.parseDefinition();
    this.scrubState = {
      startX: evt.screenX,
      startValue: fragments[fragmentIndex],
      fragmentIndex
    };
    this.scrubMouseMoveHandler = this.handleScrubMouseMove.bind(this);
    this.scrubMouseUpHandler = this.handleScrubMouseUp.bind(this);
    window.addEventListener('mousemove', this.scrubMouseMoveHandler);
    window.addEventListener('mouseup', this.scrubMouseUpHandler);
  }

  handleScrubMouseMove(evt) {
    let fragments = this.parseDefinition();
    let {fragmentIndex} = this.scrubState;
    let delta = evt.screenX - this.scrubState.startX;
    let newValue = this.scrubState.startValue + delta;

    this.scrubState.hasChanged = true;
    if (this.props.onChange) {
      fragments[fragmentIndex] = newValue;
      this.props.onChange(this.getDefinitionFromParsed(fragments));
    }
  }

  handleScrubMouseUp() {
    window.removeEventListener('mousemove', this.scrubMouseMoveHandler);
    window.removeEventListener('mouseup', this.scrubMouseUpHandler);
    this.scrubState = null;
  }
}

ExpressionEditorAndScrub.propTypes = {
  asVector: React.PropTypes.bool,
  variableValues: React.PropTypes.object.isRequired,
  variables: React.PropTypes.array.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};

