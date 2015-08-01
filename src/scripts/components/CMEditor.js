import React from 'react';
import CodeMirror from 'codemirror';

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
      lineNumbers: true,
      viewportMargin: Infinity,
      theme: 'lesser-dark',
      gutters: ['CodeMirror-lint-markers']
      //lintWith: CodeMirror.javascriptValidatorWithOptions({
        //asi: true,
        //laxcomma: true,
        //laxbreak: true,
        //loopfunc: true,
        //smarttabs: true,
        //multistr: true,
        //sub: true
      //})
    };
    /*eslint new-cap:0 */
    this.codeMirror = CodeMirror(this.refs.codeMirrorStub.getDOMNode(), options);
    this.codeMirror.setValue(this.props.value);
  }
}

CMEditor.propTypes = {
  value: React.PropTypes.string.isRequired
};

export default CMEditor;
