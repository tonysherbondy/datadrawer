// This is just a container to hold the result of a picture compiler
// right now. The only reason why I didn't bring those togther is because
// I don't want to recalculate it each time somebody wants to compute evaluate
// some js.
export default class PictureResult {
  constructor(props) {
    this.dataVariables = props.dataVariables;
    this.shapes = props.shapes;
    this.variableValues = props.variableValues;
    this.jsCode = props.jsCode;
  }

  // TODO - maybe we can have some useful other functionality here like
  // grabbing the shape name or doing other eval that the UI sentence
  // stuff needs

}

// For example this function should be part of the class or something
PictureResult.getTable = function(dataVariables, variableValues) {
  let rows = dataVariables.filter(v => v.isRow);
  let rowValues = rows.map(row => {
    return row.getValue(variableValues);
  });
  let maxLength = rowValues.reduce((max, row) => {
    return row.length > max ? row.length : max;
  }, 0);
  return {rows, rowValues, maxLength};
};
