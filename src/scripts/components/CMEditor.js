import React from 'react';
import CodeMirror from 'codemirror';
require('codemirror/mode/javascript/javascript');

class CMEditor extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  render() {
    return (
      <div className="cmeditor">
        <div ref="codeMirrorStub"></div>
      </div>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.value !== nextProps.value) {
      this.setState({value: nextProps.value});
      this.codeMirror.setValue(this.state.value);
    }
  }

  componentDidMount() {
    let options = {
      value: this.props.value,
      mode: 'javascript',
      lineNumbers: true,
      viewportMargin: Infinity,
      gutters: ['CodeMirror-lint-markers']
      //lintWith: CodeMirror.lint.javascript({
        //asi: true,
        //laxcomma: true,
        //laxbreak: true,
        //loopfunc: true,
        //smarttabs: true,
        //multistr: true,
        //sub: true
      //})
    };
    this.codeMirror = CodeMirror(this.refs.codeMirrorStub.getDOMNode(), options);
  }
}

CMEditor.propTypes = {
  value: React.PropTypes.string.isRequired
};

export default CMEditor;
