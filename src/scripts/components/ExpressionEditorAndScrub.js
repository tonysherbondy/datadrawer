import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
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
          handleEnterKey={this.handleEnterKey.bind(this)} />
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
            <VariablePill picture={this.props.picture} variable={fragment} key={index} />
          );
        }
      });
      return (
        <span
          onDrop={this.handleDrop.bind(this)}
          onDragOver={this.handleDragOver.bind(this)}
          onMouseUp={this.handleMouseUp.bind(this)}>
            {mappedFragments}
        </span>
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
      return [this.props.picture.getVariableForFragment(fragment)];
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
      fragment = fragment.slice(index + nextNumber.length);
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
        f = {id: f.id, prop: f.prop, asVector: this.props.asVector};
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

  handleDragOver(evt) {
    if (!this.state.isEditing &&
        evt.dataTransfer.types.indexOf('datavariable') > -1) {
      evt.preventDefault();
    }
  }

  handleDrop(evt) {
    let {id, prop} = VariablePill.getVarFromDropData(evt.dataTransfer);
    if (this.props.onChange) {
      this.props.onChange(new Expression({id, prop, asVector: this.props.asVector}));
    }
  }

  handleMouseUp() {
    // Only switch to editor if we haven't scrubbed a value
    if (this.scrubState && this.scrubState.hasChanged) {
      return;
    }
    this.setState({isEditing: true});
    if (this.props.onEditChange) {
      this.props.onEditChange(true);
    }
  }

  handleEnterKey(evt) {
    this.setState({isEditing: false});
    if (this.props.onEditChange) {
      this.props.onEditChange(false);
    }
    evt.stopPropagation();
  }

  handleScrubMouseDown(fragmentIndex, evt) {
    let fragments = this.parseDefinition();
    let startValue = fragments[fragmentIndex];
    this.scrubState = {
      startX: evt.screenX,
      startValue,
      fragmentIndex
    };
    this.scrubMouseMoveHandler = this.handleScrubMouseMove.bind(this);
    this.scrubMouseUpHandler = this.handleScrubMouseUp.bind(this);
    window.addEventListener('mousemove', this.scrubMouseMoveHandler);
    window.addEventListener('mouseup', this.scrubMouseUpHandler);
    $('body').css('cursor', 'ew-resize');
    evt.preventDefault();
  }

  handleScrubMouseMove(evt) {
    let fragments = this.parseDefinition();
    let {fragmentIndex, startValue, startX} = this.scrubState;
    let scaleValuePerPixels = 2 * Math.abs(startValue) / 100;
    let delta = evt.screenX - startX;
    let newValue = startValue + delta * scaleValuePerPixels;
    newValue = Math.round(newValue * 100) / 100;

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
    $('body').css('cursor', 'default');
  }
}

ExpressionEditorAndScrub.propTypes = {
  asVector: React.PropTypes.bool,
  variableValues: React.PropTypes.object.isRequired,
  definition: React.PropTypes.instanceOf(Expression).isRequired
};

