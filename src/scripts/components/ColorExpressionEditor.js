import React from 'react';
import Expression from '../models/Expression';
import PictureResult from '../models/PictureResult';

export default class ColorExpressionEditor extends React.Component {

  render() {
    let {variableValues} = this.props.pictureResult;
    // TODO - might need index for evaluate
    let color = this.props.definition.evaluate(variableValues);
    return (
      <div className="color-expression-editor" style={{backgroundColor: color}}>
      </div>
    );
  }
}

ColorExpressionEditor.propTypes = {
  definition: React.PropTypes.instanceOf(Expression).isRequired,
  pictureResult: React.PropTypes.instanceOf(PictureResult).isRequired
};
