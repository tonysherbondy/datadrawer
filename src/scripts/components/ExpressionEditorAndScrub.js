import React from 'react';
import _ from 'lodash';
import ExpressionEditor from './ExpressionEditor';
import Expression from '../models/Expression';
import VariablePill from './VariablePill';

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
    console.log('will unmount');
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

  handleMouseUp() {
    // Only switch to editor if we haven't scrubbed a value
    if (this.scrubState && this.scrubState.hasChanged) {
      return;
    }
    console.log('handlemouseup');
    this.setState({isEditing: true});
  }

  handleEditorBlur() {
    this.setState({isEditing: false});
  }

  handleScrubMouseDown(fragmentIndex, evt) {
    this.scrubState = {
      startX: evt.screenX,
      fragmentIndex
    };
    this.scrubMouseMoveHandler = this.handleScrubMouseMove.bind(this);
    this.scrubMouseUpHandler = this.handleScrubMouseUp.bind(this);
    window.addEventListener('mousemove', this.scrubMouseMoveHandler);
    window.addEventListener('mouseup', this.scrubMouseUpHandler);
  }

  handleScrubMouseMove(evt) {
    let fragments = this.parseDefinition();
    let original = fragments[this.scrubState.fragmentIndex];
    let delta = evt.screenX - this.scrubState.startX;
    let newValue = original + delta;
    this.scrubState.hasChanged = true;
    console.log('scrubbing', newValue);
  }

  handleScrubMouseUp() {
    console.log('scrub mouse up');
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

